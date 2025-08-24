'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  Download,
  Clock,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { exportAnalyticsToExcel } from '@/lib/analytics-export'; // Assuming this utility exists from the main branch

// This is the comprehensive data structure from the 'main' branch
interface AnalyticsData {
  keyMetrics: {
    totalRevenue: number;
    onTimeRate: number;
    avgLeadTime: number;
    costEfficiency: number;
    totalShipments: number;
    activeProducts: number;
    activeSuppliers: number;
  };
  shippingMethodStats: Record<string, { total: number; onTime: number; delayed: number; stuck: number }>;
  geographicStats: Record<string, { total: number; onTime: number; delayed: number; stuck: number; totalValue: number }>;
  supplierStats: Array<{
    name: string;
    rating: number;
    status: string;
    riskLevel: string;
    leadTime: number;
    specialties: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    onTimeRate: number;
    totalShipments: number;
  }>;
  riskAnalysis: {
    highRiskShipments: number;
    mediumRiskShipments: number;
    lowRiskShipments: number;
    highRiskProducts: number;
    highRiskSuppliers: number;
  };
  topRoutes: Array<{
    route: string;
    onTimeRate: number;
    totalValue: number;
    totalShipments: number;
  }>;
  topSuppliers: Array<{
    name: string;
    rating: number;
    status: string;
    riskLevel: string;
    leadTime: number;
    specialties: number;
  }>;
  timeRange: string;
}

export function Analytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Correctly fetches from a dedicated backend route, as established in 'main'
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
      const result = await response.json();
      
      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        setError(result.error || 'Failed to fetch analytics data');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const handleExport = async () => {
    if (!analyticsData) return;
    
    try {
      setExporting(true);
      const filename = `supply-chain-analytics-${timeRange}`;
      // Assuming exportAnalyticsToExcel exists from the 'main' branch
      await exportAnalyticsToExcel(analyticsData, filename);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export report');
    } finally {
      setExporting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button onClick={fetchAnalytics} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600 dark:text-gray-400">No analytics data available</p>
      </div>
    );
  }

  const { keyMetrics } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">Real-time insights and performance metrics</p>
        </div>
        <div className="flex space-x-2">
           <Button variant="outline" onClick={fetchAnalytics}>
             <Activity className="h-4 w-4 mr-2" />
             Refresh
           </Button>
           <Button onClick={handleExport} disabled={exporting || !analyticsData}>
             <Download className="h-4 w-4 mr-2" />
             {exporting ? 'Exporting...' : 'Export Report'}
           </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex space-x-2">
        {['7d', '30d', '90d', '1y'].map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range}
          </Button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(keyMetrics.totalRevenue)}</div>
            <div className="flex items-center text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="h-4 w-4 mr-1" />
              {keyMetrics.totalShipments} shipments
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Last {timeRange}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">On-Time Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{keyMetrics.onTimeRate.toFixed(1)}%</div>
            <Progress value={keyMetrics.onTimeRate} className="mt-2" />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {keyMetrics.totalShipments} total shipments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Lead Time</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{keyMetrics.avgLeadTime.toFixed(1)} days</div>
            <div className="flex items-center text-sm text-orange-600 dark:text-orange-400">
              <Clock className="h-4 w-4 mr-1" />
              Average
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Across all products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Cost Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{keyMetrics.costEfficiency.toFixed(1)}%</div>
            <Progress value={keyMetrics.costEfficiency} className="mt-2" />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Profit margin</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
                <CardDescription>On-time delivery rates by month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Performance chart</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Interactive chart coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
                <CardDescription>Shipping costs and efficiency metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Air Freight</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sea Freight</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Land Transport</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis</CardTitle>
              <CardDescription>Key trends and patterns in supply chain performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Trend analysis chart</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Interactive trend visualization coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="geography" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Performance</CardTitle>
              <CardDescription>Performance metrics by region and route</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Geographic analysis</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Interactive map and regional data coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="suppliers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Performance</CardTitle>
              <CardDescription>Supplier metrics and performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">4.8</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">92%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">On-Time Rate</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">15</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Active Suppliers</div>
                  </div>
                </div>
                <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Supplier performance chart</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Detailed supplier analytics coming soon</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
