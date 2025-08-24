import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import { Shipment, IShipment } from '@/models/Shipment';

export async function GET() {
  try {
    await connectToDatabase();
    const shipments = await Shipment.find()
      .populate('productId', 'name category supplier origin')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      data: shipments,
      count: shipments.length
    });
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch shipments' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'productId',
      'origin',
      'destination',
      'expectedDelivery',
      'quantity',
      'totalValue',
      'shippingMethod',
      'carrier'
    ];
    
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required field: ${field}` 
          },
          { status: 400 }
        );
      }
    }
    
    // Validate shipping method
    const validShippingMethods = ['Air', 'Sea', 'Land', 'Express'];
    if (!validShippingMethods.includes(body.shippingMethod)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid shipping method. Must be one of: Air, Sea, Land, Express' 
        },
        { status: 400 }
      );
    }
    
    // Validate numeric fields
    const numericFields = ['quantity', 'totalValue'];
    for (const field of numericFields) {
      const value = body[field];
      if (typeof value !== 'number' || value <= 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: `${field} must be a positive number` 
          },
          { status: 400 }
        );
      }
    }
    
    // Validate expected delivery date
    const expectedDelivery = new Date(body.expectedDelivery);
    if (isNaN(expectedDelivery.getTime())) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid expected delivery date' 
        },
        { status: 400 }
      );
    }
    
    const shipment = new Shipment({
      productId: body.productId,
      origin: body.origin.trim(),
      destination: body.destination.trim(),
      expectedDelivery: expectedDelivery,
      trackingNumber: body.trackingNumber?.trim(),
      quantity: body.quantity,
      totalValue: body.totalValue,
      shippingMethod: body.shippingMethod,
      carrier: body.carrier.trim(),
      currentLocation: body.currentLocation?.trim(),
      estimatedArrival: body.estimatedArrival ? new Date(body.estimatedArrival) : undefined,
      riskFactors: body.riskFactors || []
    });

    const savedShipment = await shipment.save();
    await savedShipment.populate('productId', 'name category supplier origin');

    return NextResponse.json({
      success: true,
      message: 'Shipment created successfully',
      data: savedShipment
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating shipment:', error);
    
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
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create shipment' 
      },
      { status: 500 }
    );
  }
}