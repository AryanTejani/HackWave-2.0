'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { downloadExcel, ExportData } from '@/lib/export-utils';

interface ExportButtonProps {
  data: ExportData;
  filename?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function ExportButton({ 
  data, 
  filename = 'supply-chain-report',
  className = '',
  variant = 'default',
  size = 'md'
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportStatus('idle');
      
      // Simulate a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      downloadExcel(data, filename);
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

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };
    
    const variantClasses = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500'
    };
    
    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  };

  const getIcon = () => {
    if (isExporting) {
      return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />;
    }
    
    if (exportStatus === 'success') {
      return <CheckCircle className="h-4 w-4" />;
    }
    
    if (exportStatus === 'error') {
      return <AlertCircle className="h-4 w-4" />;
    }
    
    return <FileSpreadsheet className="h-4 w-4" />;
  };

  const getButtonText = () => {
    if (isExporting) return 'Exporting...';
    if (exportStatus === 'success') return 'Exported!';
    if (exportStatus === 'error') return 'Export Failed';
    return 'Export Report';
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={getButtonClasses()}
      title="Export data to Excel file"
    >
      {getIcon()}
      <span className="ml-2">{getButtonText()}</span>
    </button>
  );
}

// Alternative compact version for smaller spaces
export function CompactExportButton({ 
  data, 
  filename = 'supply-chain-report',
  className = ''
}: Omit<ExportButtonProps, 'variant' | 'size'>) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportStatus('idle');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      downloadExcel(data, filename);
      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 2000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 2000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`inline-flex items-center justify-center p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        exportStatus === 'success' 
          ? 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500' 
          : exportStatus === 'error'
          ? 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-blue-500'
      } ${className}`}
      title="Export to Excel"
    >
      {isExporting ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
      ) : exportStatus === 'success' ? (
        <CheckCircle className="h-4 w-4" />
      ) : exportStatus === 'error' ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </button>
  );
}
