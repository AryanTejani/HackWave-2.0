// app/api/what-if-simulation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MultiAgentOrchestrator } from '@/lib/multi-agent-system';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scenario } = body;

    if (!scenario) {
      return NextResponse.json(
        { success: false, error: 'Scenario is required' },
        { status: 400 }
      );
    }

    const orchestrator = new MultiAgentOrchestrator();
    const simulation = await orchestrator.runWhatIfSimulation(scenario);

    return NextResponse.json({
      success: true,
      simulation,
      processedAt: new Date(),
    });
  } catch (error) {
    console.error('What-if simulation error:', error);
    return NextResponse.json(
      { success: false, error: 'Simulation failed' },
      { status: 500 }
    );
  }
}