
// app/api/alerts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import { Shipment } from '@/models/Shipment';
import { generateAlerts, calculateAlertSummary } from '@/lib/alert-utils';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch shipments with populated product data
    const shipments = await Shipment.find({
      status: { $in: ['Delayed', 'Stuck', 'On-Time'] }
    })
    .populate('productId', 'name category supplier origin riskLevel leadTime unitCost')
    .sort({ expectedDelivery: 1 })
    .lean();

    const alerts = generateAlerts(shipments as any);
    const summary = calculateAlertSummary(alerts);

    return NextResponse.json({
      alerts,
      summary
    });
  } catch (error) {
    console.error('Error generating alerts:', error);
    return NextResponse.json(
      { error: 'Failed to generate alerts' },
      { status: 500 }
    );
  }
}