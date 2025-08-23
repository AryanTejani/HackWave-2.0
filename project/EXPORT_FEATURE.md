# Export Feature Documentation

## Overview

The export functionality allows users to download supply chain data in Excel format (.xlsx) with multiple worksheets containing different types of information.

## Features

### 1. Quick Export Button
- **Location**: Dashboard header (next to "Add Shipment" button)
- **Functionality**: Exports all current data with default settings
- **Output**: Single Excel file with all worksheets

### 2. Export Options Modal
- **Location**: "Export Options" button in dashboard header
- **Functionality**: Customizable export with selective data inclusion
- **Features**:
  - Custom filename input
  - Selective data export (shipments, alerts, stats, alerts summary)
  - Data preview before export
  - Real-time record counts

### 3. Section-Specific Export
- **Shipments Table**: Compact export button for shipments-only data
- **Alerts Section**: Compact export button for alerts-only data

## Export Data Structure

### Worksheets Included

1. **Shipments Worksheet**
   - Shipment ID
   - Product Name
   - Product Category
   - Supplier
   - Origin
   - Destination
   - Status
   - Expected Delivery
   - Actual Delivery
   - Tracking Number
   - Created Date
   - Last Updated

2. **Alerts Worksheet**
   - Alert ID
   - Product Name
   - Status
   - Origin
   - Destination
   - Expected Delivery
   - Risk Level
   - Suggestions

3. **Statistics Worksheet**
   - Total Shipments
   - On Time Count
   - Delayed Count
   - Stuck Count
   - Delivered Count

4. **Alerts Summary Worksheet**
   - Total Alerts
   - High Risk Count
   - Medium Risk Count
   - Low Risk Count

## Usage Instructions

### Quick Export
1. Navigate to the Dashboard
2. Click the "Export Report" button in the header
3. File will automatically download with timestamp

### Custom Export
1. Click "Export Options" button
2. Customize filename (optional)
3. Select which data to include:
   - ✅ Shipments
   - ✅ Risk Alerts
   - ✅ Statistics
   - ✅ Alerts Summary
4. Review data preview
5. Click "Export to Excel"

### Section-Specific Export
- **Shipments**: Click the download icon in the shipments table header
- **Alerts**: Click the download icon in the alerts section header

## File Naming Convention

- **Default**: `supply-chain-report-YYYY-MM-DD.xlsx`
- **Custom**: `[custom-name]-YYYY-MM-DD.xlsx`
- **Section-specific**: `[section-name]-YYYY-MM-DD.xlsx`

## Technical Implementation

### Dependencies
- `xlsx` library for Excel file generation
- React hooks for state management
- TypeScript for type safety

### Key Components
- `ExportButton`: Quick export functionality
- `CompactExportButton`: Section-specific exports
- `ExportModal`: Advanced export options
- `export-utils.ts`: Core export logic

### Export Functions
- `downloadExcel()`: Main export function
- `exportToExcelBlob()`: Returns blob for download
- `exportToExcel()`: Direct file writing (server-side)

## Error Handling

- Loading states during export
- Success/error feedback
- Automatic state reset after 3 seconds
- Graceful fallback for missing data

## Browser Compatibility

- Modern browsers with ES6+ support
- Automatic download trigger
- Blob URL generation and cleanup

## Performance Considerations

- Client-side processing
- Minimal memory usage
- Efficient data transformation
- Responsive UI during export

## Future Enhancements

- PDF export option
- CSV format support
- Scheduled exports
- Email delivery
- Custom date range selection
- Advanced filtering options
