// app/api/test-apis/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  // Test OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log('🤖 Testing OpenAI...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Say "OpenAI test successful"' }],
          max_tokens: 10
        })
      });

      if (response.ok) {
        const data = await response.json();
        results.tests.push({
          api: 'OpenAI',
          status: 'SUCCESS',
          message: 'Connection successful',
          response: data.choices?.[0]?.message?.content || 'No content'
        });
      } else {
        const errorText = await response.text();
        results.tests.push({
          api: 'OpenAI',
          status: 'FAILED',
          httpStatus: response.status,
          error: errorText.substring(0, 200)
        });
      }
    } catch (error) {
      results.tests.push({
        api: 'OpenAI',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    results.tests.push({
      api: 'OpenAI',
      status: 'NO_KEY',
      error: 'OPENAI_API_KEY not found'
    });
  }

  // Test Gemini
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey) {
    try {
      console.log('🔮 Testing Gemini...');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Say "Gemini test successful"' }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        results.tests.push({
          api: 'Gemini',
          status: 'SUCCESS',
          message: 'Connection successful',
          response: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No content'
        });
      } else {
        const errorText = await response.text();
        results.tests.push({
          api: 'Gemini',
          status: 'FAILED',
          httpStatus: response.status,
          error: errorText.substring(0, 200)
        });
      }
    } catch (error) {
      results.tests.push({
        api: 'Gemini',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    results.tests.push({
      api: 'Gemini',
      status: 'NO_KEY',
      error: 'GEMINI_API_KEY or GOOGLE_API_KEY not found'
    });
  }

  // Test XAI (Grok)
  const xaiKey = process.env.XAI_API_KEY || process.env.X_API_KEY || process.env.GROK_API_KEY;
  if (xaiKey) {
    try {
      console.log('🚀 Testing XAI/Grok...');
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${xaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [{ role: 'user', content: 'Say "XAI test successful"' }],
          max_tokens: 10
        })
      });

      if (response.ok) {
        const data = await response.json();
        results.tests.push({
          api: 'XAI',
          status: 'SUCCESS',
          message: 'Connection successful',
          response: data.choices?.[0]?.message?.content || 'No content'
        });
      } else {
        const errorText = await response.text();
        results.tests.push({
          api: 'XAI',
          status: 'FAILED',
          httpStatus: response.status,
          error: errorText.substring(0, 200)
        });
      }
    } catch (error) {
      results.tests.push({
        api: 'XAI',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    results.tests.push({
      api: 'XAI',
      status: 'NO_KEY',
      error: 'XAI_API_KEY, X_API_KEY, or GROK_API_KEY not found'
    });
  }

  // Test Sam.gov
  const samKey = process.env.SAM_GOV_API_KEY || process.env.SAM_API_KEY || process.env.SAMGOV_API_KEY;
  if (samKey) {
    try {
      console.log('🏛️ Testing Sam.gov...');
      // Test with a simple entity search
      const response = await fetch(`https://api.sam.gov/entity-information/v3/entities?api_key=${samKey}&page=0&size=1`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        results.tests.push({
          api: 'Sam.gov',
          status: 'SUCCESS',
          message: 'Connection successful',
          entitiesFound: data.totalRecords || 0
        });
      } else {
        const errorText = await response.text();
        results.tests.push({
          api: 'Sam.gov',
          status: 'FAILED',
          httpStatus: response.status,
          error: errorText.substring(0, 200)
        });
      }
    } catch (error) {
      results.tests.push({
        api: 'Sam.gov',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    results.tests.push({
      api: 'Sam.gov',
      status: 'NO_KEY',
      error: 'SAM_GOV_API_KEY, SAM_API_KEY, or SAMGOV_API_KEY not found'
    });
  }

  // Test SerpAPI
  const serpKey = process.env.SERPAPI_KEY || process.env.SERP_API_KEY;
  if (serpKey) {
    try {
      console.log('🔍 Testing SerpAPI...');
      const response = await fetch(`https://serpapi.com/search.json?q=test&api_key=${serpKey}&num=1`);
      
      if (response.ok) {
        const data = await response.json();
        results.tests.push({
          api: 'SerpAPI',
          status: 'SUCCESS',
          message: 'Connection successful',
          resultsFound: data.organic_results?.length || 0
        });
      } else {
        const errorText = await response.text();
        results.tests.push({
          api: 'SerpAPI',
          status: 'FAILED',
          httpStatus: response.status,
          error: errorText.substring(0, 200)
        });
      }
    } catch (error) {
      results.tests.push({
        api: 'SerpAPI',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    results.tests.push({
      api: 'SerpAPI',
      status: 'NO_KEY',
      error: 'SERPAPI_KEY or SERP_API_KEY not found'
    });
  }

  // Summary
  const successful = results.tests.filter((t: any) => t.status === 'SUCCESS').length;
  const total = results.tests.length;
  const keysFound = results.tests.filter((t: any) => t.status !== 'NO_KEY').length;
  
  results.summary = {
    successful,
    total,
    keysFound,
    allWorking: successful === keysFound && keysFound > 0,
    issues: results.tests.filter((t: any) => t.status !== 'SUCCESS'),
    codeGap: {
      message: 'Your code only checks 3 APIs but you have 5 configured',
      currentCodeAPIs: ['OpenAI', 'Gemini', 'SerpAPI'],
      yourConfiguredAPIs: ['OpenAI', 'Gemini', 'XAI', 'Sam.gov', 'SerpAPI'],
      missingFromCode: ['XAI', 'Sam.gov']
    }
  };

  return NextResponse.json(results, { 
    status: 200,
    headers: { 'Cache-Control': 'no-cache' }
  });
}
