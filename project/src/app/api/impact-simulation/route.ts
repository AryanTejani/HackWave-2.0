
// app/api/impact-simulation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ImpactSimulatorAgent, RiskAlert, RouteInfo } from '@/lib/multi-agent-system';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { risks, currentRoute }: { risks: RiskAlert[], currentRoute: RouteInfo } = body;

    const simulatorAgent = new ImpactSimulatorAgent();
    const simulation = await simulatorAgent.simulateDisruption(risks, currentRoute);

    return NextResponse.json({
      success: true,
      simulation,
      processedAt: new Date(),
    });
  } catch (error) {
    console.error('Impact simulation error:', error);
    return NextResponse.json(
      { success: false, error: 'Impact simulation failed' },
      { status: 500 }
    );
  }
}