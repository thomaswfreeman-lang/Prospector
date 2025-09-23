"use client";
import { useState } from 'react';
import { Search, Loader, AlertTriangle, CheckCircle } from 'lucide-react';

interface Prospect {
  id: string;
  date: string;
  publishedDate: string;
  bidDueDate: string;
  company: string;
  contact: string;
  location: string;
  catalyst: string;
  fit: string;
  reasoning: string;
  type: string;
  source: string;
  phone: string;
  email: string;
}

interface SearchResults {
  prospects: Prospect[];
  sources?: string[];
  totalAPIs?: number;
  successfulAPIs?: number;
  errors?: string[];
}

interface UnifiedSearchButtonProps {
  onProspectsFound: (prospects: Prospect[], searchResults: SearchResults) => void;
}

const UnifiedSearchButton: React.FC<UnifiedSearchButtonProps> = ({ onProspectsFound }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string>('');
  const [lastSearchResults, setLastSearchResults] = useState<SearchResults | null>(null);

  const performUnifiedSearch = async () => {
    setIsSearching(true);
    setSearchStatus('Starting multi-API search: OpenAI, SerpAPI...');

    try {
      const response = await fetch('/api/unified-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: generateSearchQuery(),
          maxProspects: 10
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const searchResults: SearchResults = {
          prospects: data.prospects || [],
          sources: data.sources || [],
          totalAPIs: data.totalAPIs || 0,
          successfulAPIs: data.successfulAPIs || 0,
          errors: data.errors || []
        };
        
        setLastSearchResults(searchResults);
        onProspectsFound(searchResults.prospects, searchResults);
        setSearchStatus(`Search complete: ${searchResults.prospects.length} prospects found from ${searchResults.sources?.length || 0} sources`);
      } else {
        setSearchStatus(`Search failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchStatus(`Search error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSearching(false);
    }
  };

  const generateSearchQuery = (): string => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `Using the current date [${currentDate}], search for the latest North American labs, universities, government entities in fire safety for sectors like construction/building materials, aerospace, automotive/EV batteries, plastics/polymers/chemicals, textiles, electronics/consumer goods, furniture, healthcare, manufacturing using UL94, ASTM E1354, ISO 5660, ISO 9705, ISO 11341, ASTM E84, NFPA 701. Include university research grants (e.g., NSF FIRE, UL Institutes, FEMA FP&S, DOE ARPA-E, NIH SBIR, NASA SBIR) and university/government solicitations (RFBs, open contracts, university solicitations, government RFPs). Prioritize events from the last 30-90 days. Find 10 unique prospects (no duplicates from prior lists) with contact names/titles, emails/phones, cities, catalysts (regs, market shifts, grants, solicitations) or funding/green certs, why they need our instruments (e.g., cone calorimeters for ASTM E1354, smoke chambers for NFPA 701, oxygen indexes/microcalorimeters/UL94 testers), announcement dates, source links, and type (Funding, Green Cert, or Catalyst). Output as a CSV file with columns: Date,Published Date,Bid Due Date,Company,Contact,Location,Catalyst/Funding (link at end),Fit,Reasoning,Type. Ensure thorough and detailed responses in the Reasoning column. Include notes on sources, verification, and format. Balance ~4 Funding, ~3 Green Cert, ~3 Catalyst. Base on verifiable sources like company sites, press releases, federal registers, grant databases (grants.gov), university announcements, and journals (e.g., NFPA, FAA, ASTM, NSF).`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">AI-Powered Prospect Search</h2>
          <p className="text-blue-100">Search across multiple APIs simultaneously for fire safety prospects</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={performUnifiedSearch}
            disabled={isSearching}
            className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <>
                <Loader className="animate-spin" size={20} />
                Searching...
              </>
            ) : (
              <>
                <Search size={20} />
                Start Unified Search
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search Status */}
      {searchStatus && (
        <div className="bg-white/10 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            {isSearching ? (
              <Loader className="animate-spin text-yellow-300" size={16} />
            ) : searchStatus.includes('complete') ? (
              <CheckCircle className="text-green-300" size={16} />
            ) : (
              <AlertTriangle className="text-red-300" size={16} />
            )}
            <span className="font-medium">Search Status</span>
          </div>
          <p className="text-sm text-blue-100">{searchStatus}</p>
        </div>
      )}

      {/* Last Search Results Summary */}
      {lastSearchResults && !isSearching && (
        <div className="bg-white/10 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-300 mb-2">Search Complete</h3>
          <div className="text-sm text-blue-100">
            Found {lastSearchResults.prospects.length} prospects from {lastSearchResults.sources?.length || 0} sources
            {lastSearchResults.sources && lastSearchResults.sources.length > 0 && (
              <span className="ml-2">
                ({lastSearchResults.sources.join(', ')})
              </span>
            )}
          </div>
          
          {lastSearchResults.errors && lastSearchResults.errors.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-red-300">
                API Issues: {lastSearchResults.errors.join(', ')}
              </p>
            </div>
          )}
          
          <div className="mt-2 text-xs text-blue-200">
            APIs Used: {lastSearchResults.successfulAPIs || 0} / {lastSearchResults.totalAPIs || 0} successful
          </div>
        </div>
      )}

      {/* API Status Indicators */}
      <div className="mt-4 flex gap-2">
        <div className="flex items-center gap-1 text-xs">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>OpenAI Ready</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>SerpAPI Ready</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          <span>Sam.gov Optional</span>
        </div>
      </div>
    </div>
  );
};

export default UnifiedSearchButton;
