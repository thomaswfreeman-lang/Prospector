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

  const templates = [
    { id: 'ul94-rfp', name: 'UL 94 RFPs', category: 'rfp' },
    { id: 'iso5660-rfp', name: 'ISO 5660 RFPs', category: 'rfp' },
    { id: 'astm-e84-rfp', name: 'ASTM E84 RFPs', category: 'rfp' },
    { id: 'fire-safety-grants', name: 'Fire Safety Grants', category: 'grant' }
  ];

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
      <h1 className="text-3xl font-bold mb-8">Fire Safety Opportunity Search</h1>
      
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