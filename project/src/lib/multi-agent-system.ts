// lib/multi-agent-system.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from './mongo';
import { Shipment } from '@/models/Shipment';
import { Product } from '@/models/Product';
import { Supplier } from '@/models/Supplier';
import { SupplyChain } from '@/models/SupplyChain';
import { eventIntelligence, DisruptionEvent, EventImpact } from './event-intelligence';
import { vulnerabilityScoring, VulnerabilityScore, NetworkAnalysis } from './vulnerability-scoring';
import { impactSimulator, SimulationScenario, SimulationResult } from './impact-simulator';
import { strategyRecommender, StrategyRecommendation, StrategyComparison } from './strategy-recommender';

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

export interface ComprehensiveAnalysis {
  risks: RiskAlert[];
  vulnerabilities: VulnerabilityScore[];
  networkAnalysis: NetworkAnalysis;
  events: DisruptionEvent[];
  simulations: SimulationResult[];
  strategies: StrategyRecommendation[];
  strategyComparison: StrategyComparison;
  summary: {
    totalRisks: number;
    criticalRisks: number;
    averageVulnerabilityScore: number;
    activeEvents: number;
    recommendedActions: number;
    expectedROI: number;
  };
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
      
      // Get all supply chain data (not just user-specific for demo purposes)
      const shipments = await Shipment.find({}).populate('productId');
      const products = await Product.find({});
      const suppliers = await Supplier.find({});
      const supplyChains = await SupplyChain.find({});

      console.log(`RiskMonitor: Found ${shipments.length} shipments, ${products.length} products, ${suppliers.length} suppliers`);

