'use client';

import React, { useState } from 'react';
import { Search, Loader, ExternalLink, Calendar, Building, Award } from 'lucide-react';

interface TemplateResult {
  template: {
    id: string;
    name: string;
    query: string;
    description: string;
    category: string;
  };
  results: {
    organic_results: Array<{
      position: number;
      title: string;
      link: string;
      snippet: string;
      date?: string;
      source: string;
    }>;
    total_results: number;
    search_time: string;
  };
}

interface Prospect {
  id: string;
  title: string;
  url: string;
  snippet: string;
  organization: string;
  category: string;
  date?: string;
  template_used: string;
  opportunity_type: string;
}

export default function TemplateSearchPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>(['ul94-rfp', 'iso5660-rfp']);
  const [copyStatus, setCopyStatus] = useState<string>('');

  const templates = [
    { id: 'ul94-rfp', name: 'UL 94 RFPs', category: 'rfp' },
    { id: 'iso5660-rfp', name: 'ISO 5660 RFPs', category: 'rfp' },
    { id: 'astm-e84-rfp', name: 'ASTM E84 RFPs', category: 'rfp' },
    { id: 'fire-safety-grants', name: 'Fire Safety Grants', category: 'grant' }
  ];

  const copyPrompt = async (aiTool: string) => {
    const prompt = `Using the current date [September 21, 2025], search for the latest North American labs, universities, government entities in fire safety for sectors like construction/building materials, aerospace, automotive/EV batteries, plastics/polymers/chemicals, textiles, electronics/consumer goods, furniture, healthcare, manufacturing using UL94, ASTM E1354, ISO 5660, ISO 9705, ISO 11341, ASTM E84, NFPA 701. Include university research grants (e.g., NSF FIRE, UL Institutes, FEMA FP&S, DOE ARPA-E, NIH SBIR, NASA SBIR) and university/government solicitations (RFBs, open contracts, university solicitations, government RFPs). Prioritize events from the last 30-90 days. Find 10 unique prospects (no duplicates from prior lists) with contact names/titles, emails/phones, cities, catalysts (regs, market shifts, grants, solicitations) or funding/green certs, why they need our instruments (e.g., cone calorimeters for ASTM E1354, smoke chambers for NFPA 701, oxygen indexes/microcalorimeters/UL94 testers), announcement dates, source links, and type (Funding, Green Cert, or Catalyst). Output as a CSV file with columns: Date,Published Date,Bid Due Date,Company,Contact,Location,Catalyst/Funding (link at end),Fit,Reasoning,Type. Ensure thorough and detailed responses in the Reasoning column. Include notes on sources, verification, and format. Balance ~4 Funding, ~3 Green Cert, ~3 Catalyst. Base on verifiable sources like company sites, press releases, federal registers, grant databases (grants.gov), university announcements, and journals (e.g., NFPA, FAA, ASTM, NSF). IMPORTANT: At the end of your response, please list all the specific websites and sources you used to find this information, formatted as: SOURCES USED: - Website Name: URL (what was found here) - Website Name: URL (what was found here) This helps track reliable sources for ongoing monitoring.`;
    
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyStatus(`${aiTool} prompt copied!`);
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopyStatus('Copy failed - please try again');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  const handleSearch = async () => {
    if (selectedTemplates.length === 0) {
      alert('Please select at least one template');
      return;
    }

    setIsSearching(true);
    setProspects([]);

    try {
      const response = await fetch('/api/search-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateIds: selectedTemplates })
      });

      const data = await response.json();
      
      // Convert results to prospects
      const allProspects: Prospect[] = [];
      
      data.results?.forEach((result: TemplateResult) => {
        result.results.organic_results?.forEach((item, index) => {
          const prospect: Prospect = {
            id: `${result.template.id}-${index}`,
            title: item.title,
            url: item.link,
            snippet: item.snippet,
            organization: item.source || 'Unknown',
            category: result.template.category,
            date: item.date || new Date().toISOString().split('T')[0],
            template_used: result.template.name,
            opportunity_type: 'RFP'
          };
          allProspects.push(prospect);
        });
      });

      setProspects(allProspects);

    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with title and AI buttons */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Fire Safety Opportunity Search</h1>
        
        {/* AI Search Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => copyPrompt('ChatGPT')}
            className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
          >
            ChatGPT
          </button>
          <button
            onClick={() => copyPrompt('Grok')}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            Grok
          </button>
          <button
            onClick={() => copyPrompt('Perplexity')}
            className="px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
          >
            Perplexity
          </button>
          <button
            onClick={() => copyPrompt('Gemini')}
            className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
          >
            Gemini
          </button>
        </div>
      </div>

      {/* Copy status indicator */}
      {copyStatus && (
        <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
          {copyStatus}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Select Templates</h2>
        
        {templates.map(template => (
          <label key={template.id} className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              checked={selectedTemplates.includes(template.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedTemplates([...selectedTemplates, template.id]);
                } else {
                  setSelectedTemplates(selectedTemplates.filter(id => id !== template.id));
                }
              }}
            />
            <span>{template.name}</span>
          </label>
        ))}
        
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isSearching ? 'Searching...' : 'Search Templates'}
        </button>
      </div>

      <div className="space-y-4">
        {prospects.map(prospect => (
          <div key={prospect.id} className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold mb-2">{prospect.title}</h3>
            <p className="text-gray-600 mb-3">{prospect.snippet}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{prospect.organization}</span>
              <a href={prospect.url} target="_blank" className="text-blue-600">View</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
