// app/api/generate-prospects/route.ts - 3 APIs ONLY
import { NextRequest, NextResponse } from 'next/server';

interface Prospect {
  id: number;
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

export async function POST(request: NextRequest) {
  try {
    const { query = 'fire safety testing equipment prospects', region = 'north-america', maxProspects = 15 } = await request.json();
    
    console.log('Starting 3-API search: OpenAI, Sam.gov, SerpAPI...');
    
    // Check only the 3 APIs we're using
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasSamGov = !!process.env.SAM_API_KEY;
    const hasSerpAPI = !!process.env.SERPAPI_KEY;
    
    console.log('API Status:', { hasOpenAI, hasSamGov, hasSerpAPI });
    
    const allProspects: Prospect[] = [];
    const apiPromises = [];
    const debugInfo: any = {
      configuredAPIs: [],
      apiResults: [],
      errors: []
    };

    // OpenAI
    if (hasOpenAI) {
      console.log('Queuing OpenAI...');
      debugInfo.configuredAPIs.push('OpenAI');
      apiPromises.push(
        searchWithOpenAI(query, region, 5)
          .then(prospects => ({ source: 'OpenAI', prospects, success: true }))
          .catch(err => ({ source: 'OpenAI', prospects: [], success: false, error: err.message }))
      );
    } else {
      debugInfo.errors.push('OpenAI API key not configured');
    }

    // Sam.gov
    if (hasSamGov) {
      console.log('Queuing Sam.gov...');
      debugInfo.configuredAPIs.push('Sam.gov');
      apiPromises.push(
        searchWithSamGov(query, region, 5)
          .then(prospects => ({ source: 'Sam.gov', prospects, success: true }))
          .catch(err => ({ source: 'Sam.gov', prospects: [], success: false, error: err.message }))
      );
    } else {
      debugInfo.errors.push('Sam.gov API key not configured');
    }

    // SerpAPI
    if (hasSerpAPI) {
      console.log('Queuing SerpAPI...');
      debugInfo.configuredAPIs.push('SerpAPI');
      apiPromises.push(
        searchWithSerpAPI(query, region, 5)
          .then(prospects => ({ source: 'SerpAPI', prospects, success: true }))
          .catch(err => ({ source: 'SerpAPI', prospects: [], success: false, error: err.message }))
      );
    } else {
      debugInfo.errors.push('SerpAPI key not configured');
    }

    console.log(`Executing ${apiPromises.length}/3 API calls...`);
    
    // Execute all API calls with timeout
    const timeoutMs = 45000;
    
    const results = await Promise.allSettled(
      apiPromises.map(promise => 
        Promise.race([
          promise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API call timeout after 45s')), timeoutMs)
          )
        ])
      )
    );
    
    // Process results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { source, prospects, success, error } = result.value as any;
        console.log(`${source}: ${prospects.length} prospects ${success ? 'SUCCESS' : 'FAILED'}${error ? ` (${error})` : ''}`);
        debugInfo.apiResults.push({ source, prospectCount: prospects.length, success, error });
        if (success) {
          allProspects.push(...prospects);
        }
      } else {
        const source = debugInfo.configuredAPIs[index] || 'Unknown';
        console.log(`${source}: CRASHED - ${result.reason}`);
        debugInfo.apiResults.push({ source, prospectCount: 0, success: false, error: result.reason?.message || 'Promise rejected' });
      }
    });

    // Remove duplicates and limit
    const uniqueProspects = removeDuplicates(allProspects);
    const limitedProspects = uniqueProspects.slice(0, maxProspects);

    console.log(`SEARCH COMPLETE: ${limitedProspects.length} total prospects from ${debugInfo.configuredAPIs.length} APIs`);

    return NextResponse.json({
      prospects: limitedProspects,
      searchResults: {
        totalProspects: limitedProspects.length,
        searchQuery: query,
        region: region,
        realAPICalls: true,
        apisUsed: debugInfo.configuredAPIs,
        debugInfo: {
          ...debugInfo,
          totalFound: limitedProspects.length,
          apiCallsAttempted: apiPromises.length,
          successfulAPIs: debugInfo.apiResults.filter((r: any) => r.success).length
        }
      }
    });

  } catch (error) {
    console.error('Search Engine Error:', error);
    return NextResponse.json({
      error: 'Search failed',
      prospects: [],
      searchResults: {
        realAPICalls: false,
        debugInfo: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }, { status: 500 });
  }
}

