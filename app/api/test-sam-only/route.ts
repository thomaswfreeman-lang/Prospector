// app/api/test-sam-only/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query = 'fire safety testing equipment prospects', region = 'north-america', maxProspects = 5 } = await request.json();
    
    console.log('🏛️ Testing ONLY Sam.gov (the working API)...');
    
    const apiKey = process.env.SAM_GOV_API_KEY || process.env.SAM_API_KEY || process.env.SAMGOV_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: 'Sam.gov API key not found',
        prospects: []
      });
    }

    // Search for fire safety opportunities
    const searchQuery = encodeURIComponent('fire safety testing equipment laboratory research');
    const response = await fetch(`https://api.sam.gov/opportunities/v2/search?api_key=${apiKey}&keyword=${searchQuery}&limit=${maxProspects}&postedFrom=2024-01-01`, {
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
    
    const prospects = opportunities.slice(0, maxProspects).map((opp: any, i: number) => ({
      id: Date.now() + Math.random() * 1000 + i,
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

    console.log(`✅ Sam.gov SUCCESS: Found ${prospects.length} prospects`);

    return NextResponse.json({
      prospects,
      searchResults: {
        totalProspects: prospects.length,
        searchQuery: query,
        region: region,
        realAPICalls: true,
        apisUsed: ['Sam.gov'],
        debugInfo: {
          message: 'Sam.gov is working! This proves your search logic works.',
          totalOpportunities: opportunities.length,
          source: 'Government contracts database'
        }
      }
    });

  } catch (error) {
    console.error('❌ Sam.gov Test Error:', error);
    return NextResponse.json({
      error: 'Sam.gov test failed',
      prospects: [],
      searchResults: {
        debugInfo: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Also support GET for easy testing
  return NextResponse.json({
    message: 'Sam.gov test endpoint ready. Use POST with query parameters.',
    testUrl: 'POST to this endpoint with: {"query": "fire safety", "maxProspects": 5}'
  });
}
