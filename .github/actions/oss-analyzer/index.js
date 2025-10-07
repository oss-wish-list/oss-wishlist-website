const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs').promises;
const path = require('path');

// Ecosyste.ms API client
class EcosystemsClient {
  constructor() {
    this.packagesBaseUrl = 'https://packages.ecosyste.ms/api/v1';
    this.reposBaseUrl = 'https://repos.ecosyste.ms/api/v1';
    this.cache = new Map();
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
        core.warning(`Failed to fetch ${packageName}: ${packageResponse.status}`);
        return null;
      }

      const packageData = await packageResponse.json();
      
      // Get repository data if available
      let repoData = null;
      if (packageData.repository_url) {
        // Extract owner/repo from GitHub URL
        const repoMatch = packageData.repository_url.match(/github\.com\/([^/]+\/[^/]+)/);
        if (repoMatch) {
          const ownerRepo = repoMatch[1].replace(/\.git$/, '');
          const repoUrl = `${this.reposBaseUrl}/hosts/github.com/repositories/${ownerRepo}`;
          
          core.info(`Fetching repo: ${repoUrl}`);
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const repoResponse = await fetch(repoUrl);
          if (repoResponse.ok) {
            repoData = await repoResponse.json();
          }
        }
      }

      const combinedData = {
        package: packageData,
        repository: repoData
      };

      this.cache.set(purl, combinedData);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return combinedData;
    } catch (error) {
      core.warning(`Error fetching ${purl}: ${error.message}`);
      return null;
    }
  }
  async getCriticalityScore(purl) {
    const data = await this.getPackageData(purl);
    if (!data) return null;

    const pkg = data.package;
    const repo = data.repository;

    const metrics = {
      created_since: repo?.created_at ? this.monthsSince(repo.created_at) : 0,
      updated_since: repo?.updated_at ? this.monthsSince(repo.updated_at) : 0,
      contributor_count: repo?.total_committers || 0,
      org_count: this.calculateOrgCount(pkg.maintainers),
      commit_frequency: repo?.mean_commits || 0,
      recent_releases_count: pkg.releases_count || 0,
      closed_issues_count: 0, // Not available in repos API
      updated_issues_count: 0, // Not available in repos API
      comment_frequency: 0,
      dependents_count: pkg.dependent_packages_count || 0,
      watchers_count: repo?.stargazers_count || 0
    };

    const signals = [
      { weight: 1, value: metrics.created_since, threshold: 120 },
      { weight: 1, value: metrics.updated_since, threshold: 120, inverse: true },
      { weight: 2, value: metrics.contributor_count, threshold: 5000 },
      { weight: 1, value: metrics.org_count, threshold: 10 },
      { weight: 1, value: metrics.commit_frequency, threshold: 1000 },
      { weight: 0.5, value: metrics.recent_releases_count, threshold: 26 },
      { weight: 0.5, value: metrics.closed_issues_count, threshold: 5000 },
      { weight: 0.5, value: metrics.updated_issues_count, threshold: 5000 },
      { weight: 1, value: metrics.comment_frequency, threshold: 15 },
      { weight: 2, value: metrics.dependents_count, threshold: 500000 },
      { weight: 1, value: metrics.watchers_count, threshold: 10000 }
    ];

    let weightedSum = 0;
    let totalWeight = 0;

    for (const signal of signals) {
      let normalizedValue;
      if (signal.inverse) {
        normalizedValue = Math.max(0, 1 - (signal.value / signal.threshold));
      } else {
        normalizedValue = Math.min(1, signal.value / signal.threshold);
      }
      
      weightedSum += signal.weight * normalizedValue;
      totalWeight += signal.weight;
    }

    const score = weightedSum / totalWeight;

    return {
      score: Math.min(Math.max(score, 0), 1.0),
      metrics,
      repository_url: pkg.repository_url,
      homepage: pkg.homepage,
      maintainers: pkg.maintainers
    };
  }