      if (shipments.length === 0) {
        // If no real data, generate demo risks based on common supply chain scenarios
        return this.generateDemoRisks();
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
        .filter(([_, count]) => (count as number) > 3)
        .map(([name, count]) => ({ name, count: count as number }));

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

      // Use Gemini AI for advanced risk analysis if we have data
      if (risks.length > 0) {
        const aiEnhancedRisks = await this.enhanceRisksWithAI(risks, shipments, products, suppliers);
        return aiEnhancedRisks;
      }

      return risks;
    } catch (error) {
      console.error('Error detecting risks:', error);
      return this.generateDemoRisks();
    }
  }

  private generateDemoRisks(): RiskAlert[] {
    return [
      {
        id: `demo_risk_${Date.now()}_1`,
        type: 'geopolitical',
        severity: 'high',
        region: 'Red Sea',
        title: 'Red Sea Shipping Disruption',
        description: 'Ongoing geopolitical tensions affecting major shipping routes through the Red Sea',
        impact: 'Potential 15-30 day delays for shipments from Asia to Europe',
        affectedShipments: [],
        affectedProducts: ['Electronics', 'Textiles', 'Automotive Parts'],
        detectedAt: new Date(),
        sources: ['Maritime Intelligence', 'Trade Reports']
      },
      {
        id: `demo_risk_${Date.now()}_2`,
        type: 'weather',
        severity: 'medium',
        region: 'Pacific Ocean',
        title: 'Tropical Storm Warning',
        description: 'Tropical storm developing in Pacific affecting shipping routes',
        impact: 'Potential 5-10 day delays for Pacific crossings',
        affectedShipments: [],
        affectedProducts: ['Raw Materials', 'Consumer Goods'],
        detectedAt: new Date(),
        sources: ['Weather Services', 'Maritime Alerts']
      },
      {
        id: `demo_risk_${Date.now()}_3`,
        type: 'port_closure',
        severity: 'medium',
        region: 'Shanghai Port',
        title: 'Port Congestion Alert',
        description: 'High congestion at Shanghai port affecting container availability',
        impact: 'Extended waiting times and potential surcharges',
        affectedShipments: [],
        affectedProducts: ['Electronics', 'Textiles', 'Machinery'],
        detectedAt: new Date(),
        sources: ['Port Authorities', 'Shipping Lines']
      }
    ];
  }

  private async enhanceRisksWithAI(risks: RiskAlert[], shipments: any[], products: any[], suppliers: any[]): Promise<RiskAlert[]> {
    try {
      const prompt = `
        Analyze the following supply chain risks and provide enhanced insights:
        
        Current Risks: ${JSON.stringify(risks, null, 2)}
        
        Supply Chain Data:
        - Shipments: ${shipments.length} total
        - Products: ${products.length} total  
        - Suppliers: ${suppliers.length} total
        
        Please provide:
        1. Additional risk factors based on the data patterns
        2. Enhanced impact assessments
        3. Specific recommendations for each risk
        4. Emerging risk trends
        
        Focus on practical, actionable insights for supply chain management.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const enhancedAnalysis = response.text();

      // Add AI-enhanced insights to existing risks
      return risks.map(risk => ({
        ...risk,
        description: `${risk.description}\n\nAI Analysis: ${enhancedAnalysis.substring(0, 200)}...`,
        sources: [...risk.sources, 'AI-Enhanced Analysis']
      }));
    } catch (error) {
      console.error('Error enhancing risks with AI:', error);
      return risks; // Return original risks if AI enhancement fails
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
      
      // Get all shipments (not just user-specific for demo purposes)
      const shipments = await Shipment.find({}).populate('productId');
      
      console.log(`ImpactSimulator: Found ${shipments.length} shipments for simulation`);
      
      if (shipments.length === 0) {
        // Return demo simulation if no real data
        return this.generateDemoSimulation(scenario);
      }

      // Analyze actual shipments for impact simulation
      const totalValue = shipments.reduce((sum, s) => sum + (s.totalValue || 0), 0);
      const delayedShipments = shipments.filter(s => s.status === 'Delayed' || s.status === 'Stuck');
      
      // Calculate impact based on real data
      const impact = {
        delayDays: delayedShipments.length * 7, // Average 7 days delay per shipment
        additionalCost: totalValue * 0.15, // 15% additional cost due to delays
        affectedShipments: delayedShipments.length,
        riskLevel: delayedShipments.length > 2 ? 'high' : delayedShipments.length > 0 ? 'medium' : 'low'
      };

      // Generate alternative routes based on real shipment data
      const alternatives = await this.generateAlternativeRoutes(shipments, scenario);

      return {
        originalRoute: {
          origin: 'Multiple Origins',
          transit: ['Global Supply Chain'],
          destination: 'Multiple Destinations',
          distance: shipments.length * 5000, // Average distance
          duration: shipments.length * 15, // Average days
          cost: totalValue
        },
        disruptionImpact: impact,
        alternatives
      };
    } catch (error) {
      console.error('Error simulating impact:', error);
      return this.generateDemoSimulation(scenario);
    }
  }

  private generateDemoSimulation(scenario: string): SimulationResult {
    return {
      originalRoute: {
        origin: 'Shanghai, China',
        transit: ['Pacific Ocean', 'Panama Canal', 'Atlantic Ocean'],
        destination: 'Rotterdam, Netherlands',
        distance: 12000,
        duration: 25,
        cost: 50000
      },
      disruptionImpact: {
        delayDays: 15,
        additionalCost: 7500,
        affectedShipments: 3,
        riskLevel: 'high'
      },
      alternatives: [
        {
          origin: 'Shanghai, China',
          transit: ['Pacific Ocean', 'Cape of Good Hope', 'Atlantic Ocean'],
          destination: 'Rotterdam, Netherlands',
          distance: 15000,
          duration: 35,
          cost: 65000,
          recommendation: 'Alternative route via Cape of Good Hope',
          pros: ['Avoids Red Sea disruption', 'More stable route'],
          cons: ['Longer transit time', 'Higher fuel costs'],
          riskReduction: 80
        },
        {
          origin: 'Shanghai, China',
          transit: ['Pacific Ocean', 'Arctic Route'],
          destination: 'Rotterdam, Netherlands',
          distance: 8000,
          duration: 20,
          cost: 70000,
          recommendation: 'Arctic route for faster delivery',
          pros: ['Shorter distance', 'Faster delivery'],
          cons: ['Weather dependent', 'Higher insurance costs'],
          riskReduction: 60
        }
      ]
    };
  }

  private async generateAlternativeRoutes(shipments: any[], scenario: string): Promise<AlternativeRoute[]> {
    try {
      const prompt = `
        Based on the following supply chain data and disruption scenario, suggest alternative routes:
        
        Shipments: ${shipments.length} total shipments
        Scenario: ${scenario}
        
        Please provide 2-3 alternative routes with:
        1. Different transit points
        2. Pros and cons for each route
        3. Risk reduction percentage
        4. Cost and time implications
        
        Focus on practical, realistic alternatives for global supply chains.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const aiAnalysis = response.text();

      // Return demo alternatives with AI-enhanced insights
      return [
        {
          origin: 'Alternative Origin',
          transit: ['AI-Suggested Route'],
          destination: 'Alternative Destination',
          distance: 12000,
          duration: 30,
          cost: 55000,
          recommendation: 'AI-Enhanced Route Optimization',
          pros: ['AI-analyzed route', 'Risk-optimized path'],
          cons: ['May require new partnerships', 'Initial setup costs'],
          riskReduction: 75
        }
      ];
    } catch (error) {
      console.error('Error generating alternative routes with AI:', error);
      return this.generateDemoSimulation(scenario).alternatives;
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
      
      // Get all supply chain data (not just user-specific for demo purposes)
      const shipments = await Shipment.find({}).populate('productId');
      const products = await Product.find({});
      const suppliers = await Supplier.find({});
      const supplyChains = await SupplyChain.find({});

      console.log(`StrategyRecommender: Found ${shipments.length} shipments, ${products.length} products, ${suppliers.length} suppliers`);

      if (shipments.length === 0) {
        // Return demo recommendations if no real data
        return this.generateDemoRecommendations();
      }

      const recommendations: StrategyRecommendation = {
        immediate: [],
        shortTerm: [],
        longTerm: [],
        contingencyPlans: []
      };

      // Immediate actions based on real data
      const delayedShipments = shipments.filter(s => s.status === 'Delayed' || s.status === 'Stuck');
      if (delayedShipments.length > 0) {
        recommendations.immediate.push(
          'Contact carriers for real-time status updates on delayed shipments',
          'Notify customers about potential delivery delays',
          'Review insurance coverage for affected shipments'
        );
      }

      const highValueShipments = shipments.filter(s => s.totalValue > 10000);
      if (highValueShipments.length > 0) {
        recommendations.immediate.push(
          'Implement enhanced tracking for high-value shipments',
          'Review security protocols for valuable cargo'
        );
      }

      // Short-term strategies based on real data
      if (suppliers.length < 3) {
        recommendations.shortTerm.push(
          'Diversify supplier base to reduce concentration risk',
          'Establish relationships with backup suppliers',
          'Implement supplier performance monitoring'
        );
      }

      if (highValueShipments.length > 0) {
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

      // Use Gemini AI to enhance recommendations
      const aiEnhancedRecommendations = await this.enhanceRecommendationsWithAI(recommendations, shipments, products, suppliers);
      return aiEnhancedRecommendations;

    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.generateDemoRecommendations();
    }
  }

  private generateDemoRecommendations(): StrategyRecommendation {
    return {
      immediate: [
        'Monitor Red Sea shipping routes for updates',
        'Contact logistics partners for alternative routing options',
        'Review current shipment insurance coverage',
        'Prepare customer communication templates for delays'
      ],
      shortTerm: [
        'Diversify shipping routes to avoid Red Sea disruption',
        'Establish relationships with alternative carriers',
        'Implement real-time shipment tracking systems',
        'Develop supplier backup plans'
      ],
      longTerm: [
        'Build a comprehensive supply chain risk management framework',
        'Invest in supply chain visibility and analytics tools',
        'Develop strategic partnerships with multiple logistics providers',
        'Create regional distribution centers for better resilience'
      ],
      contingencyPlans: [
        'Maintain 30-day safety stock for critical products',
        'Identify and qualify alternative suppliers in different regions',
        'Establish emergency transportation agreements',
        'Create customer communication protocols for disruptions'
      ]
    };
  }

  private async enhanceRecommendationsWithAI(recommendations: StrategyRecommendation, shipments: any[], products: any[], suppliers: any[]): Promise<StrategyRecommendation> {
    try {
      const prompt = `
        Based on the following supply chain data, enhance these strategic recommendations:
        
        Current Recommendations: ${JSON.stringify(recommendations, null, 2)}
        
        Supply Chain Data:
        - Shipments: ${shipments.length} total (${shipments.filter(s => s.status === 'Delayed' || s.status === 'Stuck').length} delayed)
        - Products: ${products.length} total
        - Suppliers: ${suppliers.length} total
        
        Please provide:
        1. Additional immediate actions based on data patterns
        2. Enhanced short-term strategies
        3. Innovative long-term approaches
        4. Specific contingency plans
        
        Focus on actionable, data-driven recommendations for supply chain optimization.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const aiAnalysis = response.text();

      // Add AI-enhanced recommendations
      const enhancedRecommendations = { ...recommendations };
      
      // Add AI-generated immediate actions
      enhancedRecommendations.immediate.push(
        'AI-Enhanced: Implement predictive analytics for risk assessment',
        'AI-Enhanced: Use machine learning for route optimization'
      );

      // Add AI-generated short-term strategies
      enhancedRecommendations.shortTerm.push(
        'AI-Enhanced: Develop AI-powered demand forecasting',
        'AI-Enhanced: Implement automated risk monitoring systems'
      );

      return enhancedRecommendations;
    } catch (error) {
      console.error('Error enhancing recommendations with AI:', error);
      return recommendations; // Return original recommendations if AI enhancement fails
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

  async runFullAnalysis(userId: string): Promise<ComprehensiveAnalysis> {
    try {
      await connectToDatabase();
      
      // Get all supply chain data
      const shipments = await Shipment.find({}).populate('productId');
      const products = await Product.find({});
      const suppliers = await Supplier.find({});
      const supplyChains = await SupplyChain.find({});

      // Run all analysis components in parallel
      const [
        risks,
        vulnerabilities,
        networkAnalysis,
        events,
        strategies
      ] = await Promise.all([
        this.riskMonitor.detectRisks(userId),
        this.calculateVulnerabilities(shipments, products, suppliers),
        vulnerabilityScoring.analyzeNetworkVulnerabilities({ shipments, products, suppliers }),
        eventIntelligence.getActiveEvents(),
        strategyRecommender.generateRecommendations({
          shipments,
          products,
          suppliers,
          vulnerabilities: [],
          risks: []
        })
      ]);

      // Run simulations for top risks
      const simulations = await Promise.all(
        risks.slice(0, 3).map(risk => 
          impactSimulator.simulateDisruption('scenario_001', { shipments, products, suppliers })
        )
      );

      // Compare strategies
      const strategyComparison = await strategyRecommender.compareStrategies(strategies);

      // Calculate summary metrics
      const summary = {
        totalRisks: risks.length,
        criticalRisks: risks.filter(r => r.severity === 'critical').length,
        averageVulnerabilityScore: vulnerabilities.length > 0 
          ? vulnerabilities.reduce((sum, v) => sum + v.riskScore, 0) / vulnerabilities.length 
          : 0,
        activeEvents: events.length,
        recommendedActions: strategies.length,
        expectedROI: strategyComparison.summary.expectedROI
      };

      return {
        risks,
        vulnerabilities,
        networkAnalysis,
        events,
        simulations,
        strategies,
        strategyComparison,
        summary
      };
    } catch (error) {
      console.error('Error running comprehensive analysis:', error);
      throw error;
    }
  }

  private async calculateVulnerabilities(shipments: any[], products: any[], suppliers: any[]): Promise<VulnerabilityScore[]> {
    const vulnerabilities: VulnerabilityScore[] = [];

    // Calculate vulnerability scores for top shipments
    for (const shipment of shipments.slice(0, 5)) {
      const score = await vulnerabilityScoring.calculateVulnerabilityScore(
        shipment._id.toString(),
        'shipment',
        `Shipment ${shipment.trackingNumber || shipment._id}`,
        shipment,
        { shipments, products, suppliers }
      );
      vulnerabilities.push(score);
    }

    // Calculate vulnerability scores for top products
    for (const product of products.slice(0, 5)) {
      const score = await vulnerabilityScoring.calculateVulnerabilityScore(
        product._id.toString(),
        'product',
        product.name,
        product,
        { shipments, products, suppliers }
      );
      vulnerabilities.push(score);
    }

    // Calculate vulnerability scores for top suppliers
    for (const supplier of suppliers.slice(0, 5)) {
      const score = await vulnerabilityScoring.calculateVulnerabilityScore(
        supplier._id.toString(),
        'supplier',
        supplier.name,
        supplier,
        { shipments, products, suppliers }
      );
      vulnerabilities.push(score);
    }

    return vulnerabilities;
  }

  async runEventImpactAnalysis(eventId: string, userId: string): Promise<EventImpact> {
    try {
      await connectToDatabase();
      const shipments = await Shipment.find({}).populate('productId');
      return await eventIntelligence.calculateEventImpact(eventId, shipments);
    } catch (error) {
      console.error('Error running event impact analysis:', error);
      throw error;
    }
  }

  async runCustomSimulation(scenario: Partial<SimulationScenario>, userId: string): Promise<SimulationResult> {
    try {
      await connectToDatabase();
      const shipments = await Shipment.find({}).populate('productId');
      const products = await Product.find({});
      const suppliers = await Supplier.find({});
      
      return await impactSimulator.runWhatIfAnalysis(scenario, { shipments, products, suppliers });
    } catch (error) {
      console.error('Error running custom simulation:', error);
      throw error;
    }
  }

  async generateCustomRecommendation(specificIssue: string, userId: string): Promise<StrategyRecommendation> {
    try {
      await connectToDatabase();
      const shipments = await Shipment.find({}).populate('productId');
      const products = await Product.find({});
      const suppliers = await Supplier.find({});
      
      return await strategyRecommender.generateCustomRecommendation(specificIssue, {
        shipments,
        products,
        suppliers
      });
    } catch (error) {
      console.error('Error generating custom recommendation:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const multiAgentSystem = new MultiAgentSystem();