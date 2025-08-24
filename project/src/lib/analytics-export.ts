import * as XLSX from 'xlsx';

export interface AnalyticsExportData {
  keyMetrics: {
    totalRevenue: number;
    onTimeRate: number;
    avgLeadTime: number;
    costEfficiency: number;
    totalShipments: number;
    activeProducts: number;
    activeSuppliers: number;
  };
  shippingMethodStats: Record<string, { total: number; onTime: number; delayed: number; stuck: number }>;
  geographicStats: Record<string, { total: number; onTime: number; delayed: number; stuck: number; totalValue: number }>;
  supplierStats: Array<{
    name: string;
    rating: number;
    status: string;
    riskLevel: string;
    leadTime: number;
    specialties: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    onTimeRate: number;
    totalShipments: number;
  }>;
  riskAnalysis: {
    highRiskShipments: number;
    mediumRiskShipments: number;
    lowRiskShipments: number;
    highRiskProducts: number;
    highRiskSuppliers: number;
  };
  topRoutes: Array<{
    route: string;
    onTimeRate: number;
    totalValue: number;
    totalShipments: number;
  }>;
  topSuppliers: Array<{
    name: string;
    rating: number;
    status: string;
    riskLevel: string;
    leadTime: number;
    specialties: number;
  }>;
  timeRange: string;
}

