'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Truck, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  DollarSign,
  RefreshCw,
  Database,
  Activity
} from 'lucide-react';

interface DashboardStats {
  totalShipments: number;
  onTimeDeliveries: number;
  delayedShipments: number;
  inTransitShipments: number;
  totalValue: number;
  averageDeliveryTime: number;
  riskScore: number;
  totalProducts: number;
  highRiskSuppliers: number;
  activeAlerts: number;
  onTimeDeliveryRate: number;
  averageOrderValue: number;
  lastUpdated: string;
}

interface DataStatus {
  hasData: boolean;
  products: number;
  suppliers: number;
  shipments: number;
  supplyChains: number;
}

export function DashboardOverview() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalShipments: 0,
    onTimeDeliveries: 0,
    delayedShipments: 0,
    inTransitShipments: 0,
    totalValue: 0,
    averageDeliveryTime: 0,
    riskScore: 0,
    totalProducts: 0,
    highRiskSuppliers: 0,
    activeAlerts: 0,
    onTimeDeliveryRate: 0,
    averageOrderValue: 0,
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [dataStatus, setDataStatus] = useState<DataStatus | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const checkDataStatus = async () => {
    try {
      const response = await fetch('/api/seed', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        setDataStatus(result.data);
        return result.data.hasData;
      }
      return false;
    } catch (error) {
      console.error('Error checking data status:', error);
      return false;
    }
  };

  const checkDashboardStatus = async () => {
    try {
      const response = await fetch('/api/dashboard-status', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        setDebugInfo(result);
        console.log('Dashboard Status:', result);
      }
    } catch (error) {
      console.error('Error checking dashboard status:', error);
    }
  };



  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from the new unified dashboard stats API
      const response = await fetch('/api/dashboard-stats', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const dashboardStats = await response.json();
      
      setStats(dashboardStats);
      setLastUpdated(new Date(dashboardStats.lastUpdated));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      // First check if we have data
      const hasData = await checkDataStatus();
      
      if (hasData) {
        // Data exists, fetch dashboard stats
        await fetchDashboardData();
      } else {
        // No data exists, just set loading to false to show empty state
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  const getRiskLevel = (score: number) => {
    if (score <= 30) return { level: 'Low', color: 'bg-green-100 text-green-800' };
    if (score <= 70) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'High', color: 'bg-red-100 text-red-800' };
  };

  const riskLevel = getRiskLevel(stats.riskScore);



  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Show empty state when no data
  if (!dataStatus?.hasData) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {session?.user?.name}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={fetchDashboardData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={checkDashboardStatus} variant="ghost" size="sm">
              🔍 Debug
            </Button>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Data Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upload your supply chain data to get started with real-time insights.
            </p>
            <Button asChild>
              <a href="/admin-dashboard/data-onboarding">
                <Database className="h-4 w-4 mr-2" />
                Upload Data
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {session?.user?.name}
          </p>
          {dataStatus && (
            <p className="text-xs text-gray-500 mt-1">
              📊 Live data: {dataStatus.products} products, {dataStatus.suppliers} suppliers, {dataStatus.shipments} shipments
            </p>
          )}
          <div className="flex space-x-2 mt-2">
            <Button asChild variant="outline" size="sm">
              <a href="/admin-dashboard?tab=live-data">
                <Activity className="h-4 w-4 mr-2" />
                View Live Data
              </a>
            </Button>
          </div>
        </div>
                 <div className="flex space-x-2">
           <Button onClick={fetchDashboardData} variant="outline" size="sm">
             <RefreshCw className="h-4 w-4 mr-2" />
             Refresh
           </Button>
           <Button onClick={checkDashboardStatus} variant="ghost" size="sm">
             🔍 Debug
           </Button>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShipments}</div>
            <p className="text-xs text-muted-foreground">
              Active shipments in transit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.totalValue / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">
              Combined shipment value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.riskScore.toFixed(1)}</div>
            <Badge className={riskLevel.color}>{riskLevel.level}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active products
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Shipment Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Shipment Status</CardTitle>
            <CardDescription>Current shipment distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">On Time</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{stats.onTimeDeliveries}</span>
                <span className="text-xs text-muted-foreground">
                  {stats.totalShipments > 0 ? ((stats.onTimeDeliveries / stats.totalShipments) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">Delayed</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{stats.delayedShipments}</span>
                <span className="text-xs text-muted-foreground">
                  {stats.totalShipments > 0 ? ((stats.delayedShipments / stats.totalShipments) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <span className="text-sm">In Transit</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{stats.inTransitShipments}</span>
                <span className="text-xs text-muted-foreground">
                  {stats.totalShipments > 0 ? ((stats.inTransitShipments / stats.totalShipments) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supply Chain Health</CardTitle>
            <CardDescription>Overall performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">On-Time Delivery Rate</span>
                <span className="text-sm font-medium">
                  {stats.onTimeDeliveryRate}%
                </span>
              </div>
              <Progress 
                value={stats.onTimeDeliveryRate} 
                className="h-2" 
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Risk Level</span>
                <Badge className={riskLevel.color}>{riskLevel.level}</Badge>
              </div>
              <Progress 
                value={stats.riskScore} 
                className="h-2" 
              />
            </div>
            
            <div className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">High Risk Suppliers:</span>
                  <span className="ml-2 font-medium">{stats.highRiskSuppliers}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Active Alerts:</span>
                  <span className="ml-2 font-medium">{stats.activeAlerts}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg Delivery:</span>
                  <span className="ml-2 font-medium">{stats.averageDeliveryTime} days</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg Order Value:</span>
                  <span className="ml-2 font-medium">${stats.averageOrderValue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug Info */}
      {debugInfo && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">🔍 Debug Information</CardTitle>
            <CardDescription>Current data status and sample records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Shipments:</span>
                <span className="ml-2">{debugInfo.dataCounts.shipments}</span>
              </div>
              <div>
                <span className="font-medium">Products:</span>
                <span className="ml-2">{debugInfo.dataCounts.products}</span>
              </div>
              <div>
                <span className="font-medium">Suppliers:</span>
                <span className="ml-2">{debugInfo.dataCounts.suppliers}</span>
              </div>
              <div>
                <span className="font-medium">Total:</span>
                <span className="ml-2">{debugInfo.dataCounts.total}</span>
              </div>
            </div>
            {debugInfo.sampleData.shipment && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                <div className="font-medium mb-2">Sample Shipment:</div>
                <div>Status: {debugInfo.sampleData.shipment.status}</div>
                <div>Product: {debugInfo.sampleData.shipment.product}</div>
                <div>Value: ${debugInfo.sampleData.shipment.totalValue}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  );
}