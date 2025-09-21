import { useState, useEffect } from 'react';

interface Service {
  id: string;
  data: {
    title: string;
    description: string;
    category: string;
    price_tier: string;
    estimated_hours: string;
  };
}

interface FormData {
  projectName: string;
  username: string;
  repoUrl: string;
  email: string;
  services: string[];
  notes: string;
}

const WishlistForm = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    username: '',
    repoUrl: '',
    email: '',
    services: [],
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // In a real implementation, you'd fetch this from your services data
    // For now, we'll use placeholder data
    setServices([
      {
        id: 'governance-setup',
        data: {
          title: 'Governance Setup',
          description: 'Establish project governance structure and guidelines',
          category: 'Governance',
          price_tier: 'medium',
          estimated_hours: '8-12 hours'
        }
      },
      {
        id: 'community-strategy',
        data: {
          title: 'Community Strategy',
          description: 'Develop comprehensive community growth plan',
          category: 'Community',
          price_tier: 'high',
          estimated_hours: '10-15 hours'
        }
      },
      {
        id: 'security-audit',
        data: {
          title: 'Security Audit',
          description: 'Comprehensive security review of codebase',
          category: 'Security',
          price_tier: 'high',
          estimated_hours: '15-20 hours'
        }
      }
    ]);
  }, []);

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Generate GitHub issue body
    const selectedServiceNames = services
      .filter(service => formData.services.includes(service.id))
      .map(service => service.data.title);

    const issueBody = `## Wishlist Request

### Project Information
- **Project Name:** ${formData.projectName}
- **Repository:** ${formData.repoUrl}
- **Maintainer:** @${formData.username}
- **Contact:** ${formData.email}

### Services Requested
${selectedServiceNames.map(name => `- ${name}`).join('\n')}

### Additional Notes
${formData.notes || 'None'}

---
*This wishlist was created via the OSS Wishlist platform*`;

    const issueTitle = `Wishlist: ${formData.projectName}`;
    const repoOwner = 'oss-wishlist'; // Your GitHub org
    const repoName = 'wishlists'; // Repository for wishlist issues
    
    const issueUrl = `https://github.com/${repoOwner}/${repoName}/issues/new?` +
      `title=${encodeURIComponent(issueTitle)}&` +
      `body=${encodeURIComponent(issueBody)}&` +
      `labels=wishlist`;

    // Open GitHub issue creation in new tab
    window.open(issueUrl, '_blank');
    
    setIsLoading(false);
  };

  const getPriceDisplay = (tier: string) => {
    const prices = {
      low: 'Budget',
      medium: 'Standard',
      high: 'Premium'
    };
    return prices[tier as keyof typeof prices] || tier;
  };

  const getPriceColor = (tier: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-purple-100 text-purple-800'
    };
    return colors[tier as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Project Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Project Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.projectName}
                onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="My Awesome Project"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Username *
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="octocat"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repository URL *
              </label>
              <input
                type="url"
                required
                value={formData.repoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, repoUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://github.com/username/project"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
          </div>
        </div>

        {/* Services Selection */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Select Services Needed</h3>
          <div className="space-y-3">
            {services.map((service) => (
              <label
                key={service.id}
                className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.services.includes(service.id)}
                  onChange={() => handleServiceToggle(service.id)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{service.data.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{service.data.description}</p>
                      <p className="text-gray-500 text-xs mt-2">{service.data.estimated_hours}</p>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional context about your project's needs..."
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isLoading || formData.services.length === 0}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Creating Wishlist...' : 'Create Wishlist'}
          </button>
          <p className="text-sm text-gray-600 mt-2">
            This will open GitHub to create your wishlist issue
          </p>
        </div>
      </form>
    </div>
  );
};

export default WishlistForm;