// lib/multi-agent-system.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { demoRiskAlerts } from './demo-data/risk-alerts';
import { generateWhatIfSimulation } from './demo-data/what-if-scenarios';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface RiskAlert {
  id: string;
  type: 'geopolitical' | 'weather' | 'port_closure' | 'trade_disruption' | 'labor_strike' | 'regulatory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  region: string;
  title: string;
  description: string;
  impact: string;
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

/**
 * Agent 1: Risk Monitor
 * Detects vulnerabilities from news and trade data
 */
export class RiskMonitorAgent {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async detectRisks(region: string = 'Red Sea'): Promise<RiskAlert[]> {
    const prompt = `
    You are a supply chain risk monitoring AI agent. Analyze current geopolitical and trade situations for the ${region} region.
    
    Based on recent events, generate realistic supply chain risk alerts. Consider:
    - Geopolitical tensions
    - Port closures or capacity issues
    - Weather disruptions
    - Trade route vulnerabilities
    - Shipping delays
    
    Return a JSON array of risk alerts with this structure:
    {
      "id": "unique_id",
      "type": "geopolitical|weather|port_closure|trade_disruption",
      "severity": "low|medium|high|critical", 
      "region": "affected region",
      "title": "Alert title",
      "description": "Detailed description",
      "impact": "Expected impact on supply chains",
      "sources": ["source1", "source2"]
    }
    
    Generate 3-4 realistic alerts for a company shipping electronics from China via Red Sea to Europe/US.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const alerts = JSON.parse(jsonMatch[0]);
        return alerts.map((alert: any) => ({
          ...alert,
          detectedAt: new Date(),
        }));
      }
      
      // Fallback with sample data
      return this.getSampleRiskAlerts();
    } catch (error) {
      console.error('Risk detection error:', error);
      return this.getSampleRiskAlerts();
    }
  }

  private getSampleRiskAlerts(): RiskAlert[] {
    // Use demo data instead of hardcoded sample data
    return demoRiskAlerts.map(alert => ({
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      region: alert.region,
      title: alert.title,
      description: alert.description,
      impact: alert.impact,
      detectedAt: alert.detectedAt,
      sources: alert.sources
    }));
  }
}

/**
 * Agent 2: Impact Simulator  
 * Calculates disruption impact on shipments and costs
 */
export class ImpactSimulatorAgent {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async simulateDisruption(alerts: RiskAlert[], currentRoute: RouteInfo): Promise<SimulationResult> {
    const prompt = `
    You are a supply chain impact simulation AI agent. Calculate the impact of these risk alerts on a shipping route.
    
    Current Route: ${JSON.stringify(currentRoute, null, 2)}
    Risk Alerts: ${JSON.stringify(alerts, null, 2)}
    
    Calculate and return a JSON object with:
    1. Disruption impact (delay days, additional costs, affected shipments, risk level)
    2. 3-4 alternative routes with pros/cons and risk reduction percentages
    
    Use this structure:
    {
      "disruptionImpact": {
        "delayDays": number,
        "additionalCost": number,
        "affectedShipments": number,
        "riskLevel": "low|medium|high|critical"
      },
      "alternatives": [
        {
          "origin": "origin port",
          "transit": ["transit points"],
          "destination": "destination port", 
          "distance": number,
          "duration": number,
          "cost": number,
          "recommendation": "brief description",
          "pros": ["advantage1", "advantage2"],
          "cons": ["disadvantage1", "disadvantage2"],
          "riskReduction": number (0-100)
        }
      ]
    }
    
    Focus on realistic shipping routes for electronics from China to Europe/US.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const simulation = JSON.parse(jsonMatch[0]);
        return {
          originalRoute: currentRoute,
          disruptionImpact: simulation.disruptionImpact,
          alternatives: simulation.alternatives
        };
      }
      
      return this.getSampleSimulation(currentRoute);
    } catch (error) {
      console.error('Simulation error:', error);
      return this.getSampleSimulation(currentRoute);
    }
  }

  private getSampleSimulation(originalRoute: RouteInfo): SimulationResult {
    return {
      originalRoute,
      disruptionImpact: {
        delayDays: 12,
        additionalCost: 185000,
        affectedShipments: 24,
        riskLevel: 'high'
      },
      alternatives: [
        {
          origin: 'Shanghai, China',
          transit: ['Cape of Good Hope', 'West Africa'],
          destination: 'Rotterdam, Netherlands',
          distance: 16800,
          duration: 35,
          cost: 485000,
          recommendation: 'Cape Route - Longer but safer alternative',
          pros: ['Avoids Red Sea tensions', 'More predictable timing', 'Lower risk profile'],
          cons: ['15 days longer transit', '45% higher costs', 'Higher fuel consumption'],
          riskReduction: 85
        },
        {
          origin: 'Shanghai, China', 
          transit: ['Trans-Pacific', 'Panama Canal'],
          destination: 'Los Angeles, USA',
          distance: 11200,
          duration: 18,
          cost: 320000,
          recommendation: 'Pacific Route - Fastest alternative',
          pros: ['Shortest transit time', 'Established route', 'Lower costs'],
          cons: ['Different destination market', 'Limited to US/West Coast'],
          riskReduction: 75
        }
      ]
    };
  }
}

