'use client';

import React, { useState } from 'react';
import { Search, Loader, ExternalLink, Calendar, Building, Award, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [isQueryExpanded, setIsQueryExpanded] = useState(false);

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
        <div>
          <h1 className="text-3xl font-bold mb-2">Fire Testing New Prospects</h1>
          <p className="text-gray-600">Fire Testing New Prospects Manager</p>
        </div>
        
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
          <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
            Import/Export ▼
          </button>
        </div>
      </div>

      {/* Copy status indicator */}
      {copyStatus && (
        <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
          {copyStatus}
        </div>
      )}

      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800">
          <strong>Advanced Search Configuration:</strong> Click the ChatGPT and other tools to auto-copy the prompt below and paste into the prompt field once loaded. Wait 1-5 minutes and import the results with the Import/Export button at the top right.
        </p>
      </div>
      
      {/* AI-Powered Prospect Search & Advanced Search Configuration merged */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
            ⚡
          </div>
          <h2 className="text-xl font-semibold">AI-Powered Prospect Search</h2>
        </div>
        
        {/* Search Query Section with toggle */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="font-semibold text-gray-700">Search something specific...</label>
            <button 
              onClick={() => setIsQueryExpanded(!isQueryExpanded)}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {isQueryExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {isQueryExpanded ? 'Minimize' : 'Maximize'}
            </button>
          </div>
          
          <input 
            type="text" 
            className="w-full p-3 border border-gray-300 rounded-md"
            defaultValue="UL 94, ASTM E1354, ISO 5660"
            placeholder="Enter your search terms..."
          />
          
          {/* Expandable query configuration */}
          {isQueryExpanded && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>North America</option>
                    <option>Europe</option>
                    <option>Asia Pacific</option>
                    <option>Global</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Results</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>15 prospects</option>
                    <option>25 prospects</option>
                    <option>50 prospects</option>
                    <option>100 prospects</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Standards</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="NFPA 701, ISO 9705..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Instrument or Keyword</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Cone Calorimeter, Oxygen Index..."
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm text-gray-700">Include Sam.gov Federal Opportunities</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Template Selection */}
        <h3 className="text-lg font-semibold mb-4">Select Templates</h3>
        
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
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSearching ? (
            <div className="flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              Searching...
            </div>
          ) : (
            'Search Templates'
          )}
        </button>
      </div>

      {/* Sample Data Notice */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-sm">
          <strong>1 RFB/Solicitation with approaching deadlines</strong>
        </p>
        <p className="text-yellow-700 text-sm mt-1">
          If you're seeing sample data instead of real results: Required Environment Variables
        </p>
      </div>

      {/* Sample Prospects */}
      <div className="space-y-4">
        {/* University of Texas */}
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Contact: Dr. Sarah Chen, Research Director</h3>
              <div className="text-sm text-gray-600 mb-2">
                📧 schen@utexas.edu<br />
                📞 512-555-0123
              </div>
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-medium">
              NSF FIRE grant for EV battery safety research ($2.5M)
            </div>
          </div>
          <div className="bg-blue-50 text-blue-800 p-2 rounded mb-3 text-sm">
            Cone calorimeters, oxygen index testers, microcalorimeters
          </div>
          <p className="text-gray-700">
            NSF awarded $2.5M FIRE grant for comprehensive EV battery thermal runaway research. Lab needs ASTM E1354 cone calorimetry and oxygen index testing equipment to study lithium-ion battery failure modes and develop safer battery designs.
          </p>
        </div>

        {/* NIST */}
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Contact: Dr. Mark Rodriguez, Principal Investigator</h3>
              <div className="text-sm text-gray-600 mb-2">
                📧 mrodriguez@nist.gov<br />
                📞 301-555-0456
              </div>
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-medium">
              FEMA FP&S solicitation for wildfire-resistant building materials
            </div>
          </div>
          <div className="bg-blue-50 text-blue-800 p-2 rounded mb-3 text-sm">
            Smoke density chambers, heat release testers, UL94 equipment
          </div>
          <p className="text-gray-700">
            NIST responding to FEMA Fire Prevention & Safety (FP&S) RFB for wildfire-resistant construction materials research. Requires ISO 5660 heat release testing and ASTM E84 flame spread equipment for developing new building material standards.
          </p>
        </div>

        {/* Boeing Partnership */}
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Contact: Jennifer Liu, Lab Manager</h3>
              <div className="text-sm text-gray-600 mb-2">
                📧 jliu@amtc.org<br />
                📞 206-555-0789
              </div>
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-medium">
              Boeing-University partnership for sustainable aviation materials
            </div>
          </div>
          <div className="bg-blue-50 text-blue-800 p-2 rounded mb-3 text-sm">
            Cone calorimeters, smoke chambers, oxygen index testers
          </div>
          <p className="text-gray-700">
            Multi-university consortium with Boeing funding sustainable aviation material development. Green certification requirements demand comprehensive fire testing per FAA Part 25. New $5M lab facility needs complete fire testing suite including ASTM E1354 and NFPA 701 compliance equipment.
          </p>
        </div>

        {/* Dynamic search results */}
        {prospects.map(prospect => (
          <div key={prospect.id} className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold mb-2">{prospect.title}</h3>
            <p className="text-gray-600 mb-3">{prospect.snippet}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{prospect.organization}</span>
              <a href={prospect.url} target="_blank" className="text-blue-600 hover:text-blue-800">
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
