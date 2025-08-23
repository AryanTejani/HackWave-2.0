'use client';

import { useState } from 'react';
import { X, FileSpreadsheet, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { downloadExcel, ExportData } from '@/lib/export-utils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ExportData;
  filename?: string;
}

export default function ExportModal({ isOpen, onClose, data, filename = 'supply-chain-report' }: ExportModalProps) {
  const [exportOptions, setExportOptions] = useState({
    shipments: true,
    alerts: true,
    stats: true,
    alertsSummary: true,
  });
  const [customFilename, setCustomFilename] = useState(filename);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportStatus('idle');
      
      // Filter data based on selected options
      const filteredData: ExportData = {
        shipments: exportOptions.shipments ? data.shipments : [],
        alerts: exportOptions.alerts ? data.alerts : [],
        stats: exportOptions.stats ? data.stats : { total: 0, onTime: 0, delayed: 0, stuck: 0, delivered: 0 },
        alertsSummary: exportOptions.alertsSummary ? data.alertsSummary : { total: 0, high: 0, medium: 0, low: 0 },
      };
      
      // Simulate a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 800));
      
      downloadExcel(filteredData, customFilename);
      setExportStatus('success');
      
      // Reset success state after 3 seconds
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
      
      // Reset error state after 3 seconds
      setTimeout(() => setExportStatus('idle'), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const getDataSummary = () => {
    return {
      shipments: data.shipments.length,
      alerts: data.alerts.length,
      stats: data.stats.total,
      alertsSummary: data.alertsSummary.total,
    };
  };

  const summary = getDataSummary();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Export Data</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Filename */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filename
            </label>
            <input
              type="text"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter filename"
            />
          </div>

          {/* Export Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select data to export:
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.shipments}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, shipments: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">Shipments</span>
                  <span className="text-xs text-gray-500 ml-2">({summary.shipments} records)</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.alerts}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, alerts: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">Risk Alerts</span>
                  <span className="text-xs text-gray-500 ml-2">({summary.alerts} records)</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.stats}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, stats: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">Statistics</span>
                  <span className="text-xs text-gray-500 ml-2">(Summary metrics)</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.alertsSummary}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, alertsSummary: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">Alerts Summary</span>
                  <span className="text-xs text-gray-500 ml-2">(Risk level breakdown)</span>
                </div>
              </label>
            </div>
          </div>

          {/* Data Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Data Preview</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Shipments:</span>
                <span className="font-medium">{data.stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Alerts:</span>
                <span className="font-medium">{data.alertsSummary.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">On Time:</span>
                <span className="font-medium text-green-600">{data.stats.onTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delayed:</span>
                <span className="font-medium text-yellow-600">{data.stats.delayed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || (!exportOptions.shipments && !exportOptions.alerts && !exportOptions.stats && !exportOptions.alertsSummary)}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isExporting || (!exportOptions.shipments && !exportOptions.alerts && !exportOptions.stats && !exportOptions.alertsSummary)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : exportStatus === 'success'
                ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                : exportStatus === 'error'
                ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Exporting...
              </>
            ) : exportStatus === 'success' ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Exported!
              </>
            ) : exportStatus === 'error' ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Export Failed
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
