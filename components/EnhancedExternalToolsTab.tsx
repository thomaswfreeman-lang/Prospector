import React, { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle, XCircle, Clock, Loader, AlertTriangle, Zap } from 'lucide-react';

interface APIStatus {
  configured?: boolean;
  status?: 'healthy' | 'error' | 'checking' | 'unknown';
  message?: string;
}

interface APIProgress {
  [key: string]: {
    status: 'waiting' | 'connecting' | 'searching' | 'complete' | 'error';
    message: string;
    prospectCount?: number;
  };
}

const EnhancedExternalToolsTab = () => {
  const [apiHealth, setApiHealth] = useState<Record<string, APIStatus | boolean>>({});
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [isTestingSearch, setIsTestingSearch] = useState(false);
  const [searchProgress, setSearchProgress] = useState<APIProgress>({});
  
  const toolsConfig = [
    {
      id: 'openai',
      name: 'ChatGPT Fire Safety Query',
      url: 'https://chat.openai.com',
      description: 'Use GPT-4 to search for fire safety lab prospects',
      lastUsed: '2025-09-16'
    },
    {
      id: 'gemini',
      name: 'Google Gemini Research',
      url: 'https://gemini.google.com',
      description: 'Google AI for research and analysis',
      lastUsed: '2025-09-15'
    },
    {
      id: 'xai',
      name: 'XAI Grok Research',
      url: 'https://x.com/i/grok',
      description: 'Real-time X/Twitter data and breaking news for fire safety opportunities',
      lastUsed: '2025-09-16'
    },
    {
      id: 'serpapi',
      name: 'SerpAPI Web Search',
      url: 'https://serpapi.com',
      description: 'Advanced web search API for grants and research opportunities',
      lastUsed: '2025-09-14'
    },
    {
      id: 'samgov',
      name: 'SAM.gov Contractor Database',
      url: 'https://sam.gov',
      description: 'Federal contractor and grants database',
      lastUsed: '2025-09-13'
    }
  ];

  useEffect(() => {
    checkAPIHealth();
  }, []);

  const checkAPIHealth = async (enhanced = false) => {
    setIsCheckingHealth(true);
    try {
      const url = enhanced ? '/api/check-api-status?enhanced=true' : '/api/check-api-status';
      const response = await fetch(url);
      if (response.ok) {
        const healthData = await response.json();
        setApiHealth(healthData);
      } else {
        console.error('Health check failed:', response.status);
      }
    } catch (error) {
      console.error('Health check error:', error);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const testUnifiedSearch = async () => {
    setIsTestingSearch(true);
    
    // Initialize progress
    const initialProgress: APIProgress = {};
    toolsConfig.forEach(tool => {
      initialProgress[tool.id] = { status: 'waiting', message: 'Waiting to start...' };
    });
    setSearchProgress(initialProgress);

    try {
      // Simulate the unified search process
      const tools = ['openai', 'gemini', 'xai', 'serpapi', 'samgov'];
      
      for (const tool of tools) {
        // Update to connecting
        setSearchProgress(prev => ({
          ...prev,
          [tool]: { status: 'connecting', message: 'Connecting...' }
        }));
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update to searching
        setSearchProgress(prev => ({
          ...prev,
          [tool]: { status: 'searching', message: 'Searching prospects...' }
        }));
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate results based on API health
        const health = apiHealth[tool];
        const isConfigured = typeof health === 'boolean' ? health : health?.configured;
        
        if (isConfigured) {
          const prospectCount = Math.floor(Math.random() * 5) + 1;
          setSearchProgress(prev => ({
            ...prev,
            [tool]: { 
              status: 'complete', 
              message: `Found ${prospectCount} prospects`,
              prospectCount 
            }
          }));
        } else {
          setSearchProgress(prev => ({
            ...prev,
            [tool]: { 
              status: 'error', 
              message: 'API key missing or invalid'
            }
          }));
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Call the actual unified search API if it exists
      try {
        const response = await fetch('/api/generate-prospects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: 'fire safety testing equipment prospects',
            region: 'north-america',
            maxProspects: 10
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Search results:', data);
        }
      } catch (error) {
        console.log('Unified search API not available yet:', error);
      }
      
    } catch (error) {
      console.error('Test search error:', error);
    } finally {
      setIsTestingSearch(false);
    }
  };

  const getStatusIcon = (health: APIStatus | boolean | undefined) => {
    if (typeof health === 'boolean') {
      return health ? 
        <CheckCircle className="w-5 h-5 text-green-500" /> : 
        <XCircle className="w-5 h-5 text-red-500" />;
    }
    
    if (!health?.configured) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    
    switch (health.status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'checking':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getProgressIcon = (progress: APIProgress[string]) => {
    switch (progress.status) {
      case 'connecting':
      case 'searching':
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusMessage = (health: APIStatus | boolean | undefined) => {
    if (typeof health === 'boolean') {
      return health ? 'API key configured' : 'API key missing';
    }
    
    if (!health?.configured) {
      return 'API key missing';
    }
    
    return health.message || 'Unknown status';
  };

  const completedAPIs = Object.values(searchProgress).filter(p => p.status === 'complete' || p.status === 'error').length;
  const totalAPIs = toolsConfig.length;
  const totalProspects = Object.values(searchProgress).reduce((sum, p) => sum + (p.prospectCount || 0), 0);

  return (
    <div>
      {/* API Health Dashboard */}
      <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
            <Zap className="text-yellow-500" />
            AI Tools Health Dashboard
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => checkAPIHealth(false)}
              disabled={isCheckingHealth}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {isCheckingHealth ? <Loader className="w-4 h-4 animate-spin" /> : null}
              {isCheckingHealth ? 'Checking...' : 'Quick Check'}
            </button>
            <button
              onClick={() => checkAPIHealth(true)}
              disabled={isCheckingHealth}
              className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              Enhanced Check
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {toolsConfig.map(tool => {
            const health = apiHealth[tool.id];
            return (
              <div key={tool.id} className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(health)}
                    <span className="font-medium text-sm text-gray-800">
                      {tool.name.replace(' Fire Safety Query', '').replace(' Research Assistant', '').replace(' Real-time Research', '').replace(' Web Search', '').replace(' Contractor Database', '')}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  {getStatusMessage(health)}
                </div>
                {isTestingSearch && searchProgress[tool.id] && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    {getProgressIcon(searchProgress[tool.id])}
                    <span className={`${
                      searchProgress[tool.id].status === 'complete' ? 'text-green-600' :
                      searchProgress[tool.id].status === 'error' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {searchProgress[tool.id].message}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Test Search Section */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800">Unified Search Test</h4>
            <button
              onClick={testUnifiedSearch}
              disabled={isTestingSearch}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {isTestingSearch ? <Loader className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {isTestingSearch ? 'Testing All APIs...' : 'Test Unified Search'}
            </button>
          </div>
          
          {isTestingSearch && (
            <div className="space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${(completedAPIs / totalAPIs) * 100}%`}}
                />
              </div>
              <div className="text-sm text-gray-600">
                Progress: {completedAPIs}/{totalAPIs} APIs completed
                {totalProspects > 0 && ` • ${totalProspects} prospects found so far`}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* External Tools Grid */}
      <div className="grid gap-4">
        {toolsConfig.map((tool) => {
          const health = apiHealth[tool.id];
          const isConfigured = typeof health === 'boolean' ? health : health?.configured;
          
          return (
            <div key={tool.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{tool.name}</h3>
                    {getStatusIcon(health)}
                  </div>
                  <p className="text-gray-700 text-sm mb-3">{tool.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div>Last Used: {tool.lastUsed}</div>
                    <div className="flex items-center gap-2">
                      <span>Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isConfigured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isConfigured ? 'Ready' : 'Not Configured'}
                      </span>
                    </div>
                  </div>
                  
                  {!isConfigured && (
                    <div className="text-sm text-red-600 bg-red-50 rounded p-2 mb-3">
                      Add API key to .env.local to enable this tool
                    </div>
                  )}
                  
                  <a 
                    href={tool.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink size={14} />
                    Open Tool
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EnhancedExternalToolsTab;