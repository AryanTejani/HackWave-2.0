// app/api/ai-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MultiAgentOrchestrator } from '@/lib/multi-agent-system';
import { requireAuth } from '@/lib/auth-utils'; // Assuming this utility exists from the main branch

export async function POST(request: NextRequest) {
  try {
    // Authentication is preserved from your 'main' branch
    const user = await requireAuth(request);
    const userId = user._id.toString(); // userId is available for future use if needed

    const body = await request.json();
    const { analysisType = 'full' } = body;

    // The orchestrator from 'feat/dynamic' is now the core of the analysis
    const orchestrator = new MultiAgentOrchestrator();
    let analysis;

    // The flexible 'analysisType' logic from 'main' is preserved and updated
    if (analysisType === 'full') {
      // The orchestrator now handles its own data fetching internally
      analysis = await orchestrator.analyzeSupplyChain(userId);
    } else if (analysisType === 'risks') {
      // To get just the risks, we run the full analysis and extract the relevant part.
      // This is efficient as it reuses the main analysis flow.
      const fullAnalysis = await orchestrator.analyzeSupplyChain(userId);
      analysis = {
        risks: fullAnalysis.risks,
        analysisTimestamp: fullAnalysis.analysisTimestamp,
        summary: {
          totalRisks: fullAnalysis.risks.length,
          highRiskCount: fullAnalysis.risks.filter(r => r.severity === 'high' || r.severity === 'critical').length,
        }
      };
    } else if (analysisType === 'recommendations') {
      // Similarly, we run the full analysis to get the context for recommendations.
      const fullAnalysis = await orchestrator.analyzeSupplyChain(userId);
      const recommendations = fullAnalysis.recommendations;
      analysis = {
        recommendations,
        analysisTimestamp: fullAnalysis.analysisTimestamp,
        summary: {
          recommendationsCount: (recommendations.immediate?.length || 0) + (recommendations.shortTerm?.length || 0) + (recommendations.longTerm?.length || 0)
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

// The GET endpoint from your 'main' branch is preserved as it provides useful metadata.
export async function GET(request: NextRequest) {
  try {
    // Require authentication for this endpoint as well
    await requireAuth(request);

    // Return analysis status and available types
    return NextResponse.json({
      success: true,
      data: {
        availableAnalysisTypes: ['full', 'risks', 'recommendations'],
        lastAnalysis: null, // This could be implemented to show the last run time
        status: 'ready'
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