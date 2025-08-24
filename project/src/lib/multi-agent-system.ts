// src/lib/multi-agent-system.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from './mongo';
import { Shipment } from '@/models/Shipment';
import { Product } from '@/models/Product';
import { Supplier } from '@/models/Supplier';
import { Factory } from '@/models/Factory';
import { Warehouse } from '@/models/Warehouse';
import { Retailer } from '@/models/Retailer';
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

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

/**
 * Agent 1: Risk Monitor
 * Analyzes both the user's specific supply chain data and live global data to detect risks.
 */
export class RiskMonitorAgent {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async detectRisks(userId: string): Promise<RiskAlert[]> {
    try {
      await connectToDatabase();
      
      // Fetch user's MongoDB data from all models
      const [shipments, suppliers, products, factories, warehouses, retailers] = await Promise.all([
        Shipment.find({ userId }).populate('productId', 'name supplier').limit(20),
        Supplier.find({ userId }).limit(20),
        Product.find({ userId }).limit(20),
        Factory.find({ userId }).limit(20),
        Warehouse.find({ userId }).limit(20),
        Retailer.find({ userId }).limit(20)
      ]);

      console.log(`🔍 Risk Monitor: Found ${shipments.length} shipments, ${suppliers.length} suppliers, ${products.length} products, ${factories.length} factories, ${warehouses.length} warehouses, ${retailers.length} retailers for user ${userId}`);

      // Fetch live global data
      const [conditions, news] = await Promise.all([
        getGlobalConditions(),
        getSupplyChainNews(10)
      ]);

      // Create comprehensive user data summary
      const userDataSummary = {
        shipments: shipments.map(s => ({
          product: (s.productId as any)?.name || 'Unknown',
          status: s.status,
          origin: s.origin,
          destination: s.destination,
          value: s.totalValue,
          carrier: s.carrier
        })),
        suppliers: suppliers.map(s => ({
          name: s.name,
          location: s.location,
          country: s.country,
          riskLevel: s.riskLevel,
          rating: s.rating
        })),
        products: products.map(p => ({
          name: p.name,
          category: p.category,
          supplier: p.supplier,
          origin: p.origin,
          riskLevel: p.riskLevel,
          unitCost: p.unitCost
        })),
        factories: factories.map(f => ({
          name: f.Factory_Name,
          location: f.Location,
          capacity: f.Capacity,
          utilization: f.Utilization,
          qualityRating: f.Quality_Rating
        })),
        warehouses: warehouses.map(w => ({
          name: w.Warehouse_Name,
          location: w.Location,
          capacity: w.Capacity,
          currentStock: w.Current_Stock,
          utilization: (w.Current_Stock / w.Capacity) * 100
        })),
        retailers: retailers.map(r => ({
          name: r.Retailer_Name,
          location: r.Location,
          marketSegment: r.Market_Segment,
          salesVolume: r.Sales_Volume
        }))
      };

      // Create concise descriptions for AI analysis
      const userSummary = {
        shipmentSummary: `User has ${shipments.length} shipments worth $${shipments.reduce((sum, s) => sum + (s.totalValue || 0), 0).toLocaleString()}`,
        supplierSummary: `User has ${suppliers.length} suppliers across ${new Set(suppliers.map(s => s.country)).size} countries`,
        productSummary: `User manages ${products.length} products across ${new Set(products.map(p => p.category)).size} categories`,
        factorySummary: `User has ${factories.length} factories with average ${(factories.reduce((sum, f) => sum + f.Utilization, 0) / factories.length || 0).toFixed(1)}% utilization`,
        warehouseSummary: `User has ${warehouses.length} warehouses with average ${(warehouses.reduce((sum, w) => sum + (w.Current_Stock / w.Capacity * 100), 0) / warehouses.length || 0).toFixed(1)}% utilization`,
        retailerSummary: `User has ${retailers.length} retailers with total sales volume of $${retailers.reduce((sum, r) => sum + r.Sales_Volume, 0).toLocaleString()}`
      };

      const globalSummary = {
        conditions: conditions.map(c => `${c.region}: ${c.condition} (${c.severity})`).join(', '),
        news: news.map(n => `${n.title} - ${n.source}`).slice(0, 3).join('; ')
      };

      console.log('📊 User Summary:', userSummary);
      console.log('🌍 Global Summary:', globalSummary);

      const prompt = `
You are a world-class supply chain risk monitoring AI. Your task is to analyze the user's comprehensive supply chain data in conjunction with live global news and conditions to generate a JSON array of critical risk alerts.

**User's Supply Chain Summary:**
${JSON.stringify(userSummary, null, 2)}

**Detailed User Data:**
${JSON.stringify(userDataSummary, null, 2)}

**Live Global Conditions & News:**
- Global Conditions: ${JSON.stringify(conditions)}
- Latest News: ${JSON.stringify(news.map(n => ({ title: n.title, snippet: n.snippet, source: n.source })))}

**Instructions:**
1. **Analyze Holistically:** Consider both the user's internal data and external global events.
2. **Generate 4-6 Alerts:** Create a JSON array of 4 to 6 highly relevant risk alerts.
3. **Be Specific:** In the "description" and "impact" fields, explicitly mention how the risk affects the user's specific products, suppliers, or shipments.
4. **Format Correctly:** Return ONLY a valid JSON array. Do not include any explanatory text, markdown formatting, or code blocks.

**Required JSON Structure for each alert:**
{
  "id": "unique_id",
  "type": "geopolitical|weather|supplier_risk|logistics_risk|capacity_risk|demand_risk",
  "severity": "low|medium|high|critical",
  "region": "The specific region affected, or 'Global'",
  "title": "A concise alert title",
  "description": "A detailed description of the risk, explaining how it affects the user's specific supply chain.",
  "impact": "The expected impact on the user's supply chain.",
  "affectedProducts": ["List affected product names"],
  "affectedShipments": ["List affected shipment IDs"],
  "affectedSuppliers": ["List affected supplier names"],
  "affectedFactories": ["List affected factory names"],
  "affectedWarehouses": ["List affected warehouse names"],
  "affectedRetailers": ["List affected retailer names"],
  "sources": ["e.g., 'Live News Feed', 'User Data Analysis'"],
  "estimatedCost": "Estimated financial impact in USD",
  "timeframe": "immediate|short_term|long_term"
}

**IMPORTANT:** Return ONLY the JSON array. No other text, no markdown, no explanations.
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      console.log('🤖 AI Response:', response.substring(0, 500) + '...');
      console.log('🤖 Response length:', response.length);
      console.log('🤖 Response starts with:', response.substring(0, 100));
      console.log('🤖 Response ends with:', response.substring(response.length - 100));
      
      // Try to extract JSON array from the response
      let jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        // Try to find JSON object
        jsonMatch = response.match(/\{[\s\S]*\}/);
      }
      
      if (jsonMatch) {
        try {
          const alerts = JSON.parse(jsonMatch[0]);
          console.log(`✅ AI generated ${alerts.length} risk alerts:`, alerts.map((a: any) => `${a.type} - ${a.severity}`));
          return alerts.map((alert: any) => ({
            ...alert,
            detectedAt: new Date(),
          }));
        } catch (parseError) {
          console.error('❌ JSON parsing failed:', parseError);
          console.error('❌ Failed JSON string:', jsonMatch[0]);
        }
      } else {
        console.warn('⚠️ No JSON found in AI response');
        console.warn('⚠️ Response content:', response);
      }
      
      console.log('❌ AI failed to generate valid JSON, using fallback alerts');
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
 * Simulates impact on a user's actual supply chain using AI analysis.
 */
export class ImpactSimulatorAgent {
    private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    async simulateImpact(userId: string, risks: RiskAlert[]): Promise<SimulationResult> {
        try {
            await connectToDatabase();
            
            // Fetch user's supply chain data for impact analysis
            const [shipments, products, suppliers, factories, warehouses] = await Promise.all([
                Shipment.find({ userId }).populate('productId', 'name supplier'),
                Product.find({ userId }),
                Supplier.find({ userId }),
                Factory.find({ userId }),
                Warehouse.find({ userId })
            ]);

            // Calculate current supply chain metrics
            const totalShipmentValue = shipments.reduce((sum, s) => sum + (s.totalValue || 0), 0);
            const delayedShipments = shipments.filter(s => s.status === 'delayed' || s.status === 'stuck');
            const highRiskSuppliers = suppliers.filter(s => s.riskLevel === 'high');
            const lowUtilizationFactories = factories.filter(f => f.Utilization < 50);
            const highUtilizationWarehouses = warehouses.filter(w => (w.Current_Stock / w.Capacity) > 80);

            // Create user summary for the prompt
            const userSummary = {
                totalShipments: shipments.length,
                totalValue: totalShipmentValue,
                delayedShipments: delayedShipments.length,
                highRiskSuppliers: highRiskSuppliers.length,
                lowUtilizationFactories: lowUtilizationFactories.length,
                highUtilizationWarehouses: highUtilizationWarehouses.length
            };

            const prompt = `
You are a world-class supply chain impact simulation AI. Your task is to analyze the detected risks and user's supply chain data to simulate potential impacts and generate mitigation strategies.

**Detected Risks:**
${JSON.stringify(risks, null, 2)}

**User's Supply Chain Summary:**
${JSON.stringify(userSummary, null, 2)}

**User's Supply Chain Data:**
- Shipments: ${shipments.length} total, ${delayedShipments.length} delayed/stuck
- Products: ${products.length} items
- Suppliers: ${suppliers.length} suppliers, ${highRiskSuppliers.length} high-risk
- Factories: ${factories.length} facilities, ${lowUtilizationFactories.length} under-utilized
- Warehouses: ${warehouses.length} facilities, ${highUtilizationWarehouses.length} over-utilized

**Instructions:**
1. **Analyze Impact:** Consider how the detected risks will affect the user's specific supply chain.
2. **Generate Simulation:** Create a comprehensive impact simulation with alternative routes and mitigation strategies.
3. **Be Specific:** Provide concrete, actionable recommendations based on the user's actual data.
4. **Format Correctly:** Return ONLY a valid JSON object. Do not include any explanatory text, markdown formatting, or code blocks.

**Required JSON Structure:**
{
  "originalRoute": {
    "origin": "string",
    "transit": ["array of transit points"],
    "destination": "string", 
    "distance": "number in km",
    "duration": "number in days",
    "cost": "number in USD"
  },
  "disruptionImpact": {
    "delayDays": "number of days delay",
    "additionalCost": "additional cost in USD",
    "affectedShipments": "number of affected shipments",
    "riskLevel": "low|medium|high|critical",
    "affectedProducts": "number of affected products",
    "affectedSuppliers": "number of affected suppliers",
    "capacityImpact": "percentage impact on capacity",
    "revenueImpact": "percentage impact on revenue"
  },
  "alternatives": [
    {
      "route": "string description",
      "cost": "number in USD",
      "duration": "number in days",
      "riskLevel": "low|medium|high|critical",
      "feasibility": "high|medium|low"
    }
  ],
  "mitigationStrategies": [
    {
      "strategy": "string description",
      "cost": "number in USD",
      "timeToImplement": "number in days",
      "effectiveness": "percentage",
      "priority": "high|medium|low"
    }
  ]
}

**IMPORTANT:** Return ONLY the JSON object. No other text, no markdown, no explanations.
`;
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            
            console.log('🔍 AI Response:', response);
            console.log('🔍 Response length:', response.length);
            console.log('🔍 Response starts with:', response.substring(0, 100));
            console.log('🔍 Response ends with:', response.substring(response.length - 100));
            
            // Try to extract JSON from the response
            let jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                // Try to find JSON array
                jsonMatch = response.match(/\[[\s\S]*\]/);
            }
            
            if (jsonMatch) {
                try {
                    const simulation = JSON.parse(jsonMatch[0]);
                    console.log('✅ AI generated impact simulation:', simulation);
                    return simulation;
                } catch (parseError) {
                    console.error('❌ JSON parsing failed:', parseError);
                    console.error('❌ Failed JSON string:', jsonMatch[0]);
                }
            } else {
                console.warn('⚠️ No JSON found in AI response');
                console.warn('⚠️ Response content:', response);
            }

            // Fallback simulation
            console.log('❌ AI failed to generate valid simulation, using fallback');
            return {
                originalRoute: { 
                    origin: 'Multiple', 
                    transit: [], 
                    destination: 'Multiple', 
                    distance: 0, 
                    duration: 25, 
                    cost: totalShipmentValue 
                },
                disruptionImpact: { 
                    delayDays: risks.length * 2, 
                    additionalCost: totalShipmentValue * 0.15, 
                    affectedShipments: risks.flatMap(r => r.affectedShipments).length, 
                    riskLevel: risks.some(r => r.severity === 'critical') ? 'critical' : 'high',
                    affectedProducts: risks.flatMap(r => r.affectedProducts).length,
                    affectedSuppliers: risks.flatMap(r => r.affectedSuppliers || []).length,
                    capacityImpact: 25,
                    revenueImpact: 15
                },
                alternatives: [],
                mitigationStrategies: []
            };

        } catch (error) {
            console.error('Impact simulation error:', error);
            // Return basic simulation based on risks
            return {
                originalRoute: { origin: 'Multiple', transit: [], destination: 'Multiple', distance: 0, duration: 25, cost: 500000 },
                disruptionImpact: { 
                    delayDays: risks.length * 2, 
                    additionalCost: 75000, 
                    affectedShipments: risks.flatMap(r => r.affectedShipments).length, 
                    riskLevel: 'high',
                    affectedProducts: risks.flatMap(r => r.affectedProducts).length,
                    affectedSuppliers: risks.flatMap(r => r.affectedSuppliers || []).length,
                    capacityImpact: 20,
                    revenueImpact: 10
                },
                alternatives: [],
                mitigationStrategies: []
            };
        }
    }
}

/**
 * Agent 3: Strategy Recommender
 * Provides AI-driven recommendations based on detected risks and impact simulation.
 */
export class StrategyRecommenderAgent {
    private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    async generateRecommendations(userId: string, risks: RiskAlert[], simulation: SimulationResult): Promise<StrategyRecommendation> {
        try {
            await connectToDatabase();
            
            // Fetch user's supply chain data for context-aware recommendations
            const [products, suppliers, factories, warehouses, retailers] = await Promise.all([
                Product.find({ userId }).limit(10),
                Supplier.find({ userId }).limit(10),
                Factory.find({ userId }).limit(10),
                Warehouse.find({ userId }).limit(10),
                Retailer.find({ userId }).limit(10)
            ]);

            const prompt = `
You are an expert supply chain strategy consultant. Analyze the detected risks, impact simulation, and user's supply chain data to generate actionable strategic recommendations.

**Detected Risks:**
${JSON.stringify(risks, null, 2)}

**Impact Simulation:**
${JSON.stringify(simulation, null, 2)}

**User's Supply Chain Context:**
- Products: ${products.length} items across ${new Set(products.map(p => p.category)).size} categories
- Suppliers: ${suppliers.length} suppliers across ${new Set(suppliers.map(s => s.country)).size} countries
- Factories: ${factories.length} facilities with average ${(factories.reduce((sum, f) => sum + f.Utilization, 0) / factories.length || 0).toFixed(1)}% utilization
- Warehouses: ${warehouses.length} facilities with average ${(warehouses.reduce((sum, w) => sum + (w.Current_Stock / w.Capacity * 100), 0) / warehouses.length || 0).toFixed(1)}% utilization
- Retailers: ${retailers.length} partners with total sales volume of $${retailers.reduce((sum, r) => sum + r.Sales_Volume, 0).toLocaleString()}

**Instructions:**
1. **Analyze Risks:** Consider how each detected risk affects the user's specific supply chain.
2. **Generate Strategies:** Create practical, actionable recommendations that address the identified risks.
3. **Be Specific:** Provide concrete actions with realistic costs and timelines.
4. **Format Correctly:** Return ONLY a valid JSON object. Do not include any explanatory text, markdown formatting, or code blocks.

**Required JSON Structure:**
{
  "immediate": [
    {
      "action": "string",
      "priority": "high|medium|low",
      "estimatedCost": "number in USD",
      "timeToImplement": "number in days",
      "expectedImpact": "string description"
    }
  ],
  "shortTerm": [
    {
      "action": "string",
      "priority": "high|medium|low", 
      "estimatedCost": "number in USD",
      "timeToImplement": "number in days",
      "expectedImpact": "string description"
    }
  ],
  "longTerm": [
    {
      "action": "string",
      "priority": "high|medium|low",
      "estimatedCost": "number in USD", 
      "timeToImplement": "number in days",
      "expectedImpact": "string description"
    }
  ],
  "contingencyPlans": [
    {
      "scenario": "string",
      "action": "string",
      "trigger": "string",
      "estimatedCost": "number in USD",
      "effectiveness": "percentage"
    }
  ],
  "riskMitigation": [
    {
      "riskType": "string",
      "strategy": "string",
      "cost": "number in USD",
      "effectiveness": "percentage",
      "implementationTime": "number in days"
    }
  ]
}

**IMPORTANT:** Return ONLY the JSON object. No other text, no markdown, no explanations.
`;

            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            
            console.log('🔍 AI Response:', response);
            console.log('🔍 Response length:', response.length);
            console.log('🔍 Response starts with:', response.substring(0, 100));
            console.log('🔍 Response ends with:', response.substring(response.length - 100));
            
            // Try to extract JSON from the response
            let jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                // Try to find JSON array
                jsonMatch = response.match(/\[[\s\S]*\]/);
            }
            
            if (jsonMatch) {
                try {
                    const recommendations = JSON.parse(jsonMatch[0]);
                    console.log('✅ AI generated strategic recommendations:', recommendations);
                    console.log('✅ Recommendations structure:', {
                        immediate: recommendations.immediate?.length || 0,
                        shortTerm: recommendations.shortTerm?.length || 0,
                        longTerm: recommendations.longTerm?.length || 0,
                        contingencyPlans: recommendations.contingencyPlans?.length || 0,
                        riskMitigation: recommendations.riskMitigation?.length || 0
                    });
                    return recommendations;
                } catch (parseError) {
                    console.error('❌ JSON parsing failed:', parseError);
                    console.error('❌ Failed JSON string:', jsonMatch[0]);
                }
            } else {
                console.warn('⚠️ No JSON found in AI response');
                console.warn('⚠️ Response content:', response);
            }

            // Fallback to sample strategies
            console.log('❌ AI failed to generate valid recommendations, using fallback');
            return this.getSampleStrategies();

        } catch (error) {
            console.error('Strategy generation error:', error);
            return this.getSampleStrategies();
        }
    }

    public getSampleStrategies(): StrategyRecommendation {
        return {
            immediate: [
                {
                    action: 'Contact carriers for status updates on delayed shipments',
                    priority: 'high',
                    estimatedCost: 0,
                    timeToImplement: 1,
                    expectedImpact: 'Immediate visibility into shipment status'
                }
            ],
            shortTerm: [
                {
                    action: 'Explore alternative shipping routes',
                    priority: 'high',
                    estimatedCost: 5000,
                    timeToImplement: 3,
                    expectedImpact: 'Reduce delivery delays by 30%'
                }
            ],
            longTerm: [
                {
                    action: 'Diversify supplier base in key regions',
                    priority: 'medium',
                    estimatedCost: 50000,
                    timeToImplement: 90,
                    expectedImpact: 'Reduce supply chain risk by 40%'
                }
            ],
            contingencyPlans: [
                {
                    scenario: 'Major port closure',
                    action: 'Activate air freight contingency',
                    trigger: 'Port closure > 48 hours',
                    estimatedCost: 25000,
                    effectiveness: 85
                }
            ],
            riskMitigation: [
                {
                    riskType: 'Supplier Risk',
                    strategy: 'Develop backup suppliers',
                    cost: 15000,
                    effectiveness: 75,
                    implementationTime: 30
                }
            ]
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
      let conditions: any[] = [];
      let news: any[] = [];
      
      try {
        [conditions, news] = await Promise.all([
          getGlobalConditions(),
          getSupplyChainNews(10) // Fetch 10 latest news items
        ]);
        console.log(`📊 Fetched ${conditions.length} global conditions and ${news.length} news items`);
        console.log('Global conditions:', conditions.map(c => `${c.region}: ${c.condition} (${c.severity})`));
        console.log('News items:', news.map(n => `${n.title} - ${n.source}`));
      } catch (error) {
        console.warn('⚠️ Failed to fetch global data, continuing with empty data:', error);
        conditions = [];
        news = [];
      }

      // 2. Run Risk Monitor with userId (fetches both user data and live data internally)
      console.log('🤖 Agent 1: Detecting risks from live and user data...');
      let risks: any[] = [];
      try {
        risks = await this.riskMonitor.detectRisks(userId);
        console.log(`✅ Risk Monitor generated ${risks.length} risk alerts`);
      } catch (error) {
        console.warn('⚠️ Risk Monitor failed, using empty risks array:', error);
        risks = [];
      }

      // 3. Run Impact Simulator based on detected risks
      console.log('🤖 Agent 2: Simulating impact...');
      let simulation: any = {};
      try {
        simulation = await this.impactSimulator.simulateImpact(userId, risks);
        console.log('✅ Impact Simulator generated simulation');
      } catch (error) {
        console.warn('⚠️ Impact Simulator failed, using fallback simulation:', error);
        simulation = {
          originalRoute: { origin: 'Multiple', transit: [], destination: 'Multiple', distance: 0, duration: 25, cost: 0 },
          disruptionImpact: { delayDays: risks.length * 2, additionalCost: 75000, affectedShipments: 0, riskLevel: 'high', affectedProducts: 0, affectedSuppliers: 0, capacityImpact: 20, revenueImpact: 10 },
          alternatives: [],
          mitigationStrategies: []
        };
      }
      
      // 4. Run Strategy Recommender based on detected risks
      console.log('🤖 Agent 3: Generating strategies...');
      let recommendations: any = {};
      try {
        recommendations = await this.strategyRecommender.generateRecommendations(userId, risks, simulation);
        console.log('✅ Strategy Recommender generated recommendations');
      } catch (error) {
        console.warn('⚠️ Strategy Recommender failed, using fallback strategies:', error);
        recommendations = this.strategyRecommender.getSampleStrategies();
      }

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
      console.error('❌ Critical error in multi-agent analysis:', error);
      
      // Return fallback data if everything fails
      const fallbackRecommendations = this.strategyRecommender.getSampleStrategies();
      
      return {
        risks: [],
        simulation: {
          originalRoute: { origin: 'Multiple', transit: [], destination: 'Multiple', distance: 0, duration: 25, cost: 0 },
          disruptionImpact: { delayDays: 0, additionalCost: 0, affectedShipments: 0, riskLevel: 'low', affectedProducts: 0, affectedSuppliers: 0, capacityImpact: 0, revenueImpact: 0 },
          alternatives: [],
          mitigationStrategies: []
        },
        recommendations: fallbackRecommendations,
        analysisTimestamp: new Date().toISOString(),
        summary: {
          totalRisks: 0,
          highRiskCount: 0,
          recommendationsCount: fallbackRecommendations.immediate.length + fallbackRecommendations.shortTerm.length + fallbackRecommendations.longTerm.length
        }
      };
    }
  }

  async runWhatIfSimulation(userId: string, scenario: string) {
    try {
      // This can be further enhanced, but uses the main branch's logic for now
      const simulation = generateWhatIfSimulation(scenario); 
      return {
        ...simulation,
        scenario // Override the scenario from the simulation with the user-provided one
      };
    } catch (error) {
      console.error('Error in what-if simulation:', error);
      throw error;
    }
  }
}

// Export a single instance to be used across the application
export const multiAgentSystem = new MultiAgentOrchestrator();