
// app/api/alerts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import Shipment from '@/models/Shipment';
import { Alert } from '@/lib/types';
import { demoShipments } from '@/lib/demo-data/shipments';

// Risk detection & mitigation engine
function generateAlerts(shipments: any[]): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();

  shipments.forEach((shipment) => {
    if (shipment.status === 'Delivered') return;

    const daysDiff = Math.ceil((now.getTime() - new Date(shipment.expectedDelivery).getTime()) / (1000 * 60 * 60 * 24));
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    let suggestions: string[] = [];

    if (shipment.status === 'Delayed') {
      if (daysDiff > 7) {
        riskLevel = 'High';
        suggestions = [
          'Consider alternate supplier for future orders',
          'Expedite shipping method',
          'Communicate with customer about delay',
          'Investigate supply chain bottlenecks'
        ];
      } else if (daysDiff > 3) {
        riskLevel = 'Medium';
        suggestions = [
          'Monitor closely for further delays',
          'Contact shipping provider for updates',
          'Prepare customer communication'
        ];
      } else {
        suggestions = [
          'Continue monitoring',
          'Check with logistics provider'
        ];
      }
    }

    if (shipment.status === 'Stuck') {
      riskLevel = 'High';
      suggestions = [
        'Check customs clearance documentation',
        'Contact customs broker',
        'Review import/export compliance',
        'Consider alternate routing for future shipments',
        'Escalate to logistics manager'
      ];
    }

    if (shipment.status === 'Delayed' || shipment.status === 'Stuck') {
      alerts.push({
        shipmentId: shipment._id.toString(),
        productName: shipment.productId?.name || 'Unknown Product',
        status: shipment.status,
        origin: shipment.origin,
        destination: shipment.destination,
        expectedDelivery: shipment.expectedDelivery,
        riskLevel,
        suggestions,
      });
    }
  });

  // Sort by risk level (High -> Medium -> Low)
  return alerts.sort((a, b) => {
    const riskOrder = { High: 3, Medium: 2, Low: 1 };
    return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
  });
}

export async function GET() {
  try {
    // Use demo data for now - you can switch to database later
    const alerts = generateAlerts(demoShipments);

    return NextResponse.json({
      alerts,
      summary: {
        total: alerts.length,
        high: alerts.filter(a => a.riskLevel === 'High').length,
        medium: alerts.filter(a => a.riskLevel === 'Medium').length,
        low: alerts.filter(a => a.riskLevel === 'Low').length,
      }
    });
    
    // Uncomment below to use actual database
    // await connectToDatabase();
    // const shipments = await Shipment.find({
    //   status: { $in: ['Delayed', 'Stuck', 'On-Time'] }
    // })
    // .populate('productId', 'name category supplier')
    // .sort({ expectedDelivery: 1 });
    // const alerts = generateAlerts(shipments);
    // return NextResponse.json({
    //   alerts,
    //   summary: {
    //     total: alerts.length,
    //     high: alerts.filter(a => a.riskLevel === 'High').length,
    //     medium: alerts.filter(a => a.riskLevel === 'Medium').length,
    //     low: alerts.filter(a => a.riskLevel === 'Low').length,
    //   }
    // });
  } catch (error) {
    console.error('Error generating alerts:', error);
    return NextResponse.json(
      { error: 'Failed to generate alerts' },
      { status: 500 }
    );
  }
}