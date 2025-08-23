// app/api/strategy-recommendations/route.ts  
import { NextRequest, NextResponse } from 'next/server';
import { StrategyRecommenderAgent, RiskAlert, SimulationResult } from '@/lib/multi-agent-system';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { risks, simulation }: { risks: RiskAlert[], simulation: SimulationResult } = body;

    const strategyAgent = new StrategyRecommenderAgent();
    const strategies = await strategyAgent.generateStrategies(risks, simulation);

    return NextResponse.json({
      success: true,
      strategies,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error('Strategy generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Strategy generation failed' },
      { status: 500 }
    );
  }
}