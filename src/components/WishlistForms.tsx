import { useState, useEffect } from 'react';
import { getApiPath } from '../config/app';

// Heroicon SVG components
const PencilIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RocketIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

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
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null);
  const [selectedAction, setSelectedAction] = useState<'create' | 'edit' | 'close' | null>(null);
  const [existingWishlists, setExistingWishlists] = useState<Record<string, { issueUrl: string; issueNumber: number }>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{
    issueNumber: number;
    issueUrl: string;
    issueTitle: string;
    isUpdate?: boolean;
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
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [existingIssueNumber, setExistingIssueNumber] = useState<number | null>(null);
  const [originalServices, setOriginalServices] = useState<string[]>([]);
  
  // Wishlist form state
  const [wishlistData, setWishlistData] = useState({
    projectTitle: '',
    selectedServices: [] as string[],
    technologies: [] as string[],
    urgency: 'medium' as 'low' | 'medium' | 'high',
    timeline: '',
    organizationType: 'individual' as 'individual' | 'company' | 'nonprofit' | 'foundation',
    organizationName: '',
    additionalNotes: '',
    openToSponsorship: false
  });
  
  // Checkbox for FUNDING.yml PR
  const [createFundingPR, setCreateFundingPR] = useState(false);

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

  // Update page title when editing mode changes
  useEffect(() => {
    const titleElement = document.getElementById('title-action');
    if (titleElement) {
      titleElement.textContent = isEditingExisting ? 'Edit Your' : 'Create Your';
    }
  }, [isEditingExisting]);

  const checkUserSession = async () => {
    try {
      setLoadingRepos(true);
      const response = await fetch(getApiPath('/api/auth/session'));
      
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
      const response = await fetch(getApiPath('/api/repositories'));
      
      if (response.ok) {
        const data = await response.json();
        const repos = data.repositories || [];
        setRepositories(repos);
        
        // Check for existing wishlists for these repositories
        if (repos.length > 0) {
          checkExistingWishlists(repos.map((r: GitHubRepository) => r.html_url));
        }
      } else {
        // If fetching fails, just keep repositories empty
        setRepositories([]);
      }
    } catch (err) {
      console.error('Error fetching repositories:', err);
      setRepositories([]);
    }
  };

  const checkExistingWishlists = async (repositoryUrls: string[]) => {
    try {
      const response = await fetch(getApiPath('/api/check-existing-wishlists'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repositoryUrls }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const existingMap: Record<string, { issueUrl: string; issueNumber: number }> = {};
        
        for (const [url, info] of Object.entries(data.results)) {
          if ((info as any).exists) {
            existingMap[url] = {
              issueUrl: (info as any).issueUrl,
              issueNumber: (info as any).issueNumber,
            };
          }
        }
        
        setExistingWishlists(existingMap);
      }
    } catch (err) {
      console.error('Error checking existing wishlists:', err);
    }
  };

  const loadExistingWishlistData = async (issueNumber: number) => {
    try {
      // Use the API endpoint to get cached wishlist data
      const apiUrl = getApiPath(`/api/get-wishlist?issueNumber=${issueNumber}`);
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        console.error('Failed to load cached wishlist data, status:', response.status);
        const text = await response.text();
        console.error('Response body:', text);
        return false;
      }
      
      const cachedData = await response.json();
      
      const updatedData: any = {
        projectTitle: cachedData.projectTitle || '',
        selectedServices: cachedData.wishes || [],
        urgency: cachedData.urgency || 'medium',
        timeline: cachedData.timeline || '',
        organizationType: cachedData.organizationType || 'individual',
        organizationName: cachedData.organizationName || '',
        additionalNotes: cachedData.additionalNotes || '',
        technologies: cachedData.technologies || [],
        openToSponsorship: cachedData.openToSponsorship || false,
      };
      
      // Set original services for comparison
      setOriginalServices(cachedData.wishes || []);
      
      // Update all form data directly (not using prev callback)
      setWishlistData(updatedData);
      
      setIsEditingExisting(true);
      setExistingIssueNumber(issueNumber);
      
      return true;
      
    } catch (err) {
      console.error('Error loading existing wishlist data:', err);
      return false;
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
    window.location.href = getApiPath('/api/auth/github');
  };

  const parseProjectUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      
      // Check if it's a GitHub URL to extract more detailed info
      const githubMatch = url.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
      
      if (githubMatch) {
        const [, username, repoName] = githubMatch;
        return {
          username,
          name: repoName,
          description: 'Repository entered manually',
          url: `https://github.com/${username}/${repoName}`
        };
      }
      
      // For non-GitHub URLs, extract what we can from the URL
      const pathParts = urlObj.pathname.split('/').filter(p => p);
      const projectName = pathParts[pathParts.length - 1] || urlObj.hostname;
      
      return {
        username: urlObj.hostname,
        name: projectName,
        description: 'Project entered manually',
        url: url
      };
    } catch {
      return null;
    }
  };

  const handleManualRepoSubmit = () => {
    setError('');
    const repoData = parseProjectUrl(manualRepoUrl);
    
    if (!repoData) {
      setError('Please enter a valid URL (e.g., https://github.com/username/repository or https://example.com/project)');
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
    
    if (!wishlistData.projectTitle.trim()) {
      setError('Please enter a project title');
      return;
    }
    
    if (wishlistData.selectedServices.length === 0) {
      setError('Please select at least one service');
      return;
    }

    // Basic client-side validation for spam patterns
    const fieldsToCheck = [
      wishlistData.projectTitle,
      wishlistData.organizationName,
      wishlistData.additionalNotes
    ].filter(Boolean).join(' ');

    // Check for excessive URLs
    const urlCount = (fieldsToCheck.match(/https?:\/\//gi) || []).length;
    if (urlCount > 3) {
      setError('Too many URLs detected. Please limit links in your submission.');
      return;
    }

    // Check for excessive capitalization
    if (fieldsToCheck.length > 20) {
      const capsCount = (fieldsToCheck.match(/[A-Z]/g) || []).length;
      const lettersCount = (fieldsToCheck.match(/[a-zA-Z]/g) || []).length;
      if (lettersCount > 0 && capsCount / lettersCount > 0.6) {
        setError('Please avoid excessive capitalization in your submission.');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      // Create array of repository info
      const repositories = selectedRepo 
        ? [{
            name: selectedRepo.name,
            url: selectedRepo.html_url,
            username: user?.login || '',
            description: selectedRepo.description || ''
          }]
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

      const issueBody = `# OSS Project Wishlist

## Project Information
${repositoriesSection}
${wishlistData.technologies.length > 0 ? `- **Technologies:** ${wishlistData.technologies.join(', ')}` : ''}

## Services Requested
${wishlistData.selectedServices.map(serviceId => {
  const service = availableServices.find(s => s.id === serviceId);
  const serviceLink = service?.slug ? `${window.location.origin}/services/${service.slug}` : '';
  return `- **${service?.title || serviceId}** (${service?.category || 'General'})
  ${service?.description || 'No description available'}${serviceLink ? `
  [Learn more about this service](${serviceLink})` : ''}`;
}).join('\n')}

## Project Details
- **Urgency:** ${wishlistData.urgency.charAt(0).toUpperCase() + wishlistData.urgency.slice(1)}
- **Timeline:** ${wishlistData.timeline || 'Flexible'}
- **Open to Honorarium:** ${wishlistData.openToSponsorship ? 'Yes' : 'No'}

## Organization
- **Type:** ${wishlistData.organizationType.charAt(0).toUpperCase() + wishlistData.organizationType.slice(1)}
${wishlistData.organizationName ? `- **Name:** ${wishlistData.organizationName}` : ''}

## Additional Notes
${wishlistData.additionalNotes || 'None provided'}

---
**Ready to help?** Comment below or reach out to the maintainer!

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
          isUpdate: isEditingExisting,
          ...(existingIssueNumber && { issueNumber: existingIssueNumber }), // Only include if exists
          formData: {
            projectTitle: wishlistData.projectTitle,
            projectUrl: repositories[0].url, // Use first repo as primary
            maintainer: repositories[0].username,
            services: wishlistData.selectedServices,
            technologies: wishlistData.technologies,
            urgency: wishlistData.urgency,
            description: repositories[0].description || '',
            additionalNotes: wishlistData.additionalNotes || '',
            repositories: repositories, // Include all repositories
            createFundingPR: createFundingPR, // Include FUNDING.yml PR flag
            openToSponsorship: wishlistData.openToSponsorship // Include sponsorship opt-in
          }
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Handle validation errors with field information
        if (result.field) {
          // Convert technical field names to user-friendly labels
          const fieldLabels: Record<string, string> = {
            'formData.projectTitle': 'Project Title',
            'formData.timeline': 'Timeline',
            'formData.organizationName': 'Organization Name',
            'formData.additionalNotes': 'Additional Notes',
            'formData.description': 'Project Description',
            'title': 'Title',
            'body': 'Content'
          };
          
          const friendlyFieldName = fieldLabels[result.field] || result.field;
          const errorMessage = `${friendlyFieldName}: ${result.details || result.error}`;
          throw new Error(errorMessage);
        }
        // Include details from moderation failures or other API errors
        const errorMessage = result.details 
          ? `${result.error}: ${result.details}`
          : result.error || 'Failed to create wishlist';
        throw new Error(errorMessage);
      }

      // Success! Store the result (data is now nested under result.data)
      const issueData = result.data;
      setSuccess({
        issueNumber: issueData.issue.number,
        issueUrl: issueData.issue.url,
        issueTitle: issueData.issue.title,
        isUpdate: issueData.updated || false
      });
      
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseWishlist = async () => {
    if (!existingIssueNumber) {
      setError('No wishlist to close');
      return;
    }

    const confirmClose = window.confirm(
      `Are you sure you want to close this wishlist (Issue #${existingIssueNumber})? This will mark it as no longer needing help.`
    );

    if (!confirmClose) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(getApiPath('/api/close-wishlist'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issueNumber: existingIssueNumber
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to close wishlist');
      }

      // Remove the closed wishlist from existingWishlists state
      setExistingWishlists(prev => {
        const updated = { ...prev };
        // Find and remove the wishlist by issue number
        Object.keys(updated).forEach(repoUrl => {
          if (updated[repoUrl].issueNumber === existingIssueNumber) {
            delete updated[repoUrl];
          }
        });
        return updated;
      });

      // Show success message
      setSuccess({
        issueNumber: result.issue.number,
        issueUrl: result.issue.url,
        issueTitle: '✅ Wishlist Closed Successfully!',
        isUpdate: false
      });

      // If in edit mode, reset to auth step after showing success
      if (currentStep === 'wishlist') {
        setTimeout(() => {
          setCurrentStep('auth');
          setIsEditingExisting(false);
          setExistingIssueNumber(null);
          setSelectedRepo(null);
          setSuccess(null);
        }, 3000);
      } else {
        // If on repo list, just clear success after 3 seconds
        setTimeout(() => {
          setSuccess(null);
          setExistingIssueNumber(null);
        }, 3000);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close wishlist');
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
              <svg className="mx-auto h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-green-900">{success.issueTitle}</h3>
                <p className="text-sm text-green-700">The wishlist has been closed and removed from your list.</p>
              </div>
            </div>
          </div>
        )}

        {/* Show user's repositories if authenticated */}
        {repositories.length > 0 && (
          <div className="bg-white p-8 rounded-lg shadow-sm border mb-8">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Select Your Repository</h3>
              <p className="text-gray-600 text-xs mb-6 text-center">
                {selectedRepo ? '1 selected' : 'No repository selected'}
              </p>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
              
              <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
                {repositories.map((repo) => {
                  const isSelected = selectedRepo?.id === repo.id;
                  const hasExistingWishlist = existingWishlists[repo.html_url];
                  
                  return (
                    <div
                      key={repo.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedRepo(null);
                          setSelectedAction(null);
                        } else {
                          setSelectedRepo(repo);
                          // If no wishlist, default to create action
                          if (!hasExistingWishlist) {
                            setSelectedAction('create');
                          } else {
                            // Reset action when selecting a repo with existing wishlist
                            setSelectedAction(null);
                          }
                        }
                      }}
                      className={`w-full text-left p-4 border rounded-lg transition-colors cursor-pointer ${
                        isSelected 
                          ? 'border-gray-900 bg-gray-100' 
                          : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          checked={isSelected}
                          readOnly
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-gray-900">{repo.name}</h4>
                            <div className="flex items-center gap-2">
                              {hasExistingWishlist ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedRepo(repo);
                                      setSelectedAction('edit');
                                    }}
                                    className={`text-xs px-2 py-1 rounded border transition-colors flex items-center gap-1 shrink-0 ${
                                      isSelected && selectedAction === 'edit'
                                        ? 'bg-gray-200 text-gray-900 border-gray-400'
                                        : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                                    }`}
                                  >
                                    <PencilIcon />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedRepo(repo);
                                      setSelectedAction('close');
                                    }}
                                    className={`text-xs px-2 py-1 rounded border transition-colors flex items-center gap-1 shrink-0 ${
                                      isSelected && selectedAction === 'close'
                                        ? 'bg-gray-300 text-gray-900 border-gray-500'
                                        : 'bg-gray-200 text-gray-800 border-gray-400 hover:bg-gray-300'
                                    }`}
                                    title="Close this wishlist"
                                  >
                                    <TrashIcon />
                                    <span>Close</span>
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs px-2 py-1 rounded border bg-gray-50 text-gray-700 border-gray-300 flex items-center gap-1 shrink-0">
                                  <SparklesIcon />
                                  <span>Create Wishlist</span>
                                </span>
                              )}
                            </div>
                          </div>
                          {repo.description && (
                            <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            {repo.language && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {repo.language}
                              </span>
                            )}
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <StarIcon />
                              {repo.stargazers_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {selectedRepo && selectedAction && (
                <button
                  onClick={async () => {
                    const hasExisting = selectedRepo && existingWishlists[selectedRepo.html_url];
                    
                    if (selectedAction === 'close') {
                      // Handle close action
                      if (hasExisting) {
                        setExistingIssueNumber(hasExisting.issueNumber);
                        await handleCloseWishlist();
                      }
                    } else if (selectedAction === 'edit') {
                      // Handle edit action
                      if (hasExisting) {
                        setLoading(true);
                        setError(''); // Clear any previous errors
                        // Set editing state FIRST before loading data
                        setIsEditingExisting(true);
                        setExistingIssueNumber(hasExisting.issueNumber);
                        const success = await loadExistingWishlistData(hasExisting.issueNumber);
                        setLoading(false);
                        // Only navigate if data loaded successfully
                        if (success) {
                          setCurrentStep('wishlist');
                        } else {
                          setError('Failed to load wishlist data. Please try again.');
                        }
                      }
                    } else if (selectedAction === 'create') {
                      // Handle create action
                      setIsEditingExisting(false);
                      setExistingIssueNumber(null);
                      setCurrentStep('wishlist');
                    }
                  }}
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </span>
                  ) : selectedAction === 'close' ? (
                    'Continue to Close Wishlist'
                  ) : selectedAction === 'edit' ? (
                    'Continue to Edit Wishlist'
                  ) : (
                    'Continue with Repository'
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Manual Entry Form */}
        <div className="bg-white p-8 rounded-lg shadow-sm border mb-8">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              {repositories.length > 0 ? 'Or, enter your project URL manually' : 'Enter Project URL'}
            </h3>
            <p className="text-gray-600 text-sm mb-4 text-center">
              This can be anywhere.
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="repo-url" className="block text-sm font-medium text-gray-700 mb-2">
                  Project URL
                </label>
                  <input
                    id="repo-url"
                    type="url"
                    value={manualRepoUrl}
                    onChange={(e) => setManualRepoUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleManualRepoSubmit}
                    disabled={!manualRepoUrl.trim()}
                    className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400"
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
    if (manualRepoData || selectedRepo) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Confirm Project Details
              </h3>
              
              {manualRepoData && (
                <div className="bg-gray-50 border rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900">{manualRepoData.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{manualRepoData.description}</p>
                  <p className="text-sm text-gray-700 underline mt-2">{manualRepoData.url}</p>
                  <p className="text-sm text-gray-500 mt-2">Maintainer: @{manualRepoData.username}</p>
                </div>
              )}
              
              {selectedRepo && (
                <div className="space-y-3 mb-6">
                  <p className="text-sm text-gray-600 text-center mb-3">
                    Repository selected
                  </p>
                  <div className="bg-gray-50 border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900">{selectedRepo.name}</h4>
                    {selectedRepo.description && (
                      <p className="text-sm text-gray-600 mt-1">{selectedRepo.description}</p>
                    )}
                    <p className="text-sm text-gray-700 underline mt-2">{selectedRepo.html_url}</p>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={proceedToWishlist}
                  className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 flex items-center justify-center gap-2"
                >
                  {isEditingExisting ? (
                    <>
                      <PencilIcon />
                      <span>Update Wishlist</span>
                    </>
                  ) : (
                    <>
                      <RocketIcon />
                      <span>Create Wishlist</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setManualRepoData(null);
                    setManualRepoUrl('');
                    setSelectedRepo(null);
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
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {success.isUpdate ? '🎉 Wishlist Updated Successfully!' : '🎉 Wishlist Created Successfully!'}
              </h3>
              <p className="text-gray-600 mb-6">
                {success.isUpdate 
                  ? `Your wishlist has been updated in GitHub issue #${success.issueNumber}`
                  : `Your wishlist has been submitted as GitHub issue #${success.issueNumber}`
                }
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">{success.issueTitle}</h4>
                <p className="text-sm text-gray-600">
                  Your wishlist is now visible to potential contributors and supporters.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`${window.location.origin}${import.meta.env.BASE_URL || ''}/fulfill?issue=${success.issueNumber}`}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 inline-flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  View Wishlist Page
                </a>
                <a
                  href={success.issueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 inline-flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
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
                      technologies: [],
                      urgency: 'medium',
                      timeline: '',
                      organizationType: 'individual',
                      organizationName: '',
                      additionalNotes: '',
                      openToSponsorship: false
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
          {/* Repository Info Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-lg p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 1 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 0 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 0 1 1-1h8zM5 12.25v3.25a.25.25 0 0 0 .4.2l1.45-1.087a.25.25 0 0 1 .3 0L8.6 15.7a.25.25 0 0 0 .4-.2v-3.25a.25.25 0 0 0-.25-.25h-3.5a.25.25 0 0 0-.25.25z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Creating Wishlist For</h3>
                {selectedRepo ? (
                  <>
                    <p className="text-xl font-bold text-gray-900 mb-2">{selectedRepo.name}</p>
                    <a 
                      href={selectedRepo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-700 hover:text-gray-900 hover:underline break-all inline-flex items-center gap-1"
                    >
                      {selectedRepo.html_url}
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    {selectedRepo.description && (
                      <p className="text-sm text-gray-600 mt-2">{selectedRepo.description}</p>
                    )}
                  </>
                ) : manualRepoData ? (
                  <>
                    <p className="text-xl font-bold text-gray-900 mb-2">{manualRepoData.name}</p>
                    <a 
                      href={manualRepoData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-700 hover:text-gray-900 hover:underline break-all inline-flex items-center gap-1"
                    >
                      {manualRepoData.url}
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    {manualRepoData.description && (
                      <p className="text-sm text-gray-600 mt-2">{manualRepoData.description}</p>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Edit Mode Header */}
          {isEditingExisting && (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Editing Existing Wishlist</h2>
                  <p className="text-sm text-gray-700">
                    You're updating wishlist #{existingIssueNumber}. All fields below are pre-filled with current values.
                  </p>
                </div>
              </div>
            </div>
          )}
          
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              This will be the main title for your wishlist and how people will identify and triage your project or projects
            </p>
          </div>

          {/* Technologies */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔧 Technologies
            </h3>
            
            {/* Common technology buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {['JavaScript', 'Python', 'TypeScript', 'Java', 'Go', 'Rust', 'C++', 'C#', 'Ruby', 'PHP', 
                'React', 'Vue', 'Node.js', 'Django', 'Flask', 'Spring', 'Docker', 'Kubernetes', 'AWS', 'PostgreSQL', 'MongoDB'].map((tech) => {
                const isSelected = wishlistData.technologies.includes(tech);
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => {
                      setWishlistData(prev => ({
                        ...prev,
                        technologies: isSelected 
                          ? prev.technologies.filter(t => t !== tech)
                          : [...prev.technologies, tech]
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tech}
                  </button>
                );
              })}
            </div>

            {/* Custom technology input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add custom technologies (comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g., TensorFlow, FastAPI, Redis"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    const value = input.value.trim();
                    if (value) {
                      const newTechs = value.split(',').map(t => t.trim()).filter(t => t && !wishlistData.technologies.includes(t));
                      if (newTechs.length > 0) {
                        setWishlistData(prev => ({
                          ...prev,
                          technologies: [...prev.technologies, ...newTechs]
                        }));
                        input.value = '';
                      }
                    }
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Press Enter to add</p>
            </div>

            {/* Selected technologies display */}
            {wishlistData.technologies.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected technologies:</p>
                <div className="flex flex-wrap gap-2">
                  {wishlistData.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700 text-white rounded-lg text-sm"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => {
                          setWishlistData(prev => ({
                            ...prev,
                            technologies: prev.technologies.filter(t => t !== tech)
                          }));
                        }}
                        className="hover:text-gray-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Services Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Services Needed <span className="text-red-500">*</span>
            </h3>
            {isEditingExisting && originalServices.length > 0 && (
              <p className="text-sm text-gray-600 mb-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <span className="font-medium">Currently selected services</span> are highlighted. You can modify your selection below.
              </p>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              {availableServices.map((service) => {
                const isSelected = wishlistData.selectedServices.includes(service.id);
                const wasOriginallySelected = originalServices.includes(service.id);
                
                return (
                  <div
                    key={service.id}
                    onClick={() => handleServiceToggle(service.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-gray-900 bg-gray-100'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{service.title}</h4>
                          {wasOriginallySelected && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded border border-green-300">
                              Currently selected
                            </span>
                          )}
                        </div>
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
                              className="text-xs text-gray-700 hover:text-gray-900 underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Learn more →
                            </a>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="ml-2 text-gray-900 text-lg">✓</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ClockIcon />
              <span>Project Details</span>
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency
                </label>
                <select
                  value={wishlistData.urgency}
                  onChange={(e) => setWishlistData(prev => ({ ...prev, urgency: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
                  placeholder="e.g., 'Within 3 months', 'Q1 2024', 'Flexible'"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sponsorship Opt-in */}
            <div className="mt-6">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={wishlistData.openToSponsorship}
                  onChange={(e) => setWishlistData(prev => ({ ...prev, openToSponsorship: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  I am open to receiving an honorarium as part of wish fulfillment
                  <span className="block text-xs text-gray-500 mt-1">
                    Organizations fulfilling your wish may offer an optional honorarium to recognize your time and collaboration (not payment for services or obligation)
                  </span>
                </span>
              </label>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  <option value="individual">Individual maintainer</option>
                  <option value="company">Company</option>
                  <option value="nonprofit">Nonprofit organization</option>
                  <option value="foundation">Foundation</option>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
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
              placeholder="Any additional information about your project, specific requirements, or context that would help supporters understand your needs..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>

          {/* Submit */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            {/* FUNDING.yml PR Checkbox */}
            <div className={`mb-6 p-4 rounded-lg border ${manualRepoData ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 border-gray-200'}`}>
              <label className={`flex items-start space-x-3 ${manualRepoData ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={createFundingPR && !manualRepoData}
                  onChange={(e) => setCreateFundingPR(e.target.checked)}
                  disabled={!!manualRepoData}
                  className="mt-0.5 h-5 w-5 text-gray-900 border-gray-300 rounded focus:ring-gray-500 disabled:cursor-not-allowed"
                />
                <div className="flex-1">
                  <span className="text-gray-900 font-medium text-sm">Create a PR to add FUNDING.yml to this repository</span>
                  <p className="text-xs text-gray-600 mt-1">
                    {manualRepoData 
                      ? 'Only available for GitHub repositories selected from your account' 
                      : 'Automatically submit a pull request to add GitHub Sponsors funding information to your repo'
                    }
                  </p>
                </div>
              </label>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <button
                type="button"
                onClick={() => setCurrentStep('repo')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors order-2 sm:order-1"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading || wishlistData.selectedServices.length === 0 || !wishlistData.projectTitle.trim()}
                className="flex-1 px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 order-1 sm:order-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>{isEditingExisting ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    {isEditingExisting ? (
                      <>
                        <PencilIcon />
                        <span>Update Wishlist</span>
                      </>
                    ) : (
                      <>
                        <RocketIcon />
                        <span>Create Wishlist</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              {isEditingExisting 
                ? `This will update the existing wishlist (Issue #${existingIssueNumber})` 
                : 'This will create a GitHub issue with your wishlist details'
              }
            </p>
          </div>
        </form>
      </div>
    );
  }

  return null;
};

export default WishlistForm;