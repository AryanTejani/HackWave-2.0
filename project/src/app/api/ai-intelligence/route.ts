import { NextResponse } from 'next/server';
import {
  getSupplyChainNews,
  getGlobalConditions,
  getMarketData,
  getSupplierIntelligence,
  getSupplyChainAlerts
} from '@/lib/tools';

export async function GET() {
  try {
    // These functions now run securely on the server
    const [
      news,
      conditions,
      marketData,
      alerts,
      supplierIntel
    ] = await Promise.all([
      getSupplyChainNews(15),
      getGlobalConditions(),
      getMarketData(),
      getSupplyChainAlerts(),
      getSupplierIntelligence(['Apple', 'Samsung', 'Intel'])
    ]);

    const dynamicData = {
      news,
      conditions,
      marketData,
      alerts,
      supplierIntel,
    };

    return NextResponse.json({ success: true, data: dynamicData });

  } catch (error) {
    console.error('Error in ai-intelligence API route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch AI intelligence data' },
      { status: 500 }
    );
  }
}