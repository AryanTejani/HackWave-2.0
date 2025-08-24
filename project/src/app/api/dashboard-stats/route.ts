import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectToDatabase } from '@/lib/mongo';
import { Shipment } from '@/models/Shipment';
import { Product } from '@/models/Product';
import { Supplier } from '@/models/Supplier';
import { generateAlerts } from '@/lib/alert-utils';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    const userId = session.user.id || session.user.email;

    // Fetch all data in parallel for better performance
    const [shipments, products, suppliers] = await Promise.all([
      Shipment.find({ userId }).populate('productId', 'name supplier'),
      Product.find({ userId }),
      Supplier.find({ userId })
    ]);

    // Generate alerts from shipment data
    const alerts = generateAlerts(shipments as any);

    // Calculate metrics with flexible status matching
    const totalShipments = shipments.length;
    const onTimeDeliveries = shipments.filter(s => 
      s.status === 'delivered' || s.status === 'Delivered' || s.status === 'On-Time'
    ).length;
    const delayedShipments = shipments.filter(s => 
      s.status === 'delayed' || s.status === 'Delayed'
    ).length;
    const inTransitShipments = shipments.filter(s => 
      s.status === 'in-transit' || s.status === 'In Transit' || s.status === 'Stuck'
    ).length;
    
    const totalValue = shipments.reduce((sum, s) => sum + (s.totalValue || 0), 0);
    const averageDeliveryTime = shipments.length > 0 
      ? shipments.reduce((sum, s) => {
          // Handle different field names for delivery dates
          const expectedDate = s.expectedDelivery || s.estimatedDelivery;
          const actualDate = s.actualDelivery;
          
          if (expectedDate && actualDate) {
            const expected = new Date(expectedDate);
            const actual = new Date(actualDate);
            return sum + Math.abs(actual.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24);
          } else if (expectedDate) {
            // If no actual delivery, use current date vs expected
            const expected = new Date(expectedDate);
            const now = new Date();
            return sum + Math.abs(now.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24);
          }
          return sum;
        }, 0) / shipments.length
      : 0;

    const highRiskSuppliers = suppliers.filter((s: any) => s.riskLevel === 'high').length;
    const totalProducts = products.length;
    const activeAlerts = alerts.filter((a: any) => a.riskLevel === 'High').length;

    // Calculate risk score (0-100)
    const riskFactors = [
      totalShipments > 0 ? (delayedShipments / totalShipments) * 30 : 0, // 30% weight for delays
      suppliers.length > 0 ? (highRiskSuppliers / suppliers.length) * 25 : 0, // 25% weight for high-risk suppliers
      activeAlerts * 5, // 5 points per active alert
      totalShipments > 0 ? ((totalShipments - onTimeDeliveries) / totalShipments) * 20 : 0 // 20% weight for non-on-time deliveries
    ];
    const riskScore = Math.min(100, Math.max(0, riskFactors.reduce((sum, factor) => sum + factor, 0)));

    // Calculate efficiency metrics
    const onTimeDeliveryRate = totalShipments > 0 ? (onTimeDeliveries / totalShipments) * 100 : 0;
    const averageOrderValue = totalShipments > 0 ? totalValue / totalShipments : 0;

    const stats = {
      totalShipments,
      onTimeDeliveries,
      delayedShipments,
      inTransitShipments,
      totalValue: Math.round(totalValue),
      averageDeliveryTime: Math.round(averageDeliveryTime * 10) / 10,
      highRiskSuppliers,
      totalProducts,
      activeAlerts,
      riskScore: Math.round(riskScore),
      onTimeDeliveryRate: Math.round(onTimeDeliveryRate * 10) / 10,
      averageOrderValue: Math.round(averageOrderValue),
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
