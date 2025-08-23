// app/api/risk-monitor/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RiskMonitorAgent } from '@/lib/multi-agent-system';

// In-memory cache to store results and prevent rate-limiting
const cache = new Map();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // The region is now optional. If not provided, it will be null.
    const region = searchParams.get('region');
    const cacheKey = `risk-monitor-${region || 'global'}`;

    if (cache.has(cacheKey)) {
      const cachedData = cache.get(cacheKey);
      if (Date.now() - cachedData.timestamp < CACHE_DURATION_MS) {
        console.log(`Serving cached data for: ${region || 'Global'}`);
        return NextResponse.json(cachedData.data);
      }
    }

    console.log(`Running AI analysis for: ${region || 'Global'}`);
    const riskAgent = new RiskMonitorAgent();
    // If region is null, the agent's default 'Global' parameter will be used.
    const risks = await riskAgent.detectRisks(region || undefined);

    const responseData = {
      success: true,
      risks,
      region: region || 'Global', // Respond with "Global" if no region was specified
      detectedAt: new Date(),
    };

    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
    });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Risk monitoring error:', error);
    return NextResponse.json(
      { success: false, error: 'Risk monitoring failed' },
      { status: 500 }
    );
  }
}