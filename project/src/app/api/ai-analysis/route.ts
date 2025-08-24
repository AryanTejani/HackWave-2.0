// app/api/ai-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { multiAgentSystem } from '@/lib/multi-agent-system';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    const userId = user._id.toString();

    const body = await request.json();
    const { analysisType = 'full' } = body;

    let analysis;

    if (analysisType === 'full') {
      // Run full supply chain analysis
      analysis = await multiAgentSystem.analyzeSupplyChain(userId);
    } else if (analysisType === 'risks') {
      // Run only risk analysis
      const risks = await multiAgentSystem.riskMonitor.detectRisks(userId);
      analysis = {
        risks,
        analysisTimestamp: new Date().toISOString(),
        summary: {
          totalRisks: risks.length,
          highRiskCount: risks.filter(r => r.severity === 'high' || r.severity === 'critical').length,
          recommendationsCount: 0
        }
      };
    } else if (analysisType === 'recommendations') {
      // Run only recommendations
      const recommendations = await multiAgentSystem.strategyRecommender.generateRecommendations(userId);
      analysis = {
        risks: [],
        recommendations,
        analysisTimestamp: new Date().toISOString(),
        summary: {
          totalRisks: 0,
          highRiskCount: 0,
          recommendationsCount: recommendations.immediate.length + recommendations.shortTerm.length + recommendations.longTerm.length
        }
      };
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid analysis type. Use: full, risks, or recommendations' 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis,
      message: 'AI analysis completed successfully'
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
    
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to complete AI analysis' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    const userId = user._id.toString();

    // Test the AI system with a quick analysis
    console.log('AI Analysis: Testing system with user:', userId);
    
    const risks = await multiAgentSystem.riskMonitor.detectRisks(userId);
    const recommendations = await multiAgentSystem.strategyRecommender.generateRecommendations(userId);

    // Return analysis status and available types
    return NextResponse.json({
      success: true,
      data: {
        availableAnalysisTypes: ['full', 'risks', 'recommendations'],
        lastAnalysis: {
          timestamp: new Date().toISOString(),
          risksFound: risks.length,
          recommendationsGenerated: recommendations.immediate.length + recommendations.shortTerm.length + recommendations.longTerm.length
        },
        status: 'ready',
        testResults: {
          riskDetection: risks.length > 0 ? 'working' : 'no data',
          recommendationGeneration: 'working',
          aiIntegration: 'active'
        }
      }
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
    
    console.error('AI analysis status error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get analysis status' 
      },
      { status: 500 }
    );
  }
}

