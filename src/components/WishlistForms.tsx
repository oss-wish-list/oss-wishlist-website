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
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{
    issueNumber: number;
    issueUrl: string;
    issueTitle: string;
  } | null>(null);
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
    // Check for auth callback first
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const error = urlParams.get('error');
    
    if (authStatus === 'success' || authStatus === 'already_authenticated') {
      // Clear the URL params
      window.history.replaceState({}, '', '/oss-wishlist-website/maintainers');
      // Check if user is authenticated
      checkUserSession();
    } else if (error) {
      setError(`Authentication failed: ${error.replace('_', ' ')}`);
    } else {
      // No auth callback, just check if user is logged in
      checkUserSession();
    }
  }, []);

  const checkUserSession = async () => {
    try {
      setLoadingRepos(true);
      const response = await fetch('/oss-wishlist-website/api/auth/session');
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // After confirming user is authenticated, fetch their repositories
        await fetchUserRepositories();
      } else {
        setUser(null);
        setRepositories([]);
      }
    } catch (err) {
      setUser(null);
      setRepositories([]);
    } finally {
      setLoadingRepos(false);
    }
  };

  const fetchUserRepositories = async () => {
    try {
      const response = await fetch('/oss-wishlist-website/api/repositories');
      
      if (response.ok) {
        const data = await response.json();
        setRepositories(data.repositories || []);
      } else {
        // If fetching fails, just keep repositories empty
        setRepositories([]);
      }
    } catch (err) {
      console.error('Error fetching repositories:', err);
      setRepositories([]);
    }
  };

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
    setLoading(false);
    setError('');
    window.location.href = '/api/auth/github';
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
    if ((user && selectedRepos.length > 0) || manualRepoData) {
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
      // Create array of repository info
      const repositories = selectedRepos.length > 0 
        ? selectedRepos.map(repo => ({
            name: repo.name,
            url: repo.html_url,
            username: user?.login || '',
            description: repo.description || ''
          }))
        : manualRepoData 
          ? [manualRepoData]
          : [];

      if (repositories.length === 0) {
        console.error('Repository information is missing');
        throw new Error('Repository information is missing. Please go back and select or enter a repository.');
      }

      const selectedServiceTitles = wishlistData.selectedServices.map(
        serviceId => availableServices.find(s => s.id === serviceId)?.title || serviceId
      );

      const issueTitle = `Wishlist: ${wishlistData.projectTitle}`;
      
      // Format repositories section
      const repositoriesSection = repositories.length === 1
        ? `- **Project:** [${wishlistData.projectTitle}](${repositories[0].url})
- **Maintainer:** @${repositories[0].username}
- **Description:** ${repositories[0].description}`
        : `- **Projects:**
${repositories.map(repo => `  - [${repo.name}](${repo.url}) - ${repo.description || 'No description'}`).join('\n')}
- **Maintainer:** @${repositories[0].username}`;

      const issueBody = `# 🎯 OSS Project Wishlist

## 📁 Project Information
${repositoriesSection}

## 🛠️ Services Requested
${wishlistData.selectedServices.map(serviceId => {
  const service = availableServices.find(s => s.id === serviceId);
  const serviceLink = service?.slug ? `${window.location.origin}/services/${service.slug}` : '';
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
      const response = await fetch('/api/submit-wishlist', {
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
            projectUrl: repositories[0].url, // Use first repo as primary
            maintainer: repositories[0].username,
            services: wishlistData.selectedServices,
            urgency: wishlistData.urgency,
            description: repositories[0].description || '',
            additionalNotes: wishlistData.additionalNotes || '',
            repositories: repositories // Include all repositories
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

  // Step 1: Authentication / Repository Selection
  if (currentStep === 'auth') {
    // If not authenticated, show sign-in prompt
    if (!user && !loadingRepos) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <div className="mb-6">
              <svg className="mx-auto h-16 w-16 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Please sign in with GitHub to create a wishlist. This helps us verify project ownership and prevent spam.
            </p>
            <button
              onClick={initiateGitHubAuth}
              className="inline-flex items-center bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-lg"
            >
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
              Sign in with GitHub
            </button>
            <div className="mt-8 text-sm text-gray-500">
              <h4 className="font-medium text-gray-700 mb-2">Why we require authentication:</h4>
              <ul className="text-left inline-block">
                <li className="flex items-center mb-1">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Verify project ownership
                </li>
                <li className="flex items-center mb-1">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Prevent spam and abuse
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Connect with your GitHub profile
                </li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    // Loading repositories
    if (loadingRepos) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your repositories...</p>
          </div>
        </div>
      );
    }

    // Authenticated user - show repositories and manual entry
    return (
      <div className="max-w-4xl mx-auto">
        {/* Show user's repositories if authenticated */}
        {repositories.length > 0 && (
          <div className="bg-white p-8 rounded-lg shadow-sm border mb-8">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Select Your Repositories</h3>
              <p className="text-gray-600 text-sm mb-2 text-center">
                Choose up to 3 repositories from your GitHub account
              </p>
              <p className="text-blue-600 text-xs mb-6 text-center">
                {selectedRepos.length}/3 selected
              </p>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
              
              <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
                {repositories.map((repo) => {
                  const isSelected = selectedRepos.some(r => r.id === repo.id);
                  const canSelect = selectedRepos.length < 3 || isSelected;
                  
                  return (
                    <button
                      key={repo.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedRepos(selectedRepos.filter(r => r.id !== repo.id));
                        } else if (canSelect) {
                          setSelectedRepos([...selectedRepos, repo]);
                        }
                      }}
                      disabled={!canSelect}
                      className={`w-full text-left p-4 border rounded-lg transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : canSelect
                            ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="mt-1"
                          disabled={!canSelect}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{repo.name}</h4>
                          {repo.description && (
                            <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            {repo.language && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {repo.language}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              ⭐ {repo.stargazers_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {selectedRepos.length > 0 && (
                <button
                  onClick={() => setCurrentStep('repo')}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Continue with {selectedRepos.length} {selectedRepos.length === 1 ? 'Repository' : 'Repositories'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Manual Entry Form */}
        <div className="bg-white p-8 rounded-lg shadow-sm border mb-8">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              {repositories.length > 0 ? 'Or Enter Repository URL Manually' : 'Enter Repository URL'}
            </h3>
            <p className="text-gray-600 text-sm mb-4 text-center">
              Paste your GitHub repository URL below
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
            
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
                </div>
              </div>
            </div>
          </div>
      </div>
    );
  }

  // Step 2: Repository Selection/Confirmation
  if (currentStep === 'repo') {
    // Show manual repo confirmation OR selected repos from OAuth
    if (manualRepoData || selectedRepos.length > 0) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Confirm Repository Details
              </h3>
              
              {manualRepoData && (
                <div className="bg-gray-50 border rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900">{manualRepoData.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{manualRepoData.description}</p>
                  <p className="text-sm text-blue-600 mt-2">{manualRepoData.url}</p>
                  <p className="text-sm text-gray-500 mt-2">Maintainer: @{manualRepoData.username}</p>
                </div>
              )}
              
              {selectedRepos.length > 0 && (
                <div className="space-y-3 mb-6">
                  <p className="text-sm text-gray-600 text-center mb-3">
                    {selectedRepos.length} {selectedRepos.length === 1 ? 'repository' : 'repositories'} selected
                  </p>
                  {selectedRepos.map((repo) => (
                    <div key={repo.id} className="bg-gray-50 border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900">{repo.name}</h4>
                      {repo.description && (
                        <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
                      )}
                      <p className="text-sm text-blue-600 mt-2">{repo.html_url}</p>
                    </div>
                  ))}
                </div>
              )}
              
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
                    setSelectedRepos([]);
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
              Debug: Step={currentStep}, HasRepo={!!(manualRepoData || (selectedRepos.length > 0 && user))}
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
              This will be the main title for your wishlist and how people will identify and triage your project or projects
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
                            href={`/services/${service.slug}`}
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