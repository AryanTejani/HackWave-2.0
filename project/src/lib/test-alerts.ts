// lib/test-alerts.ts
import { generateAlerts, calculateAlertSummary } from './alert-utils';

// Test data to verify alert generation
const testShipments = [
  {
    _id: '1',
    productId: {
      _id: 'p1',
      name: 'Test Product 1',
      category: 'Electronics',
      supplier: 'Test Supplier',
      origin: 'China',
      riskLevel: 'high',
      leadTime: 14,
      unitCost: 500
    },
    status: 'Delayed' as const,
    origin: 'Shanghai, China',
    destination: 'New York, USA',
    expectedDelivery: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    totalValue: 15000,
    shippingMethod: 'Express',
    riskFactors: ['weather', 'customs', 'carrier_delay']
  },
  {
    _id: '2',
    productId: {
      _id: 'p2',
      name: 'Test Product 2',
      category: 'Clothing',
      supplier: 'Another Supplier',
      origin: 'India',
      riskLevel: 'medium',
      leadTime: 21,
      unitCost: 25
    },
    status: 'Stuck' as const,
    origin: 'Mumbai, India',
    destination: 'London, UK',
    expectedDelivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    totalValue: 5000,
    shippingMethod: 'Sea',
    riskFactors: ['customs_clearance']
  },
  {
    _id: '3',
    productId: {
      _id: 'p3',
      name: 'Test Product 3',
      category: 'Food',
      supplier: 'Local Supplier',
      origin: 'California',
      riskLevel: 'low',
      leadTime: 7,
      unitCost: 10
    },
    status: 'On-Time' as const,
    origin: 'Los Angeles, CA',
    destination: 'Seattle, WA',
    expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    totalValue: 2000,
    shippingMethod: 'Land',
    riskFactors: []
  }
];

export function testAlertGeneration() {
  console.log('Testing Alert Generation...\n');
  
  const alerts = generateAlerts(testShipments);
  const summary = calculateAlertSummary(alerts);
  
  console.log('Generated Alerts:', alerts.length);
  console.log('Summary:', summary);
  
  alerts.forEach((alert, index) => {
    console.log(`\nAlert ${index + 1}:`);
    console.log(`- Product: ${alert.productName}`);
    console.log(`- Status: ${alert.status}`);
    console.log(`- Risk Level: ${alert.riskLevel}`);
    console.log(`- Route: ${alert.origin} → ${alert.destination}`);
    console.log(`- Expected Delivery: ${alert.expectedDelivery.toLocaleDateString()}`);
    console.log(`- Suggestions: ${alert.suggestions.length} items`);
    alert.suggestions.forEach((suggestion, i) => {
      console.log(`  ${i + 1}. ${suggestion}`);
    });
  });
  
  return { alerts, summary };
}

// Uncomment to run test
// testAlertGeneration();
