// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ShipmentWithProduct, Alert } from '@/lib/types';
import ShipmentTable from '@/components/shipment/ShipmentTable';
import AlertsSection from '@/components/shipment/AlertsSection';
import AddShipmentForm from '@/components/shipment/AddShipmentForm';
import { Plus, Truck, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface DashboardStats {
  total: number;
  onTime: number;
  delayed: number;
  stuck: number;
  delivered: number;
}

export default function Dashboard() {
  const [shipments, setShipments] = useState<ShipmentWithProduct[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsSummary, setAlertsSummary] = useState({ total: 0, high: 0, medium: 0, low: 0 });
  const [stats, setStats] = useState<DashboardStats>({ total: 0, onTime: 0, delayed: 0, stuck: 0, delivered: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Supply Chain Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor shipments and manage supply chain risks
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Shipment
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Shipments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">On Time</p>
                <p className="text-2xl font-bold text-green-600">{stats.onTime}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Delayed</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.delayed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Stuck</p>
                <p className="text-2xl font-bold text-red-600">{stats.stuck}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Shipment Form */}
        {showAddForm && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Shipment</h2>
              <AddShipmentForm
                onSuccess={() => {
                  setShowAddForm(false);
                  handleShipmentUpdate();
                }}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </div>
        )}

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <AlertsSection alerts={alerts} summary={alertsSummary} />
          </div>
        )}

        {/* Shipments Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Shipments</h2>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage all your shipments in one place
            </p>
          </div>
          <ShipmentTable 
            shipments={shipments} 
            onUpdate={handleShipmentUpdate}
          />
        </div>
      </div>
    </div>
  );
}