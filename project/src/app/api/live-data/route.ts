// src/app/api/live-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectToDatabase } from '@/lib/mongo';
import { Product } from '@/models/Product';
import { Supplier } from '@/models/Supplier';
import { Shipment } from '@/models/Shipment';
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

    // Convert userId to ObjectId for data collections
    let userObjectId: any;
    let userIdString: string;
    
    try {
      const { default: mongoose } = await import('mongoose');
      
      if (session.user.id) {
        userIdString = session.user.id;
        if (mongoose.Types.ObjectId.isValid(session.user.id)) {
          userObjectId = new mongoose.Types.ObjectId(session.user.id);
        } else {
          // If userId is not a valid ObjectId, create a hash-based one from email
          const crypto = await import('crypto');
          const emailHash = crypto.createHash('md5').update(session.user.email).digest('hex');
          userObjectId = new mongoose.Types.ObjectId(emailHash.substring(0, 24));
        }
      } else {
        userIdString = session.user.email;
        // Fallback to email hash
        const crypto = await import('crypto');
        const emailHash = crypto.createHash('md5').update(session.user.email).digest('hex');
        userObjectId = new mongoose.Types.ObjectId(emailHash.substring(0, 24));
      }
      
      console.log('User ID for query:', { userIdString, userObjectId: userObjectId.toString() });
    } catch (error) {
      console.error('Error creating ObjectId:', error);
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Fetch data from all collections for this user
    // Try both ObjectId and string userId to handle different storage formats
    const [products, suppliers, shipments, factories, warehouses, retailers] = await Promise.all([
      Product.find({ $or: [{ userId: userObjectId }, { userId: userIdString }] }).limit(10).lean(),
      Supplier.find({ $or: [{ userId: userObjectId }, { userId: userIdString }] }).limit(10).lean(),
      Shipment.find({ $or: [{ userId: userObjectId }, { userId: userIdString }] }).limit(10).lean(),
      Factory.find({ $or: [{ userId: userObjectId }, { userId: userIdString }] }).limit(10).lean(),
      Warehouse.find({ $or: [{ userId: userObjectId }, { userId: userIdString }] }).limit(10).lean(),
      Retailer.find({ $or: [{ userId: userObjectId }, { userId: userIdString }] }).limit(10).lean()
    ]);

    console.log('Data found:', {
      products: products.length,
      suppliers: suppliers.length,
      shipments: shipments.length,
      factories: factories.length,
      warehouses: warehouses.length,
      retailers: retailers.length
    });

    // Calculate summary statistics
    const totalProducts = await Product.countDocuments({ $or: [{ userId: userObjectId }, { userId: userIdString }] });
    const totalSuppliers = await Supplier.countDocuments({ $or: [{ userId: userObjectId }, { userId: userIdString }] });
    const totalShipments = await Shipment.countDocuments({ $or: [{ userId: userObjectId }, { userId: userIdString }] });
    const totalFactories = await Factory.countDocuments({ $or: [{ userId: userObjectId }, { userId: userIdString }] });
    const totalWarehouses = await Warehouse.countDocuments({ $or: [{ userId: userObjectId }, { userId: userIdString }] });
    const totalRetailers = await Retailer.countDocuments({ $or: [{ userId: userObjectId }, { userId: userIdString }] });

    // Calculate shipment statistics
    const onTimeShipments = await Shipment.countDocuments({ 
      $or: [{ userId: userObjectId }, { userId: userIdString }],
      status: 'On-Time' 
    });
    const delayedShipments = await Shipment.countDocuments({ 
      $or: [{ userId: userObjectId }, { userId: userIdString }],
      status: 'Delayed' 
    });
    const stuckShipments = await Shipment.countDocuments({ 
      $or: [{ userId: userObjectId }, { userId: userIdString }],
      status: 'Stuck' 
    });

    const totalValue = shipments.reduce((sum, shipment) => sum + (shipment.totalValue || 0), 0);
    const onTimePercentage = totalShipments > 0 ? (onTimeShipments / totalShipments) * 100 : 0;

    // Calculate risk score based on various factors
    let riskScore = 0;
    if (totalShipments > 0) {
      riskScore += (delayedShipments / totalShipments) * 40; // Delayed shipments contribute to risk
      riskScore += (stuckShipments / totalShipments) * 60; // Stuck shipments are high risk
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalProducts,
          totalSuppliers,
          totalShipments,
          totalFactories,
          totalWarehouses,
          totalRetailers,
          totalValue,
          onTimePercentage,
          riskScore: Math.min(100, riskScore)
        },
        recentData: {
          products: products.slice(0, 5),
          suppliers: suppliers.slice(0, 5),
          shipments: shipments.slice(0, 5),
          factories: factories.slice(0, 3),
          warehouses: warehouses.slice(0, 3),
          retailers: retailers.slice(0, 3)
        },
        status: {
          onTimeShipments,
          delayedShipments,
          stuckShipments,
          totalShipments
        }
      }
    });

  } catch (error) {
    console.error('Error fetching live data:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}