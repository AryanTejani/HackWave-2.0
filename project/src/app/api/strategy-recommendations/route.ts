// app/api/strategy-recommendations/route.ts  
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { multiAgentSystem } from '@/lib/multi-agent-system';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    const userId = user._id.toString();

    console.log('🔍 Strategy recommendations API called for user:', userId);

    // Get strategic recommendations using the full multi-agent system
    // This ensures proper context (risks, simulation) is passed to the strategy recommender
    const analysis = await multiAgentSystem.analyzeSupplyChain(userId);
    const recommendations = analysis.recommendations;

    console.log('🔍 Raw recommendations from multi-agent system:', recommendations);
    console.log('🔍 Recommendations structure check:', {
      hasImmediate: !!recommendations?.immediate,
      hasShortTerm: !!recommendations?.shortTerm,
      hasLongTerm: !!recommendations?.longTerm,
      hasContingency: !!recommendations?.contingencyPlans,
      immediateCount: recommendations?.immediate?.length || 0,
      shortTermCount: recommendations?.shortTerm?.length || 0,
      longTermCount: recommendations?.longTerm?.length || 0,
      contingencyCount: recommendations?.contingencyPlans?.length || 0
    });

    // Sample check of the first item in each category
    if (recommendations?.immediate?.[0]) {
      console.log('🔍 Sample immediate action:', recommendations.immediate[0]);
      console.log('🔍 Action field type:', typeof recommendations.immediate[0].action);
      console.log('🔍 Action field value:', recommendations.immediate[0].action);
    }

    return NextResponse.json({
      success: true,
      data: recommendations,
      lastUpdated: new Date().toISOString(),
      message: 'Strategic recommendations generated successfully'
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
    
    console.error('Strategy recommendations error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate strategic recommendations' 
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
    const { focusArea, customStrategy } = body;

    if (customStrategy) {
      // Allow users to add custom strategies
      const customRecommendation = {
        id: `custom_${Date.now()}`,
        type: 'custom',
        category: focusArea || 'general',
        title: customStrategy.title || 'Custom Strategy',
        description: customStrategy.description || 'User-defined strategy',
        priority: customStrategy.priority || 'medium',
        timeline: customStrategy.timeline || 'short-term',
        createdAt: new Date(),
        source: 'User Input'
      };

      return NextResponse.json({
        success: true,
        data: customRecommendation,
        message: 'Custom strategy added successfully'
      });
    }

    // Generate new recommendations using the full multi-agent system
    const analysis = await multiAgentSystem.analyzeSupplyChain(userId);
    const recommendations = analysis.recommendations;

    console.log('🔍 POST: Raw recommendations from multi-agent system:', recommendations);
    console.log('🔍 POST: Recommendations structure check:', {
      hasImmediate: !!recommendations?.immediate,
      hasShortTerm: !!recommendations?.shortTerm,
      hasLongTerm: !!recommendations?.longTerm,
      hasContingency: !!recommendations?.contingencyPlans,
      immediateCount: recommendations?.immediate?.length || 0,
      shortTermCount: recommendations?.shortTerm?.length || 0,
      longTermCount: recommendations?.longTerm?.length || 0,
      contingencyCount: recommendations?.contingencyPlans?.length || 0
    });

    // Sample check of the first item in each category
    if (recommendations?.immediate?.[0]) {
      console.log('🔍 POST: Sample immediate action:', recommendations.immediate[0]);
      console.log('🔍 POST: Action field type:', typeof recommendations.immediate[0].action);
      console.log('🔍 POST: Action field value:', recommendations.immediate[0].action);
      console.log('🔍 POST: Action field length:', recommendations.immediate[0].action?.length);
    }

    // Filter by focus area if specified
    if (focusArea) {
      const filteredRecommendations = {
        immediate: recommendations.immediate.filter((r: any) => 
          r.action.toLowerCase().includes(focusArea.toLowerCase()) ||
          r.expectedImpact.toLowerCase().includes(focusArea.toLowerCase())
        ),
        shortTerm: recommendations.shortTerm.filter((r: any) => 
          r.action.toLowerCase().includes(focusArea.toLowerCase()) ||
          r.expectedImpact.toLowerCase().includes(focusArea.toLowerCase())
        ),
        longTerm: recommendations.longTerm.filter((r: any) => 
          r.action.toLowerCase().includes(focusArea.toLowerCase()) ||
          r.expectedImpact.toLowerCase().includes(focusArea.toLowerCase())
        ),
        contingencyPlans: recommendations.contingencyPlans.filter((r: any) => 
          r.scenario.toLowerCase().includes(focusArea.toLowerCase()) ||
          r.action.toLowerCase().includes(focusArea.toLowerCase())
        )
      };

      return NextResponse.json({
        success: true,
        data: filteredRecommendations,
        focusArea,
        lastUpdated: new Date().toISOString(),
        message: 'Filtered strategic recommendations generated successfully'
      });
    }

    return NextResponse.json({
      success: true,
      data: recommendations,
      lastUpdated: new Date().toISOString(),
      message: 'Strategic recommendations refreshed successfully'
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
    
    console.error('Strategy recommendations error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate strategic recommendations' 
      },
      { status: 500 }
    );
  }
}