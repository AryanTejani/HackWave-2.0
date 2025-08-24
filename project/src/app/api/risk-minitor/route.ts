// src/app/api/risk-monitor/route.ts
import { NextRequest, NextResponse } from 'next/server';
// The Orchestrator is the only thing we need to import now
import { MultiAgentOrchestrator } from '@/lib/multi-agent-system';

export async function GET(request: NextRequest) {
  try {
    console.log("Kicking off multi-agent supply chain analysis...");
    
    const orchestrator = new MultiAgentOrchestrator();
    // The orchestrator now handles fetching and passing data to the agent
    const analysisResult = await orchestrator.analyzeSupplyChain();

    return NextResponse.json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    console.error('Risk monitoring API error:', error);
    return NextResponse.json(
      { success: false, error: 'Multi-agent analysis failed' },
      { status: 500 }
    );
  }
}