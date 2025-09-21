// app/api/debug-env/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // ⚠️ TEMPORARY DEBUG FILE - REMOVE AFTER TROUBLESHOOTING
  
  try {
    // Check all possible API key variations
    const apiKeys = {
      // OpenAI
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      
      // Gemini
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
      
      // XAI/Grok variations
      XAI_API_KEY: process.env.XAI_API_KEY,
      X_API_KEY: process.env.X_API_KEY,
      GROK_API_KEY: process.env.GROK_API_KEY,
      
      // Sam.gov variations
      SAM_GOV_API_KEY: process.env.SAM_GOV_API_KEY,
      SAM_API_KEY: process.env.SAM_API_KEY,
      SAMGOV_API_KEY: process.env.SAMGOV_API_KEY,
      
      // SerpAPI
      SERPAPI_KEY: process.env.SERPAPI_KEY,
      SERP_API_KEY: process.env.SERP_API_KEY
    };

    const configuredKeys: any = {};
    const missingKeys: string[] = [];

    Object.entries(apiKeys).forEach(([key, value]) => {
      if (value) {
        configuredKeys[key] = {
          configured: true,
          preview: value.substring(0, 8) + '...',
          length: value.length
        };
      } else {
        missingKeys.push(key);
      }
    });

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV || 'development',
      deploymentUrl: process.env.VERCEL_URL || 'localhost',
      
      configuredKeys,
      missingKeys,
      
      summary: {
        totalConfigured: Object.keys(configuredKeys).length,
        totalChecked: Object.keys(apiKeys).length,
        configuredList: Object.keys(configuredKeys)
      },
      
      codeAnalysis: {
        currentlyUsedInCode: ['OPENAI_API_KEY', 'GEMINI_API_KEY', 'SERPAPI_KEY'],
        userMentioned: ['Gemini', 'XAI', 'sam.gov', 'OpenAI', 'SerpAPI'],
        potentialMismatch: 'Code may not be using XAI and sam.gov APIs'
      },
      
      recommendations: Object.keys(configuredKeys).length === 0 ? 
        'No API keys found - check Vercel environment variables' :
        `Found ${Object.keys(configuredKeys).length} API keys. Check if code is using all available APIs.`
    };

    return NextResponse.json(result, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
