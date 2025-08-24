// app/api/simulations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { impactSimulator } from '@/lib/impact-simulator';
import { connectToDatabase } from '@/lib/mongo';
import { Shipment } from '@/models/Shipment';
import { Product } from '@/models/Product';
import { Supplier } from '@/models/Supplier';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    const userId = user._id.toString();

    console.log('Simulations API: Getting available scenarios for user:', userId);

    // Get available scenarios
    const scenarios = impactSimulator.getAvailableScenarios();

    return NextResponse.json({
      success: true,
      data: {
        scenarios,
        totalScenarios: scenarios.length
      },
      message: 'Available scenarios retrieved successfully'
    });

  } catch (error) {
    console.error('Simulations API Error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve scenarios',
        details: error instanceof Error ? error.message : 'Unknown error'
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
    const { scenarioId, customScenario } = body;

    console.log('Simulations API: Running simulation for user:', userId);

    await connectToDatabase();

    // Get all supply chain data
    const shipments = await Shipment.find({}).populate('productId');
    const products = await Product.find({});
    const suppliers = await Supplier.find({});

    let simulationResult;

    if (customScenario) {
      // Run custom scenario
      simulationResult = await impactSimulator.runWhatIfAnalysis(customScenario, {
        shipments,
        products,
        suppliers
      });
    } else if (scenarioId) {
      // Run predefined scenario
      simulationResult = await impactSimulator.simulateDisruption(scenarioId, {
        shipments,
        products,
        suppliers
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Either scenarioId or customScenario is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: simulationResult,
      message: 'Simulation completed successfully'
    });

  } catch (error) {
    console.error('Simulations API Error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to run simulation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
