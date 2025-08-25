'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Package, 
  Truck, 
  Building2,
  Database,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';



interface LiveData {
  products: any[];
  suppliers: any[];
  shipments: any[];
  supplyChains: any[];
  factories: any[];
  warehouses: any[];
}



interface SummaryCounts {
  products: number;
  suppliers: number;
  shipments: number;
  supplyChains: number;
  factories: number;
  warehouses: number;
}

export default function DashboardOverview() {

  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [summaryCounts, setSummaryCounts] = useState<SummaryCounts | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch upload logs and live data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch live data
      const liveDataResponse = await fetch('/api/live-data', {
        credentials: 'include'
      });

      console.log('Dashboard: Fetching data...');

      if (liveDataResponse.ok) {
        const liveDataData = await liveDataResponse.json();

        console.log('Dashboard: Live data response:', liveDataData);


        
        // Fix: The API returns data in a nested structure
        if (liveDataData.success && liveDataData.data) {
          // Extract the summary data for the cards
          const summaryData = liveDataData.data.summary;
          const recentData = liveDataData.data.recentData;
          
          // Create the liveData object with the correct structure
          const formattedLiveData = {
            products: recentData?.products || [],
            suppliers: recentData?.suppliers || [],
            shipments: recentData?.shipments || [],
            supplyChains: [], // Not in current API
            factories: recentData?.factories || [],
            warehouses: recentData?.warehouses || []
          };

          // Also store the summary data for potential use
          const summaryWithCounts = {
            products: summaryData?.totalProducts || 0,
            suppliers: summaryData?.totalSuppliers || 0,
            shipments: summaryData?.totalShipments || 0,
            supplyChains: 0, // Not in current API
            factories: summaryData?.totalFactories || 0,
            warehouses: summaryData?.totalWarehouses || 0
          };

          setLiveData(formattedLiveData);
          setSummaryCounts(summaryWithCounts);
          console.log('Dashboard: Formatted live data:', formattedLiveData);
          console.log('Dashboard: Summary counts:', summaryWithCounts);
        } else {
          console.error('Dashboard: Invalid live data response structure:', liveDataData);
          setLiveData(null);
        }


      } else {
        console.error('Dashboard: API response not ok:', {
          liveDataOk: liveDataResponse.ok,
          liveDataStatus: liveDataResponse.status
        });
      }
    } catch (error) {
      console.error('Dashboard: Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };







  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">Loading dashboard data...</span>
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor your uploaded data and supply chain insights</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              const event = new CustomEvent('changeSection', {
                detail: {
                  section: 'live-data',
                  dataType: 'all'
                }
              });
              window.dispatchEvent(event);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Eye className="h-4 w-4 mr-2" />
            View All Data
          </Button>
          <Button 
            onClick={fetchDashboardData} 
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>



      {/* Live Data Summary */}
      {summaryCounts && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Current Data Overview
            </CardTitle>
            <CardDescription>
              Summary of your uploaded data across different categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <Package className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-lg font-semibold">{summaryCounts.products}</div>
                <div className="text-xs text-gray-600">Products</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <Building2 className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-lg font-semibold">{summaryCounts.suppliers}</div>
                <div className="text-xs text-gray-600">Suppliers</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <Truck className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <div className="text-lg font-semibold">{summaryCounts.shipments}</div>
                <div className="text-xs text-gray-600">Shipments</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <Database className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-lg font-semibold">{summaryCounts.supplyChains}</div>
                <div className="text-xs text-gray-600">Supply Chains</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <Building2 className="h-6 w-6 mx-auto mb-2 text-red-600" />
                <div className="text-lg font-semibold">{summaryCounts.factories}</div>
                <div className="text-xs text-gray-600">Factories</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <Database className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
                <div className="text-lg font-semibold">{summaryCounts.warehouses}</div>
                <div className="text-xs text-gray-600">Warehouses</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


    </div>
  );
}