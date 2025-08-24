import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import { Shipment } from '@/models/Shipment';
import { Product } from '@/models/Product';
import { Supplier } from '@/models/Supplier';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Fetch all data in parallel
    const [shipments, products, suppliers] = await Promise.all([
      Shipment.find({
        createdAt: { $gte: startDate }
      }).populate('productId', 'name category supplier unitCost').lean(),
      Product.find({
        createdAt: { $gte: startDate }
      }).lean(),
      Supplier.find({
        createdAt: { $gte: startDate }
      }).lean()
    ]);

    // Calculate key metrics
    const totalRevenue = shipments.reduce((sum, s) => sum + (s.totalValue || 0), 0);
    const onTimeShipments = shipments.filter(s => s.status === 'On-Time').length;
    const totalShipments = shipments.length;
    const onTimeRate = totalShipments > 0 ? (onTimeShipments / totalShipments) * 100 : 0;
    
    // Calculate average lead time from products
    const avgLeadTime = products.length > 0 
      ? products.reduce((sum, p) => sum + (p.leadTime || 0), 0) / products.length 
      : 0;

    // Calculate cost efficiency (simplified metric)
    const totalCost = products.reduce((sum, p) => sum + (p.unitCost || 0), 0);
    const costEfficiency = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

    // Performance by shipping method
    const shippingMethodStats = shipments.reduce((acc, shipment) => {
      const method = shipment.shippingMethod || 'Unknown';
      if (!acc[method]) {
        acc[method] = { total: 0, onTime: 0, delayed: 0, stuck: 0 };
      }
      acc[method].total++;
      if (shipment.status === 'On-Time') acc[method].onTime++;
      else if (shipment.status === 'Delayed') acc[method].delayed++;
      else if (shipment.status === 'Stuck') acc[method].stuck++;
      return acc;
    }, {} as Record<string, { total: number; onTime: number; delayed: number; stuck: number }>);

    // Geographic performance
    const geographicStats = shipments.reduce((acc, shipment) => {
      const route = `${shipment.origin} → ${shipment.destination}`;
      if (!acc[route]) {
        acc[route] = { total: 0, onTime: 0, delayed: 0, stuck: 0, totalValue: 0 };
      }
      acc[route].total++;
      acc[route].totalValue += shipment.totalValue || 0;
      if (shipment.status === 'On-Time') acc[route].onTime++;
      else if (shipment.status === 'Delayed') acc[route].delayed++;
      else if (shipment.status === 'Stuck') acc[route].stuck++;
      return acc;
    }, {} as Record<string, { total: number; onTime: number; delayed: number; stuck: number; totalValue: number }>);

    // Supplier performance
    const supplierStats = suppliers.map(supplier => ({
      name: supplier.name,
      rating: supplier.rating,
      status: supplier.status,
      riskLevel: supplier.riskLevel,
      leadTime: supplier.leadTime,
      specialties: supplier.specialties?.length || 0
    }));

    // Monthly trends (last 12 months)
    const monthlyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthShipments = shipments.filter(s => {
        const shipmentDate = new Date(s.createdAt);
        return shipmentDate >= monthStart && shipmentDate <= monthEnd;
      });
      
      const monthRevenue = monthShipments.reduce((sum, s) => sum + (s.totalValue || 0), 0);
      const monthOnTime = monthShipments.filter(s => s.status === 'On-Time').length;
      const monthTotal = monthShipments.length;
      const monthOnTimeRate = monthTotal > 0 ? (monthOnTime / monthTotal) * 100 : 0;
      
      monthlyTrends.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        onTimeRate: monthOnTimeRate,
        totalShipments: monthTotal
      });
    }

    // Risk analysis
    const riskAnalysis = {
      highRiskShipments: shipments.filter(s => s.status === 'Stuck').length,
      mediumRiskShipments: shipments.filter(s => s.status === 'Delayed').length,
      lowRiskShipments: shipments.filter(s => s.status === 'On-Time').length,
      highRiskProducts: products.filter(p => p.riskLevel === 'high').length,
      highRiskSuppliers: suppliers.filter(s => s.riskLevel === 'high').length
    };

    // Top performing routes
    const topRoutes = Object.entries(geographicStats)
      .map(([route, stats]) => ({
        route,
        onTimeRate: stats.total > 0 ? (stats.onTime / stats.total) * 100 : 0,
        totalValue: stats.totalValue,
        totalShipments: stats.total
      }))
      .sort((a, b) => b.onTimeRate - a.onTimeRate)
      .slice(0, 5);

    // Top suppliers by rating
    const topSuppliers = supplierStats
      .filter(s => s.status === 'active')
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        keyMetrics: {
          totalRevenue,
          onTimeRate: Math.round(onTimeRate * 100) / 100,
          avgLeadTime: Math.round(avgLeadTime),
          costEfficiency: Math.round(costEfficiency * 100) / 100,
          totalShipments,
          activeProducts: products.length,
          activeSuppliers: suppliers.filter(s => s.status === 'active').length
        },
        shippingMethodStats,
        geographicStats,
        supplierStats,
        monthlyTrends,
        riskAnalysis,
        topRoutes,
        topSuppliers,
        timeRange
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
