import { useState, useEffect } from 'react';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  slug?: string;
}

interface WishlistFormProps {
  services?: Service[];
}

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  repositories: GitHubRepository[];
  authenticated: boolean;
}

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
}

const WishlistForm = ({ services = [] }: WishlistFormProps) => {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{
    issueNumber: number;
    issueUrl: string;
    issueTitle: string;
  } | null>(null);
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [manualRepoUrl, setManualRepoUrl] = useState('');
  const [manualRepoData, setManualRepoData] = useState<{
    name: string;
    description: string;
    url: string;
    username: string;
  } | null>(null);
  
  // Step management
  const [currentStep, setCurrentStep] = useState<'auth' | 'repo' | 'wishlist'>('auth');
  
  // Wishlist form state
  const [wishlistData, setWishlistData] = useState({
    projectTitle: '',
    selectedServices: [] as string[],
    urgency: 'medium' as 'low' | 'medium' | 'high',
    timeline: '',
    organizationType: 'individual' as 'individual' | 'company' | 'nonprofit' | 'foundation',
    organizationName: '',
    additionalNotes: ''
  });

  // Available services from content collections
  const availableServices = services.length > 0 ? services : [
    { id: 'community-strategy', title: 'Community Strategy', description: 'Help building and growing your community', category: 'Community' },
    { id: 'governance-setup', title: 'Governance Setup', description: 'Establish project governance and decision-making processes', category: 'Governance' },
    { id: 'security-audit', title: 'Security Audit', description: 'Security review and vulnerability assessment', category: 'Security' },
    { id: 'funding-strategy', title: 'Funding Strategy', description: 'Help securing sponsorship and funding', category: 'Strategy' },
    { id: 'documentation', title: 'Documentation', description: 'Improve project documentation and guides', category: 'Documentation' },
    { id: 'marketing', title: 'Marketing & Outreach', description: 'Promote your project and grow adoption', category: 'Marketing' }
  ];

  useEffect(() => {
    checkAuthCallback();
  }, []);

  const checkAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const error = urlParams.get('error');
        
    if (authStatus === 'success') {
      window.location.href = '/oss-wishlist-website/maintainers';
    } else if (error) {
      setError(`Authentication failed: ${error.replace('_', ' ')}`);
    }
  };

  const initiateGitHubAuth = () => {
    setLoading(true);
    setError('');
    window.location.href = '/oss-wishlist-website/api/auth/github';
  };

  const parseGitHubUrl = (url: string) => {
    try {
      const cleanUrl = url.replace(/\.git$/, '');
      const match = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
      
      if (match) {
        const [, username, repoName] = match;
        return {
          username,
          name: repoName,
          description: 'Repository entered manually',
          url: `https://github.com/${username}/${repoName}`
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleManualRepoSubmit = () => {
    setError('');
    const repoData = parseGitHubUrl(manualRepoUrl);
    
    if (!repoData) {
      setError('Please enter a valid GitHub repository URL (e.g., https://github.com/username/repository)');
      return;
    }
    
    setManualRepoData(repoData);
    setCurrentStep('repo');
  };

  const proceedToWishlist = () => {
    if ((user && selectedRepo) || manualRepoData) {
      setCurrentStep('wishlist');
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setWishlistData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
    }));
  };

  const handleSubmitWishlist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Current step:', currentStep);
    console.log('Project title:', wishlistData.projectTitle);
    console.log('Selected services:', wishlistData.selectedServices);
    console.log('Manual repo data:', manualRepoData);
    console.log('Selected repo:', selectedRepo);
    console.log('User:', user);
    
    if (!wishlistData.projectTitle.trim()) {
      setError('Please enter a project title');
      return;
    }
    
    if (wishlistData.selectedServices.length === 0) {
      setError('Please select at least one service');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const repoInfo = manualRepoData || (selectedRepo && user ? {
        name: selectedRepo.name,
        url: selectedRepo.html_url,
        username: user.login,
        description: selectedRepo.description || ''
      } : null);

      console.log('Repository info:', repoInfo);

      if (!repoInfo) {
        console.error('Repository information is missing');
        throw new Error('Repository information is missing. Please go back and select or enter a repository.');
      }

      const selectedServiceTitles = wishlistData.selectedServices.map(
        serviceId => availableServices.find(s => s.id === serviceId)?.title || serviceId
      );

      const issueTitle = `Wishlist: ${wishlistData.projectTitle} - ${selectedServiceTitles.join(', ')}`;
      const issueBody = `# 🎯 OSS Project Wishlist

## 📁 Project Information
- **Project:** [${wishlistData.projectTitle}](${repoInfo.url})
- **Maintainer:** @${repoInfo.username}
- **Description:** ${repoInfo.description}

## 🛠️ Services Requested
${wishlistData.selectedServices.map(serviceId => {
  const service = availableServices.find(s => s.id === serviceId);
  const serviceLink = service?.slug ? `${window.location.origin}${import.meta.env.BASE_URL}/services/${service.slug}` : '';
  return `- **${service?.title || serviceId}** (${service?.category || 'General'})
  ${service?.description || 'No description available'}${serviceLink ? `
  📖 [Learn more about this service](${serviceLink})` : ''}`;
}).join('\n')}

## ⏰ Project Details
- **Urgency:** ${wishlistData.urgency.charAt(0).toUpperCase() + wishlistData.urgency.slice(1)}
- **Timeline:** ${wishlistData.timeline || 'Flexible'}

## 🏢 Organization
- **Type:** ${wishlistData.organizationType.charAt(0).toUpperCase() + wishlistData.organizationType.slice(1)}
${wishlistData.organizationName ? `- **Name:** ${wishlistData.organizationName}` : ''}

## 📝 Additional Notes
${wishlistData.additionalNotes || 'None provided'}

---
💝 **Ready to help?** Comment below or reach out to the maintainer!

*Created via [OSS Wishlist Platform](${window.location.origin})*
`;

      // Submit directly to our API instead of opening GitHub
      const response = await fetch(`${import.meta.env.BASE_URL}/api/submit-wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: issueTitle,
          body: issueBody,
          labels: ['wishlist', `${wishlistData.urgency}-priority`],
          formData: {
            projectTitle: wishlistData.projectTitle,
            projectUrl: repoInfo.url,
            maintainer: repoInfo.username,
            services: wishlistData.selectedServices,
            urgency: wishlistData.urgency,
            description: repoInfo.description || '',
            additionalNotes: wishlistData.additionalNotes || ''
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create wishlist');
      }

      // Success! Store the result
      setSuccess({
        issueNumber: result.issue.number,
        issueUrl: result.issue.url,
        issueTitle: result.issue.title
      });
      
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create wishlist');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Authentication
  if (currentStep === 'auth') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-sm border mb-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create Your Wishlist</h3>
            <p className="text-gray-600 text-sm mb-6">
              Choose how you'd like to add your GitHub repository
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              {/* GitHub OAuth Option */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Option 1: Sign in with GitHub</h4>
                <p className="text-green-700 text-sm mb-3">
                  🔒 Authenticate securely to access your repositories
                </p>
                <button
                  onClick={initiateGitHubAuth}
                  disabled={loading}
                  className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400"
                >
                  {loading ? 'Connecting...' : 'Sign in with GitHub'}
                </button>
              </div>
              
              {/* Manual Entry Option */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Option 2: Enter Repository URL</h4>
                <p className="text-blue-700 text-sm mb-3">
                  📝 Manually enter your GitHub repository URL
                </p>
                <button
                  onClick={() => setUseManualEntry(true)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
                >
                  Enter Repository URL
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Entry Form */}
        {useManualEntry && (
          <div className="bg-white p-8 rounded-lg shadow-sm border mb-8">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Enter Repository URL</h3>
              <p className="text-gray-600 text-sm mb-4 text-center">
                Paste your GitHub repository URL below
              </p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="repo-url" className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub Repository URL
                  </label>
                  <input
                    id="repo-url"
                    type="url"
                    value={manualRepoUrl}
                    onChange={(e) => setManualRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleManualRepoSubmit}
                    disabled={!manualRepoUrl.trim()}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Continue
                  </button>
                  <button
                    onClick={() => {
                      setUseManualEntry(false);
                      setManualRepoUrl('');
                      setError('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 2: Repository Selection/Confirmation
  if (currentStep === 'repo') {
    if (manualRepoData) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Confirm Repository Details
              </h3>
              
              <div className="bg-gray-50 border rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900">{manualRepoData.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{manualRepoData.description}</p>
                <p className="text-sm text-blue-600 mt-2">{manualRepoData.url}</p>
                <p className="text-sm text-gray-500 mt-2">Maintainer: @{manualRepoData.username}</p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={proceedToWishlist}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Create Wishlist
                </button>
                <button
                  onClick={() => {
                    setManualRepoData(null);
                    setManualRepoUrl('');
                    setCurrentStep('auth');
                  }}
                  className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // OAuth repository selection (simplified for now)
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Repository Selection</h3>
            <p className="text-gray-600 mb-6">OAuth authentication is in progress...</p>
            <button
              onClick={() => setCurrentStep('auth')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Wishlist Creation Form
  if (currentStep === 'wishlist') {
    // Show success state if wishlist was created
    if (success) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">🎉 Wishlist Created Successfully!</h3>
              <p className="text-gray-600 mb-6">
                Your wishlist has been submitted as GitHub issue #{success.issueNumber}
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">{success.issueTitle}</h4>
                <p className="text-sm text-gray-600">
                  Your wishlist is now visible to potential contributors and supporters.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={success.issueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                  View Issue on GitHub
                </a>
                <button
                  onClick={() => {
                    setSuccess(null);
                    setCurrentStep('auth');
                    setWishlistData({
                      projectTitle: '',
                      selectedServices: [],
                      urgency: 'medium',
                      timeline: '',
                      organizationType: 'individual',
                      organizationName: '',
                      additionalNotes: ''
                    });
                  }}
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Create Another Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmitWishlist} className="space-y-8">
          {/* Header */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 Create Your Wishlist</h2>
            <p className="text-gray-600">
              Select the services you need help with for your project.
            </p>
            {/* Debug info */}
            <div className="mt-2 text-xs text-gray-400">
              Debug: Step={currentStep}, HasRepo={!!(manualRepoData || (selectedRepo && user))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Project Title */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📝 Project Title <span className="text-red-500">*</span>
            </h3>
            <input
              type="text"
              value={wishlistData.projectTitle}
              onChange={(e) => setWishlistData(prev => ({ ...prev, projectTitle: e.target.value }))}
              placeholder="Enter your project title (e.g., 'My Awesome Library')"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              This will be the main title for your wishlist and how people will identify your project.
            </p>
          </div>

          {/* Services Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🛠️ Services Needed <span className="text-red-500">*</span>
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {availableServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleServiceToggle(service.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    wishlistData.selectedServices.includes(service.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{service.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                          {service.category}
                        </span>
                        {service.slug && (
                          <a
                            href={`${import.meta.env.BASE_URL}/services/${service.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Learn more →
                          </a>
                        )}
                      </div>
                    </div>
                    {wishlistData.selectedServices.includes(service.id) && (
                      <div className="ml-2 text-blue-600 text-lg">✓</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⏰ Project Details</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency
                </label>
                <select
                  value={wishlistData.urgency}
                  onChange={(e) => setWishlistData(prev => ({ ...prev, urgency: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">🟢 Low - Flexible timeline</option>
                  <option value="medium">🟡 Medium - Preferred timeline</option>
                  <option value="high">🔴 High - Urgent need</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeline
                </label>
                <input
                  type="text"
                  value={wishlistData.timeline}
                  onChange={(e) => setWishlistData(prev => ({ ...prev, timeline: e.target.value }))}
                  placeholder="e.g., 'Within 3 months', 'Q1 2024', 'Flexible'"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Organization Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏢 Organization Details</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Type
                </label>
                <select
                  value={wishlistData.organizationType}
                  onChange={(e) => setWishlistData(prev => ({ ...prev, organizationType: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="individual">👤 Individual maintainer</option>
                  <option value="company">🏢 Company</option>
                  <option value="nonprofit">🌍 Nonprofit organization</option>
                  <option value="foundation">🏛️ Foundation</option>
                </select>
              </div>

              {wishlistData.organizationType !== 'individual' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={wishlistData.organizationName}
                    onChange={(e) => setWishlistData(prev => ({ ...prev, organizationName: e.target.value }))}
                    placeholder="Enter organization name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Additional Notes</h3>
            <textarea
              value={wishlistData.additionalNotes}
              onChange={(e) => setWishlistData(prev => ({ ...prev, additionalNotes: e.target.value }))}
              rows={4}
              placeholder="Any additional information about your project, specific requirements, or context that would help supporters understand your needs..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep('repo')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading || wishlistData.selectedServices.length === 0 || !wishlistData.projectTitle.trim()}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>🚀 Create Wishlist</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">
              This will create a GitHub issue with your wishlist details
            </p>
          </div>
        </form>
      </div>
    );
  }

  return null;
};

export default WishlistForm;