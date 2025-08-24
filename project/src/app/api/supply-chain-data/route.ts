// app/api/supply-chain-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  getSupplyChainNews, 
  getGlobalConditions, 
  getMarketData 
} from '@/lib/tools';

export async function GET(request: NextRequest) {
  try {
    // Fetch all the data on the server side
    const [news, conditions, market] = await Promise.all([
      getSupplyChainNews(5),
      getGlobalConditions(),
      getMarketData()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        news,
        conditions,
        market
      }
    });
  } catch (error) {
    console.error('Error fetching supply chain data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch supply chain data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
