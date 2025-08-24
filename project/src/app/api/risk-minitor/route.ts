// app/api/risk-monitor/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { multiAgentSystem } from '@/lib/multi-agent-system';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    const userId = user._id.toString();

    // Get real-time risk analysis based on user's data
    const risks = await multiAgentSystem.riskMonitor.detectRisks(userId);

    return NextResponse.json({
      success: true,
      data: risks,
      count: risks.length,
      lastUpdated: new Date().toISOString(),
      message: 'Risk analysis completed successfully'
    });

  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }
    
    console.error('Risk monitoring error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to complete risk analysis' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    const userId = user._id.toString();

    const body = await request.json();
    const { riskType, customRisk } = body;

    if (customRisk) {
      // Allow users to add custom risk observations
      const customRiskAlert = {
        id: `custom_${Date.now()}`,
        type: riskType || 'custom',
        severity: 'medium',
        region: 'Custom',
        title: customRisk.title || 'Custom Risk Observation',
        description: customRisk.description || 'User-reported risk factor',
        impact: customRisk.impact || 'To be assessed',
        affectedShipments: customRisk.affectedShipments || [],
        affectedProducts: customRisk.affectedProducts || [],
        detectedAt: new Date(),
        sources: ['User Report']
      };

      return NextResponse.json({
        success: true,
        data: customRiskAlert,
        message: 'Custom risk added successfully'
      });
    }

    // Trigger new risk analysis
    const risks = await multiAgentSystem.riskMonitor.detectRisks(userId);

    return NextResponse.json({
      success: true,
      data: risks,
      count: risks.length,
      lastUpdated: new Date().toISOString(),
      message: 'Risk analysis refreshed successfully'
    });

  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }
    
    console.error('Risk monitoring error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to complete risk analysis' 
      },
      { status: 500 }
    );
  }
}
