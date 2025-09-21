// app/api/search-templates/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface SearchTemplate {
  id: string;
  name: string;
  query: string;
  description: string;
  category: 'rfp' | 'grant' | 'procurement' | 'project' | 'research';
}

// Your winning query templates
const SEARCH_TEMPLATES: SearchTemplate[] = [
  // RFP Templates
  {
    id: 'ul94-rfp',
    name: 'UL 94 RFPs',
    query: '"UL 94" RFP',
    description: 'UL 94 flammability testing RFPs',
    category: 'rfp'
  },
  {
    id: 'iso5660-rfp', 
    name: 'ISO 5660 RFPs',
    query: '"ISO 5660" RFP',
    description: 'ISO 5660 cone calorimeter RFPs',
    category: 'rfp'
  },
  {
    id: 'astm-e84-rfp',
    name: 'ASTM E84 RFPs', 
    query: '"ASTM E84" RFP OR "flame spread" RFP',
    description: 'ASTM E84 flame spread testing RFPs',
    category: 'rfp'
  },
  {
    id: 'nfpa-701-rfp',
    name: 'NFPA 701 RFPs',
    query: '"NFPA 701" RFP OR "flame retardant" procurement',
    description: 'NFPA 701 flame retardant testing',
    category: 'rfp'
  },

  // Grant Templates  
  {
    id: 'fire-safety-grants',
    name: 'Fire Safety Grants',
    query: 'grant "fire safety" OR grant "flammability testing"',
    description: 'Fire safety research grants',
    category: 'grant'
  },
  {
    id: 'polymer-research-grants',
    name: 'Polymer Research Grants',
    query: 'grant "polymer flammability" OR grant "fire retardant"',
    description: 'Polymer flammability research funding',
    category: 'grant'
  },

  // Site-Specific Templates
  {
    id: 'gov-opengov',
    name: 'OpenGov Fire Safety',
    query: 'fire safety testing site:opengov.com',
    description: 'Government fire safety opportunities on OpenGov',
    category: 'procurement'
  },
  {
    id: 'bonfire-hub',
    name: 'BonfireHub Opportunities', 
    query: 'flammability OR "fire testing" site:bonfirehub.com',
    description: 'Fire testing opportunities on BonfireHub',
    category: 'procurement'
  },
  {
    id: 'bidnet-direct',
    name: 'BidNet Direct',
    query: '"fire safety" OR "flame spread" site:bidnetdirect.com',
    description: 'Fire safety bids on BidNet Direct',
    category: 'procurement'
  },
  {
    id: 'usgbc-projects',
    name: 'USGBC Green Projects',
    query: 'site:usgbc.org projects fire safety',
    description: 'Green building fire safety projects',
    category: 'project'
  },

  // Research Institution Templates
  {
    id: 'university-labs',
    name: 'University Fire Labs',
    query: '"fire safety laboratory" site:edu',
    description: 'University fire safety laboratories',
    category: 'research'
  },
  {
    id: 'nist-fire-research',
    name: 'NIST Fire Research',
    query: 'site:nist.gov "fire research" OR "flammability"',
    description: 'NIST fire safety research',
    category: 'research'
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const templateId = searchParams.get('id');

  // Return specific template
  if (templateId) {
    const template = SEARCH_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json(template);
  }

  // Filter by category
  let templates = SEARCH_TEMPLATES;
  if (category) {
    templates = SEARCH_TEMPLATES.filter(t => t.category === category);
  }

  return NextResponse.json({
    templates,
    categories: ['rfp', 'grant', 'procurement', 'project', 'research'],
    total: templates.length
  });
}

export async function POST(request: NextRequest) {
  try {
    const { templateIds, customQuery } = await request.json();
    const apiKey = process.env.SERPAPI_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'SerpAPI key not configured' }, { status: 500 });
    }

    const results = [];
    
    // Execute custom query if provided
    if (customQuery) {
      const searchResult = await searchWithTemplate(customQuery, apiKey);
      results.push({
        template: { id: 'custom', name: 'Custom Query', query: customQuery },
        results: searchResult
      });
    }

    // Execute template queries
    if (templateIds && Array.isArray(templateIds)) {
      for (const templateId of templateIds) {
        const template = SEARCH_TEMPLATES.find(t => t.id === templateId);
        if (template) {
          const searchResult = await searchWithTemplate(template.query, apiKey);
          results.push({
            template,
            results: searchResult
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      searchCount: results.length,
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Template search error:', error);
    return NextResponse.json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function searchWithTemplate(query: string, apiKey: string) {
  const params = new URLSearchParams({
    q: query,
    api_key: apiKey,
    num: '10',
    hl: 'en',
    gl: 'us'
  });

  const response = await fetch(`https://serpapi.com/search.json?${params}`);
  
  if (!response.ok) {
    throw new Error(`SerpAPI failed: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    organic_results: data.organic_results || [],
    total_results: data.search_information?.total_results || 0,
    search_time: data.search_information?.time_taken_displayed || '0s'
  };
}