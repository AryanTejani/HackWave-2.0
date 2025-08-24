// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ShipmentWithProduct, Alert } from '@/lib/types';
import ShipmentTable from '@/components/shipment/ShipmentTable';
import AlertsSection from '@/components/shipment/AlertsSection';
import AddShipmentForm from '@/components/shipment/AddShipmentForm';
import ExportButton from '@/components/ui/export-button';
import ExportModal from '@/components/ui/export-modal';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Plus, Truck, AlertTriangle, CheckCircle, Clock, FileSpreadsheet, Settings, Package } from 'lucide-react';

interface DashboardStats {
  total: number;
  onTime: number;
  delayed: number;
  stuck: number;
  delivered: number;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [shipments, setShipments] = useState<ShipmentWithProduct[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsSummary, setAlertsSummary] = useState({ total: 0, high: 0, medium: 0, low: 0 });
  const [stats, setStats] = useState<DashboardStats>({ total: 0, onTime: 0, delayed: 0, stuck: 0, delivered: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from API
      const [shipmentsRes, alertsRes] = await Promise.all([
        fetch('/api/shipments'),
        fetch('/api/alerts')
      ]);

      if (shipmentsRes.ok) {
        const shipmentsData = await shipmentsRes.json();
        setShipments(shipmentsData.data || []);
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.data || []);
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

  // Calculate stats from real data
  useEffect(() => {
    const newStats = {
      total: shipments.length,
      onTime: shipments.filter(s => s.status === 'On-Time').length,
      delayed: shipments.filter(s => s.status === 'Delayed').length,
      stuck: shipments.filter(s => s.status === 'Stuck').length,
      delivered: shipments.filter(s => s.status === 'Delivered').length
    };
    setStats(newStats);

    // Calculate alerts summary
    const newAlertsSummary = {
      total: alerts.length,
      high: alerts.filter(a => a.riskLevel === 'High').length,
      medium: alerts.filter(a => a.riskLevel === 'Medium').length,
      low: alerts.filter(a => a.riskLevel === 'Low').length
    };
    setAlertsSummary(newAlertsSummary);
  }, [shipments, alerts]);

  const handleShipmentAdded = () => {
    fetchData(); // Refresh data after adding shipment
    setShowAddForm(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Supply Chain Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Welcome back, {session?.user?.name}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="btn-secondary"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export Data
                </button>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shipment
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Shipments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">On Time</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.onTime}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Delayed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.delayed}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Stuck</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.stuck}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.delivered}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          <div className="mb-8">
            <AlertsSection 
              alerts={alerts} 
              summary={alertsSummary}
            />
          </div>

          {/* Shipments Table */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Recent Shipments
              </h2>
              <Link
                href="/admin-dashboard?section=shipments"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View All
              </Link>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ShipmentTable 
                shipments={shipments.slice(0, 5)} // Show only first 5 shipments
                onUpdate={fetchData}
              />
            )}
          </div>
        </div>

        {/* Add Shipment Form Modal */}
        {showAddForm && (
          <AddShipmentForm
            onSuccess={handleShipmentAdded}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Export Modal */}
        {showExportModal && (
          <ExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            data={{ 
              shipments, 
              alerts,
              stats,
              alertsSummary
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}