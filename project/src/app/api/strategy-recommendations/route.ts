// app/api/strategy-recommendations/route.ts  
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { multiAgentSystem } from '@/lib/multi-agent-system';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    const userId = user._id.toString();

    // Get strategic recommendations based on user's actual data
    const recommendations = await multiAgentSystem.strategyRecommender.generateRecommendations(userId);

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

    // Generate new recommendations
    const recommendations = await multiAgentSystem.strategyRecommender.generateRecommendations(userId);

    // Filter by focus area if specified
    if (focusArea) {
      const filteredRecommendations = {
        immediate: recommendations.immediate.filter(r => 
          r.toLowerCase().includes(focusArea.toLowerCase())
        ),
        shortTerm: recommendations.shortTerm.filter(r => 
          r.toLowerCase().includes(focusArea.toLowerCase())
        ),
        longTerm: recommendations.longTerm.filter(r => 
          r.toLowerCase().includes(focusArea.toLowerCase())
        ),
        contingencyPlans: recommendations.contingencyPlans.filter(r => 
          r.toLowerCase().includes(focusArea.toLowerCase())
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