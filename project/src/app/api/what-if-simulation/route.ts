// app/api/what-if-simulation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { multiAgentSystem } from '@/lib/multi-agent-system';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { scenario } = body;

    if (!scenario || typeof scenario !== 'string') {
      return NextResponse.json(
        { error: 'Scenario is required and must be a string' },
        { status: 400 }
      );
    }

    const userId = session.user.id || session.user.email;

    console.log(`Running What-If simulation for user ${userId} with scenario: ${scenario}`);

    // Run the simulation using the multi-agent system
    const simulationResult = await multiAgentSystem.runWhatIfSimulation(userId, scenario);

    console.log('What-If simulation completed successfully');

    return NextResponse.json({
      success: true,
      simulation: simulationResult,
      message: 'What-If simulation completed successfully'
    });

  } catch (error) {
    console.error('Error in What-If simulation:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
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