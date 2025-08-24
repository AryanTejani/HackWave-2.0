'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  Calendar,
  RefreshCw,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadLog } from '@/lib/types';

interface GroupedLogs {
  [key: string]: UploadLog[];
}

export function DataHistory({ refreshKey }: { refreshKey: number }) {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<UploadLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async () => {
    try {
      setError(null);
      const response = await fetch('/api/upload-logs', {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch logs');
      }

      const data = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getDataTypeLabel = (dataType: string) => {
    const labels: { [key: string]: string } = {
      'products': 'Products',
      'suppliers': 'Suppliers',
      'factories': 'Factories',
      'shipments': 'Shipments',
      'warehouses': 'Warehouses',
      'retailers': 'Retailers'
    };
    return labels[dataType] || dataType.charAt(0).toUpperCase() + dataType.slice(1);
  };

  const getStatusIcon = (status: 'Success' | 'Failed') => {
    return status === 'Success' ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const downloadDataAsCSV = async (dataType: string) => {
    try {
      // Fetch the actual data from the live-data API
      const response = await fetch('/api/live-data', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data for download');
      }

      const result = await response.json();
      const data = result.data.recentData[dataType] || [];

      if (data.length === 0) {
        alert('No data available to download');
        return;
      }

      // Convert data to CSV format
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map((row: any) => 
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

  const viewData = (dataType: string) => {
    console.log('View button clicked for data type:', dataType);
    
    // Navigate to the live data section and set the active tab
    if (window.location.pathname === '/admin-dashboard') {
      // We're already on the admin dashboard, just change the section
      const event = new CustomEvent('changeSection', { 
        detail: { section: 'live-data', dataType: dataType } 
      });
      console.log('Dispatching changeSection event:', event.detail);
      window.dispatchEvent(event);
    } else {
      // Navigate to admin dashboard with live data section
      window.location.href = '/admin-dashboard';
    }
  };

  const groupLogsByDate = (logs: UploadLog[]): GroupedLogs => {
    const grouped: GroupedLogs = {};
    
    logs.forEach(log => {
      const dateKey = formatDate(log.createdAt);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(log);
    });

    return grouped;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Data History
          </CardTitle>
          <CardDescription>
            Your file upload history and processing results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const groupedLogs = groupLogsByDate(logs);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Data History
            </CardTitle>
            <CardDescription>
              Your file upload history and processing results
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center gap-2 p-4 text-red-700 bg-red-50 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No upload history yet</p>
            <p className="text-sm">Upload your first file to see it here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedLogs).map(([dateKey, dateLogs]) => (
              <div key={dateKey} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4" />
                  {dateKey}
                </div>
                <div className="space-y-2">
                  {dateLogs.map((log) => (
                    <div
                      key={log._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getStatusIcon(log.status)}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                              {log.fileName}
                            </span>
                            <Badge 
                              variant={log.status === 'Success' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {log.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <FileSpreadsheet className="h-3 w-3" />
                              {getDataTypeLabel(log.dataType)}
                            </span>
                            <span>{log.rowCount} rows</span>
                            <span>{formatTime(log.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      {log.status === 'Success' && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewData(log.dataType)}
                            className="h-8 px-2"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadDataAsCSV(log.dataType)}
                            className="h-8 px-2"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}