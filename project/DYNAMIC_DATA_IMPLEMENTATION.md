# Dynamic Data Implementation with Serp API

This document outlines the implementation of dynamic data fetching using Serp API to replace hardcoded data throughout the HackWave 2.0 application.

## Overview

The application now uses real-time data from various sources including:
- Supply chain news and disruptions
- Weather conditions for key shipping locations
- Global supply chain conditions and alerts
- Supplier intelligence and performance data
- Market data including shipping rates and fuel prices

## API Configuration

### Environment Variables

Add the following to your `.env.local` file:

```bash
YOUR_SEARCH_API_KEY=your_serp_api_key_here
```

### Getting a Serp API Key

1. Visit [SerpAPI](https://serpapi.com/)
2. Sign up for an account
3. Get your API key from the dashboard
4. Add it to your environment variables

## Enhanced Tools Library (`src/lib/tools.ts`)

The tools library has been significantly enhanced with the following new functions:

### Core Functions

#### `getSupplyChainNews(limit: number)`
- Fetches latest supply chain news and disruptions
- Searches multiple queries for comprehensive coverage
- Returns structured news items with titles, snippets, and sources

#### `getWeatherData(locations: string[])`
- Fetches weather information for specified locations
- Extracts temperature, conditions, and forecasts
- Useful for shipping route planning and risk assessment

#### `getGlobalConditions()`
- Monitors global supply chain conditions
- Analyzes severity and impact of disruptions
- Provides real-time insights for risk management

#### `getSupplyChainAlerts()`
- Generates dynamic supply chain alerts
- Covers geopolitical, weather, port, and regulatory issues
- Includes probability assessments and mitigation actions

#### `getSupplierIntelligence(supplierNames: string[])`
- Analyzes supplier performance and risk levels
- Searches for company news and financial performance
- Provides real-time supplier risk assessments

#### `getMarketData()`
- Fetches current shipping rates and market trends
- Monitors container prices and fuel costs
- Provides market trend analysis

## Updated Components

### 1. Risk Management (`src/app/admin-dashboard/components/risk-management.tsx`)

**Changes Made:**
- Replaced hardcoded risk alerts with dynamic data from `getSupplyChainAlerts()`
- Added global conditions monitoring with `getGlobalConditions()`
- Implemented dynamic risk score calculation based on real alerts
- Added fallback mechanisms for API failures

**New Features:**
- Real-time risk assessment based on current global conditions
- Dynamic severity calculation from actual news and reports
- Automatic risk score updates based on alert frequency and severity

### 2. Product Management (`src/app/admin-dashboard/components/product-management.tsx`)

**Changes Made:**
- Replaced hardcoded supplier data with dynamic intelligence
- Integrated `getSupplierIntelligence()` for real-time supplier analysis
- Added supplier risk assessment based on news sentiment

**New Features:**
- Real-time supplier performance monitoring
- Dynamic risk level assessment based on company news
- Automatic supplier status updates

### 3. AI Intelligence (`src/app/admin-dashboard/components/ai-intelligence.tsx`)

**Changes Made:**
- Integrated supply chain news for AI insights
- Added market data analysis for optimization recommendations
- Implemented dynamic global conditions monitoring

**New Features:**
- AI insights based on real market conditions
- Dynamic optimization recommendations
- Real-time risk alerts integration

### 4. Dashboard Overview (`src/app/admin-dashboard/components/dashboard-overview.tsx`)

**Changes Made:**
- Added dynamic recent activity based on real news
- Integrated market trend alerts
- Implemented supply chain news updates

**New Features:**
- Real-time activity feed based on actual events
- Market trend monitoring and alerts
- Dynamic news integration

### 5. Analytics (`src/app/admin-dashboard/components/analytics.tsx`)

**Changes Made:**
- Added market data integration
- Implemented supply chain news monitoring
- Enhanced analytics with real-time data

## New API Route

### Dynamic Data API (`src/app/api/dynamic-data/route.ts`)

A new API route has been created to handle all dynamic data fetching:

**Endpoints:**
- `GET /api/dynamic-data?type=news&limit=10` - Fetch supply chain news
- `GET /api/dynamic-data?type=weather&locations=Shanghai,LA,Rotterdam` - Fetch weather data
- `GET /api/dynamic-data?type=conditions` - Fetch global conditions
- `GET /api/dynamic-data?type=alerts` - Fetch supply chain alerts
- `GET /api/dynamic-data?type=suppliers&names=Foxconn,Samsung,TSMC` - Fetch supplier intelligence
- `GET /api/dynamic-data?type=market` - Fetch market data
- `GET /api/dynamic-data?type=all` - Fetch all data types

## Data Types

### NewsItem
```typescript
interface NewsItem {
  title: string;
  snippet: string;
  link: string;
  source: string;
  publishedDate?: string;
}
```

### WeatherData
```typescript
interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
  }>;
}
```

### GlobalCondition
```typescript
interface GlobalCondition {
  region: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  sources: string[];
  lastUpdated: string;
}
```

### SupplyChainAlert
```typescript
interface SupplyChainAlert {
  id: string;
  type: 'geopolitical' | 'weather' | 'port_closure' | 'trade_disruption' | 'labor_strike' | 'regulatory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  region: string;
  title: string;
  description: string;
  impact: string;
  detectedAt: Date;
  sources: string[];
  affectedRoutes: string[];
  estimatedDuration: string;
  mitigationActions: string[];
  probability: number;
}
```

### SupplierInfo
```typescript
interface SupplierInfo {
  id: string;
  name: string;
  location: string;
  rating: number;
  products: number;
  status: 'active' | 'inactive' | 'suspended';
  riskLevel: 'low' | 'medium' | 'high';
  lastUpdated: string;
}
```

## Error Handling

All functions include comprehensive error handling:

1. **API Key Validation**: Checks for valid API key before making requests
2. **Network Error Handling**: Catches and logs network errors
3. **Fallback Mechanisms**: Provides default data when APIs fail
4. **Rate Limiting**: Implements delays between requests to avoid rate limits

## Performance Considerations

1. **Parallel Requests**: Uses `Promise.all()` for concurrent API calls
2. **Caching**: Consider implementing caching for frequently accessed data
3. **Request Optimization**: Limits number of requests per component
4. **Error Recovery**: Graceful degradation when APIs are unavailable

## Usage Examples

### Fetching Supply Chain News
```typescript
import { getSupplyChainNews } from '@/lib/tools';

const news = await getSupplyChainNews(10);
console.log(news); // Array of NewsItem objects
```

### Getting Weather Data
```typescript
import { getWeatherData } from '@/lib/tools';

const weather = await getWeatherData(['Shanghai', 'Los Angeles', 'Rotterdam']);
console.log(weather); // Array of WeatherData objects
```

### Fetching Supplier Intelligence
```typescript
import { getSupplierIntelligence } from '@/lib/tools';

const suppliers = await getSupplierIntelligence(['Foxconn', 'Samsung', 'TSMC']);
console.log(suppliers); // Array of SupplierInfo objects
```

## Future Enhancements

1. **Caching Layer**: Implement Redis or in-memory caching
2. **WebSocket Integration**: Real-time updates for critical alerts
3. **Machine Learning**: AI-powered risk prediction based on historical data
4. **Geographic Visualization**: Map-based display of global conditions
5. **Custom Alerts**: User-defined alert thresholds and notifications

## Troubleshooting

### Common Issues

1. **API Key Not Found**: Ensure `YOUR_SEARCH_API_KEY` is set in `.env.local`
2. **Rate Limiting**: Implement delays between requests if hitting rate limits
3. **Network Errors**: Check internet connection and API availability
4. **Data Parsing Errors**: Verify API response format hasn't changed

### Debug Mode

Enable debug logging by adding to your environment:
```bash
DEBUG_DYNAMIC_DATA=true
```

This will log all API requests and responses for debugging purposes.

## Conclusion

The implementation successfully replaces all hardcoded data with dynamic, real-time information from Serp API. The system is now more responsive to current market conditions and provides actionable insights based on live data rather than static mock data.

