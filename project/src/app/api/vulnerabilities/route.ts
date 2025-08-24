// app/api/vulnerabilities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { vulnerabilityScoring } from '@/lib/vulnerability-scoring';
import { connectToDatabase } from '@/lib/mongo';
import { Shipment } from '@/models/Shipment';
import { Product } from '@/models/Product';
import { Supplier } from '@/models/Supplier';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    const userId = user._id.toString();

    console.log('Vulnerabilities API: Getting vulnerability analysis for user:', userId);

    await connectToDatabase();

    // Get all supply chain data
    const shipments = await Shipment.find({}).populate('productId');
    const products = await Product.find({});
    const suppliers = await Supplier.find({});

    // Run network vulnerability analysis
    const networkAnalysis = await vulnerabilityScoring.analyzeNetworkVulnerabilities({
      shipments,
      products,
      suppliers
    });

    // Calculate vulnerability scores for top nodes
    const vulnerabilities: any[] = [];

    // Top shipments
    for (const shipment of shipments.slice(0, 5)) {
      const score = await vulnerabilityScoring.calculateVulnerabilityScore(
        shipment._id.toString(),
        'shipment',
        `Shipment ${shipment.trackingNumber || shipment._id}`,
        shipment,
        { shipments, products, suppliers }
      );
      vulnerabilities.push(score);
    }

    // Top products
    for (const product of products.slice(0, 5)) {
      const score = await vulnerabilityScoring.calculateVulnerabilityScore(
        product._id.toString(),
        'product',
        product.name,
        product,
        { shipments, products, suppliers }
      );
      vulnerabilities.push(score);
    }

    // Top suppliers
    for (const supplier of suppliers.slice(0, 5)) {
      const score = await vulnerabilityScoring.calculateVulnerabilityScore(
        supplier._id.toString(),
        'supplier',
        supplier.name,
        supplier,
        { shipments, products, suppliers }
      );
      vulnerabilities.push(score);
    }

    return NextResponse.json({
      success: true,
      data: {
        vulnerabilities,
        networkAnalysis,
        summary: {
          totalVulnerabilities: vulnerabilities.length,
          averageRiskScore: vulnerabilities.length > 0 
            ? vulnerabilities.reduce((sum, v) => sum + v.riskScore, 0) / vulnerabilities.length 
            : 0,
          criticalVulnerabilities: vulnerabilities.filter(v => v.riskLevel === 'critical').length,
          chokepoints: networkAnalysis.chokepoints.length,
          singleSourceRisks: networkAnalysis.singleSourceRisks.length
        }
      },
      message: 'Vulnerability analysis completed successfully'
    });

  } catch (error) {
    console.error('Vulnerabilities API Error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze vulnerabilities',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
