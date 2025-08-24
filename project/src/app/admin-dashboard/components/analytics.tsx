'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  Truck,
  Package,
  Users,
  AlertTriangle,
  MapPin,
  Star,
  Clock,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { exportAnalyticsToExcel } from '@/lib/analytics-export';

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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 dark:text-green-400';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      case 'inactive': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleExport = async () => {
    if (!analyticsData) return;
    
    try {
      setExporting(true);
      const filename = `supply-chain-analytics-${timeRange}`;
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

  const { keyMetrics, shippingMethodStats, geographicStats, supplierStats, monthlyTrends, riskAnalysis, topRoutes, topSuppliers } = analyticsData;

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
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{keyMetrics.onTimeRate}%</div>
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
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{keyMetrics.avgLeadTime} days</div>
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
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{keyMetrics.costEfficiency}%</div>
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
                <CardTitle>Shipping Method Performance</CardTitle>
                <CardDescription>On-time delivery rates by shipping method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(shippingMethodStats).map(([method, stats]) => {
                    const onTimeRate = stats.total > 0 ? (stats.onTime / stats.total) * 100 : 0;
                    return (
                      <div key={method} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{method}</span>
                          <span className="text-sm text-gray-600">{onTimeRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${onTimeRate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{stats.total} shipments</span>
                        </div>
                        <div className="flex space-x-4 text-xs text-gray-500">
                          <span>On-time: {stats.onTime}</span>
                          <span>Delayed: {stats.delayed}</span>
                          <span>Stuck: {stats.stuck}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Analysis</CardTitle>
                <CardDescription>Current risk distribution across supply chain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {riskAnalysis.highRiskShipments}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">High Risk Shipments</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {riskAnalysis.mediumRiskShipments}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Medium Risk Shipments</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>High Risk Products</span>
                      <span className="font-medium">{riskAnalysis.highRiskProducts}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>High Risk Suppliers</span>
                      <span className="font-medium">{riskAnalysis.highRiskSuppliers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Low Risk Shipments</span>
                      <span className="font-medium">{riskAnalysis.lowRiskShipments}</span>
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
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Revenue and performance trends over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {monthlyTrends.map((trend, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{trend.month}</span>
                      <div className="flex space-x-4 text-sm">
                        <span className="text-green-600">{formatCurrency(trend.revenue)}</span>
                        <span className="text-blue-600">{trend.onTimeRate.toFixed(1)}% on-time</span>
                        <span className="text-gray-600">{trend.totalShipments} shipments</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((trend.revenue / Math.max(...monthlyTrends.map(t => t.revenue))) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="geography" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Routes</CardTitle>
              <CardDescription>Best performing shipping routes by on-time rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topRoutes.map((route, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{route.route}</span>
                      </div>
                      <Badge variant={route.onTimeRate >= 90 ? "default" : route.onTimeRate >= 70 ? "secondary" : "destructive"}>
                        {route.onTimeRate.toFixed(1)}% on-time
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Total Value: {formatCurrency(route.totalValue)}</span>
                      <span>Shipments: {route.totalShipments}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="suppliers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Suppliers</CardTitle>
              <CardDescription>Best performing suppliers by rating</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSuppliers.map((supplier, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{supplier.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                          <span className="text-sm font-medium">{supplier.rating}</span>
                        </div>
                        <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                          {supplier.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className={`${getRiskColor(supplier.riskLevel)}`}>
                        Risk: {supplier.riskLevel}
                      </span>
                      <span>Lead Time: {supplier.leadTime} days</span>
                      <span>Specialties: {supplier.specialties}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
