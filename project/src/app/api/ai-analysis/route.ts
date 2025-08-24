// app/api/ai-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MultiAgentOrchestrator } from '@/lib/multi-agent-system';
import { getGlobalConditions, getSupplyChainNews } from '@/lib/tools';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { region = 'Worldwide', analysisType = 'full' } = body;

    // Fetch data here
    const [conditions, news] = await Promise.all([
      getGlobalConditions(),
      getSupplyChainNews()
    ]);

    const orchestrator = new MultiAgentOrchestrator();
    // Pass data to the orchestrator
    const analysis = await orchestrator.analyzeSupplyChainWithData(conditions, news);

    return NextResponse.json({
      success: true,
      analysis,
      processingTime: Date.now(),
    });
  } catch (error) {
    console.error('AI Analysis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform AI analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
