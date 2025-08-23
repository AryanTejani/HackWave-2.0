import * as XLSX from 'xlsx';

export interface ExportData {
  shipments: any[];
  alerts: any[];
  stats: {
    total: number;
    onTime: number;
    delayed: number;
    stuck: number;
    delivered: number;
  };
  alertsSummary: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
}

export const exportToExcel = (data: ExportData, filename: string = 'supply-chain-report') => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Prepare shipments data for export
  const shipmentsData = data.shipments.map(shipment => ({
    'Shipment ID': shipment._id,
    'Product Name': shipment.productId?.name || 'N/A',
    'Product Category': shipment.productId?.category || 'N/A',
    'Supplier': shipment.productId?.supplier || 'N/A',
    'Origin': shipment.origin,
    'Destination': shipment.destination,
    'Status': shipment.status,
    'Expected Delivery': shipment.expectedDelivery ? new Date(shipment.expectedDelivery).toLocaleDateString() : 'N/A',
    'Actual Delivery': shipment.actualDelivery ? new Date(shipment.actualDelivery).toLocaleDateString() : 'N/A',
    'Tracking Number': shipment.trackingNumber || 'N/A',
    'Created Date': new Date(shipment.createdAt).toLocaleDateString(),
    'Last Updated': new Date(shipment.updatedAt).toLocaleDateString(),
  }));

  // Prepare alerts data for export
  const alertsData = data.alerts.map(alert => ({
    'Alert ID': alert.shipmentId,
    'Product Name': alert.productName,
    'Status': alert.status,
    'Origin': alert.origin,
    'Destination': alert.destination,
    'Expected Delivery': new Date(alert.expectedDelivery).toLocaleDateString(),
    'Risk Level': alert.riskLevel,
    'Suggestions': alert.suggestions.join('; '),
  }));

  // Prepare stats data for export
  const statsData = [
    { 'Metric': 'Total Shipments', 'Count': data.stats.total },
    { 'Metric': 'On Time', 'Count': data.stats.onTime },
    { 'Metric': 'Delayed', 'Count': data.stats.delayed },
    { 'Metric': 'Stuck', 'Count': data.stats.stuck },
    { 'Metric': 'Delivered', 'Count': data.stats.delivered },
  ];

  // Prepare alerts summary data for export
  const alertsSummaryData = [
    { 'Alert Type': 'Total Alerts', 'Count': data.alertsSummary.total },
    { 'Alert Type': 'High Risk', 'Count': data.alertsSummary.high },
    { 'Alert Type': 'Medium Risk', 'Count': data.alertsSummary.medium },
    { 'Alert Type': 'Low Risk', 'Count': data.alertsSummary.low },
  ];

  // Create worksheets
  const shipmentsSheet = XLSX.utils.json_to_sheet(shipmentsData);
  const alertsSheet = XLSX.utils.json_to_sheet(alertsData);
  const statsSheet = XLSX.utils.json_to_sheet(statsData);
  const alertsSummarySheet = XLSX.utils.json_to_sheet(alertsSummaryData);

  // Add worksheets to workbook
  XLSX.utils.book_append_sheet(workbook, shipmentsSheet, 'Shipments');
  XLSX.utils.book_append_sheet(workbook, alertsSheet, 'Alerts');
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistics');
  XLSX.utils.book_append_sheet(workbook, alertsSummarySheet, 'Alerts Summary');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const finalFilename = `${filename}-${timestamp}.xlsx`;

  // Write to file
  XLSX.writeFile(workbook, finalFilename);
};

// Alternative export function that returns a blob for download
export const exportToExcelBlob = (data: ExportData): Blob => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Prepare shipments data for export
  const shipmentsData = data.shipments.map(shipment => ({
    'Shipment ID': shipment._id,
    'Product Name': shipment.productId?.name || 'N/A',
    'Product Category': shipment.productId?.category || 'N/A',
    'Supplier': shipment.productId?.supplier || 'N/A',
    'Origin': shipment.origin,
    'Destination': shipment.destination,
    'Status': shipment.status,
    'Expected Delivery': shipment.expectedDelivery ? new Date(shipment.expectedDelivery).toLocaleDateString() : 'N/A',
    'Actual Delivery': shipment.actualDelivery ? new Date(shipment.actualDelivery).toLocaleDateString() : 'N/A',
    'Tracking Number': shipment.trackingNumber || 'N/A',
    'Created Date': new Date(shipment.createdAt).toLocaleDateString(),
    'Last Updated': new Date(shipment.updatedAt).toLocaleDateString(),
  }));

  // Prepare alerts data for export
  const alertsData = data.alerts.map(alert => ({
    'Alert ID': alert.shipmentId,
    'Product Name': alert.productName,
    'Status': alert.status,
    'Origin': alert.origin,
    'Destination': alert.destination,
    'Expected Delivery': new Date(alert.expectedDelivery).toLocaleDateString(),
    'Risk Level': alert.riskLevel,
    'Suggestions': alert.suggestions.join('; '),
  }));

  // Prepare stats data for export
  const statsData = [
    { 'Metric': 'Total Shipments', 'Count': data.stats.total },
    { 'Metric': 'On Time', 'Count': data.stats.onTime },
    { 'Metric': 'Delayed', 'Count': data.stats.delayed },
    { 'Metric': 'Stuck', 'Count': data.stats.stuck },
    { 'Metric': 'Delivered', 'Count': data.stats.delivered },
  ];

  // Prepare alerts summary data for export
  const alertsSummaryData = [
    { 'Alert Type': 'Total Alerts', 'Count': data.alertsSummary.total },
    { 'Alert Type': 'High Risk', 'Count': data.alertsSummary.high },
    { 'Alert Type': 'Medium Risk', 'Count': data.alertsSummary.medium },
    { 'Alert Type': 'Low Risk', 'Count': data.alertsSummary.low },
  ];

  // Create worksheets
  const shipmentsSheet = XLSX.utils.json_to_sheet(shipmentsData);
  const alertsSheet = XLSX.utils.json_to_sheet(alertsData);
  const statsSheet = XLSX.utils.json_to_sheet(statsData);
  const alertsSummarySheet = XLSX.utils.json_to_sheet(alertsSummaryData);

  // Add worksheets to workbook
  XLSX.utils.book_append_sheet(workbook, shipmentsSheet, 'Shipments');
  XLSX.utils.book_append_sheet(workbook, alertsSheet, 'Alerts');
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistics');
  XLSX.utils.book_append_sheet(workbook, alertsSummarySheet, 'Alerts Summary');

  // Convert to blob
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

// Download function for browser
export const downloadExcel = (data: ExportData, filename: string = 'supply-chain-report') => {
  const blob = exportToExcelBlob(data);
  const timestamp = new Date().toISOString().split('T')[0];
  const finalFilename = `${filename}-${timestamp}.xlsx`;
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
