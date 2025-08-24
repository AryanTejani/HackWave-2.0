// lib/impact-simulator.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  type: 'port_closure' | 'supplier_disruption' | 'route_blockage' | 'weather_event' | 'geopolitical';
  location: string;
  duration: number; // days
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedElements: string[];
  probability: number; // 0-1
  createdAt: Date;
}

export interface SimulationResult {
  scenarioId: string;
  scenarioName: string;
  kpis: KPIImpact;
  affectedShipments: AffectedShipment[];
  costImpact: CostImpact;
  timeline: TimelineEvent[];
  recommendations: string[];
  confidence: number;
  createdAt: Date;
}

export interface KPIImpact {
  onTimePercentage: number; // Before vs After
  averageDelay: number; // days
  totalCostIncrease: number; // percentage
  affectedRevenue: number; // percentage
  customerSatisfaction: number; // 0-100
  supplyChainResilience: number; // 0-100
}

export interface AffectedShipment {
  shipmentId: string;
  trackingNumber: string;
  productName: string;
  originalETA: Date;
  newETA: Date;
  delayDays: number;
  additionalCost: number;
  status: 'on_time' | 'delayed' | 'critical' | 'cancelled';
  alternativeRoutes: string[];
}

export interface CostImpact {
  totalAdditionalCost: number;
  costBreakdown: {
    rerouting: number;
    expeditedShipping: number;
    inventoryHolding: number;
    customerCompensation: number;
    operationalOverhead: number;
  };
  costPerShipment: number;
  percentageIncrease: number;
}

export interface TimelineEvent {
  day: number;
  event: string;
  impact: string;
  affectedShipments: number;
  cumulativeCost: number;
}

export class ImpactSimulator {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Predefined scenarios
  private readonly SCENARIOS: SimulationScenario[] = [
    {
      id: 'scenario_001',
      name: 'Red Sea Port Closure',
      description: 'Complete closure of major ports in the Red Sea region due to geopolitical tensions',
      type: 'geopolitical',
      location: 'Red Sea',
      duration: 30,
      severity: 'high',
      affectedElements: ['Jeddah', 'Aqaba', 'Eilat', 'Suez Canal'],
      probability: 0.3,
      createdAt: new Date()
    },
    {
      id: 'scenario_002',
      name: 'Shanghai Port Congestion',
      description: 'Severe congestion at Shanghai port affecting container availability and processing',
      type: 'port_closure',
      location: 'Shanghai',
      duration: 14,
      severity: 'medium',
      affectedElements: ['Shanghai Port', 'Ningbo Port'],
      probability: 0.4,
      createdAt: new Date()
    },
    {
      id: 'scenario_003',
      name: 'Major Supplier Disruption',
      description: 'Critical supplier experiencing production issues affecting multiple product lines',
      type: 'supplier_disruption',
      location: 'China',
      duration: 21,
      severity: 'high',
      affectedElements: ['Electronics Supplier', 'Component Manufacturer'],
      probability: 0.25,
      createdAt: new Date()
    },
    {
      id: 'scenario_004',
      name: 'Pacific Storm System',
      description: 'Tropical storm system affecting shipping routes across the Pacific Ocean',
      type: 'weather_event',
      location: 'Pacific Ocean',
      duration: 7,
      severity: 'medium',
      affectedElements: ['Pacific Routes', 'Asian Ports'],
      probability: 0.5,
      createdAt: new Date()
    },
    {
      id: 'scenario_005',
      name: 'LA Port Labor Strike',
      description: 'Labor dispute at Los Angeles port causing significant delays',
      type: 'port_closure',
      location: 'Los Angeles',
      duration: 10,
      severity: 'medium',
      affectedElements: ['Los Angeles Port', 'Long Beach Port'],
      probability: 0.2,
      createdAt: new Date()
    }
  ];

  async simulateDisruption(
    scenarioId: string,
    context: {
      shipments: any[];
      products: any[];
      suppliers: any[];
    }
  ): Promise<SimulationResult> {
    const scenario = this.SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) {
      throw new Error('Scenario not found');
    }

    // Find affected shipments
    const affectedShipments = this.identifyAffectedShipments(scenario, context.shipments);
    
