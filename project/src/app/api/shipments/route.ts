import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import { Shipment, IShipment } from '@/models/Shipment';
import { requireAuth, getUserId } from '@/lib/auth-utils';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    console.log('Shipments API: GET request received');
    
    // Get authenticated user (but don't filter by user ID for now)
    const user = await requireAuth(request);
    console.log('Shipments API: User authenticated:', user.email);
    
    await connectToDatabase();
    
    // Get all shipments regardless of user (for demo purposes)
    const allShipments = await Shipment.find({})
      .populate('productId', 'name category supplier origin')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log('Shipments API: Found', allShipments.length, 'total shipments');
    
    // Debug: Log first few shipments if any exist
    if (allShipments.length > 0) {
      console.log('Shipments API: Sample shipment:', {
        id: allShipments[0]._id,
        productId: allShipments[0].productId,
        origin: allShipments[0].origin,
        destination: allShipments[0].destination,
        status: allShipments[0].status,
        userId: allShipments[0].userId
      });
    } else {
      console.log('Shipments API: No shipments found in database');
    }
    
    return NextResponse.json({
      success: true,
      data: allShipments,
      count: allShipments.length,
      message: 'Showing all shipments (demo mode)'
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
    // Require authentication
    const user = await requireAuth(request);
    const userId = user._id.toString();

    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'productId', 
      'origin', 
      'destination', 
      'status',
      'expectedDelivery',
      'quantity',
      'totalValue',
      'shippingMethod',
      'carrier'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate numeric fields
    if (body.quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be at least 1' },
        { status: 400 }
      );
    }

    if (body.totalValue <= 0) {
      return NextResponse.json(
        { success: false, error: 'Total value must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate shipping method
    const validShippingMethods = ['Air', 'Sea', 'Land', 'Express'];
    if (!validShippingMethods.includes(body.shippingMethod)) {
      return NextResponse.json(
        { success: false, error: 'Invalid shipping method' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['On-Time', 'Delayed', 'Stuck', 'Delivered'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Validate expected delivery date
    const expectedDelivery = new Date(body.expectedDelivery);
    if (isNaN(expectedDelivery.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid expected delivery date' },
        { status: 400 }
      );
    }

    // Create shipment with user ID
    const shipment = new Shipment({
      productId: new mongoose.Types.ObjectId(body.productId),
      origin: body.origin.trim(),
      destination: body.destination.trim(),
      status: body.status,
      expectedDelivery: expectedDelivery,
      trackingNumber: body.trackingNumber?.trim(),
      quantity: body.quantity,
      totalValue: body.totalValue,
      shippingMethod: body.shippingMethod,
      carrier: body.carrier.trim(),
      currentLocation: body.currentLocation?.trim(),
      riskFactors: body.riskFactors || [],
      userId: new mongoose.Types.ObjectId(userId)
    });

    await shipment.save();
    
    return NextResponse.json({
      success: true,
      data: shipment,
      message: 'Shipment created successfully'
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    console.error('Error creating shipment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create shipment' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a shipment
export async function DELETE(request: NextRequest) {
  try {
    console.log('Shipments API: DELETE request received');
    
    // Get authenticated user
    const user = await requireAuth(request);
    console.log('Shipments API: User authenticated for DELETE:', user.email);
    
    await connectToDatabase();
    
    // Get shipment ID from URL params
    const url = new URL(request.url);
    const shipmentId = url.searchParams.get('id');
    
    if (!shipmentId) {
      return NextResponse.json(
        { success: false, error: 'Shipment ID is required' },
        { status: 400 }
      );
    }
    
    console.log('Shipments API: Deleting shipment with ID:', shipmentId);
    
    // Find and delete the shipment
    const deletedShipment = await Shipment.findByIdAndDelete(shipmentId);
    
    if (!deletedShipment) {
      return NextResponse.json(
        { success: false, error: 'Shipment not found' },
        { status: 404 }
      );
    }
    
    console.log('Shipments API: Shipment deleted successfully:', deletedShipment._id);
    
    return NextResponse.json({
      success: true,
      message: 'Shipment deleted successfully',
      deletedShipment: {
        id: deletedShipment._id,
        trackingNumber: deletedShipment.trackingNumber
      }
    });
    
  } catch (error) {
    console.error('Shipments API: Error in DELETE request:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}