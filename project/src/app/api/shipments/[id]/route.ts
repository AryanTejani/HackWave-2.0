// app/api/shipments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import Shipment from '@/models/Shipment';
import mongoose from 'mongoose';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid shipment ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updateData = { ...body };

    // If status is being updated to 'Delivered', set actualDelivery
    if (updateData.status === 'Delivered' && !updateData.actualDelivery) {
      updateData.actualDelivery = new Date();
    }

    const shipment = await Shipment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('productId', 'name category supplier');

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(shipment);
  } catch (error) {
    console.error('Error updating shipment:', error);
    return NextResponse.json(
      { error: 'Failed to update shipment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid shipment ID' },
        { status: 400 }
      );
    }

    const shipment = await Shipment.findByIdAndDelete(id);

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Shipment deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting shipment:', error);
    return NextResponse.json(
      { error: 'Failed to delete shipment' },
      { status: 500 }
    );
  }
}