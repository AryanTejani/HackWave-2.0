import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import Shipment from '@/models/Shipment';
import { demoShipments } from '@/lib/demo-data/shipments';

export async function GET() {
  try {
    // Use demo data for now - you can switch to database later
    return NextResponse.json(demoShipments);
    
    // Uncomment below to use actual database
    // await connectToDatabase();
    // const shipments = await Shipment.find()
    //   .populate('productId', 'name category supplier')
    //   .sort({ createdAt: -1 });
    // return NextResponse.json(shipments);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { productId, origin, destination, expectedDelivery, trackingNumber } = body;

    if (!productId || !origin || !destination || !expectedDelivery) {
      return NextResponse.json(
        { error: 'ProductId, origin, destination, and expectedDelivery are required' },
        { status: 400 }
      );
    }

    const shipment = new Shipment({
      productId,
      origin,
      destination,
      expectedDelivery: new Date(expectedDelivery),
      trackingNumber,
    });

    await shipment.save();
    await shipment.populate('productId', 'name category supplier');

    return NextResponse.json(shipment, { status: 201 });
  } catch (error) {
    console.error('Error creating shipment:', error);
    return NextResponse.json(
      { error: 'Failed to create shipment' },
      { status: 500 }
    );
  }
}