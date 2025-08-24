import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectToDatabase } from '@/lib/mongo';
import { Shipment } from '@/models/Shipment';
import { Product } from '@/models/Product';
import { Supplier } from '@/models/Supplier';
import { Factory } from '@/models/Factory';
import { Warehouse } from '@/models/Warehouse';
import { Retailer } from '@/models/Retailer';

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

    // Fetch counts for all data types
    const [shipments, products, suppliers, factories, warehouses, retailers] = await Promise.all([
      Shipment.countDocuments({ userId }),
      Product.countDocuments({ userId }),
      Supplier.countDocuments({ userId }),
      Factory.countDocuments({ userId }),
      Warehouse.countDocuments({ userId }),
      Retailer.countDocuments({ userId })
    ]);

    // Get sample data for debugging
    const sampleShipment = await Shipment.findOne({ userId }).populate('productId', 'name');
    const sampleProduct = await Product.findOne({ userId });
    const sampleSupplier = await Supplier.findOne({ userId });

    const status = {
      userId,
      dataCounts: {
        shipments,
        products,
        suppliers,
        factories,
        warehouses,
        retailers,
        total: shipments + products + suppliers + factories + warehouses + retailers
      },
      hasData: shipments > 0 || products > 0 || suppliers > 0,
      sampleData: {
        shipment: sampleShipment ? {
          id: sampleShipment._id,
          status: sampleShipment.status,
          product: sampleShipment.productId?.name || 'No product',
          totalValue: sampleShipment.totalValue
        } : null,
        product: sampleProduct ? {
          id: sampleProduct._id,
          name: sampleProduct.name,
          category: sampleProduct.category,
          unitCost: sampleProduct.unitCost
        } : null,
        supplier: sampleSupplier ? {
          id: sampleSupplier._id,
          name: sampleSupplier.name,
          location: sampleSupplier.location,
          riskLevel: sampleSupplier.riskLevel
        } : null
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(status);

  } catch (error) {
    console.error('Error checking dashboard status:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
