
// app/api/impact-simulation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { multiAgentSystem } from '@/lib/multi-agent-system';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    const userId = user._id.toString();

    const body = await request.json();
    const { scenario, customParameters } = body;

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

    // Run impact simulation using real user data
    const simulation = await multiAgentSystem.impactSimulator.simulateImpact(userId, scenario);

    // Apply custom parameters if provided
    if (customParameters) {
      if (customParameters.delayMultiplier) {
        simulation.disruptionImpact.delayDays = Math.round(
          simulation.disruptionImpact.delayDays * customParameters.delayMultiplier
        );
      }
      if (customParameters.costMultiplier) {
        simulation.disruptionImpact.additionalCost = Math.round(
          simulation.disruptionImpact.additionalCost * customParameters.costMultiplier
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: simulation,
      message: 'Impact simulation completed successfully'
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
    
    console.error('Impact simulation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to complete impact simulation' 
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

    // Return available scenarios and simulation capabilities
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
        customParameters: {
          delayMultiplier: 'Multiply delay days by custom factor',
          costMultiplier: 'Multiply additional costs by custom factor'
        },
        description: 'Run impact simulations based on your actual supply chain data'
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
    
    console.error('Impact simulation status error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get simulation capabilities' 
      },
      { status: 500 }
    );
  }
}