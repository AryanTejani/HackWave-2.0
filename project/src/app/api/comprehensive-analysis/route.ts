// app/api/comprehensive-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { multiAgentSystem } from '@/lib/multi-agent-system';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    const userId = user._id.toString();

    console.log('Comprehensive Analysis: Starting full analysis for user:', userId);

    // Run comprehensive analysis
    const analysis = await multiAgentSystem.runFullAnalysis(userId);

    console.log('Comprehensive Analysis: Completed analysis with', {
      risks: analysis.risks.length,
      vulnerabilities: analysis.vulnerabilities.length,
      events: analysis.events.length,
      simulations: analysis.simulations.length,
      strategies: analysis.strategies.length
    });

    return NextResponse.json({
      success: true,
      data: analysis,
      message: 'Comprehensive analysis completed successfully'
    });

  } catch (error) {
    console.error('Comprehensive Analysis API Error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to run comprehensive analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
