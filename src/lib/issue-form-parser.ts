// Utility to parse GitHub Issue Form responses
// Issue forms create a structured format that's easier to parse

interface ParsedIssueForm {
  project: string;
  maintainer: string;
  repository: string;
  urgency: string;
  services: string[];
  resources: string[];
  additionalContext?: string;
  wantsFundingYml: boolean;
  // Optional form fields
  timeline?: string;
  organizationType?: 'individual' | 'company' | 'nonprofit' | 'foundation';
  organizationName?: string;
  additionalNotes?: string;
}

export function parseIssueForm(body: string): ParsedIssueForm {
  const result: ParsedIssueForm = {
    project: '',
    maintainer: '',
    repository: '',
    urgency: 'medium',
    services: [],
    resources: [],
    wantsFundingYml: false
  };

  // Issue forms create sections with ### headers
  const sections = body.split('###').map(s => s.trim()).filter(Boolean);

  for (const section of sections) {
    const lines = section.split('\n');
    const header = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();

    switch (header) {
      case 'Project Name':
        result.project = content.replace('_No response_', '').trim();
        break;
      
      case 'Maintainer GitHub Username':
        result.maintainer = content.replace('_No response_', '').replace('@', '').trim();
        break;
      
      case 'Project Repository':
        result.repository = content.replace('_No response_', '').trim();
        break;
      
      case 'Urgency Level':
        const urgencyMap: Record<string, string> = {
          'Low - Planning for future': 'low',
          'Medium - Needed within months': 'medium',
          'High - Needed within weeks': 'high',
          'Critical - Needed immediately': 'critical'
        };
        result.urgency = urgencyMap[content] || 'medium';
        break;
      
      case 'Services Requested':
        // Parse checkboxes: - [x] Service Name
        const serviceLines = content.split('\n');
        for (const line of serviceLines) {
          if (line.includes('- [x] ') || line.includes('- [X] ')) {
            const service = line.replace(/- \[[xX]\] /, '').trim();
            if (service && service !== '_No response_') {
              result.services.push(service);
            }
          }
        }
        break;
      
      case 'Resources Requested':
        const resourceLines = content.split('\n');
        for (const line of resourceLines) {
          if (line.includes('- [x] ') || line.includes('- [X] ')) {
            const resource = line.replace(/- \[[xX]\] /, '').trim();
            if (resource && resource !== '_No response_') {
              result.resources.push(resource);
            }
          }
        }
        break;
      
      case 'Additional Context':
        if (content !== '_No response_') {
          result.additionalContext = content;
        }
        break;
      
      case 'FUNDING.yml Setup':
        result.wantsFundingYml = content.includes('- [x]') || content.includes('- [X]');
        break;
      
      case 'Timeline':
        if (content !== '_No response_') {
          result.timeline = content;
        }
        break;
      
      case 'Organization Type':
        const orgTypeMap: Record<string, 'individual' | 'company' | 'nonprofit' | 'foundation'> = {
          'Individual maintainer': 'individual',
          'Company': 'company',
          'Nonprofit organization': 'nonprofit',
          'Foundation': 'foundation'
        };
        result.organizationType = orgTypeMap[content] || 'individual';
        break;
      
      case 'Organization Name':
        if (content !== '_No response_') {
          result.organizationName = content;
        }
        break;
      
      case 'Additional Notes':
        if (content !== '_No response_') {
          result.additionalNotes = content;
        }
        break;
    }
  }

  return result;
}

// Format data for creating an issue via API (matching issue form structure)
export function formatIssueFormBody(data: {
  project: string;
  maintainer: string;
  repository: string;
  urgency: string;
  services: string[];
  resources: string[];
  additionalContext?: string;
  wantsFundingYml?: boolean;
  timeline?: string;
  organizationType?: 'individual' | 'company' | 'nonprofit' | 'foundation';
  organizationName?: string;
  additionalNotes?: string;
}): string {
  const urgencyDisplay: Record<string, string> = {
    'low': 'Low - Planning for future',
    'medium': 'Medium - Needed within months',
    'high': 'High - Needed within weeks',
    'critical': 'Critical - Needed immediately'
  };

  let body = '';
  
  body += `### Project Name\n\n${data.project}\n\n`;
  body += `### Maintainer GitHub Username\n\n${data.maintainer}\n\n`;
  body += `### Project Repository\n\n${data.repository}\n\n`;
  body += `### Urgency Level\n\n${urgencyDisplay[data.urgency] || 'Medium - Needed within months'}\n\n`;
  
  body += `### Services Requested\n\n`;
  if (data.services.length > 0) {
    for (const service of data.services) {
      body += `- [x] ${service}\n`;
    }
  } else {
    body += '_No response_';
  }
  body += '\n\n';
  
  body += `### Resources Requested\n\n`;
  if (data.resources.length > 0) {
    for (const resource of data.resources) {
      body += `- [x] ${resource}\n`;
    }
  } else {
    body += '_No response_';
  }
  body += '\n\n';
  
  if (data.additionalContext) {
    body += `### Additional Context\n\n${data.additionalContext}\n\n`;
  }
  
  if (data.timeline) {
    body += `### Timeline\n\n${data.timeline}\n\n`;
  }
  
  if (data.organizationType) {
    const orgTypeDisplay: Record<string, string> = {
      'individual': 'Individual maintainer',
      'company': 'Company',
      'nonprofit': 'Nonprofit organization',
      'foundation': 'Foundation'
    };
    body += `### Organization Type\n\n${orgTypeDisplay[data.organizationType]}\n\n`;
  }
  
  if (data.organizationName) {
    body += `### Organization Name\n\n${data.organizationName}\n\n`;
  }
  
  if (data.additionalNotes) {
    body += `### Additional Notes\n\n${data.additionalNotes}\n\n`;
  }
  
  if (data.wantsFundingYml) {
    body += `### FUNDING.yml Setup\n\n- [x] Yes, create a FUNDING.yml PR for my repository\n\n`;
  }
  
  return body;
}
