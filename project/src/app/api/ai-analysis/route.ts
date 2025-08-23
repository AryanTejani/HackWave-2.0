// app/api/ai-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MultiAgentOrchestrator } from '@/lib/multi-agent-system';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { region = 'Red Sea', analysisType = 'full' } = body;

    const orchestrator = new MultiAgentOrchestrator();
    const analysis = await orchestrator.analyzeSupplyChain(region);

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

export async function GET() {
  try {
    // Quick demo analysis for testing
    const orchestrator = new MultiAgentOrchestrator();
    const analysis = await orchestrator.analyzeSupplyChain('Red Sea');

    return NextResponse.json({
      success: true,
      analysis,
      demo: true,
    });
  } catch (error) {
    console.error('Demo analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Demo analysis failed' },
      { status: 500 }
    );
  }
}

