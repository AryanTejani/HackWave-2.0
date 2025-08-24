// lib/alert-utils.ts
import { Alert } from '@/lib/types';

export interface ShipmentForAlerts {
  _id: string;
  productId?: {
    _id: string;
    name: string;
    category: string;
    supplier: string;
    origin: string;
    riskLevel?: string;
    leadTime?: number;
    unitCost?: number;
  };
  status: 'On-Time' | 'Delayed' | 'Stuck' | 'Delivered';
  origin: string;
  destination: string;
  expectedDelivery: Date;
  totalValue?: number;
  shippingMethod?: string;
  riskFactors?: string[];
}

// Enhanced risk detection & mitigation engine
export function generateAlerts(shipments: ShipmentForAlerts[]): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();

  shipments.forEach((shipment) => {
    if (shipment.status === 'Delivered') return;

    const daysDiff = Math.ceil((now.getTime() - new Date(shipment.expectedDelivery).getTime()) / (1000 * 60 * 60 * 24));
    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    let suggestions: string[] = [];

    // Enhanced risk assessment based on multiple factors
    const riskFactors: string[] = [];

    // Factor 1: Delivery delay
    if (shipment.status === 'Delayed') {
      if (daysDiff > 7) {
        riskFactors.push('extended_delay');
        riskLevel = 'High';
        suggestions = [
          'Consider alternate supplier for future orders',
          'Expedite shipping method',
          'Communicate with customer about delay',
          'Investigate supply chain bottlenecks',
          'Review carrier performance and consider alternatives'
        ];
      } else if (daysDiff > 3) {
        riskFactors.push('moderate_delay');
        riskLevel = 'Medium';
        suggestions = [
          'Monitor closely for further delays',
          'Contact shipping provider for updates',
          'Prepare customer communication',
          'Check for weather or route issues'
        ];
      } else {
        riskFactors.push('minor_delay');
        suggestions = [
          'Continue monitoring',
          'Check with logistics provider',
          'Verify tracking information'
        ];
      }
    }

    // Factor 2: Stuck shipments
    if (shipment.status === 'Stuck') {
      riskFactors.push('stuck_shipment');
      riskLevel = 'High';
      suggestions = [
        'Check customs clearance documentation',
        'Contact customs broker',
        'Review import/export compliance',
        'Consider alternate routing for future shipments',
        'Escalate to logistics manager',
        'Verify all required permits and licenses'
      ];
    }

    // Factor 3: High-value shipments (over $10,000)
    if (shipment.totalValue && shipment.totalValue > 10000) {
      riskFactors.push('high_value');
      if (riskLevel === 'Low') riskLevel = 'Medium';
      suggestions.push('Consider additional insurance coverage');
      suggestions.push('Implement enhanced tracking and monitoring');
    }

    // Factor 4: Express shipping method (higher expectations)
    if (shipment.shippingMethod === 'Express') {
      riskFactors.push('express_shipping');
      if (riskLevel === 'Low') riskLevel = 'Medium';
      suggestions.push('Verify express service guarantees');
    }

    // Factor 5: Multiple risk factors in shipment data
    if (shipment.riskFactors && shipment.riskFactors.length > 2) {
      riskFactors.push('multiple_risk_factors');
      if (riskLevel === 'Low') riskLevel = 'Medium';
      suggestions.push('Review and address identified risk factors');
    }

    // Factor 6: Long-distance shipments (international)
    const isInternational = shipment.origin !== shipment.destination && 
                           (shipment.origin.includes(',') || shipment.destination.includes(','));
    if (isInternational) {
      riskFactors.push('international_shipment');
      if (riskLevel === 'Low') riskLevel = 'Medium';
      suggestions.push('Monitor customs and border clearance');
      suggestions.push('Verify international shipping documentation');
    }

    // Factor 7: Product risk level consideration
    if (shipment.productId && shipment.productId.riskLevel === 'high') {
      riskFactors.push('high_risk_product');
      if (riskLevel === 'Low') riskLevel = 'Medium';
      suggestions.push('Implement additional quality checks');
      suggestions.push('Consider supplier diversification');
    }

    // Factor 8: Lead time vs actual delay
    if (shipment.productId && shipment.productId.leadTime) {
      const leadTimeDays = shipment.productId.leadTime;
      const delayRatio = daysDiff / leadTimeDays;
      if (delayRatio > 0.5) {
        riskFactors.push('significant_lead_time_delay');
        if (riskLevel === 'Low') riskLevel = 'Medium';
        suggestions.push('Review supplier lead time commitments');
      }
    }

    // Only create alerts for shipments with actual risks
    if (shipment.status === 'Delayed' || shipment.status === 'Stuck' || riskFactors.length > 0) {
      alerts.push({
        shipmentId: shipment._id.toString(),
        productName: shipment.productId?.name || 'Unknown Product',
        status: shipment.status as 'Delayed' | 'Stuck',
        origin: shipment.origin,
        destination: shipment.destination,
        expectedDelivery: shipment.expectedDelivery,
        riskLevel,
        suggestions: [...new Set(suggestions)], // Remove duplicates
      });
    }
  });

  // Sort by risk level (High -> Medium -> Low) and then by delay days
  return alerts.sort((a, b) => {
    const riskOrder = { High: 3, Medium: 2, Low: 1 };
    const riskDiff = riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
    if (riskDiff !== 0) return riskDiff;
    
    // If same risk level, sort by delay days (most delayed first)
    const aDays = Math.ceil((now.getTime() - new Date(a.expectedDelivery).getTime()) / (1000 * 60 * 60 * 24));
    const bDays = Math.ceil((now.getTime() - new Date(b.expectedDelivery).getTime()) / (1000 * 60 * 60 * 24));
    return bDays - aDays;
  });
}

// Helper function to calculate alert summary
export function calculateAlertSummary(alerts: Alert[]) {
  return {
    total: alerts.length,
    high: alerts.filter(a => a.riskLevel === 'High').length,
    medium: alerts.filter(a => a.riskLevel === 'Medium').length,
    low: alerts.filter(a => a.riskLevel === 'Low').length,
  };
}
