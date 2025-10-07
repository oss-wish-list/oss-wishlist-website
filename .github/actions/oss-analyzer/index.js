const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs').promises;
const path = require('path');

// Ecosyste.ms API client
class EcosystemsClient {
  constructor() {
    this.packagesBaseUrl = 'https://packages.ecosyste.ms/api/v1';
    this.cache = new Map();
    this.bigTechDomains = [
      'amazon.com', 'amazon.co.uk',
      'microsoft.com',
      'google.com', 'alphabet.com',
      'meta.com', 'fb.com', 'facebook.com',
      'openai.com',
      'netflix.com',
      'apple.com',
      'oracle.com',
      'ibm.com',
      'salesforce.com',
      'intel.com',
      'amd.com'
    ];
  }

  async getPackageData(purl) {
    if (this.cache.has(purl)) {
      return this.cache.get(purl);
    }

    try {
      if (!purl.startsWith('pkg:npm/')) {
        core.info(`Skipping non-npm package: ${purl}`);
        return null;
      }

      const npmPart = purl.substring('pkg:npm/'.length);
      let packageName;
      
      if (npmPart.startsWith('@')) {
        const match = npmPart.match(/^(@[^/]+\/[^@]+)(?:@(.+))?$/);
        if (!match) return null;
        packageName = match[1];
      } else {
        const match = npmPart.match(/^([^@]+)(?:@(.+))?$/);
        if (!match) return null;
        packageName = match[1];
      }

      const encodedName = packageName.replace('@', '%40').replace('/', '%2F');
      const packageUrl = `${this.packagesBaseUrl}/registries/npmjs.org/packages/${encodedName}`;
      
      core.info(`Fetching package: ${packageUrl}`);
      const packageResponse = await fetch(packageUrl);
      
      if (!packageResponse.ok) {
        core.warning(`Package API failed for ${packageName}: ${packageResponse.status}`);
        return null;
      }

      const packageData = await packageResponse.json();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      this.cache.set(purl, packageData);
      
      return packageData;
    } catch (error) {
      core.warning(`Error fetching ${purl}: ${error.message}`);
      return null;
    }
  }

  hasBigTechBacking(maintainers, repoOwner) {
    // Check maintainer emails
    if (maintainers && Array.isArray(maintainers)) {
      const hasEmailBacking = maintainers.some(m => {
        if (!m.email) return false;
        const domain = m.email.split('@')[1]?.toLowerCase();
        return this.bigTechDomains.includes(domain);
      });
      if (hasEmailBacking) return true;
    }
    
    // Check repo owner
    if (repoOwner) {
      const ownerLower = repoOwner.toLowerCase();
      const bigTechOrgs = ['facebook', 'meta', 'google', 'microsoft', 'amazon', 'netflix', 'apple', 'openai', 'oracle', 'ibm', 'salesforce', 'intel', 'amd'];
      return bigTechOrgs.some(org => ownerLower.includes(org));
    }
    
    return false;
  }

  async getPackageInfo(purl) {
    const data = await this.getPackageData(purl);
    if (!data) return null;

    const repoMeta = data.repo_metadata || {};
    
    const info = {
      name: data.name,
      dependents_count: data.dependent_packages_count || 0,
      stars: repoMeta.stargazers_count || 0,
      age_months: data.created_at ? this.monthsSince(data.created_at) : 0,
      last_update_months: data.updated_at ? this.monthsSince(data.updated_at) : 0,
      repository_url: data.repository_url,
      big_tech_backing: this.hasBigTechBacking(data.maintainers, repoMeta.owner)
    };

    return info;
  }

  monthsSince(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const months = (now.getFullYear() - date.getFullYear()) * 12 + 
                   (now.getMonth() - date.getMonth());
    return Math.max(0, months);
  }
}

// SBOM Parser
class SBOMParser {
  static async parse(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const sbom = JSON.parse(content);

      if (sbom.spdxVersion) {
        return this.parseSPDX(sbom);
      } else if (sbom.bomFormat === 'CycloneDX') {
        return this.parseCycloneDX(sbom);
      } else {
        throw new Error('Unsupported SBOM format. Expected SPDX or CycloneDX JSON.');
      }
    } catch (error) {
      core.setFailed(`Failed to parse SBOM: ${error.message}`);
      throw error;
    }
  }

  static parseSPDX(sbom) {
    const components = [];
    
    if (sbom.packages) {
      for (const pkg of sbom.packages) {
        if (pkg.externalRefs) {
          const purlRef = pkg.externalRefs.find(ref => ref.referenceType === 'purl');
          if (purlRef) {
            components.push({
              name: pkg.name,
              version: pkg.versionInfo,
              purl: purlRef.referenceLocator,
              supplier: pkg.supplier,
              license: pkg.licenseConcluded
            });
          }
        }
      }
    }

    return components;
  }

  static parseCycloneDX(sbom) {
    const components = [];
    
    if (sbom.components) {
      for (const component of sbom.components) {
        components.push({
          name: component.name,
          version: component.version,
          purl: component.purl,
          supplier: component.supplier?.name,
          license: component.licenses?.[0]?.license?.id
        });
      }
    }

    return components;
  }
}

// Dependency Analyzer
class DependencyAnalyzer {
  constructor(dependencyThreshold) {
    this.dependencyThreshold = parseInt(dependencyThreshold) || 1000;
    this.ecosystems = new EcosystemsClient();
  }