export function exportAnalyticsToExcel(data: AnalyticsExportData, filename: string = 'analytics-report') {
  const workbook = XLSX.utils.book_new();

  // 1. Key Metrics Summary
  const keyMetricsData = [
    ['Metric', 'Value', 'Description'],
    ['Total Revenue', `$${data.keyMetrics.totalRevenue.toLocaleString()}`, 'Total revenue from all shipments'],
    ['On-Time Rate', `${data.keyMetrics.onTimeRate}%`, 'Percentage of on-time deliveries'],
    ['Average Lead Time', `${data.keyMetrics.avgLeadTime} days`, 'Average lead time across all products'],
    ['Cost Efficiency', `${data.keyMetrics.costEfficiency}%`, 'Profit margin percentage'],
    ['Total Shipments', data.keyMetrics.totalShipments, 'Total number of shipments'],
    ['Active Products', data.keyMetrics.activeProducts, 'Number of active products'],
    ['Active Suppliers', data.keyMetrics.activeSuppliers, 'Number of active suppliers'],
    ['', '', ''],
    ['Time Range', data.timeRange, 'Analysis period'],
    ['Generated', new Date().toLocaleString(), 'Report generation timestamp']
  ];

  const keyMetricsSheet = XLSX.utils.aoa_to_sheet(keyMetricsData);
  XLSX.utils.book_append_sheet(workbook, keyMetricsSheet, 'Key Metrics');

  // 2. Shipping Method Performance
  const shippingMethodData = [
    ['Shipping Method', 'Total Shipments', 'On-Time', 'Delayed', 'Stuck', 'On-Time Rate (%)']
  ];

  Object.entries(data.shippingMethodStats).forEach(([method, stats]) => {
    const onTimeRate = stats.total > 0 ? (stats.onTime / stats.total) * 100 : 0;
    shippingMethodData.push([
      method,
      stats.total,
      stats.onTime,
      stats.delayed,
      stats.stuck,
      onTimeRate.toFixed(1)
    ]);
  });

  const shippingMethodSheet = XLSX.utils.aoa_to_sheet(shippingMethodData);
  XLSX.utils.book_append_sheet(workbook, shippingMethodSheet, 'Shipping Methods');

  // 3. Geographic Performance
  const geographicData = [
    ['Route', 'Total Shipments', 'On-Time', 'Delayed', 'Stuck', 'On-Time Rate (%)', 'Total Value ($)']
  ];

  Object.entries(data.geographicStats).forEach(([route, stats]) => {
    const onTimeRate = stats.total > 0 ? (stats.onTime / stats.total) * 100 : 0;
    geographicData.push([
      route,
      stats.total,
      stats.onTime,
      stats.delayed,
      stats.stuck,
      onTimeRate.toFixed(1),
      stats.totalValue.toLocaleString()
    ]);
  });

  const geographicSheet = XLSX.utils.aoa_to_sheet(geographicData);
  XLSX.utils.book_append_sheet(workbook, geographicSheet, 'Geographic Performance');

  // 4. Supplier Performance
  const supplierData = [
    ['Supplier Name', 'Rating', 'Status', 'Risk Level', 'Lead Time (days)', 'Specialties Count']
  ];

  data.supplierStats.forEach(supplier => {
    supplierData.push([
      supplier.name,
      supplier.rating,
      supplier.status,
      supplier.riskLevel,
      supplier.leadTime,
      supplier.specialties
    ]);
  });

  const supplierSheet = XLSX.utils.aoa_to_sheet(supplierData);
  XLSX.utils.book_append_sheet(workbook, supplierSheet, 'Supplier Performance');

  // 5. Monthly Trends
  const trendsData = [
    ['Month', 'Revenue ($)', 'On-Time Rate (%)', 'Total Shipments']
  ];

  data.monthlyTrends.forEach(trend => {
    trendsData.push([
      trend.month,
      trend.revenue.toLocaleString(),
      trend.onTimeRate.toFixed(1),
      trend.totalShipments
    ]);
  });

  const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
  XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Monthly Trends');

  // 6. Risk Analysis
  const riskData = [
    ['Risk Category', 'Count', 'Description'],
    ['High Risk Shipments', data.riskAnalysis.highRiskShipments, 'Shipments with "Stuck" status'],
    ['Medium Risk Shipments', data.riskAnalysis.mediumRiskShipments, 'Shipments with "Delayed" status'],
    ['Low Risk Shipments', data.riskAnalysis.lowRiskShipments, 'Shipments with "On-Time" status'],
    ['High Risk Products', data.riskAnalysis.highRiskProducts, 'Products with high risk level'],
    ['High Risk Suppliers', data.riskAnalysis.highRiskSuppliers, 'Suppliers with high risk level']
  ];

  const riskSheet = XLSX.utils.aoa_to_sheet(riskData);
  XLSX.utils.book_append_sheet(workbook, riskSheet, 'Risk Analysis');

  // 7. Top Performing Routes
  const topRoutesData = [
    ['Route', 'On-Time Rate (%)', 'Total Value ($)', 'Total Shipments']
  ];

  data.topRoutes.forEach(route => {
    topRoutesData.push([
      route.route,
      route.onTimeRate.toFixed(1),
      route.totalValue.toLocaleString(),
      route.totalShipments
    ]);
  });

  const topRoutesSheet = XLSX.utils.aoa_to_sheet(topRoutesData);
  XLSX.utils.book_append_sheet(workbook, topRoutesSheet, 'Top Routes');

  // 8. Top Suppliers
  const topSuppliersData = [
    ['Supplier Name', 'Rating', 'Status', 'Risk Level', 'Lead Time (days)', 'Specialties Count']
  ];

  data.topSuppliers.forEach(supplier => {
    topSuppliersData.push([
      supplier.name,
      supplier.rating,
      supplier.status,
      supplier.riskLevel,
      supplier.leadTime,
      supplier.specialties
    ]);
  });

  const topSuppliersSheet = XLSX.utils.aoa_to_sheet(topSuppliersData);
  XLSX.utils.book_append_sheet(workbook, topSuppliersSheet, 'Top Suppliers');

  // Auto-size columns for all sheets
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
    
    const colWidths: number[] = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      let maxWidth = 10;
      for (let row = range.s.r; row <= range.e.r; row++) {
        const cell = sheet[XLSX.utils.encode_cell({ r: row, c: col })];
        if (cell && cell.v) {
          const cellWidth = cell.v.toString().length;
          maxWidth = Math.max(maxWidth, cellWidth);
        }
      }
      colWidths[col] = Math.min(maxWidth + 2, 50);
    }
    
    sheet['!cols'] = colWidths.map(width => ({ width }));
  });

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const finalFilename = `${filename}-${timestamp}.xlsx`;

  // Download the file
  XLSX.writeFile(workbook, finalFilename);
  
  return finalFilename;
}
