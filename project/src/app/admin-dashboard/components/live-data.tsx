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
  Activity,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface LiveDataSummary {
  totalProducts: number;
  totalSuppliers: number;
  totalShipments: number;
  totalFactories: number;
  totalWarehouses: number;
  totalRetailers: number;
  totalValue: number;
  onTimePercentage: number;
  riskScore: number;
}

interface LiveDataStatus {
  onTimeShipments: number;
  delayedShipments: number;
  stuckShipments: number;
  totalShipments: number;
}

interface RecentData {
  products: any[];
  suppliers: any[];
  shipments: any[];
  factories: any[];
  warehouses: any[];
  retailers: any[];
}

interface LiveDataResponse {
  summary: LiveDataSummary;
  recentData: RecentData;
  status: LiveDataStatus;
}

interface LiveDataProps {
  initialDataType?: string;
}

export function LiveData({ initialDataType }: LiveDataProps) {
  const [liveData, setLiveData] = useState<LiveDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialDataType || 'overview');

  // Update activeTab when initialDataType changes
  useEffect(() => {
    console.log('LiveData component received initialDataType:', initialDataType);
    if (initialDataType && initialDataType !== 'overview') {
      console.log('Setting active tab to:', initialDataType);
      setActiveTab(initialDataType);
    }
  }, [initialDataType]);

  const fetchLiveData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/live-data', {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        setLiveData(result.data);
      } else {
        console.error('Failed to fetch live data');
      }
    } catch (error) {
      console.error('Error fetching live data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, []);

  const downloadDataAsExcel = async (dataType: string, data: any[]) => {
    try {
      // Convert data to CSV format
      if (data.length === 0) {
        alert('No data to download');
        return;
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Handle arrays and objects
            if (Array.isArray(value)) {
              return `"${value.join('; ')}"`;
            }
            if (typeof value === 'object' && value !== null) {
              return `"${JSON.stringify(value)}"`;
            }
            return `"${value || ''}"`;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataType}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading data:', error);
      alert('Failed to download data');
    }
  };

  const getRiskLevel = (score: number) => {
    if (score <= 30) return { level: 'Low', color: 'bg-green-100 text-green-800' };
    if (score <= 70) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'High', color: 'bg-red-100 text-red-800' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading live data...</span>
        </div>
      </div>
    );
  }

  if (!liveData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No live data available</p>
        <Button onClick={fetchLiveData} className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  const riskLevel = getRiskLevel(liveData.summary.riskScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Live Data Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time data from your uploaded files
          </p>
        </div>
        <Button onClick={fetchLiveData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveData.summary.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active products in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveData.summary.totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              Active suppliers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveData.summary.totalShipments}</div>
            <p className="text-xs text-muted-foreground">
              Active shipments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveData.summary.riskScore.toFixed(1)}</div>
            <Badge className={riskLevel.color}>{riskLevel.level}</Badge>
          </CardContent>
        </Card>
      </div>

             {/* Tabs for different data types */}
       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
         <TabsList className="grid w-full grid-cols-7">
           <TabsTrigger value="overview">Overview</TabsTrigger>
           <TabsTrigger value="products">Products</TabsTrigger>
           <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
           <TabsTrigger value="shipments">Shipments</TabsTrigger>
           <TabsTrigger value="factories">Factories</TabsTrigger>
           <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
           <TabsTrigger value="retailers">Retailers</TabsTrigger>
         </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shipment Status */}
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
                    <span className="text-sm font-medium">{liveData.status.onTimeShipments}</span>
                    <span className="text-xs text-muted-foreground">
                      {liveData.status.totalShipments > 0 ? 
                        ((liveData.status.onTimeShipments / liveData.status.totalShipments) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Delayed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{liveData.status.delayedShipments}</span>
                    <span className="text-xs text-muted-foreground">
                      {liveData.status.totalShipments > 0 ? 
                        ((liveData.status.delayedShipments / liveData.status.totalShipments) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Stuck</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{liveData.status.stuckShipments}</span>
                    <span className="text-xs text-muted-foreground">
                      {liveData.status.totalShipments > 0 ? 
                        ((liveData.status.stuckShipments / liveData.status.totalShipments) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">On-Time Delivery Rate</span>
                    <span className="text-sm font-medium">
                      {liveData.summary.onTimePercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={liveData.summary.onTimePercentage} 
                    className="h-2" 
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Total Value</span>
                    <span className="text-sm font-medium">
                      ${liveData.summary.totalValue.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Factories:</span>
                      <span className="ml-2 font-medium">{liveData.summary.totalFactories}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Warehouses:</span>
                      <span className="ml-2 font-medium">{liveData.summary.totalWarehouses}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Retailers:</span>
                      <span className="ml-2 font-medium">{liveData.summary.totalRetailers}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Products</h3>
            <Button 
              onClick={() => downloadDataAsExcel('products', liveData.recentData.products)}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Risk Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liveData.recentData.products.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.supplier}</TableCell>
                      <TableCell>${product.unitCost?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={product.riskLevel === 'high' ? 'destructive' : 
                                       product.riskLevel === 'medium' ? 'secondary' : 'default'}>
                          {product.riskLevel}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Suppliers</h3>
            <Button 
              onClick={() => downloadDataAsExcel('suppliers', liveData.recentData.suppliers)}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liveData.recentData.suppliers.map((supplier, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.location}</TableCell>
                      <TableCell>{supplier.country}</TableCell>
                      <TableCell>{supplier.rating?.toFixed(1)}/5</TableCell>
                      <TableCell>
                        <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                          {supplier.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipments Tab */}
        <TabsContent value="shipments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Shipments</h3>
            <Button 
              onClick={() => downloadDataAsExcel('shipments', liveData.recentData.shipments)}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liveData.recentData.shipments.map((shipment, index) => (
                    <TableRow key={index}>
                      <TableCell>{shipment.origin}</TableCell>
                      <TableCell>{shipment.destination}</TableCell>
                      <TableCell>
                        <Badge variant={
                          shipment.status === 'On-Time' ? 'default' :
                          shipment.status === 'Delayed' ? 'secondary' :
                          shipment.status === 'Stuck' ? 'destructive' : 'outline'
                        }>
                          {shipment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{shipment.quantity}</TableCell>
                      <TableCell>${shipment.totalValue?.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

                 {/* Factories Tab */}
         <TabsContent value="factories" className="space-y-4">
           <div className="flex items-center justify-between">
             <h3 className="text-lg font-semibold">Recent Factories</h3>
             <Button 
               onClick={() => downloadDataAsExcel('factories', liveData.recentData.factories)}
               variant="outline"
               size="sm"
             >
               <Download className="h-4 w-4 mr-2" />
               Download CSV
             </Button>
           </div>
           <Card>
             <CardContent className="p-0">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Factory ID</TableHead>
                     <TableHead>Factory Name</TableHead>
                     <TableHead>Location</TableHead>
                     <TableHead>Capacity</TableHead>
                     <TableHead>Utilization</TableHead>
                     <TableHead>Quality Rating</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {liveData.recentData.factories.map((factory, index) => (
                     <TableRow key={index}>
                       <TableCell className="font-medium">{factory.Factory_ID}</TableCell>
                       <TableCell>{factory.Factory_Name}</TableCell>
                       <TableCell>{factory.Location}</TableCell>
                       <TableCell>{factory.Capacity?.toLocaleString()}</TableCell>
                       <TableCell>{factory.Utilization?.toFixed(1)}%</TableCell>
                       <TableCell>{factory.Quality_Rating?.toFixed(1)}/5</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </CardContent>
           </Card>
         </TabsContent>

         {/* Warehouses Tab */}
         <TabsContent value="warehouses" className="space-y-4">
           <div className="flex items-center justify-between">
             <h3 className="text-lg font-semibold">Recent Warehouses</h3>
             <Button 
               onClick={() => downloadDataAsExcel('warehouses', liveData.recentData.warehouses)}
               variant="outline"
               size="sm"
             >
               <Download className="h-4 w-4 mr-2" />
               Download CSV
             </Button>
           </div>
           <Card>
             <CardContent className="p-0">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Warehouse ID</TableHead>
                     <TableHead>Warehouse Name</TableHead>
                     <TableHead>Location</TableHead>
                     <TableHead>Capacity</TableHead>
                     <TableHead>Current Stock</TableHead>
                     <TableHead>Storage Cost</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {liveData.recentData.warehouses.map((warehouse, index) => (
                     <TableRow key={index}>
                       <TableCell className="font-medium">{warehouse.Warehouse_ID}</TableCell>
                       <TableCell>{warehouse.Warehouse_Name}</TableCell>
                       <TableCell>{warehouse.Location}</TableCell>
                       <TableCell>{warehouse.Capacity?.toLocaleString()}</TableCell>
                       <TableCell>{warehouse.Current_Stock?.toLocaleString()}</TableCell>
                       <TableCell>${warehouse.Storage_Cost?.toFixed(2)}</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </CardContent>
           </Card>
         </TabsContent>

         {/* Retailers Tab */}
         <TabsContent value="retailers" className="space-y-4">
           <div className="flex items-center justify-between">
             <h3 className="text-lg font-semibold">Recent Retailers</h3>
             <Button 
               onClick={() => downloadDataAsExcel('retailers', liveData.recentData.retailers)}
               variant="outline"
               size="sm"
             >
               <Download className="h-4 w-4 mr-2" />
               Download CSV
             </Button>
           </div>
           <Card>
             <CardContent className="p-0">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Retailer ID</TableHead>
                     <TableHead>Retailer Name</TableHead>
                     <TableHead>Location</TableHead>
                     <TableHead>Market Segment</TableHead>
                     <TableHead>Sales Volume</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {liveData.recentData.retailers.map((retailer, index) => (
                     <TableRow key={index}>
                       <TableCell className="font-medium">{retailer.Retailer_ID}</TableCell>
                       <TableCell>{retailer.Retailer_Name}</TableCell>
                       <TableCell>{retailer.Location}</TableCell>
                       <TableCell>{retailer.Market_Segment}</TableCell>
                       <TableCell>${retailer.Sales_Volume?.toLocaleString()}</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </CardContent>
           </Card>
         </TabsContent>
      </Tabs>

      {/* Last Updated */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
