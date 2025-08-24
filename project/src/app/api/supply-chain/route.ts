import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import { SupplyChain, ISupplyChain } from '@/models/SupplyChain';

// GET - Fetch all supply chain entries
export async function GET() {
  try {
    await connectToDatabase();
    
    const supplyChains = await SupplyChain.find({})
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean(); // Convert to plain JavaScript objects for better performance
    
    return NextResponse.json({
      success: true,
      data: supplyChains,
      count: supplyChains.length
    });
  } catch (error) {
    console.error('Error fetching supply chain data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch supply chain data' 
      },
      { status: 500 }
    );
  }
}

// POST - Create a new supply chain entry
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'productName',
      'supplier.name',
      'supplier.country', 
      'supplier.region',
      'shipment.origin',
      'shipment.destination',
      'shipment.status',
      'riskFactors.politicalRisk',
      'riskFactors.supplierReliability',
      'riskFactors.transportRisk'
    ];
    
    for (const field of requiredFields) {
      const value = field.split('.').reduce((obj, key) => obj?.[key], body);
      if (value === undefined || value === null || value === '') {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required field: ${field}` 
          },
          { status: 400 }
        );
      }
    }
    
    // Validate shipment status
    const validStatuses = ['In Transit', 'Delivered', 'Delayed'];
    if (!validStatuses.includes(body.shipment.status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid shipment status. Must be one of: In Transit, Delivered, Delayed' 
        },
        { status: 400 }
      );
    }
    
    // Validate risk factor ranges (0-100)
    const riskFactors = ['politicalRisk', 'supplierReliability', 'transportRisk'];
    for (const factor of riskFactors) {
      const value = body.riskFactors[factor];
      if (typeof value !== 'number' || value < 0 || value > 100) {
        return NextResponse.json(
          { 
            success: false, 
            error: `${factor} must be a number between 0 and 100` 
          },
          { status: 400 }
        );
      }
    }
    
    // Create new supply chain entry
    const newSupplyChain = new SupplyChain({
      productName: body.productName.trim(),
      supplier: {
        name: body.supplier.name.trim(),
        country: body.supplier.country.trim(),
        region: body.supplier.region.trim()
      },
      shipment: {
        origin: body.shipment.origin.trim(),
        destination: body.shipment.destination.trim(),
        status: body.shipment.status
      },
      riskFactors: {
        politicalRisk: body.riskFactors.politicalRisk,
        supplierReliability: body.riskFactors.supplierReliability,
        transportRisk: body.riskFactors.transportRisk
      }
    });
    
    const savedSupplyChain = await newSupplyChain.save();
    
    return NextResponse.json({
      success: true,
      message: 'Supply chain entry created successfully',
      data: savedSupplyChain
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating supply chain entry:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationErrors 
        },
        { status: 400 }
      );
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'A supply chain entry with these details already exists' 
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create supply chain entry' 
      },
      { status: 500 }
    );
  }
}
