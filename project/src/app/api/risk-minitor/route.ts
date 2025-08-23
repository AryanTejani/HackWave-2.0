// app/api/risk-monitor/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RiskMonitorAgent } from '@/lib/multi-agent-system';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || 'Red Sea';

    const riskAgent = new RiskMonitorAgent();
    const risks = await riskAgent.detectRisks(region);

    return NextResponse.json({
      success: true,
      risks,
      region,
      detectedAt: new Date(),
    });
  } catch (error) {
    console.error('Risk monitoring error:', error);
    return NextResponse.json(
      { success: false, error: 'Risk monitoring failed' },
      { status: 500 }
    );
  }
}
