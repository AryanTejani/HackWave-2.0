'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  FileText, 
  Calendar, 
  Database, 
  TrendingUp, 
  Package, 
  Truck, 
  Building2,
  Download,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface UploadLog {
  _id: string;
  fileName: string;
  dataType: string;
  rowCount: number;
  status: 'Success' | 'Failed';
  userId: string;
  createdAt: string;
}

interface LiveData {
  products: any[];
  suppliers: any[];
  shipments: any[];
  supplyChains: any[];
  factories: any[];
  warehouses: any[];
}

interface DataSummary {
  totalFiles: number;
  totalRows: number;
  successRate: number;
  dataTypes: { [key: string]: number };
  recentUploads: UploadLog[];
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
  const [uploadLogs, setUploadLogs] = useState<UploadLog[]>([]);
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [summaryCounts, setSummaryCounts] = useState<SummaryCounts | null>(null);
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch upload logs and live data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch upload logs
      const logsResponse = await fetch('/api/upload-logs', {
        credentials: 'include'
      });
      
      // Fetch live data
      const liveDataResponse = await fetch('/api/live-data', {
        credentials: 'include'
      });

      console.log('Dashboard: Fetching data...');

      if (logsResponse.ok && liveDataResponse.ok) {
        const logsData = await logsResponse.json();
        const liveDataData = await liveDataResponse.json();

        console.log('Dashboard: Logs response:', logsData);
        console.log('Dashboard: Live data response:', liveDataData);

        setUploadLogs(logsData.logs || []);
        
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

        // Calculate data summary
        const summary = calculateDataSummary(logsData.logs || []);
        setDataSummary(summary);
      } else {
        console.error('Dashboard: API responses not ok:', {
          logsOk: logsResponse.ok,
          liveDataOk: liveDataResponse.ok,
          logsStatus: logsResponse.status,
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

  // Calculate data summary from upload logs
  const calculateDataSummary = (logs: UploadLog[]): DataSummary => {
    const totalFiles = logs.length;
    const totalRows = logs.reduce((sum, log) => sum + log.rowCount, 0);
    const successCount = logs.filter(log => log.status === 'Success').length;
    const successRate = totalFiles > 0 ? (successCount / totalFiles) * 100 : 0;

    // Count by data type
    const dataTypes: { [key: string]: number } = {};
    logs.forEach(log => {
      dataTypes[log.dataType] = (dataTypes[log.dataType] || 0) + log.rowCount;
    });

    // Get recent uploads (last 10)
    const recentUploads = logs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return {
      totalFiles,
      totalRows,
      successRate,
      dataTypes,
      recentUploads
    };
  };

  // Group uploads by date
  const groupUploadsByDate = (uploads: UploadLog[]) => {
    const groups: { [key: string]: UploadLog[] } = {};
    
    uploads.forEach(upload => {
      const date = new Date(upload.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(upload);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
  };

  // Format file size (mock calculation based on row count)
  const formatFileSize = (rowCount: number) => {
    const estimatedSize = rowCount * 100; // Rough estimate
    if (estimatedSize < 1024) return `${estimatedSize} B`;
    if (estimatedSize < 1024 * 1024) return `${(estimatedSize / 1024).toFixed(1)} KB`;
    return `${(estimatedSize / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get data type icon
  const getDataTypeIcon = (dataType: string) => {
    switch (dataType.toLowerCase()) {
      case 'products': return <Package className="h-4 w-4" />;
      case 'suppliers': return <Building2 className="h-4 w-4" />;
      case 'shipments': return <Truck className="h-4 w-4" />;
      case 'supplychains': return <Database className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    return status === 'Success' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  // Handle view data for specific upload
  const handleViewData = (dataType: string) => {
    // Dispatch custom event to navigate to live data with specific data type
    const event = new CustomEvent('changeSection', {
      detail: {
        section: 'live-data',
        dataType: dataType.toLowerCase()
      }
    });
    window.dispatchEvent(event);
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

  const groupedUploads = groupUploadsByDate(uploadLogs);

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

      {/* Data Summary Cards */}
      {dataSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Files Uploaded
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {dataSummary.totalFiles}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Excel files processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Data Rows
              </CardTitle>
              <Database className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {dataSummary.totalRows.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Records across all files
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Success Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {dataSummary.successRate.toFixed(1)}%
              </div>
              <Progress value={dataSummary.successRate} className="mt-2" />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Files processed successfully
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Data Types
              </CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Object.keys(dataSummary.dataTypes).length}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Different data categories
              </p>
            </CardContent>
          </Card>
        </div>
      )}

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

      {/* Upload History by Date */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Upload History
          </CardTitle>
          <CardDescription>
            Your uploaded Excel files grouped by date
          </CardDescription>
        </CardHeader>
        <CardContent>
          {groupedUploads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No uploads yet</p>
              <p className="text-sm">Upload your first Excel file to see it here</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedUploads.map(([date, uploads]) => (
                <div key={date} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{date}</h3>
                    <Badge variant="outline" className="text-xs">
                      {uploads.length} file{uploads.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {uploads.map((upload) => (
                      <div key={upload._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            {getDataTypeIcon(upload.dataType)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {upload.fileName}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Database className="h-3 w-3" />
                                {upload.dataType}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {upload.rowCount.toLocaleString()} rows
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(upload.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(upload.status)}>
                            {upload.status === 'Success' ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            )}
                            {upload.status}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            ~{formatFileSize(upload.rowCount)}
                          </div>
                          {upload.status === 'Success' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewData(upload.dataType)}
                              className="h-7 px-2 text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Data
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}