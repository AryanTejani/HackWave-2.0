import { NextRequest, NextResponse } from 'next/server';
import { MultiAgentOrchestrator } from '@/lib/multi-agent-system';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Require authentication (from main branch)
    const user = await requireAuth(request);
    const userId = user._id.toString(); // userId is available for future use

    // Use the MultiAgentOrchestrator to get live, dynamic risk analysis (from feat-dynamic branch)
    const orchestrator = new MultiAgentOrchestrator();
    const analysisResult = await orchestrator.analyzeSupplyChain();
    const risks = analysisResult.risks;

    return NextResponse.json({
      success: true,
      data: risks,
      count: risks.length,
      lastUpdated: new Date().toISOString(),
      message: 'Live risk analysis completed successfully'
    });

  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    console.error('Risk monitoring error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete risk analysis' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication (from main branch)
    const user = await requireAuth(request);
    const userId = user._id.toString();

    const body = await request.json();
    const { riskType, customRisk } = body;

    // This feature for adding custom risks from the 'main' branch is preserved
    if (customRisk) {
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

      // In a real application, you would save this to the database
      // For now, we just return it as a confirmation.
      return NextResponse.json({
        success: true,
        data: customRiskAlert,
        message: 'Custom risk added successfully'
      });
    }

    // Default POST action is to trigger a new, fresh analysis
    const orchestrator = new MultiAgentOrchestrator();
    const analysisResult = await orchestrator.analyzeSupplyChain();
    const risks = analysisResult.risks;

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
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    console.error('Risk monitoring error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete risk analysis' },
      { status: 500 }
    );
  }
}