    // Calculate KPI impacts
    const kpis = this.calculateKPIImpact(scenario, affectedShipments, context.shipments);
    
    // Calculate cost impacts
    const costImpact = this.calculateCostImpact(scenario, affectedShipments);
    
    // Generate timeline
    const timeline = this.generateTimeline(scenario, affectedShipments);
    
    // Generate AI recommendations
    const recommendations = await this.generateSimulationRecommendations(scenario, affectedShipments, kpis);

    return {
      scenarioId,
      scenarioName: scenario.name,
      kpis,
      affectedShipments,
      costImpact,
      timeline,
      recommendations,
      confidence: 0.85,
      createdAt: new Date()
    };
  }

  private identifyAffectedShipments(scenario: SimulationScenario, shipments: any[]): AffectedShipment[] {
    const affected: AffectedShipment[] = [];

    shipments.forEach(shipment => {
      const origin = shipment.origin?.toLowerCase() || '';
      const destination = shipment.destination?.toLowerCase() || '';
      
      // Check if shipment is affected by scenario
      const isAffected = scenario.affectedElements.some(element => 
        origin.includes(element.toLowerCase()) ||
        destination.includes(element.toLowerCase()) ||
        shipment.carrier?.toLowerCase().includes(element.toLowerCase())
      );

      if (isAffected) {
        const delayDays = this.calculateDelayDays(scenario);
        const originalETA = new Date(shipment.expectedDelivery);
        const newETA = new Date(originalETA.getTime() + delayDays * 24 * 60 * 60 * 1000);
        const additionalCost = this.calculateAdditionalCost(shipment, scenario);

        affected.push({
          shipmentId: shipment._id.toString(),
          trackingNumber: shipment.trackingNumber || 'Unknown',
          productName: shipment.productId?.name || 'Unknown Product',
          originalETA,
          newETA,
          delayDays,
          additionalCost,
          status: this.determineShipmentStatus(delayDays),
          alternativeRoutes: this.generateAlternativeRoutes(shipment, scenario)
        });
      }
    });

    return affected;
  }

  private calculateDelayDays(scenario: SimulationScenario): number {
    const baseDelay = scenario.duration * 0.7; // 70% of scenario duration
    const severityMultiplier = {
      'low': 0.5,
      'medium': 1.0,
      'high': 1.5,
      'critical': 2.0
    };

    return Math.round(baseDelay * severityMultiplier[scenario.severity]);
  }

  private calculateAdditionalCost(shipment: any, scenario: SimulationScenario): number {
    const baseValue = shipment.totalValue || 1000;
    const severityMultiplier = {
      'low': 0.05,
      'medium': 0.15,
      'high': 0.25,
      'critical': 0.4
    };

    return baseValue * severityMultiplier[scenario.severity];
  }

  private determineShipmentStatus(delayDays: number): 'on_time' | 'delayed' | 'critical' | 'cancelled' {
    if (delayDays <= 0) return 'on_time';
    if (delayDays <= 7) return 'delayed';
    if (delayDays <= 21) return 'critical';
    return 'cancelled';
  }

  private generateAlternativeRoutes(shipment: any, scenario: SimulationScenario): string[] {
    const origin = shipment.origin;
    const destination = shipment.destination;
    
    // Simple alternative route generation
    const alternatives = [];
    
    if (scenario.location.toLowerCase().includes('red sea')) {
      alternatives.push('Cape of Good Hope Route');
      alternatives.push('Suez Canal Alternative');
    } else if (scenario.location.toLowerCase().includes('shanghai')) {
      alternatives.push('Ningbo Port Route');
      alternatives.push('Busan Port Route');
    } else if (scenario.location.toLowerCase().includes('los angeles')) {
      alternatives.push('Seattle Port Route');
      alternatives.push('Vancouver Port Route');
    } else {
      alternatives.push('Alternative Route 1');
      alternatives.push('Alternative Route 2');
    }

    return alternatives;
  }

  private calculateKPIImpact(
    scenario: SimulationScenario,
    affectedShipments: AffectedShipment[],
    allShipments: any[]
  ): KPIImpact {
    const totalShipments = allShipments.length;
    const affectedCount = affectedShipments.length;
    
    // Calculate on-time percentage
    const originalOnTime = allShipments.filter(s => s.status === 'On-Time').length;
    const newOnTime = originalOnTime - affectedShipments.filter(s => s.status !== 'on_time').length;
    const onTimePercentage = totalShipments > 0 ? (newOnTime / totalShipments) * 100 : 100;

    // Calculate average delay
    const totalDelay = affectedShipments.reduce((sum, s) => sum + s.delayDays, 0);
    const averageDelay = affectedCount > 0 ? totalDelay / affectedCount : 0;

    // Calculate cost impact
    const totalAdditionalCost = affectedShipments.reduce((sum, s) => sum + s.additionalCost, 0);
    const totalValue = allShipments.reduce((sum, s) => sum + (s.totalValue || 0), 0);
    const totalCostIncrease = totalValue > 0 ? (totalAdditionalCost / totalValue) * 100 : 0;

    // Calculate affected revenue (simplified)
    const affectedRevenue = (affectedCount / totalShipments) * 100;

    // Calculate customer satisfaction (inverse relationship with delays)
    const customerSatisfaction = Math.max(0, 100 - (averageDelay * 5));

    // Calculate supply chain resilience
    const resilience = Math.max(0, 100 - (affectedCount / totalShipments) * 100);

    return {
      onTimePercentage,
      averageDelay,
      totalCostIncrease,
      affectedRevenue,
      customerSatisfaction,
      supplyChainResilience: resilience
    };
  }

  private calculateCostImpact(scenario: SimulationScenario, affectedShipments: AffectedShipment[]): CostImpact {
    const totalAdditionalCost = affectedShipments.reduce((sum, s) => sum + s.additionalCost, 0);
    
    // Break down costs by category
    const costBreakdown = {
      rerouting: totalAdditionalCost * 0.4,
      expeditedShipping: totalAdditionalCost * 0.25,
      inventoryHolding: totalAdditionalCost * 0.15,
      customerCompensation: totalAdditionalCost * 0.15,
      operationalOverhead: totalAdditionalCost * 0.05
    };

    const costPerShipment = affectedShipments.length > 0 ? totalAdditionalCost / affectedShipments.length : 0;
    
    // Calculate percentage increase (simplified)
    const totalValue = affectedShipments.reduce((sum, s) => sum + (s.additionalCost * 6.67), 0); // Rough estimate
    const percentageIncrease = totalValue > 0 ? (totalAdditionalCost / totalValue) * 100 : 0;

    return {
      totalAdditionalCost,
      costBreakdown,
      costPerShipment,
      percentageIncrease
    };
  }

  private generateTimeline(scenario: SimulationScenario, affectedShipments: AffectedShipment[]): TimelineEvent[] {
    const timeline: TimelineEvent[] = [];
    const totalCost = affectedShipments.reduce((sum, s) => sum + s.additionalCost, 0);

    // Day 1: Initial impact
    timeline.push({
      day: 1,
      event: `${scenario.name} begins`,
      impact: `${affectedShipments.length} shipments affected`,
      affectedShipments: affectedShipments.length,
      cumulativeCost: totalCost * 0.1
    });

    // Day 3: Escalation
    timeline.push({
      day: 3,
      event: 'Disruption escalates',
      impact: 'Alternative routes activated',
      affectedShipments: affectedShipments.length,
      cumulativeCost: totalCost * 0.3
    });

    // Day 7: Peak impact
    timeline.push({
      day: 7,
      event: 'Peak disruption period',
      impact: 'Maximum delays and costs incurred',
      affectedShipments: affectedShipments.length,
      cumulativeCost: totalCost * 0.6
    });

    // Day 14: Recovery begins
    timeline.push({
      day: 14,
      event: 'Recovery operations begin',
      impact: 'Gradual return to normal operations',
      affectedShipments: Math.floor(affectedShipments.length * 0.7),
      cumulativeCost: totalCost * 0.8
    });

    // Day 30: Full recovery
    timeline.push({
      day: scenario.duration,
      event: 'Full recovery achieved',
      impact: 'All systems back to normal',
      affectedShipments: 0,
      cumulativeCost: totalCost
    });

    return timeline;
  }

  private async generateSimulationRecommendations(
    scenario: SimulationScenario,
    affectedShipments: AffectedShipment[],
    kpis: KPIImpact
  ): Promise<string[]> {
    try {
      const prompt = `
        Given this disruption simulation:
        Scenario: ${scenario.name}
        Type: ${scenario.type}
        Severity: ${scenario.severity}
        Affected Shipments: ${affectedShipments.length}
        On-Time Percentage: ${kpis.onTimePercentage.toFixed(1)}%
        Average Delay: ${kpis.averageDelay.toFixed(1)} days
        Cost Increase: ${kpis.totalCostIncrease.toFixed(1)}%
        
        Provide 5 specific, actionable recommendations to mitigate this disruption.
        Focus on immediate actions, medium-term strategies, and long-term resilience building.
        Return as a numbered list of recommendations.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const recommendations = response.text().split('\n').filter(rec => rec.trim());
      
      return recommendations.slice(0, 5);
    } catch (error) {
      console.error('Error generating simulation recommendations:', error);
      return [
        'Activate emergency response protocols immediately',
        'Communicate proactively with affected customers',
        'Implement alternative routing strategies',
        'Increase inventory buffers for critical products',
        'Develop long-term supplier diversification plan'
      ];
    }
  }

  async runWhatIfAnalysis(
    scenario: Partial<SimulationScenario>,
    context: {
      shipments: any[];
      products: any[];
      suppliers: any[];
    }
  ): Promise<SimulationResult> {
    // Create a custom scenario
    const customScenario: SimulationScenario = {
      id: `custom_${Date.now()}`,
      name: scenario.name || 'Custom Scenario',
      description: scenario.description || 'Custom disruption scenario',
      type: scenario.type || 'port_closure',
      location: scenario.location || 'Unknown',
      duration: scenario.duration || 14,
      severity: scenario.severity || 'medium',
      affectedElements: scenario.affectedElements || [],
      probability: scenario.probability || 0.3,
      createdAt: new Date()
    };

    return this.simulateDisruption(customScenario.id, context);
  }

  getAvailableScenarios(): SimulationScenario[] {
    return this.SCENARIOS;
  }

  async compareScenarios(
    scenarioIds: string[],
    context: {
      shipments: any[];
      products: any[];
      suppliers: any[];
    }
  ): Promise<{
    scenarios: SimulationScenario[];
    results: SimulationResult[];
    comparison: {
      worstCase: SimulationResult;
      bestCase: SimulationResult;
      averageImpact: KPIImpact;
    };
  }> {
    const scenarios = this.SCENARIOS.filter(s => scenarioIds.includes(s.id));
    const results = await Promise.all(
      scenarios.map(s => this.simulateDisruption(s.id, context))
    );

    // Find worst and best cases
    const worstCase = results.reduce((worst, current) => 
      current.kpis.totalCostIncrease > worst.kpis.totalCostIncrease ? current : worst
    );
    
    const bestCase = results.reduce((best, current) => 
      current.kpis.totalCostIncrease < best.kpis.totalCostIncrease ? current : best
    );

    // Calculate average impact
    const averageImpact: KPIImpact = {
      onTimePercentage: results.reduce((sum, r) => sum + r.kpis.onTimePercentage, 0) / results.length,
      averageDelay: results.reduce((sum, r) => sum + r.kpis.averageDelay, 0) / results.length,
      totalCostIncrease: results.reduce((sum, r) => sum + r.kpis.totalCostIncrease, 0) / results.length,
      affectedRevenue: results.reduce((sum, r) => sum + r.kpis.affectedRevenue, 0) / results.length,
      customerSatisfaction: results.reduce((sum, r) => sum + r.kpis.customerSatisfaction, 0) / results.length,
      supplyChainResilience: results.reduce((sum, r) => sum + r.kpis.supplyChainResilience, 0) / results.length
    };

    return {
      scenarios,
      results,
      comparison: {
        worstCase,
        bestCase,
        averageImpact
      }
    };
  }
}

// Export singleton instance
export const impactSimulator = new ImpactSimulator();