// OpenAI with correct model
async function searchWithOpenAI(query: string, region: string, count: number): Promise<Prospect[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key not configured');

  console.log('Calling OpenAI API...');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Find ${count} REAL fire safety research laboratories, testing facilities, and research institutions in ${region}. Focus on actual organizations that exist. Return JSON array with this exact format:
[
  {
    "companyName": "Actual Organization Name",
    "contactName": "Real Contact Person", 
    "email": "email@domain.com",
    "phone": "phone number",
    "location": "City, State",
    "description": "What they do"
  }
]
Only return valid JSON. No other text.`
      }],
      max_tokens: 2000,
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || '';
  
  try {
    const prospects = JSON.parse(content);
    return prospects.map((p: any, i: number) => ({
      id: Date.now() + Math.random() * 1000 + i,
      date: new Date().toISOString().split('T')[0],
      publishedDate: '',
      bidDueDate: '',
      company: p.companyName || 'Unknown Company',
      contact: p.contactName || 'Unknown Contact',
      location: p.location || 'Unknown Location',
      catalyst: p.description || 'Fire safety research opportunity',
      fit: 'Fire testing equipment and instrumentation',
      reasoning: `OpenAI found real fire safety facility: ${p.description}`,
      type: 'Research',
      source: 'OpenAI Discovery',
      phone: p.phone || '',
      email: p.email || ''
    }));
  } catch (parseError) {
    throw new Error('OpenAI returned invalid JSON');
  }
}

// Sam.gov using exact environment variable name
async function searchWithSamGov(query: string, region: string, count: number): Promise<Prospect[]> {
  const apiKey = process.env.SAM_API_KEY;
  if (!apiKey) throw new Error('Sam.gov API key not configured');

  console.log('Calling Sam.gov API...');

  const searchQuery = encodeURIComponent('fire safety testing equipment laboratory research');
  const response = await fetch(`https://api.sam.gov/opportunities/v2/search?api_key=${apiKey}&keyword=${searchQuery}&limit=${count}&postedFrom=2024-01-01`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Sam.gov API failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const opportunities = data.opportunitiesData || [];
  
  return opportunities.slice(0, count).map((opp: any, i: number) => ({
    id: Date.now() + Math.random() * 1000 + 4000 + i,
    date: new Date().toISOString().split('T')[0],
    publishedDate: opp.postedDate || '',
    bidDueDate: opp.responseDeadLine || '',
    company: opp.officeAddress?.name || opp.department || 'Government Agency',
    contact: 'Contracting Officer',
    location: `${opp.officeAddress?.city || ''}, ${opp.officeAddress?.state || ''}`.trim() || 'Government Location',
    catalyst: opp.title || 'Government fire safety contract opportunity',
    fit: 'Fire testing equipment and services for government contracts',
    reasoning: `Government contract opportunity: ${opp.description || opp.title}`,
    type: 'Government Contract',
    source: opp.uiLink || 'Sam.gov Contract',
    phone: '',
    email: ''
  }));
}

async function searchWithSerpAPI(query: string, region: string, count: number): Promise<Prospect[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error('SerpAPI key not configured');

  console.log('Calling SerpAPI...');

  const searchQuery = `fire safety testing laboratory research ${region}`;
  const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(searchQuery)}&api_key=${apiKey}&num=${count + 2}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SerpAPI failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const results = data.organic_results || [];
  
  return results.slice(0, count).map((result: any, i: number) => ({
    id: Date.now() + Math.random() * 1000 + 3000 + i,
    date: new Date().toISOString().split('T')[0],
    publishedDate: '',
    bidDueDate: '',
    company: extractCompanyName(result.title) || 'Research Organization',
    contact: 'Contact via website',
    location: extractLocation(result.snippet) || 'Location TBD',
    catalyst: result.snippet || 'Fire safety research opportunity found via web search',
    fit: 'Fire testing equipment and certification services',
    reasoning: `Web search result: ${result.title}. ${result.snippet}`,
    type: 'Web Discovery',
    source: result.link || 'SerpAPI Web Search',
    phone: '',
    email: ''
  }));
}

function extractCompanyName(title: string): string {
  const patterns = [
    /^([^-|]+)/,
    /(\w+\s+(?:University|Institute|Laboratory|Lab|Corp|Inc|LLC))/i
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) return match[1].trim();
  }
  
  return title.split(' ').slice(0, 3).join(' ');
}

function extractLocation(text: string): string {
  const locationPattern = /([A-Z][a-z]+,?\s+[A-Z]{2})|([A-Z][a-z]+\s+[A-Z][a-z]+,?\s+[A-Z]{2})/;
  const match = text.match(locationPattern);
  return match ? match[0] : '';
}

function removeDuplicates(prospects: Prospect[]): Prospect[] {
  const seen = new Set();
  return prospects.filter(prospect => {
    const key = `${prospect.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}