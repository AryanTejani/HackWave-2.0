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
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
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

  const mockChartData = {
    monthlyPerformance: [
      { month: 'Jan', onTime: 85, delayed: 15, total: 100 },
      { month: 'Feb', onTime: 78, delayed: 22, total: 100 },
      { month: 'Mar', onTime: 92, delayed: 8, total: 100 },
      { month: 'Apr', onTime: 88, delayed: 12, total: 100 },
      { month: 'May', onTime: 95, delayed: 5, total: 100 },
      { month: 'Jun', onTime: 91, delayed: 9, total: 100 },
    ],
    revenueTrends: [
      { month: 'Jan', revenue: 125000, shipments: 45, costs: 85000 },
      { month: 'Feb', revenue: 138000, shipments: 52, costs: 92000 },
      { month: 'Mar', revenue: 142000, shipments: 48, costs: 88000 },
      { month: 'Apr', revenue: 156000, shipments: 55, costs: 95000 },
      { month: 'May', revenue: 168000, shipments: 58, costs: 102000 },
      { month: 'Jun', revenue: 175000, shipments: 62, costs: 108000 },
    ],
    shippingMethods: [
      { method: 'Air Freight', onTime: 75, delayed: 20, stuck: 5, value: 45 },
      { method: 'Sea Freight', onTime: 60, delayed: 30, stuck: 10, value: 30 },
      { method: 'Land Transport', onTime: 85, delayed: 12, stuck: 3, value: 25 },
    ],
    geographicPerformance: [
      { region: 'Asia Pacific', onTime: 82, delayed: 15, stuck: 3, value: 40 },
      { region: 'Europe', onTime: 88, delayed: 10, stuck: 2, value: 35 },
      { region: 'North America', onTime: 91, delayed: 7, stuck: 2, value: 25 },
      { region: 'Latin America', onTime: 78, delayed: 18, stuck: 4, value: 20 },
      { region: 'Africa', onTime: 75, delayed: 20, stuck: 5, value: 15 },
    ],
    supplierPerformance: [
      { name: 'Supplier A', rating: 4.8, onTime: 92, leadTime: 12, risk: 'Low' },
      { name: 'Supplier B', rating: 4.5, onTime: 88, leadTime: 15, risk: 'Medium' },
      { name: 'Supplier C', rating: 4.9, onTime: 95, leadTime: 10, risk: 'Low' },
      { name: 'Supplier D', rating: 4.2, onTime: 82, leadTime: 18, risk: 'High' },
      { name: 'Supplier E', rating: 4.7, onTime: 90, leadTime: 14, risk: 'Medium' },
    ],
    riskDistribution: [
      { category: 'Geopolitical', value: 35, color: '#ef4444' },
      { category: 'Weather', value: 25, color: '#f97316' },
      { category: 'Regulatory', value: 20, color: '#eab308' },
      { category: 'Operational', value: 15, color: '#10b981' },
      { category: 'Financial', value: 5, color: '#3b82f6' },
    ]
  };
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
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockChartData.monthlyPerformance}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" className="text-sm text-gray-600" />
                      <YAxis className="text-sm text-gray-600" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="onTime" 
                        stackId="1" 
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.8}
                        name="On Time"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="delayed" 
                        stackId="1" 
                        stroke="#ef4444" 
                        fill="#ef4444" 
                        fillOpacity={0.8}
                        name="Delayed"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Method Performance</CardTitle>
                <CardDescription>On-time rates by shipping method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockChartData.shippingMethods} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" className="text-sm text-gray-600" />
                      <YAxis dataKey="method" type="category" className="text-sm text-gray-600" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="onTime" fill="#10b981" name="On Time" />
                      <Bar dataKey="delayed" fill="#f97316" name="Delayed" />
                      <Bar dataKey="stuck" fill="#ef4444" name="Stuck" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue and shipment trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockChartData.revenueTrends}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" className="text-sm text-gray-600" />
                      <YAxis className="text-sm text-gray-600" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value, name) => [
                          name === 'revenue' ? `$${value.toLocaleString()}` : value,
                          name === 'revenue' ? 'Revenue' : name === 'shipments' ? 'Shipments' : 'Costs'
                        ]}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        name="Revenue"
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="shipments" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Shipments"
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>Supply chain risk categories breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockChartData.riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {mockChartData.riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value, name) => [`${value}%`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {mockChartData.riskDistribution.map((risk, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: risk.color }}
                        />
                        <span className="text-gray-700 dark:text-gray-300">{risk.category}</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{risk.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="geography" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Regional Performance</CardTitle>
                <CardDescription>On-time rates by geographic region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockChartData.geographicPerformance} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" className="text-sm text-gray-600" />
                      <YAxis dataKey="region" type="category" className="text-sm text-gray-600" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="onTime" fill="#10b981" name="On Time" />
                      <Bar dataKey="delayed" fill="#f97316" name="Delayed" />
                      <Bar dataKey="stuck" fill="#ef4444" name="Stuck" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Value Distribution</CardTitle>
                <CardDescription>Shipment value by region (percentage)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockChartData.geographicPerformance}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="region"
                      >
                        {mockChartData.geographicPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f97316', '#ef4444', '#8b5cf6'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value, name) => [`${value}%`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
                <TabsContent value="suppliers" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Supplier Performance Overview</CardTitle>
                <CardDescription>Key metrics and performance indicators</CardDescription>
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
                  
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockChartData.supplierPerformance} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis type="number" className="text-sm text-gray-600" />
                        <YAxis dataKey="name" type="category" className="text-sm text-gray-600" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="rating" fill="#3b82f6" name="Rating" />
                        <Bar dataKey="onTime" fill="#10b981" name="On-Time %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supplier Risk & Lead Time Analysis</CardTitle>
                <CardDescription>Risk levels and lead time performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={mockChartData.supplierPerformance}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="On-Time Rate"
                        dataKey="onTime"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                      />
                      <Radar
                        name="Lead Time (days)"
                        dataKey="leadTime"
                        stroke="#f97316"
                        fill="#f97316"
                        fillOpacity={0.3}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
