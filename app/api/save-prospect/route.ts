// app/api/save-prospect/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache (use Redis in production)
const prospectCache = new Map<string, any>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface SavedProspect {
  id: string;
  title: string;
  url: string;
  organization: string;
  fit_score: number;
  urgency: number;
  implied_standard: string;
  why_it_matters: string;
  saved_at: string;
  status: 'new' | 'contacted' | 'qualified' | 'rejected';
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const prospect = await request.json();
    
    const savedProspect: SavedProspect = {
      id: generateId(),
      title: prospect.title || 'Untitled',
      url: prospect.url || '',
      organization: prospect.organization || 'Unknown',
      fit_score: prospect.fit_score || 0,
      urgency: prospect.urgency || 1,
      implied_standard: prospect.implied_standard || '',
      why_it_matters: prospect.why_it_matters || '',
      saved_at: new Date().toISOString(),
      status: 'new',
      notes: prospect.notes || ''
    };

    // Save to cache (replace with Redis/database in production)
    const cacheKey = `saved_prospects`;
    const existingProspects = prospectCache.get(cacheKey) || [];
    existingProspects.push(savedProspect);
    prospectCache.set(cacheKey, existingProspects);

    // Optional: Save to Google Sheets (add your Google Sheets integration here)
    if (process.env.GOOGLE_SHEETS_ENABLED === 'true') {
      await saveToGoogleSheets(savedProspect);
    }

    return NextResponse.json({
      success: true,
      prospect_id: savedProspect.id,
      message: 'Prospect saved successfully'
    });

  } catch (error) {
    console.error('Save prospect error:', error);
    return NextResponse.json({
      error: 'Failed to save prospect',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const sortBy = searchParams.get('sort') || 'saved_at';
  
  const cacheKey = `saved_prospects`;
  let prospects = prospectCache.get(cacheKey) || [];
  
  // Filter by status
  if (status && status !== 'all') {
    prospects = prospects.filter((p: SavedProspect) => p.status === status);
  }
  
  // Sort prospects
  prospects.sort((a: SavedProspect, b: SavedProspect) => {
    if (sortBy === 'fit_score') return b.fit_score - a.fit_score;
    if (sortBy === 'urgency') return b.urgency - a.urgency;
    return new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime();
  });

  return NextResponse.json({
    prospects,
    total: prospects.length,
    statuses: {
      new: prospects.filter((p: SavedProspect) => p.status === 'new').length,
      contacted: prospects.filter((p: SavedProspect) => p.status === 'contacted').length,
      qualified: prospects.filter((p: SavedProspect) => p.status === 'qualified').length,
      rejected: prospects.filter((p: SavedProspect) => p.status === 'rejected').length
    }
  });
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status, notes } = await request.json();
    
    const cacheKey = `saved_prospects`;
    const prospects = prospectCache.get(cacheKey) || [];
    
    const prospectIndex = prospects.findIndex((p: SavedProspect) => p.id === id);
    if (prospectIndex === -1) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }
    
    // Update prospect
    prospects[prospectIndex] = {
      ...prospects[prospectIndex],
      status: status || prospects[prospectIndex].status,
      notes: notes !== undefined ? notes : prospects[prospectIndex].notes,
      updated_at: new Date().toISOString()
    };
    
    prospectCache.set(cacheKey, prospects);

    return NextResponse.json({
      success: true,
      message: 'Prospect updated successfully'
    });

  } catch (error) {
    console.error('Update prospect error:', error);
    return NextResponse.json({
      error: 'Failed to update prospect',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Simple cache management
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  if (action === 'clear_cache') {
    prospectCache.clear();
    return NextResponse.json({ success: true, message: 'Cache cleared' });
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

function generateId(): string {
  return `prospect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Placeholder for Google Sheets integration
async function saveToGoogleSheets(prospect: SavedProspect) {
  // Implement Google Sheets API integration here
  // For now, just log it
  console.log('Would save to Google Sheets:', prospect);
}