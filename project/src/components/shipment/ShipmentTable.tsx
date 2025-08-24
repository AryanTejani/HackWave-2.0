// components/ShipmentTable.tsx
'use client';

import { useState } from 'react';
import { ShipmentWithProduct } from '@/lib/types';
import { CompactExportButton } from '@/components/ui/export-button';
import { Pencil, Trash2, Calendar, MapPin, Package } from 'lucide-react';

interface ShipmentTableProps {
  shipments: ShipmentWithProduct[];
  onUpdate: () => void;
}

export default function ShipmentTable({ shipments, onUpdate }: ShipmentTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On-Time': return 'bg-green-100 text-green-800';
      case 'Delayed': return 'bg-yellow-100 text-yellow-800';
      case 'Stuck': return 'bg-red-100 text-red-800';
      case 'Delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/shipments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setEditingId(null);
        onUpdate();
      } else {
        alert('Failed to update shipment status');
      }
    } catch (error) {
      console.error('Error updating shipment:', error);
      alert('Failed to update shipment status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shipment?')) return;

    try {
      const response = await fetch(`/api/shipments?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        onUpdate();
      } else {
        const error = await response.json();
        alert(`Failed to delete shipment: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting shipment:', error);
      alert('Failed to delete shipment');
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (shipments.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No shipments found</h3>
        <p className="text-gray-500">Get started by adding your first shipment.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Shipments ({shipments.length})</h3>
          <p className="text-xs text-gray-500">Export shipment data to Excel</p>
        </div>
        <CompactExportButton
          data={{
            shipments,
            alerts: [],
            stats: {
              total: shipments.length,
              onTime: shipments.filter(s => s.status === 'On-Time').length,
              delayed: shipments.filter(s => s.status === 'Delayed').length,
              stuck: shipments.filter(s => s.status === 'Stuck').length,
              delivered: shipments.filter(s => s.status === 'Delivered').length,
            },
            alertsSummary: { total: 0, high: 0, medium: 0, low: 0 }
          }}
          filename="shipments-only"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Route
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expected Delivery
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tracking
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {shipments.map((shipment) => (
            <tr key={shipment._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {shipment.productId?.name || 'Unknown Product'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {shipment.productId?.category} • {shipment.productId?.supplier}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-900">
                  <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                  <span>{shipment.origin}</span>
                  <span className="mx-2">→</span>
                  <span>{shipment.destination}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingId === shipment._id ? (
                  <div className="flex items-center space-x-2">
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1"
                    >
                      <option value="On-Time">On-Time</option>
                      <option value="Delayed">Delayed</option>
                      <option value="Stuck">Stuck</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                    <button
                      onClick={() => handleStatusUpdate(shipment._id, editStatus)}
                      className="text-green-600 hover:text-green-800 text-xs"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-600 hover:text-gray-800 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(shipment.status)}`}>
                    {shipment.status}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-900">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  {formatDate(shipment.expectedDelivery)}
                </div>
                {shipment.actualDelivery && (
                  <div className="text-xs text-gray-500 mt-1">
                    Delivered: {formatDate(shipment.actualDelivery)}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {shipment.trackingNumber || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingId(shipment._id);
                      setEditStatus(shipment.status);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                    title="Edit status"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(shipment._id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete shipment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}