calculateOrgCount(maintainers) {
  if (!maintainers || !Array.isArray(maintainers)) return 1;
  
  // Extract unique email domains from maintainers
  const domains = new Set();
  maintainers.forEach(m => {
    if (m.email) {
      const domain = m.email.split('@')[1];
      // Skip common personal email domains
      if (!['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'].includes(domain)) {
        domains.add(domain);
      }
    }
  });
  
  return Math.max(1, domains.size);
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

// Risk Analyzer
class RiskAnalyzer {
  constructor(criticalityThreshold) {
    this.criticalityThreshold = parseFloat(criticalityThreshold);
    this.ecosystems = new EcosystemsClient();
  }

  async analyzeComponents(components) {
    const results = [];
    let totalScore = 0;
    let analyzedCount = 0;

    core.info(`Analyzing ${components.length} components...`);

    for (const component of components) {
      if (!component.purl) {
        core.warning(`Skipping ${component.name}: no PURL available`);
        continue;
      }

      core.info(`Analyzing ${component.name}...`);
      
      const criticality = await this.ecosystems.getCriticalityScore(component.purl);
      
      if (criticality) {
        totalScore += criticality.score;
        analyzedCount++;

        const riskLevel = this.calculateRiskLevel(criticality.score);
        
        results.push({
          ...component,
          criticality: criticality.score,
          riskLevel,
          metrics: criticality.metrics,
          repository_url: criticality.repository_url
        });
      } else {
        core.warning(`No data available for ${component.name}, skipping`);
      }
    }

    const avgCriticality = analyzedCount > 0 ? totalScore / analyzedCount : 0;
    const overallRiskScore = Math.round((1 - avgCriticality) * 100);

    return {
      components: results.sort((a, b) => b.criticality - a.criticality),
      overallRiskScore,
      analyzedCount,
      totalCount: components.length
    };
  }

  calculateRiskLevel(score) {
    if (score >= this.criticalityThreshold) return 'low';
    if (score >= this.criticalityThreshold * 0.5) return 'medium';
    return 'high';
  }
}

// Report Generator
class ReportGenerator {
  static async generateMarkdown(analysis) {
    let report = '# OSS Sustainability Analysis Report\n\n';
    
    report += `## Summary\n\n`;
    report += `- **Overall Risk Score**: ${analysis.overallRiskScore}/100\n`;
    report += `- **Components Analyzed**: ${analysis.analyzedCount}/${analysis.totalCount}\n`;
    
    const highRisk = analysis.components.filter(c => c.riskLevel === 'high').length;
    const mediumRisk = analysis.components.filter(c => c.riskLevel === 'medium').length;
    const lowRisk = analysis.components.filter(c => c.riskLevel === 'low').length;
    
    report += `- **High Risk**: ${highRisk} components\n`;
    report += `- **Medium Risk**: ${mediumRisk} components\n`;
    report += `- **Low Risk**: ${lowRisk} components\n\n`;

    if (highRisk > 0) {
      report += `## ⚠️ High Risk Dependencies\n\n`;
      report += `These dependencies have low criticality scores and may need attention:\n\n`;
      
      for (const component of analysis.components.filter(c => c.riskLevel === 'high')) {
        report += `### ${component.name} (v${component.version})\n\n`;
        report += `- **Criticality Score**: ${component.criticality.toFixed(3)} (OpenSSF algorithm)\n`;
        report += `- **Dependents**: ${component.metrics.dependents_count.toLocaleString()} 📦\n`;
        report += `- **Contributors**: ${component.metrics.contributor_count}\n`;
        report += `- **Watchers/Stars**: ${component.metrics.watchers_count.toLocaleString()}\n`;
        report += `- **Age**: ${component.metrics.created_since} months\n`;
        report += `- **Last Update**: ${component.metrics.updated_since} months ago\n`;
        if (component.repository_url) {
          report += `- **Repository**: ${component.repository_url}\n`;
        }
        report += `\n**Why this is high risk**: `;
        if (component.metrics.dependents_count < 100) {
          report += `Low dependent count (${component.metrics.dependents_count}). `;
        }
        if (component.metrics.contributor_count < 5) {
          report += `Very few contributors (${component.metrics.contributor_count}) creates high bus factor risk. `;
        }
        if (component.metrics.updated_since > 12) {
          report += `Not updated in over a year (${component.metrics.updated_since} months). `;
        }
        if (component.metrics.commit_frequency < 10) {
          report += `Low commit activity. `;
        }
        report += `\n\n`;
      }
    }

    if (mediumRisk > 0) {
      report += `## ⚡ Medium Risk Dependencies\n\n`;
      
      for (const component of analysis.components.filter(c => c.riskLevel === 'medium')) {
        report += `- **${component.name}** (v${component.version}) - Criticality: ${component.criticality.toFixed(2)}\n`;
      }
      report += `\n`;
    }

    report += `## ✅ Low Risk Dependencies\n\n`;
    report += `${lowRisk} dependencies have high criticality scores and appear well-maintained.\n\n`;

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
    const criticalityThreshold = core.getInput('criticality-threshold');
    const createIssue = core.getInput('create-issue') === 'true';
    const commentPR = core.getInput('comment-pr') === 'true';

    core.info(`Starting OSS Sustainability Analysis...`);
    core.info(`SBOM Path: ${sbomPath}`);
    core.info(`Criticality Threshold: ${criticalityThreshold}`);

    const components = await SBOMParser.parse(sbomPath);
    core.info(`Found ${components.length} components in SBOM`);

    const analyzer = new RiskAnalyzer(criticalityThreshold);
    const analysis = await analyzer.analyzeComponents(components);

    const report = await ReportGenerator.generateMarkdown(analysis);
    const reportPath = path.join(process.cwd(), 'oss-sustainability-report.md');
    await ReportGenerator.saveReport(report, reportPath);

    core.setOutput('risk-score', analysis.overallRiskScore);
    core.setOutput('critical-count', analysis.components.filter(c => c.riskLevel === 'high').length);
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

    const highRiskCount = analysis.components.filter(c => c.riskLevel === 'high').length;
    if (createIssue && highRiskCount > 0) {
      const octokit = github.getOctokit(token);
      await octokit.rest.issues.create({
        ...github.context.repo,
        title: `⚠️ ${highRiskCount} High Risk Dependencies Detected`,
        body: report,
        labels: ['dependencies', 'security', 'sustainability']
      });
      core.info('Created issue for high-risk dependencies');
    }

    core.info('✅ Analysis complete!');

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();