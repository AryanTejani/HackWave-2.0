// src/lib/multi-agent-system.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { demoRiskAlerts } from './demo-data/risk-alerts';
import { generateWhatIfSimulation } from './demo-data/what-if-scenarios';
// =================================================================
// We now import your powerful data fetching functions and types
// =================================================================
import {
  getGlobalConditions,
  getSupplyChainNews,
  GlobalCondition,
  NewsItem,
} from './tools';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// --- All your interfaces remain exactly as you defined them ---
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
 * Detects vulnerabilities from the dynamic data passed into it.
 */
export class RiskMonitorAgent {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // =================================================================
  // CHANGE 1: The agent now accepts the rich, structured data directly.
  // It no longer fetches data itself. Its only job is to analyze.
  // =================================================================
  async detectRisks(conditions: GlobalCondition[], news: NewsItem[]): Promise<RiskAlert[]> {
    
    // =================================================================
    // CHANGE 2: The prompt is now built using the dynamic data.
    // This is where the live data is passed to the Gemini model.
    // =================================================================
    // Limit data to reduce prompt size and avoid rate limits
    const limitedConditions = conditions.slice(0, 3).map(c => ({
      region: c.region,
      condition: c.condition,
      severity: c.severity,
      impact: c.impact
    }));
    
    const limitedNews = news.slice(0, 2).map(n => ({
      title: n.title.substring(0, 100),
      snippet: n.snippet.substring(0, 150)
    }));

    const prompt = `
    You are a supply chain risk monitoring AI agent. Analyze this data and generate 3-4 risk alerts.

    **Conditions:** ${JSON.stringify(limitedConditions)}
    **News:** ${JSON.stringify(limitedNews)}

    Return JSON array with structure:
    {
      "id": "unique_id",
      "type": "geopolitical|weather|port_closure|trade_disruption",
      "severity": "low|medium|high|critical",
      "region": "region affected or 'Global'",
      "title": "concise title",
      "description": "risk description",
      "impact": "supply chain impact",
      "sources": ["source summary"]
    }
    `;

    try {
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
      
      return this.getSampleRiskAlerts('Global');
    } catch (error) {
      console.error('AI risk detection error:', error);
      return this.getSampleRiskAlerts('Global');
    }
  }

  private getSampleRiskAlerts(region: string): RiskAlert[] {
    return demoRiskAlerts.map(alert => ({ ...alert, region }));
  }
}

// =================================================================
// NO CHANGES HERE: All other agents are untouched and remain complete.
// =================================================================
export class ImpactSimulatorAgent {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  async simulateDisruption(alerts: RiskAlert[], currentRoute: RouteInfo): Promise<SimulationResult> {
    // Limit data to reduce prompt size
    const limitedAlerts = alerts.slice(0, 2).map(a => ({
      type: a.type,
      severity: a.severity,
      region: a.region,
      impact: a.impact
    }));

    const prompt = `
    You are a supply chain impact simulation AI agent. Calculate the impact of these risk alerts on a shipping route.
    
    Current Route: ${JSON.stringify(currentRoute, null, 2)}
    Risk Alerts: ${JSON.stringify(limitedAlerts)}
    
    Return JSON object with:
    {
      "disruptionImpact": { "delayDays": 0, "additionalCost": 0, "affectedShipments": 0, "riskLevel": "low" },
      "alternatives": [ { "origin": "", "transit": [], "destination": "", "distance": 0, "duration": 0, "cost": 0, "recommendation": "", "pros": [], "cons": [], "riskReduction": 0 } ]
    }`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const simulation = JSON.parse(jsonMatch[0]);
        return {
          originalRoute: currentRoute,
          ...simulation
        };
      }
      return this.getSampleSimulation(currentRoute);
    } catch (error) {
      console.error('Simulation error:', error);
      return this.getSampleSimulation(currentRoute);
    }
  }

  private getSampleSimulation(originalRoute: RouteInfo): SimulationResult {
    // (Sample data remains the same)
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
            transit: ['Cape of Good Hope'],
            destination: 'Rotterdam, Netherlands',
            distance: 16800,
            duration: 35,
            cost: 485000,
            recommendation: 'Cape Route - Longer but safer',
            pros: ['Avoids conflict zones'],
            cons: ['Longer transit', 'Higher cost'],
            riskReduction: 85
          }
        ]
      };
  }
}

export class StrategyRecommenderAgent {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  async generateStrategies(alerts: RiskAlert[], simulation: SimulationResult): Promise<StrategyRecommendation> {
    // Limit data to reduce prompt size
    const limitedAlerts = alerts.slice(0, 2).map(a => ({
      type: a.type,
      severity: a.severity,
      impact: a.impact
    }));

    const prompt = `
    You are a strategic supply chain AI agent. Based on these risk alerts and simulation results, provide actionable recommendations.
    
    Risk Alerts: ${JSON.stringify(limitedAlerts)}
    Simulation: ${JSON.stringify(simulation.disruptionImpact)}
    
    Generate strategic recommendations in JSON format:
    {
      "immediate": [],
      "shortTerm": [], 
      "longTerm": [],
      "contingencyPlans": []
    }`;

    try {
        const result = await this.model.generateContent(prompt);
        const response = result.response.text();
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
    // (Sample data remains the same)
    return {
        immediate: ['Contact logistics partners', 'Notify customers'],
        shortTerm: ['Diversify shipping routes'],
        longTerm: ['Build supplier diversification'],
        contingencyPlans: ['Maintain 90-day inventory buffer']
      };
  }
}

export class MultiAgentOrchestrator {
  private riskMonitor: RiskMonitorAgent;
  private impactSimulator: ImpactSimulatorAgent;
  private strategyRecommender: StrategyRecommenderAgent;

  constructor() {
    this.riskMonitor = new RiskMonitorAgent();
    this.impactSimulator = new ImpactSimulatorAgent();
    this.strategyRecommender = new StrategyRecommenderAgent();
  }

   async analyzeSupplyChain() {
    try {
      // Direct function calls instead of HTTP request
      console.log('Orchestrator: Fetching live global conditions and news...');
      
      const [conditions, news] = await Promise.all([
        getGlobalConditions(),
        getSupplyChainNews()
      ]);

      console.log('🤖 Agent 1: Detecting risks from live data...');
      const risks = await this.riskMonitor.detectRisks(conditions, news);

      const currentRoute: RouteInfo = {
        origin: 'Shanghai, China',
        transit: ['Singapore', 'Suez Canal', 'Global'],
        destination: 'Rotterdam, Netherlands',
        distance: 11500,
        duration: 28,
        cost: 340000
      };
      
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

   async analyzeSupplyChainWithData(conditions: GlobalCondition[], news: NewsItem[]) {
    try {
      // Limit data to reduce prompt size and avoid rate limits
      const limitedConditions = conditions.slice(0, 3);
      const limitedNews = news.slice(0, 2);
      
      console.log('🤖 Agent 1: Detecting risks from live data...');
      const risks = await this.riskMonitor.detectRisks(limitedConditions, limitedNews);

      const currentRoute: RouteInfo = {
        origin: 'Shanghai, China',
        transit: ['Singapore', 'Suez Canal', 'Global'],
        destination: 'Rotterdam, Netherlands',
        distance: 11500,
        duration: 28,
        cost: 340000
      };
      
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
    // (This function remains untouched)
    try {
      const simulation = generateWhatIfSimulation(scenario);
      if (process.env.GEMINI_API_KEY) {
        // AI enhancement logic here...
      }
      return simulation;
    } catch (error) {
      console.error('What-if simulation error:', error);
      return generateWhatIfSimulation(scenario);
    }
  }
}