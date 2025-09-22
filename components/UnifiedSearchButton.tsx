// components/UnifiedSearchButton.tsx
'use client';
import { useState } from 'react';
import { Search, Loader, Zap, AlertTriangle, ExternalLink, Calendar, MapPin, Building2, CheckCircle } from 'lucide-react';

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

interface SearchResult {
  totalFound: number;
  sources: string[];
  debugInfo: any;
}

interface UnifiedSearchButtonProps {
  onProspectsFound?: (prospects: Prospect[], searchResults: SearchResult) => void;
}

export default function UnifiedSearchButton({ onProspectsFound }: UnifiedSearchButtonProps) {
  const [query, setQuery] = useState('fire testing RFP grant procurement');
  const [loading, setLoading] = useState(false);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [region, setRegion] = useState('north-america');
  const [maxProspects, setMaxProspects] = useState(15);
  const [includeSam, setIncludeSam] = useState(true);

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
  };

  const isUrgent = (bidDueDate: string): boolean => {
    if (!bidDueDate) return false;
    const dueDate = new Date(bidDueDate);
    const today = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(today.getDate() + 14);
    return dueDate >= today && dueDate <= twoWeeksFromNow;
  };

  const getDaysLeft = (bidDueDate: string): number => {
    if (!bidDueDate) return 0;
    const dueDate = new Date(bidDueDate);
    const today = new Date();
    return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const runUnifiedSearch = async () => {
    setLoading(true);
    setError(null);
    setProspects([]);
    setSearchResults(null);
    
    try {
      const response = await fetch('/api/generate-prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          region,
          maxProspects,
          includeSam,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Search failed: ${errorText}`);
      }

      const data = await response.json();
      
      const foundProspects = data.prospects || [];
      const results = data.searchResults || { totalFound: 0, sources: [], debugInfo: null };
      
      setProspects(foundProspects);
      setSearchResults(results);
      setShowResults(true);
      
      // Notify parent component
      if (onProspectsFound && foundProspects.length > 0) {
        onProspectsFound(foundProspects, results);
      }
      
    } catch (e: any) {
      setError(e.message || 'Failed to fetch prospects');
      console.error('Search error:', e);
    } finally {
      setLoading(false);
    }
  };

  const addToProspects = (prospect: Prospect) => {
    if (onProspectsFound) {
      onProspectsFound([prospect], searchResults || { totalFound: 1, sources: [], debugInfo: null });
    }
  };

  const addAllToProspects = () => {
    if (onProspectsFound && prospects.length > 0) {
      onProspectsFound(prospects, searchResults || { totalFound: prospects.length, sources: [], debugInfo: null });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Search Interface */}
      <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Zap className="text-white" size={18} />
          </div>
          <h3 className="text-lg font-semibold text-blue-900">AI-Powered Prospect Search</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-blue-800 mb-2">Search Query</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., fire testing RFP grant procurement"
              className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full border border-blue-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="north-america">North America</option>
              <option value="europe">Europe</option>
              <option value="global">Global</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-2">Max Results</label>
            <select
              value={maxProspects}
              onChange={(e) => setMaxProspects(parseInt(e.target.value))}
              className="w-full border border-blue-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10 prospects</option>
              <option value="15">15 prospects</option>
              <option value="20">20 prospects</option>
              <option value="25">25 prospects</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 text-sm text-blue-800">
            <input
              type="checkbox"
              checked={includeSam}
              onChange={(e) => setIncludeSam(e.target.checked)}
              className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
            />
            Include Sam.gov Federal Opportunities
          </label>
        </div>

        <button
          onClick={runUnifiedSearch}
          disabled={loading || !query.trim()}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? (
            <>
              <Loader className="animate-spin" size={18} />
              Searching with AI...
            </>
          ) : (
            <>
              <Search size={18} />
              Unified AI Search
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Search Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Summary */}
      {searchResults && showResults && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Search Complete</h3>
                <div className="mt-1 text-sm text-green-700">
                  Found {prospects.length} prospects from {searchResults.sources.length} sources
                  {searchResults.sources.length > 0 && (
                    <span className="ml-2">
                      ({searchResults.sources.join(', ')})
                    </span>
                  )}
                </div>
              </div>
            </div>
            {prospects.length > 0 && (
              <button
                onClick={addAllToProspects}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Add All to Prospects
              </button>
            )}
          </div>
        </div>
      )}

      {/* Prospects Results */}
      {prospects.length > 0 && showResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Found Prospects</h3>
            <div className="text-sm text-gray-600">
              {prospects.length} prospect{prospects.length > 1 ? 's' : ''} found
            </div>
          </div>

          <div className="grid gap-4">
            {prospects.map((prospect) => (
              <div key={prospect.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                {/* Urgent Banner */}
                {isUrgent(prospect.bidDueDate) && (
                  <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                      <span className="font-medium text-red-800">
                        URGENT: Due in {getDaysLeft(prospect.bidDueDate)} day{getDaysLeft(prospect.bidDueDate) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{prospect.company}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        prospect.type === 'Funding' ? 'bg-green-100 text-green-800' :
                        prospect.type === 'Green Cert' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {prospect.type}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(prospect.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        {prospect.location}
                      </div>
                      {prospect.bidDueDate && (
                        <div className="flex items-center gap-1">
                          <span className={isUrgent(prospect.bidDueDate) ? "text-red-600" : "text-orange-600"}>⏰</span>
                          <span className={`font-medium ${isUrgent(prospect.bidDueDate) ? "text-red-600" : "text-orange-600"}`}>
                            Due: {formatDate(prospect.bidDueDate)}
                          </span>
                        </div>
                      )}
                      {prospect.publishedDate && (
                        <div className="text-xs text-gray-500">
                          Published: {formatDate(prospect.publishedDate)}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-gray-700"><strong>Contact:</strong> {prospect.contact}</p>
                      {prospect.email && <p className="text-sm text-gray-600">📧 {prospect.email}</p>}
                      {prospect.phone && <p className="text-sm text-gray-600">📞 {prospect.phone}</p>}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <a 
                      href={prospect.source} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <ExternalLink size={14} />
                      Source
                    </a>
                    <button
                      onClick={() => addToProspects(prospect)}
                      className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm bg-green-50 px-2 py-1 rounded"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Catalyst/Funding</h4>
                    <p className="text-gray-700 text-sm">{prospect.catalyst}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Equipment Fit</h4>
                    <p className="text-gray-700 text-sm">{prospect.fit}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Reasoning</h4>
                    <p className="text-gray-700 text-sm">{prospect.reasoning}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {showResults && prospects.length === 0 && !loading && !error && (
        <div className="text-center py-12 text-gray-500">
          <Building2 size={48} className="mx-auto mb-4 opacity-50" />
          <p>No prospects found for this search.</p>
          <p className="text-sm">Try adjusting your search terms or criteria.</p>
        </div>
      )}

      {/* API Status Debug (only in development) */}
      {searchResults?.debugInfo && process.env.NODE_ENV === 'development' && (
        <details className="bg-gray-50 border rounded-lg p-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
            API Status & Debug Info
          </summary>
          <div className="space-y-2">
            {searchResults.debugInfo.apiHits?.map((hit: any, index: number) => (
              <div key={index} className={`text-xs p-2 rounded ${hit.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <strong>{hit.source}:</strong> {hit.success ? 'Success' : 'Failed'} - {hit.prospectCount} results
                {hit.error && <div className="text-red-600">Error: {hit.error}</div>}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}