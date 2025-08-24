// src/lib/multi-agent-system.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from './mongo';
import Shipment from '@/models/Shipment';
import Product from '@/models/Product';
import Supplier from '@/models/Supplier';
import { generateWhatIfSimulation } from './demo-data/what-if-scenarios';
import { 
  getGlobalConditions, 
  getSupplyChainNews,
  GlobalCondition,
  NewsItem,
  RiskAlert,
  SimulationResult,
  RouteInfo,
  AlternativeRoute,
  StrategyRecommendation
} from './tools';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Agent 1: Risk Monitor
 * Analyzes both the user's specific supply chain data and live global data to detect risks.
 */
export class RiskMonitorAgent {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async detectRisks(userId: string, conditions: GlobalCondition[], news: NewsItem[]): Promise<RiskAlert[]> {
    try {
      await connectToDatabase();
      
      // Get user's actual supply chain data
      const shipments = await Shipment.find({ userId }).populate('productId', 'name supplier').limit(10);
      const suppliers = await Supplier.find({ userId }).limit(10);

      const userShipmentSummary = shipments.map(s => ({
        product: (s.productId as any)?.name,
        status: s.status,
        origin: s.origin,
        destination: s.destination,
        value: s.totalValue
      }));

      const userSupplierSummary = suppliers.map(s => ({
        name: s.name,
        location: s.location,
        riskLevel: s.riskLevel
      }));

      const prompt = `
      You are a world-class supply chain risk monitoring AI. Analyze the user's current supply chain data in conjunction with live global news and conditions to generate a JSON array of critical risk alerts.

      **User's Live Supply Chain Data:**
      - Shipments: ${JSON.stringify(userShipmentSummary)}
      - Key Suppliers: ${JSON.stringify(userSupplierSummary)}

      **Live Global Conditions & News:**
      - Global Conditions: ${JSON.stringify(conditions)}
      - Latest News: ${JSON.stringify(news.map(n => ({ title: n.title, snippet: n.snippet })))}

      Based on BOTH the user's data and the live global data, generate a JSON array of 3-4 highly relevant risk alerts. The structure for each alert should be:
      {
        "id": "unique_id",
        "type": "geopolitical|weather|supplier_risk|logistics_risk",
        "severity": "low|medium|high|critical",
        "region": "The specific region affected, or 'Global'",
        "title": "A concise alert title",
        "description": "A detailed description of the risk, explaining how it affects the user's specific products or suppliers.",
        "impact": "The expected impact on the user's supply chain.",
        "affectedProducts": ["List affected product names"],
        "affectedShipments": ["List affected shipment IDs"],
        "sources": ["e.g., 'Live News Feed', 'User Shipment Data'"]
      }
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const alerts = JSON.parse(jsonMatch[0]);
        return alerts.map((alert: any) => ({
          ...alert,
          detectedAt: new Date(),
        }));
      }
      return []; // Return empty if AI fails to generate valid JSON
    } catch (error) {
      console.error('AI risk detection error:', error);
      // Fallback to a simple, data-driven alert if AI fails
      const shipments = await Shipment.find({ userId, status: { $in: ['Delayed', 'Stuck'] } });
      if (shipments.length > 0) {
          return [{
              id: `fallback_${Date.now()}`, type: 'logistics_risk', severity: 'high', region: 'Global',
              title: 'Shipment Delays Detected', description: `${shipments.length} shipments are delayed or stuck.`,
              impact: 'Potential delivery delays.', affectedShipments: shipments.map(s => s._id.toString()),
              affectedProducts: [], detectedAt: new Date(), sources: ['Internal System Monitoring']
          }];
      }
      return [];
    }
  }
}

/**
 * Agent 2: Impact Simulator
 * Simulates impact on a user's actual supply chain.
 */
export class ImpactSimulatorAgent {
    private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    async simulateImpact(userId: string, risks: RiskAlert[]): Promise<SimulationResult> {
        // This agent can be enhanced to use live data as well, but for now, we use the main branch logic.
        // It's a placeholder for a more complex simulation.
        return {
            originalRoute: { origin: 'Multiple', transit: [], destination: 'Multiple', distance: 0, duration: 25, cost: 500000 },
            disruptionImpact: { delayDays: 7, additionalCost: 75000, affectedShipments: risks.flatMap(r => r.affectedShipments).length, riskLevel: 'high' },
            alternatives: []
        };
    }
}

/**
 * Agent 3: Strategy Recommender
 * Provides recommendations based on the detected risks.
 */
export class StrategyRecommenderAgent {
    private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    async generateRecommendations(risks: RiskAlert[]): Promise<StrategyRecommendation> {
       const prompt = `
        Given these supply chain risks: ${JSON.stringify(risks)}, generate strategic recommendations.
        Return JSON: { "immediate": [], "shortTerm": [], "longTerm": [], "contingencyPlans": [] }
       `;
        try {
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
            return this.getSampleStrategies();
        } catch (error) {
            console.error('Strategy generation error:', error);
            return this.getSampleStrategies();
        }
    }

    private getSampleStrategies(): StrategyRecommendation {
        return {
            immediate: ['Contact carriers for status updates on delayed shipments.'],
            shortTerm: ['Explore alternative shipping routes.'],
            longTerm: ['Diversify supplier base in key regions.'],
            contingencyPlans: ['Increase safety stock for high-risk products.']
        };
    }
}

/**
 * Multi-Agent Orchestrator
 * This is the main controller that combines the power of both branches.
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

  async analyzeSupplyChain(userId: string) {
    try {
      // 1. Fetch live global data
      console.log('Orchestrator: Fetching live global conditions and news...');
      const [conditions, news] = await Promise.all([
        getGlobalConditions(),
        getSupplyChainNews(10) // Fetch 10 latest news items
      ]);

      // 2. Run Risk Monitor with both userId (for user data) and live data
      console.log('🤖 Agent 1: Detecting risks from live and user data...');
      const risks = await this.riskMonitor.detectRisks(userId, conditions, news);

      // 3. Run Impact Simulator based on detected risks
      console.log('🤖 Agent 2: Simulating impact...');
      const simulation = await this.impactSimulator.simulateImpact(userId, risks);
      
      // 4. Run Strategy Recommender based on detected risks
      console.log('🤖 Agent 3: Generating strategies...');
      const recommendations = await this.strategyRecommender.generateRecommendations(risks);

      return {
        risks,
        simulation,
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
      // This can be further enhanced, but uses the main branch's logic for now
      const simulation = generateWhatIfSimulation(scenario); 
      return {
        scenario,
        ...simulation
      };
    } catch (error) {
      console.error('Error in what-if simulation:', error);
      throw error;
    }
  }
}

// Export a single instance to be used across the application
export const multiAgentSystem = new MultiAgentOrchestrator();