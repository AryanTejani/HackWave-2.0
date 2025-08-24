import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import { Shipment, IShipment } from '@/models/Shipment';
import { requireAuth, getUserId } from '@/lib/auth-utils';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    const userId = user._id.toString();

    await connectToDatabase();
    
    // Filter shipments by user ID
    const shipments = await Shipment.find({ userId })
      .populate('productId', 'name category supplier origin')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      data: shipments,
      count: shipments.length
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
    const requiredFields = ['productId', 'origin', 'destination', 'status', 'expectedDelivery', 'quantity', 'totalValue', 'shippingMethod', 'carrier'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(body.productId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    // Validate status is one of the allowed values
    const allowedStatuses = ['On-Time', 'Delayed', 'Stuck', 'Delivered'];
    if (!allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate shipping method is one of the allowed values
    const allowedShippingMethods = ['Air', 'Sea', 'Land', 'Express'];
    if (!allowedShippingMethods.includes(body.shippingMethod)) {
      return NextResponse.json(
        { success: false, error: `Invalid shipping method. Must be one of: ${allowedShippingMethods.join(', ')}` },
        { status: 400 }
      );
    }

    // Create shipment with user ID
    const shipment = new Shipment({
      ...body,
      userId: new mongoose.Types.ObjectId(userId),
      productId: new mongoose.Types.ObjectId(body.productId),
      trackingNumber: body.trackingNumber?.trim() || '',
      origin: body.origin.trim(),
      destination: body.destination.trim(),
      status: body.status,
      expectedDelivery: new Date(body.expectedDelivery),
      quantity: body.quantity,
      totalValue: body.totalValue,
      shippingMethod: body.shippingMethod,
      carrier: body.carrier.trim(),
      currentLocation: body.currentLocation || '',
      estimatedArrival: body.estimatedArrival ? new Date(body.estimatedArrival) : undefined,
      riskFactors: body.riskFactors || []
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