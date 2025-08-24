# Dynamic Alerts System

## Overview

The Dynamic Alerts System replaces the previous hardcoded risk alerts with a sophisticated, real-time risk assessment engine that analyzes actual shipment and product data from MongoDB to generate contextual alerts and recommendations.

## Key Features

### 🎯 **Real-Time Risk Assessment**
- Analyzes live shipment and product data from MongoDB
- Generates alerts based on actual supply chain conditions
- Provides contextual recommendations based on specific risk factors

### 🔍 **Multi-Factor Risk Analysis**
The system evaluates shipments based on 8 key risk factors:

1. **Delivery Delay Analysis**
   - Extended delays (>7 days): High risk
   - Moderate delays (3-7 days): Medium risk
   - Minor delays (<3 days): Low risk

2. **Shipment Status Monitoring**
   - Stuck shipments: Automatic High risk
   - Delayed shipments: Risk level based on delay duration

3. **Value-Based Risk Assessment**
   - High-value shipments (>$10,000): Elevated risk level
   - Additional insurance and monitoring recommendations

4. **Shipping Method Analysis**
   - Express shipping: Higher expectations, elevated risk
   - Service guarantee verification recommendations

5. **Risk Factor Aggregation**
   - Multiple risk factors (>2): Elevated risk level
   - Comprehensive risk factor review recommendations

6. **International Shipment Detection**
   - Long-distance shipments: Enhanced monitoring
   - Customs and documentation recommendations

7. **Product Risk Level Integration**
   - High-risk products: Additional quality checks
   - Supplier diversification recommendations

8. **Lead Time Performance**
   - Lead time vs actual delay ratio analysis
   - Supplier performance review recommendations

## Technical Implementation

### API Endpoint
```
GET /api/alerts
```

### Response Format
```json
{
  "alerts": [
    {
      "shipmentId": "string",
      "productName": "string",
      "status": "Delayed" | "Stuck",
      "origin": "string",
      "destination": "string",
      "expectedDelivery": "Date",
      "riskLevel": "Low" | "Medium" | "High",
      "suggestions": ["string"]
    }
  ],
  "summary": {
    "total": "number",
    "high": "number",
    "medium": "number",
    "low": "number"
  }
}
```

### Core Components

#### 1. Alert Generation Engine (`/lib/alert-utils.ts`)
- **`generateAlerts(shipments)`**: Main risk assessment function
- **`calculateAlertSummary(alerts)`**: Summary statistics calculation
- **`ShipmentForAlerts`**: TypeScript interface for shipment data

#### 2. API Route (`/app/api/alerts/route.ts`)
- Fetches shipments from MongoDB with populated product data
- Applies risk assessment logic
- Returns structured alerts and summary

#### 3. Database Integration
- Uses Mongoose models: `Shipment` and `Product`
- Populates product data for comprehensive analysis
- Filters active shipments (excludes delivered)

## Risk Assessment Logic

### Risk Level Determination
```typescript
// Base risk levels
Low: Default for minor issues
Medium: Moderate delays, high-value shipments, express shipping
High: Extended delays (>7 days), stuck shipments, multiple risk factors
```

### Suggestion Generation
Each risk factor generates specific, actionable recommendations:

- **Extended Delays**: Supplier alternatives, expedited shipping, customer communication
- **Stuck Shipments**: Customs documentation, broker contact, compliance review
- **High-Value Shipments**: Insurance coverage, enhanced tracking
- **International Shipments**: Customs monitoring, documentation verification
- **High-Risk Products**: Quality checks, supplier diversification

## Data Flow

1. **Data Fetching**: API retrieves shipments with populated product data
2. **Risk Analysis**: Each shipment evaluated against 8 risk factors
3. **Alert Generation**: Risk-based alerts created with contextual suggestions
4. **Sorting**: Alerts sorted by risk level and delay duration
5. **Summary Calculation**: Statistical summary of alert distribution
6. **Response**: Structured JSON response to frontend

## Integration Points

### Dashboard Integration
- **Component**: `AlertsSection.tsx`
- **Data Source**: `/api/alerts` endpoint
- **Display**: Risk level indicators, contextual suggestions, summary statistics

### Export Functionality
- **Component**: `ExportButton` and `ExportModal`
- **Data**: Alerts included in export data
- **Format**: Excel export with alert details

## Performance Optimizations

### Database Queries
- **Selective Population**: Only required product fields populated
- **Status Filtering**: Excludes delivered shipments
- **Indexing**: Leverages existing database indexes

### Caching Strategy
- **Real-Time Data**: No caching for live risk assessment
- **Efficient Sorting**: Client-side sorting for better performance

## Testing

### Test Data (`/lib/test-alerts.ts`)
- Sample shipments with various risk scenarios
- Comprehensive test cases for all risk factors
- Validation of alert generation logic

### Test Scenarios
1. **Extended Delay**: 10-day delayed shipment with high-value product
2. **Stuck Shipment**: International shipment with customs issues
3. **On-Time Shipment**: No risk factors, should not generate alerts

## Configuration

### Risk Thresholds
- **Extended Delay**: 7 days
- **Moderate Delay**: 3 days
- **High Value**: $10,000
- **Multiple Risk Factors**: >2 factors
- **Lead Time Ratio**: >50% delay vs lead time

### Customization
Risk thresholds and suggestion text can be easily modified in `/lib/alert-utils.ts`

## Benefits

### 🚀 **Real-Time Accuracy**
- Alerts based on actual current data
- No outdated hardcoded information
- Dynamic risk assessment

### 🎯 **Contextual Recommendations**
- Specific suggestions based on actual risk factors
- Actionable advice for supply chain managers
- Risk-level appropriate responses

### 📊 **Comprehensive Analysis**
- Multi-factor risk evaluation
- Product and shipment data integration
- Statistical summary for overview

### 🔄 **Scalable Architecture**
- Modular utility functions
- Reusable components
- Easy to extend with new risk factors

## Future Enhancements

### Potential Additions
1. **Weather Integration**: Real-time weather data for route analysis
2. **Market Conditions**: Economic factors affecting supply chain risk
3. **Historical Analysis**: Trend-based risk prediction
4. **Machine Learning**: Predictive risk assessment
5. **Real-Time Notifications**: Push notifications for critical alerts

### Performance Improvements
1. **Background Processing**: Scheduled alert generation
2. **Caching Layer**: Redis for frequently accessed data
3. **Batch Processing**: Efficient bulk alert generation

## Monitoring and Maintenance

### Logging
- Error logging for failed alert generation
- Performance metrics for API response times
- Risk factor distribution analytics

### Health Checks
- Database connectivity verification
- Alert generation success rate monitoring
- Data quality validation

---

This dynamic alerts system provides a robust, scalable foundation for real-time supply chain risk assessment, replacing static hardcoded alerts with intelligent, data-driven insights.
