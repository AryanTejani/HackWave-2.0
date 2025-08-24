// lib/multi-agent-system.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from './mongo';
import { Shipment } from '@/models/Shipment';
import { Product } from '@/models/Product';
import { Supplier } from '@/models/Supplier';
import { SupplyChain } from '@/models/SupplyChain';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface RiskAlert {
  id: string;
  type: 'geopolitical' | 'weather' | 'port_closure' | 'trade_disruption' | 'labor_strike' | 'regulatory' | 'supplier_risk' | 'logistics_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  region: string;
  title: string;
  description: string;
  impact: string;
  affectedShipments: string[];
  affectedProducts: string[];
  detectedAt: Date;
  sources: string[];
}

export interface SimulationResult {
  originalRoute: RouteInfo;
  disruptionImpact: {
    delayDays: number;
    additionalCost: number;
    affectedShipments: number;
    riskLevel: string;
  };
  alternatives: AlternativeRoute[];
}

export interface RouteInfo {
  origin: string;
  transit: string[];
  destination: string;
  distance: number;
  duration: number;
  cost: number;
}

export interface AlternativeRoute extends RouteInfo {
  recommendation: string;
  pros: string[];
  cons: string[];
  riskReduction: number;
}

export interface StrategyRecommendation {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
  contingencyPlans: string[];
}

export interface SupplyChainContext {
  shipments: any[];
  products: any[];
  suppliers: any[];
  supplyChains: any[];
  userId: string;
}

/**
 * Agent 1: Risk Monitor
 * Analyzes user's actual supply chain data to detect real risks
 */
