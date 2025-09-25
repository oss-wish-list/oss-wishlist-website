import { useState, useEffect } from 'react';

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

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price_tier: string;
  estimated_hours: string;
}

interface Expert {
  id: string;
  name: string;
  title: string;
  specialties: string[];
}

interface WishlistFormProps {
  services?: Service[];
  experts?: Expert[];
}

const WishlistForm = ({ services = [], experts = [] }: WishlistFormProps) => {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    selectedServices: [] as string[],
    selectedExperts: [] as string[],
    urgency: 'medium' as 'low' | 'medium' | 'high',
    timeline: '',
    budgetRange: '',
    projectStage: 'growing' as 'early' | 'growing' | 'mature' | 'scaling' | 'enterprise-ready',
    technologies: [] as string[],
    organizationType: 'individual' as 'individual' | 'company' | 'nonprofit' | 'foundation',
    organizationName: '',
    organizationSize: '',
    organizationWebsite: '',
    additionalNotes: ''
  });

  useEffect(() => {
    checkAuthCallback();
  }, []);

  const checkAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const error = urlParams.get('error');
        
    if (authStatus === 'success') {
      window.location.href = '/oss-wishlist-website/submit';
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

  const handleExpertToggle = (expertId: string) => {
    setWishlistData(prev => ({
      ...prev,
      selectedExperts: prev.selectedExperts.includes(expertId)
        ? prev.selectedExperts.filter(id => id !== expertId)
        : [...prev.selectedExperts, expertId]
    }));
  };

  const handleTechnologyAdd = (tech: string) => {
    if (tech && !wishlistData.technologies.includes(tech)) {
      setWishlistData(prev => ({
        ...prev,
        technologies: [...prev.technologies, tech]
      }));
    }
  };

  const handleTechnologyRemove = (tech: string) => {
    setWishlistData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const handleSubmitWishlist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (wishlistData.selectedServices.length === 0) {
      setError('Please select at least one service');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare wishlist data
      const repoInfo = manualRepoData || (selectedRepo && user ? {
        name: selectedRepo.name,
        url: selectedRepo.html_url,
        username: user.login,
        description: selectedRepo.description || ''
      } : null);

      if (!repoInfo) {
        throw new Error('Repository information is missing');
      }

      const wishlistPayload = {
        project_name: repoInfo.name,
        repo_url: repoInfo.url,
        github_stars: selectedRepo?.stargazers_count || 0,
        project_stage: wishlistData.projectStage,
        technologies: wishlistData.technologies,
        maintainer: {
          username: repoInfo.username,
          display_name: user?.name || repoInfo.username,
          email: user?.email || `${repoInfo.username}@github.local`,
          github_id: user?.id || 0,
          avatar_url: user?.avatar_url,
        },
        organization: wishlistData.organizationType !== 'individual' ? {
          type: wishlistData.organizationType,
          name: wishlistData.organizationName,
          size: wishlistData.organizationSize,
          website: wishlistData.organizationWebsite || undefined,
        } : undefined,
        services_needed: wishlistData.selectedServices,
        preferred_experts: wishlistData.selectedExperts,
        urgency: wishlistData.urgency,
        timeline: wishlistData.timeline,
        budget_range: wishlistData.budgetRange,
        additional_notes: wishlistData.additionalNotes,
      };

      // Create GitHub issue with structured data
      const issueTitle = `Wishlist: ${repoInfo.name} - ${wishlistData.selectedServices.join(', ')}`;
      const issueBody = `# OSS Wishlist Request

## Project Information
- **Project:** [${repoInfo.name}](${repoInfo.url})
- **Stage:** ${wishlistData.projectStage}
- **Technologies:** ${wishlistData.technologies.join(', ') || 'Not specified'}

## Services Requested
${wishlistData.selectedServices.map(service => `- ${services.find(s => s.id === service)?.title || service}`).join('\n')}

## Preferred Experts
${wishlistData.selectedExperts.length > 0 
  ? wishlistData.selectedExperts.map(expert => `- ${experts.find(e => e.id === expert)?.name || expert}`).join('\n')
  : 'No specific preference'}

## Project Details
- **Urgency:** ${wishlistData.urgency}
- **Timeline:** ${wishlistData.timeline || 'Flexible'}
- **Budget Range:** ${wishlistData.budgetRange || 'To be discussed'}

## Organization
- **Type:** ${wishlistData.organizationType}
${wishlistData.organizationName ? `- **Name:** ${wishlistData.organizationName}` : ''}
${wishlistData.organizationSize ? `- **Size:** ${wishlistData.organizationSize}` : ''}

## Additional Notes
${wishlistData.additionalNotes || 'None provided'}

---
*Wishlist created via [OSS Wishlist Platform](${window.location.origin})*

\`\`\`json
${JSON.stringify(wishlistPayload, null, 2)}
\`\`\`
`;

      const issueUrl = `https://github.com/oss-wish-list/wishlists/issues/new?` +
        `title=${encodeURIComponent(issueTitle)}&` +
        `body=${encodeURIComponent(issueBody)}&` +
        `labels=wishlist,${wishlistData.urgency}-priority`;

      window.open(issueUrl, '_blank');
      
      // Reset form or show success message
      alert('Wishlist created! Please complete the GitHub issue creation.');
      
    } catch (err) {
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

  // Step 2: Repository Selection (OAuth) or Confirmation (Manual)
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

    // OAuth repository selection (if user is authenticated)
    if (user) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <img 
                  src={user?.avatar_url || ''} 
                  alt={user?.name || user?.login || 'User'}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Welcome, {user?.name || user?.login}!
                  </h3>
                  <p className="text-gray-600">@{user?.login}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setUser(null);
                  setCurrentStep('auth');
                }}
                className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-300 rounded-lg"
              >
                Start Over
              </button>
            </div>

            {user?.repositories && user.repositories.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Select a Repository
                </h4>
                <div className="grid gap-4 max-h-60 overflow-y-auto mb-6">
                  {user?.repositories?.map((repo) => (
                    <div
                      key={repo.id}
                      onClick={() => setSelectedRepo(repo)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedRepo?.id === repo.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{repo.name}</h5>
                          <p className="text-sm text-gray-600 mt-1">{repo.description || 'No description'}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            {repo.language && (
                              <span>{repo.language}</span>
                            )}
                            <span>⭐ {repo.stargazers_count}</span>
                          </div>
                        </div>
                        {selectedRepo?.id === repo.id && (
                          <div className="ml-2 text-blue-600">✓</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedRepo && (
                  <div className="text-center">
                    <button
                      onClick={proceedToWishlist}
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Create Wishlist for {selectedRepo.name}
                    </button>
                  </div>
                )}
              </div>
            )}

            {(!user?.repositories || user.repositories.length === 0) && (
              <div className="text-center py-8">
                <p className="text-gray-600">No repositories found with admin access.</p>
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  // Step 3: Wishlist Creation Form
  if (currentStep === 'wishlist') {
    return (
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmitWishlist} className="space-y-8">
          {/* Header */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Wishlist</h2>
            <p className="text-gray-600">
              Select the services and experts you'd like help from for your project.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Services Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Services Needed <span className="text-red-500">*</span>
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {services.map((service) => (
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
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">{service.category}</span>
                        <span>{service.estimated_hours}</span>
                        <span className="capitalize">{service.price_tier} cost</span>
                      </div>
                    </div>
                    {wishlistData.selectedServices.includes(service.id) && (
                      <div className="ml-2 text-blue-600">✓</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experts Selection */}
          {experts.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Preferred Experts (Optional)
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {experts.map((expert) => (
                  <div
                    key={expert.id}
                    onClick={() => handleExpertToggle(expert.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      wishlistData.selectedExperts.includes(expert.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{expert.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{expert.title}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {expert.specialties.slice(0, 3).map((specialty) => (
                            <span key={specialty} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                      {wishlistData.selectedExperts.includes(expert.id) && (
                        <div className="ml-2 text-blue-600">✓</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Stage
                </label>
                <select
                  value={wishlistData.projectStage}
                  onChange={(e) => setWishlistData(prev => ({ ...prev, projectStage: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="early">Early stage (idea/prototype)</option>
                  <option value="growing">Growing (active development)</option>
                  <option value="mature">Mature (stable, established)</option>
                  <option value="scaling">Scaling (expanding user base)</option>
                  <option value="enterprise-ready">Enterprise ready</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency
                </label>
                <select
                  value={wishlistData.urgency}
                  onChange={(e) => setWishlistData(prev => ({ ...prev, urgency: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low - Flexible timeline</option>
                  <option value="medium">Medium - Preferred timeline</option>
                  <option value="high">High - Urgent need</option>
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
                  placeholder="e.g., 'Within 3 months', 'Q1 2024'"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range
                </label>
                <select
                  value={wishlistData.budgetRange}
                  onChange={(e) => setWishlistData(prev => ({ ...prev, budgetRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select budget range</option>
                  <option value="volunteer">Volunteer/Pro bono</option>
                  <option value="under-1k">Under $1,000</option>
                  <option value="1k-5k">$1,000 - $5,000</option>
                  <option value="5k-20k">$5,000 - $20,000</option>
                  <option value="20k-50k">$20,000 - $50,000</option>
                  <option value="50k-plus">$50,000+</option>
                  <option value="ongoing-sponsorship">Ongoing sponsorship</option>
                </select>
              </div>
            </div>
          </div>

          {/* Organization Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Details</h3>
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
                  <option value="individual">Individual maintainer</option>
                  <option value="company">Company</option>
                  <option value="nonprofit">Nonprofit organization</option>
                  <option value="foundation">Foundation</option>
                </select>
              </div>

              {wishlistData.organizationType !== 'individual' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={wishlistData.organizationName}
                      onChange={(e) => setWishlistData(prev => ({ ...prev, organizationName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Size
                    </label>
                    <select
                      value={wishlistData.organizationSize}
                      onChange={(e) => setWishlistData(prev => ({ ...prev, organizationSize: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select size</option>
                      <option value="startup">Startup (1-10 employees)</option>
                      <option value="small">Small (11-50 employees)</option>
                      <option value="medium">Medium (51-200 employees)</option>
                      <option value="enterprise">Enterprise (200+ employees)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Website
                    </label>
                    <input
                      type="url"
                      value={wishlistData.organizationWebsite}
                      onChange={(e) => setWishlistData(prev => ({ ...prev, organizationWebsite: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
            <textarea
              value={wishlistData.additionalNotes}
              onChange={(e) => setWishlistData(prev => ({ ...prev, additionalNotes: e.target.value }))}
              rows={4}
              placeholder="Any additional information about your project, specific requirements, or context that would help experts understand your needs..."
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
                Back
              </button>
              <button
                type="submit"
                disabled={loading || wishlistData.selectedServices.length === 0}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Creating Wishlist...' : 'Create Wishlist'}
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