import { NextRequest, NextResponse } from 'next/server';
import { 
  getSupplyChainNews, 
  getWeatherData, 
  getGlobalConditions, 
  getSupplyChainAlerts, 
  getSupplierIntelligence,
  getMarketData 
} from '@/lib/tools';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '5');

    switch (type) {
      case 'news':
        const news = await getSupplyChainNews(limit);
        return NextResponse.json({ success: true, data: news });

      case 'weather':
        const locations = searchParams.get('locations')?.split(',') || ['Shanghai', 'Los Angeles', 'Rotterdam'];
        const weather = await getWeatherData(locations);
        return NextResponse.json({ success: true, data: weather });

      case 'conditions':
        const conditions = await getGlobalConditions();
        return NextResponse.json({ success: true, data: conditions });

      case 'alerts':
        const alerts = await getSupplyChainAlerts();
        return NextResponse.json({ success: true, data: alerts });

      case 'suppliers':
        const supplierNames = searchParams.get('names')?.split(',') || ['Foxconn Technology Group', 'Samsung Electronics', 'TSMC'];
        const suppliers = await getSupplierIntelligence(supplierNames);
        return NextResponse.json({ success: true, data: suppliers });

      case 'market':
        const market = await getMarketData();
        return NextResponse.json({ success: true, data: market });

      case 'all':
        // Fetch all dynamic data in parallel
        const [news, conditions, alerts, market] = await Promise.all([
          getSupplyChainNews(3),
          getGlobalConditions(),
          getSupplyChainAlerts(),
          getMarketData()
        ]);

        return NextResponse.json({
          success: true,
          data: {
            news,
            conditions,
            alerts,
            market
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid data type specified' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching dynamic data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dynamic data' },
      { status: 500 }
    );
  }
}

