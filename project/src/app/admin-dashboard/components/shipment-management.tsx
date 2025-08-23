'use client';

import { useState, useEffect } from 'react';
import { ShipmentWithProduct, Alert } from '@/lib/types';
import ShipmentTable from '@/components/shipment/ShipmentTable';
import AlertsSection from '@/components/shipment/AlertsSection';
import AddShipmentForm from '@/components/shipment/AddShipmentForm';
import { 
  Plus, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DashboardStats {
  total: number;
  onTime: number;
  delayed: number;
  stuck: number;
  delivered: number;
}

export function ShipmentManagement() {
  const [shipments, setShipments] = useState<ShipmentWithProduct[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsSummary, setAlertsSummary] = useState({ total: 0, high: 0, medium: 0, low: 0 });
  const [stats, setStats] = useState<DashboardStats>({ total: 0, onTime: 0, delayed: 0, stuck: 0, delivered: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch shipments and alerts in parallel
      const [shipmentsRes, alertsRes] = await Promise.all([
        fetch('/api/shipments'),
        fetch('/api/alerts')
      ]);

      if (shipmentsRes.ok) {
        const shipmentsData = await shipmentsRes.json();
        setShipments(shipmentsData);
        
        // Calculate stats
        const stats = {
          total: shipmentsData.length,
          onTime: shipmentsData.filter((s: any) => s.status === 'On-Time').length,
          delayed: shipmentsData.filter((s: any) => s.status === 'Delayed').length,
          stuck: shipmentsData.filter((s: any) => s.status === 'Stuck').length,
          delivered: shipmentsData.filter((s: any) => s.status === 'Delivered').length,
        };
        setStats(stats);
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.alerts);
        setAlertsSummary(alertsData.summary);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleShipmentUpdate = () => {
    fetchData(); // Refresh data after updates
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      shipment.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Loading shipments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shipment Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage all your shipments in one place</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Shipment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Shipments</CardTitle>
            <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">All shipments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">On Time</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.onTime}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">On-time deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Delayed</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.delayed}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Delayed shipments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Stuck</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.stuck}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Stuck shipments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.delivered}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Completed deliveries</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Shipment Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Shipment</CardTitle>
            <CardDescription>Create a new shipment entry</CardDescription>
          </CardHeader>
          <CardContent>
            <AddShipmentForm
              onSuccess={() => {
                setShowAddForm(false);
                handleShipmentUpdate();
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Risk Alerts
            </CardTitle>
            <CardDescription>Active alerts requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertsSection alerts={alerts} summary={alertsSummary} />
          </CardContent>
        </Card>
      )}

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Shipments</CardTitle>
              <CardDescription>Track and manage all your shipments</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search shipments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="On-Time">On Time</option>
                <option value="Delayed">Delayed</option>
                <option value="Stuck">Stuck</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="cards">Card View</TabsTrigger>
              <TabsTrigger value="map">Map View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="table" className="mt-6">
              <ShipmentTable 
                shipments={filteredShipments} 
                onUpdate={handleShipmentUpdate}
              />
            </TabsContent>
            
            <TabsContent value="cards" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredShipments.map((shipment) => (
                  <Card key={shipment._id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-sm">{shipment.trackingNumber}</CardTitle>
                          <CardDescription className="text-xs">
                            {shipment.productId?.name || 'Unknown Product'}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={
                            shipment.status === 'On-Time' ? 'default' :
                            shipment.status === 'Delayed' ? 'secondary' :
                            shipment.status === 'Stuck' ? 'destructive' : 'outline'
                          }
                        >
                          {shipment.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Route:</span>
                          <span className="font-medium">{shipment.origin} → {shipment.destination}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Value:</span>
                          <span className="font-medium">{formatCurrency(shipment?.totalValue || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Expected:</span>
                          <span className="font-medium">
                            {new Date(shipment.expectedDelivery).toLocaleDateString()}
                          </span>
                        </div>
                        {shipment.currentLocation && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Location:</span>
                            <span className="font-medium">{shipment?.currentLocation}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="map" className="mt-6">
              <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Map view coming soon</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Interactive shipment tracking map</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