  async analyzeComponents(components) {
    const results = [];

    core.info(`Analyzing ${components.length} components...`);

    for (const component of components) {
      if (!component.purl) {
        core.warning(`Skipping ${component.name}: no PURL available`);
        continue;
      }

      core.info(`Analyzing ${component.name}...`);
      
      const info = await this.ecosystems.getPackageInfo(component.purl);
      
      if (info) {
        // Only include packages with high dependency counts
        if (info.dependents_count >= this.dependencyThreshold) {
          results.push({
            ...component,
            ...info
          });
        }
      } else {
        core.warning(`No data available for ${component.name}, skipping`);
      }
    }

    // Sort by dependents count (highest first)
    results.sort((a, b) => b.dependents_count - a.dependents_count);

    return {
      packages: results,
      total_analyzed: components.length,
      high_dependency_count: results.length
    };
  }
}

// Report Generator
class ReportGenerator {
  static async generateMarkdown(analysis, threshold) {
    let report = '# OSS Dependency Analysis Report\n\n';
    
    report += `## Summary\n\n`;
    report += `- **Total Dependencies**: ${analysis.total_analyzed}\n`;
    report += `- **High-Usage Dependencies** (${threshold.toLocaleString()}+ dependents): ${analysis.high_dependency_count}\n`;
    
    const withBigTech = analysis.packages.filter(p => p.big_tech_backing).length;
    const withoutBigTech = analysis.packages.length - withBigTech;
    
    report += `- **With Big Tech Backing**: ${withBigTech}\n`;
    report += `- **Without Big Tech Backing**: ${withoutBigTech}\n\n`;

    if (analysis.packages.length === 0) {
      report += `No dependencies found with ${threshold.toLocaleString()}+ dependents.\n\n`;
      return report;
    }

    // Group by Big Tech backing
    const withBacking = analysis.packages.filter(p => p.big_tech_backing);
    const withoutBacking = analysis.packages.filter(p => !p.big_tech_backing);

    if (withoutBacking.length > 0) {
      report += `## ⚠️ High-Usage Dependencies WITHOUT Big Tech Backing\n\n`;
      report += `These packages are widely used but may lack organizational support:\n\n`;
      
      for (const pkg of withoutBacking) {
        report += `### ${pkg.name} (v${pkg.version})\n\n`;
        report += `- **Dependents**: ${pkg.dependents_count.toLocaleString()} 📦\n`;
        report += `- **Stars**: ${pkg.stars.toLocaleString()} ⭐\n`;
        report += `- **Age**: ${pkg.age_months} months\n`;
        report += `- **Last Update**: ${pkg.last_update_months} months ago\n`;
        if (pkg.repository_url) {
          report += `- **Repository**: ${pkg.repository_url}\n`;
        }
        report += `\n`;
      }
    }

    if (withBacking.length > 0) {
      report += `## ✅ High-Usage Dependencies WITH Big Tech Backing\n\n`;
      
      for (const pkg of withBacking) {
        report += `### ${pkg.name} (v${pkg.version})\n\n`;
        report += `- **Dependents**: ${pkg.dependents_count.toLocaleString()} 📦\n`;
        report += `- **Stars**: ${pkg.stars.toLocaleString()} ⭐\n`;
        report += `- **Age**: ${pkg.age_months} months\n`;
        report += `- **Last Update**: ${pkg.last_update_months} months ago\n`;
        if (pkg.repository_url) {
          report += `- **Repository**: ${pkg.repository_url}\n`;
        }
        report += `\n`;
      }
    }

    report += `---\n\n`;
    report += `*Generated by OSS Sustainability Analyzer*\n`;

    return report;
  }

  static async saveReport(report, outputPath) {
    await fs.writeFile(outputPath, report, 'utf8');
    core.info(`Report saved to ${outputPath}`);
  }
}

// Main action logic
async function run() {
  try {
    const sbomPath = core.getInput('sbom-path');
    const token = core.getInput('token');
    const dependencyThreshold = core.getInput('dependency-threshold') || '1000';
    const createIssue = core.getInput('create-issue') === 'true';
    const commentPR = core.getInput('comment-pr') === 'true';

    core.info(`Starting OSS Dependency Analysis...`);
    core.info(`SBOM Path: ${sbomPath}`);
    core.info(`Dependency Threshold: ${dependencyThreshold}`);

    const components = await SBOMParser.parse(sbomPath);
    core.info(`Found ${components.length} components in SBOM`);

    const analyzer = new DependencyAnalyzer(dependencyThreshold);
    const analysis = await analyzer.analyzeComponents(components);

    const report = await ReportGenerator.generateMarkdown(analysis, parseInt(dependencyThreshold));
    const reportPath = path.join(process.cwd(), 'oss-dependency-report.md');
    await ReportGenerator.saveReport(report, reportPath);

    core.setOutput('high-dependency-count', analysis.high_dependency_count);
    core.setOutput('without-backing-count', analysis.packages.filter(p => !p.big_tech_backing).length);
    core.setOutput('report-path', reportPath);

    if (commentPR && github.context.payload.pull_request) {
      const octokit = github.getOctokit(token);
      await octokit.rest.issues.createComment({
        ...github.context.repo,
        issue_number: github.context.payload.pull_request.number,
        body: report
      });
      core.info('Posted analysis as PR comment');
    }

    const withoutBacking = analysis.packages.filter(p => !p.big_tech_backing).length;
    if (createIssue && withoutBacking > 0) {
      const octokit = github.getOctokit(token);
      await octokit.rest.issues.create({
        ...github.context.repo,
        title: `⚠️ ${withoutBacking} High-Usage Dependencies Without Big Tech Backing`,
        body: report,
        labels: ['dependencies', 'sustainability']
      });
      core.info('Created issue for dependencies without backing');
    }

    core.info('✅ Analysis complete!');

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();