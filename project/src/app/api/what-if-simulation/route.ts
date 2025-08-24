// app/api/what-if-simulation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { multiAgentSystem } from '@/lib/multi-agent-system';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    const userId = user._id.toString();

    const body = await request.json();
    const { scenario } = body;

    if (!scenario) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Scenario is required' 
        },
        { status: 400 }
      );
    }

    // Validate scenario
    const validScenarios = [
      'port congestion',
      'weather disruption', 
      'supplier issue',
      'customs delay',
      'transportation strike',
      'natural disaster',
      'political unrest',
      'economic sanctions'
    ];

    if (!validScenarios.includes(scenario.toLowerCase())) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid scenario. Use one of: ${validScenarios.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Run what-if simulation using real user data
    const simulation = await multiAgentSystem.runWhatIfSimulation(userId, scenario);

    return NextResponse.json({
      success: true,
      data: simulation,
      message: 'What-if simulation completed successfully'
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
    
    console.error('What-if simulation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to complete what-if simulation' 
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

    // Return available scenarios
    return NextResponse.json({
      success: true,
      data: {
        availableScenarios: [
          'port congestion',
          'weather disruption', 
          'supplier issue',
          'customs delay',
          'transportation strike',
          'natural disaster',
          'political unrest',
          'economic sanctions'
        ],
        description: 'Run what-if simulations based on your actual supply chain data'
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
    
    console.error('What-if simulation status error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get simulation scenarios' 
      },
      { status: 500 }
    );
  }
}