export class RiskMonitorAgent {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async detectRisks(userId: string): Promise<RiskAlert[]> {
    try {
      await connectToDatabase();
      
      // Get user's actual supply chain data
      const shipments = await Shipment.find({ userId }).populate('productId');
      const products = await Product.find({ userId });
      const suppliers = await Supplier.find({ userId });
      const supplyChains = await SupplyChain.find({ userId });

      if (shipments.length === 0) {
        return [];
      }

      // Analyze actual data for risks
      const risks: RiskAlert[] = [];

      // Check for delayed/stuck shipments
      const delayedShipments = shipments.filter(s => s.status === 'Delayed' || s.status === 'Stuck');
      if (delayedShipments.length > 0) {
        risks.push({
          id: `risk_${Date.now()}_1`,
          type: 'logistics_risk',
          severity: delayedShipments.length > 2 ? 'high' : 'medium',
          region: 'Global',
          title: 'Shipment Delays Detected',
          description: `${delayedShipments.length} shipments are currently delayed or stuck in transit`,
          impact: 'Potential delivery delays and customer satisfaction issues',
          affectedShipments: delayedShipments.map(s => s._id.toString()),
          affectedProducts: delayedShipments.map(s => s.productId?.name || 'Unknown'),
          detectedAt: new Date(),
          sources: ['Shipment Status Analysis']
        });
      }

      // Check for high-value shipments
      const highValueShipments = shipments.filter(s => s.totalValue > 10000);
      if (highValueShipments.length > 0) {
        risks.push({
          id: `risk_${Date.now()}_2`,
          type: 'supplier_risk',
          severity: 'medium',
          region: 'Global',
          title: 'High-Value Shipments in Transit',
          description: `${highValueShipments.length} high-value shipments (over $10K) are currently in transit`,
          impact: 'Increased financial risk and insurance requirements',
          affectedShipments: highValueShipments.map(s => s._id.toString()),
          affectedProducts: highValueShipments.map(s => s.productId?.name || 'Unknown'),
          detectedAt: new Date(),
          sources: ['Shipment Value Analysis']
        });
      }

      // Check for supplier concentration risk
      const supplierCounts = suppliers.reduce((acc, supplier) => {
        acc[supplier.name] = (acc[supplier.name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const highConcentrationSuppliers = Object.entries(supplierCounts)
        .filter(([_, count]) => count > 3)
        .map(([name, count]) => ({ name, count }));

      if (highConcentrationSuppliers.length > 0) {
        risks.push({
          id: `risk_${Date.now()}_3`,
          type: 'supplier_risk',
          severity: 'medium',
          region: 'Global',
          title: 'Supplier Concentration Risk',
          description: `High dependency on ${highConcentrationSuppliers.length} suppliers with multiple products`,
          impact: 'Single point of failure risk if supplier issues arise',
          affectedShipments: [],
          affectedProducts: products.filter(p => highConcentrationSuppliers.some(s => s.name === p.supplier)).map(p => p.name),
          detectedAt: new Date(),
          sources: ['Supplier Analysis']
        });
      }

      // Check for long lead time products
      const longLeadTimeProducts = products.filter(p => p.leadTime > 60);
      if (longLeadTimeProducts.length > 0) {
        risks.push({
          id: `risk_${Date.now()}_4`,
          type: 'supplier_risk',
          severity: 'low',
          region: 'Global',
          title: 'Long Lead Time Products',
          description: `${longLeadTimeProducts.length} products have lead times over 60 days`,
          impact: 'Reduced flexibility and increased planning requirements',
          affectedShipments: [],
          affectedProducts: longLeadTimeProducts.map(p => p.name),
          detectedAt: new Date(),
          sources: ['Product Lead Time Analysis']
        });
      }

      return risks;
    } catch (error) {
      console.error('Error detecting risks:', error);
      return [];
    }
  }
}

/**
 * Agent 2: Impact Simulator
 * Simulates impact of disruptions on user's actual shipments
 */
export class ImpactSimulatorAgent {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async simulateImpact(userId: string, scenario: string): Promise<SimulationResult> {
    try {
      await connectToDatabase();
      
      // Get user's actual shipments
      const shipments = await Shipment.find({ userId }).populate('productId');
      
      if (shipments.length === 0) {
        return {
          originalRoute: {
            origin: 'N/A',
            transit: [],
            destination: 'N/A',
            distance: 0,
            duration: 0,
            cost: 0
          },
          disruptionImpact: {
            delayDays: 0,
            additionalCost: 0,
            affectedShipments: 0,
            riskLevel: 'low'
          },
          alternatives: []
        };
      }

      // Calculate baseline metrics
      const totalValue = shipments.reduce((sum, s) => sum + s.totalValue, 0);
      const avgDeliveryTime = shipments.reduce((sum, s) => {
        const expected = new Date(s.expectedDelivery);
        const created = new Date(s.createdAt);
        return sum + Math.ceil((expected.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      }, 0) / shipments.length;

      // Simulate impact based on scenario
      let delayDays = 0;
      let additionalCost = 0;
      let affectedShipments = 0;

      switch (scenario.toLowerCase()) {
        case 'port congestion':
          delayDays = 7;
          additionalCost = totalValue * 0.15;
          affectedShipments = shipments.filter(s => s.shippingMethod === 'Sea').length;
          break;
        case 'weather disruption':
          delayDays = 3;
          additionalCost = totalValue * 0.08;
          affectedShipments = shipments.length;
          break;
        case 'supplier issue':
          delayDays = 14;
          additionalCost = totalValue * 0.25;
          affectedShipments = shipments.length;
          break;
        case 'customs delay':
          delayDays = 5;
          additionalCost = totalValue * 0.12;
          affectedShipments = shipments.filter(s => s.status === 'Stuck').length;
          break;
        default:
          delayDays = 5;
          additionalCost = totalValue * 0.10;
          affectedShipments = Math.ceil(shipments.length * 0.3);
      }

      const riskLevel = additionalCost > totalValue * 0.2 ? 'high' : 
                       additionalCost > totalValue * 0.1 ? 'medium' : 'low';

      return {
        originalRoute: {
          origin: 'Multiple Origins',
          transit: ['Various Routes'],
          destination: 'Multiple Destinations',
          distance: 0,
          duration: avgDeliveryTime,
          cost: totalValue
        },
        disruptionImpact: {
          delayDays,
          additionalCost: Math.round(additionalCost),
          affectedShipments,
          riskLevel
        },
        alternatives: [
          {
            origin: 'Alternative Suppliers',
            transit: ['Diversified Routes'],
            destination: 'Same Destinations',
            distance: 0,
            duration: avgDeliveryTime + 3,
            cost: totalValue * 1.1,
            recommendation: 'Diversify supplier base and routes',
            pros: ['Reduced risk', 'Better resilience'],
            cons: ['Higher costs', 'Longer lead times'],
            riskReduction: 0.6
          }
        ]
      };
    } catch (error) {
      console.error('Error simulating impact:', error);
      throw error;
    }
  }
}

/**
 * Agent 3: Strategy Recommender
 * Provides recommendations based on user's actual supply chain data
 */
export class StrategyRecommenderAgent {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async generateRecommendations(userId: string): Promise<StrategyRecommendation> {
    try {
      await connectToDatabase();
      
      // Get user's actual data
      const shipments = await Shipment.find({ userId });
      const products = await Product.find({ userId });
      const suppliers = await Supplier.find({ userId });

      const recommendations: StrategyRecommendation = {
        immediate: [],
        shortTerm: [],
        longTerm: [],
        contingencyPlans: []
      };

      // Immediate actions based on current status
      const stuckShipments = shipments.filter(s => s.status === 'Stuck');
      if (stuckShipments.length > 0) {
        recommendations.immediate.push(
          'Contact customs brokers for stuck shipments',
          'Review documentation for clearance issues',
          'Communicate delays to customers'
        );
      }

      const delayedShipments = shipments.filter(s => s.status === 'Delayed');
      if (delayedShipments.length > 0) {
        recommendations.immediate.push(
          'Contact shipping carriers for status updates',
          'Assess impact on customer commitments',
          'Prepare delay notifications'
        );
      }

      // Short-term strategies
      if (suppliers.length < 3) {
        recommendations.shortTerm.push(
          'Diversify supplier base to reduce concentration risk',
          'Establish relationships with backup suppliers',
          'Implement supplier performance monitoring'
        );
      }

      if (shipments.filter(s => s.totalValue > 10000).length > 0) {
        recommendations.shortTerm.push(
          'Review insurance coverage for high-value shipments',
          'Implement additional tracking and security measures',
          'Establish emergency response procedures'
        );
      }

      // Long-term strategies
      recommendations.longTerm.push(
        'Implement supply chain risk management framework',
        'Develop supplier relationship management program',
        'Establish real-time monitoring and alerting systems',
        'Create business continuity plans'
      );

      // Contingency plans
      recommendations.contingencyPlans.push(
        'Maintain safety stock for critical products',
        'Identify alternative transportation routes',
        'Establish emergency supplier agreements',
        'Create customer communication protocols'
      );

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }
}

/**
 * Main Multi-Agent System
 * Coordinates all agents to provide comprehensive analysis
 */
export class MultiAgentSystem {
  public riskMonitor: RiskMonitorAgent;
  public impactSimulator: ImpactSimulatorAgent;
  public strategyRecommender: StrategyRecommenderAgent;

  constructor() {
    this.riskMonitor = new RiskMonitorAgent();
    this.impactSimulator = new ImpactSimulatorAgent();
    this.strategyRecommender = new StrategyRecommenderAgent();
  }

  async analyzeSupplyChain(userId: string) {
    try {
      // Run all agents in parallel
      const [risks, recommendations] = await Promise.all([
        this.riskMonitor.detectRisks(userId),
        this.strategyRecommender.generateRecommendations(userId)
      ]);

      return {
        risks,
        recommendations,
        analysisTimestamp: new Date().toISOString(),
        summary: {
          totalRisks: risks.length,
          highRiskCount: risks.filter(r => r.severity === 'high' || r.severity === 'critical').length,
          recommendationsCount: recommendations.immediate.length + recommendations.shortTerm.length + recommendations.longTerm.length
        }
      };
    } catch (error) {
      console.error('Error in multi-agent analysis:', error);
      throw error;
    }
  }

  async runWhatIfSimulation(userId: string, scenario: string) {
    try {
      const impact = await this.impactSimulator.simulateImpact(userId, scenario);
      const recommendations = await this.strategyRecommender.generateRecommendations(userId);

      return {
        scenario,
        impact,
        recommendations,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error in what-if simulation:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const multiAgentSystem = new MultiAgentSystem();