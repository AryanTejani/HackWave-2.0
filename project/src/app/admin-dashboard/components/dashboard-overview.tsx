'use client';

import { useState, useEffect } from 'react';
import { 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  DollarSign,
  Package,
  Users,
  MapPin,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface DashboardStats {
  totalShipments: number;
  onTimeDeliveries: number;
  delayedShipments: number;
  stuckShipments: number;
  deliveredShipments: number;
  totalValue: number;
  activeProducts: number;
  totalSuppliers: number;
  riskScore: number;
  onTimePercentage: number;
}

interface RecentActivity {
  id: string;
  type: 'shipment' | 'alert' | 'product' | 'supplier';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalShipments: 0,
    onTimeDeliveries: 0,
    delayedShipments: 0,
    stuckShipments: 0,
    deliveredShipments: 0,
    totalValue: 0,
    activeProducts: 0,
    totalSuppliers: 0,
    riskScore: 0,
    onTimePercentage: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch shipments and calculate stats
        const shipmentsRes = await fetch('/api/shipments');
        if (shipmentsRes.ok) {
          const shipments = await shipmentsRes.json();
          
          const totalShipments = shipments.length;
          const onTimeDeliveries = shipments.filter((s: any) => s.status === 'On-Time').length;
          const delayedShipments = shipments.filter((s: any) => s.status === 'Delayed').length;
          const stuckShipments = shipments.filter((s: any) => s.status === 'Stuck').length;
          const deliveredShipments = shipments.filter((s: any) => s.status === 'Delivered').length;
          const totalValue = shipments.reduce((sum: number, s: any) => sum + (s.totalValue || 0), 0);
          const onTimePercentage = totalShipments > 0 ? (onTimeDeliveries / totalShipments) * 100 : 0;

          setStats({
            totalShipments,
            onTimeDeliveries,
            delayedShipments,
            stuckShipments,
            deliveredShipments,
            totalValue,
            activeProducts: 10, // Demo data
            totalSuppliers: 25, // Demo data
            riskScore: 7.2, // Demo data
            onTimePercentage
          });
        }

        // Mock recent activity
        setRecentActivity([
          {
            id: '1',
            type: 'shipment',
            title: 'New shipment created',
            description: 'Shipment #SH-2024-001 from Shanghai to Los Angeles',
            timestamp: '2 minutes ago',
            status: 'success'
          },
          {
            id: '2',
            type: 'alert',
            title: 'Risk alert detected',
            description: 'High risk alert for Panama Canal route',
            timestamp: '15 minutes ago',
            status: 'warning'
          },
          {
            id: '3',
            type: 'product',
            title: 'Product updated',
            description: 'iPhone 15 Pro Max specifications updated',
            timestamp: '1 hour ago',
            status: 'info'
          },
          {
            id: '4',
            type: 'supplier',
            title: 'Supplier performance review',
            description: 'Monthly review completed for Foxconn',
            timestamp: '2 hours ago',
            status: 'success'
          }
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'info': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'shipment': return <Truck className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'product': return <Package className="h-4 w-4" />;
      case 'supplier': return <Users className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading dashboard...</span>
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
          <p className="text-gray-600 dark:text-gray-400">Monitor your supply chain performance and key metrics</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Export Report</Button>
          <Button>Refresh Data</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Shipments</CardTitle>
            <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalShipments}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Active shipments in transit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">On-Time Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.onTimePercentage.toFixed(1)}%</div>
            <Progress value={stats.onTimePercentage} className="mt-2" />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stats.onTimeDeliveries} of {stats.totalShipments} on time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total shipment value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Risk Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.riskScore}/10</div>
            <Badge variant={stats.riskScore > 7 ? "destructive" : stats.riskScore > 4 ? "secondary" : "default"}>
              {stats.riskScore > 7 ? "High Risk" : stats.riskScore > 4 ? "Medium Risk" : "Low Risk"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Shipment Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Shipment Status Overview</CardTitle>
            <CardDescription>Current status of all shipments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.onTimeDeliveries}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">On Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.delayedShipments}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Delayed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.stuckShipments}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Stuck</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.deliveredShipments}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Delivered</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Key supply chain metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Products</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.activeProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Suppliers</span>
              <span className="font-semibold text-gray-900 dark:text-white">{stats.totalSuppliers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Delivery Time</span>
              <span className="font-semibold text-gray-900 dark:text-white">18.5 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Cost Efficiency</span>
              <span className="font-semibold text-green-600 dark:text-green-400">+12.3%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{activity.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
