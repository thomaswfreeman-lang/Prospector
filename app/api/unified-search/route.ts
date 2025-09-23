export const runtime = 'node';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  return POST(new Request(req.url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ q }),
  }));
}

export async function POST(req: NextRequest) {
  const { q = '' } = await req.json().catch(() => ({ q: '' }));
  return NextResponse.json({ success: true, echo: q });
}


/** Your existing POST handler should already exist. If it doesn’t, keep this shape: */
export async function POST(req: Request) {
  // ... your existing logic that returns the JSON you saw from your PowerShell POST test
  // e.g. read { q } from req.json(), call your unified search, return NextResponse.json(...)
  const { q = '' } = await req.json().catch(() => ({ q: '' }));
  // return NextResponse.json(await runUnified(q));
  // (leave your actual implementation here)
  return NextResponse.json({ success: true, prospects: [], sources: [], totalAPIs: 0, successfulAPIs: 0, errors: [] });
}

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

export async function POST(request: NextRequest) {
  try {
    console.log('API endpoint called');
    const { query, maxProspects = 10 } = await request.json();

    // Simple test response first
    const testProspects: Prospect[] = [
      {
        id: 'test-1',
        date: '2025-09-22',
        publishedDate: '2025-09-15',
        bidDueDate: '2025-10-15',
        company: 'Test University Fire Lab',
        contact: 'Dr. Test Contact, Research Director',
        location: 'Test City, TX',
        catalyst: 'API Test - Fire safety research grant',
        fit: 'Cone calorimeters, oxygen index testers',
        reasoning: 'This is a test prospect to verify the API is working correctly.',
        type: 'Funding',
        source: 'API Test',
        phone: '555-555-0123',
        email: 'test@university.edu'
      }
    ];

    console.log('Returning test prospects');

    return NextResponse.json({
      success: true,
      prospects: testProspects,
      sources: ['API Test'],
      totalAPIs: 1,
      successfulAPIs: 1,
      errors: []
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      message: `API failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      prospects: [],
      sources: [],
      totalAPIs: 0,
      successfulAPIs: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    });
  }
}