/**
 * Agent 3: Strategy Recommender
 * Suggests resilient alternatives and contingency plans
 */
export class StrategyRecommenderAgent {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async generateStrategies(
    alerts: RiskAlert[], 
    simulation: SimulationResult
  ): Promise<StrategyRecommendation> {
    const prompt = `
    You are a strategic supply chain AI agent. Based on these risk alerts and simulation results, 
    provide actionable recommendations for supply chain resilience.
    
    Risk Alerts: ${JSON.stringify(alerts, null, 2)}
    Simulation: ${JSON.stringify(simulation.disruptionImpact, null, 2)}
    
    Generate strategic recommendations in 4 categories:
    1. Immediate actions (next 24-48 hours)
    2. Short-term strategies (next 2-4 weeks)
    3. Long-term resilience building (3-6 months)
    4. Contingency plans for future disruptions
    
    Return as JSON:
    {
      "immediate": ["action1", "action2"],
      "shortTerm": ["strategy1", "strategy2"], 
      "longTerm": ["plan1", "plan2"],
      "contingencyPlans": ["backup1", "backup2"]
    }
    
    Focus on practical, business-ready recommendations for an electronics company.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.getSampleStrategies();
    } catch (error) {
      console.error('Strategy generation error:', error);
      return this.getSampleStrategies();
    }
  }

  private getSampleStrategies(): StrategyRecommendation {
    return {
      immediate: [
        'Contact logistics partners to assess current shipment status',
        'Notify customers about potential delays and provide updates',
        'Activate alternative shipping routes for critical orders',
        'Review inventory levels and prioritize essential components'
      ],
      shortTerm: [
        'Diversify shipping routes to reduce single-point-of-failure',
        'Establish partnerships with multiple freight forwarders',
        'Increase safety stock for critical components by 20-30%',
        'Implement real-time shipment tracking across all routes'
      ],
      longTerm: [
        'Build supplier diversification strategy across multiple regions',
        'Invest in predictive analytics for early risk detection', 
        'Develop regional distribution centers to reduce shipping distances',
        'Create strategic partnerships with backup suppliers'
      ],
      contingencyPlans: [
        'Maintain 90-day inventory buffer for top 20% of products',
        'Pre-negotiate emergency shipping contracts with premium carriers',
        'Establish air freight partnerships for critical component rush orders',
        'Create supplier scorecards including geopolitical risk assessments'
      ]
    };
  }
}

/**
 * Multi-Agent Orchestrator
 * Coordinates all three agents for comprehensive analysis
 */
export class MultiAgentOrchestrator {
  private riskMonitor: RiskMonitorAgent;
  private impactSimulator: ImpactSimulatorAgent;
  private strategyRecommender: StrategyRecommenderAgent;

  constructor() {
    this.riskMonitor = new RiskMonitorAgent();
    this.impactSimulator = new ImpactSimulatorAgent();
    this.strategyRecommender = new StrategyRecommenderAgent();
  }

  async analyzeSupplyChain(region: string = 'Red Sea') {
    try {
      // Sample route data for electronics company
      const currentRoute: RouteInfo = {
        origin: 'Shanghai, China',
        transit: ['Singapore', 'Suez Canal', 'Red Sea'],
        destination: 'Rotterdam, Netherlands',
        distance: 11500,
        duration: 28,
        cost: 340000
      };

      console.log('🤖 Agent 1: Detecting risks...');
      const risks = await this.riskMonitor.detectRisks(region);

      console.log('🤖 Agent 2: Simulating impact...');
      const simulation = await this.impactSimulator.simulateDisruption(risks, currentRoute);

      console.log('🤖 Agent 3: Generating strategies...');
      const strategies = await this.strategyRecommender.generateStrategies(risks, simulation);

      return {
        risks,
        simulation,
        strategies,
        analysisTimestamp: new Date(),
        companyProfile: {
          name: 'TechFlow Electronics Ltd',
          industry: 'Consumer Electronics',
          primaryMarkets: ['Europe', 'North America'],
          monthlyShipments: 150,
          averageOrderValue: 75000
        }
      };
    } catch (error) {
      console.error('Multi-agent analysis error:', error);
      throw error;
    }
  }

  async runWhatIfSimulation(scenario: string) {
    try {
      // Use demo data for reliable simulation results
      const simulation = generateWhatIfSimulation(scenario);
      
      // Optionally enhance with AI if available
      if (process.env.GEMINI_API_KEY) {
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const prompt = `
            Enhance this supply chain what-if simulation with additional insights:
            
            Scenario: "${scenario}"
            Current Analysis: ${JSON.stringify(simulation, null, 2)}
            
            Provide additional recommendations or insights that could be valuable for this scenario.
            Focus on practical, actionable advice for an electronics company.
          `;
          
          const result = await model.generateContent(prompt);
          const aiEnhancement = result.response.text();
          
          // Add AI enhancement to the simulation
          return {
            ...simulation,
            aiEnhancement: aiEnhancement.substring(0, 500) + '...' // Limit length
          };
        } catch (aiError) {
          console.log('AI enhancement failed, using demo data only:', aiError);
        }
      }
      
      return simulation;
    } catch (error) {
      console.error('What-if simulation error:', error);
      // Fallback to basic simulation
      return generateWhatIfSimulation(scenario);
    }
  }
}