// lib/strategy-recommender.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface StrategyRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'immediate' | 'short_term' | 'long_term';
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: StrategyImpact;
  implementation: ImplementationDetails;
  tradeoffs: Tradeoff[];
  confidence: number;
  createdAt: Date;
}

export interface StrategyImpact {
  costDelta: number; // percentage change
  delayDelta: number; // days change
  riskReduction: number; // percentage reduction
  revenueImpact: number; // percentage change
  customerSatisfaction: number; // 0-100
  implementationTime: number; // days
}

export interface ImplementationDetails {
  steps: string[];
  resources: string[];
  timeline: number; // days
  cost: number;
  difficulty: 'easy' | 'medium' | 'hard';
  dependencies: string[];
}

export interface Tradeoff {
  aspect: string;
  currentValue: number;
  proposedValue: number;
  change: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface StrategyComparison {
  strategies: StrategyRecommendation[];
  comparison: {
    bestCostEfficiency: StrategyRecommendation;
    bestRiskReduction: StrategyRecommendation;
    bestQuickWin: StrategyRecommendation;
    overallRecommendation: StrategyRecommendation;
  };
  summary: {
    totalCost: number;
    averageRiskReduction: number;
    averageImplementationTime: number;
    expectedROI: number;
  };
}

export class StrategyRecommender {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async generateRecommendations(
    context: {
      shipments: any[];
      products: any[];
      suppliers: any[];
      vulnerabilities: any[];
      risks: any[];
    }
  ): Promise<StrategyRecommendation[]> {
    const recommendations: StrategyRecommendation[] = [];

    // Generate immediate actions
    const immediateActions = await this.generateImmediateActions(context);
    recommendations.push(...immediateActions);

    // Generate short-term strategies
    const shortTermStrategies = await this.generateShortTermStrategies(context);
    recommendations.push(...shortTermStrategies);

    // Generate long-term strategies
    const longTermStrategies = await this.generateLongTermStrategies(context);
    recommendations.push(...longTermStrategies);

    return recommendations;
  }

  private async generateImmediateActions(context: any): Promise<StrategyRecommendation[]> {
    const actions: StrategyRecommendation[] = [];

    // Analyze high-risk shipments
    const highRiskShipments = context.shipments.filter((s: any) => 
      s.status === 'Delayed' || s.status === 'Stuck'
    );

    if (highRiskShipments.length > 0) {
      actions.push({
        id: `immediate_${Date.now()}_1`,
        title: 'Emergency Shipment Rerouting',
        description: 'Immediately reroute delayed shipments to alternative routes to minimize delays',
        category: 'immediate',
        priority: 'critical',
        impact: {
          costDelta: 15,
          delayDelta: -5,
          riskReduction: 30,
          revenueImpact: 5,
          customerSatisfaction: 20,
          implementationTime: 1
        },
        implementation: {
          steps: [
            'Identify all delayed shipments',
            'Contact carriers for alternative routes',
            'Update tracking information',
            'Notify customers of route changes'
          ],
          resources: ['Logistics team', 'Carrier contacts', 'Customer service'],
          timeline: 1,
          cost: 5000,
          difficulty: 'medium',
          dependencies: ['Carrier availability', 'Route alternatives']
        },
        tradeoffs: [
          {
            aspect: 'Cost',
            currentValue: 0,
            proposedValue: 15,
            change: 15,
            impact: 'negative',
            description: 'Additional routing costs'
          },
          {
            aspect: 'Delay',
            currentValue: 10,
            proposedValue: 5,
            change: -5,
            impact: 'positive',
            description: 'Reduced delivery delays'
          }
        ],
        confidence: 0.9,
        createdAt: new Date()
      });
    }

    // Supplier diversification for single-source products
    const singleSourceProducts = this.identifySingleSourceProducts(context);
    if (singleSourceProducts.length > 0) {
      actions.push({
        id: `immediate_${Date.now()}_2`,
        title: 'Emergency Supplier Backup',
        description: 'Establish backup suppliers for critical single-source products',
        category: 'immediate',
        priority: 'high',
        impact: {
          costDelta: 10,
          delayDelta: 0,
          riskReduction: 40,
          revenueImpact: 0,
          customerSatisfation: 0,
          implementationTime: 3
        },
        implementation: {
          steps: [
            'Identify single-source products',
            'Research alternative suppliers',
            'Establish backup agreements',
            'Test supplier capabilities'
          ],
          resources: ['Procurement team', 'Supplier database', 'Quality assurance'],
          timeline: 3,
          cost: 15000,
          difficulty: 'hard',
          dependencies: ['Supplier availability', 'Quality standards']
        },
        tradeoffs: [
          {
            aspect: 'Cost',
            currentValue: 0,
            proposedValue: 10,
            change: 10,
            impact: 'negative',
            description: 'Additional supplier costs'
          },
          {
            aspect: 'Risk',
            currentValue: 80,
            proposedValue: 40,
            change: -40,
            impact: 'positive',
            description: 'Reduced supplier concentration risk'
          }
        ],
        confidence: 0.85,
        createdAt: new Date()
      });
    }

    return actions;
  }

  private async generateShortTermStrategies(context: any): Promise<StrategyRecommendation[]> {
    const strategies: StrategyRecommendation[] = [];

    // Route optimization
    strategies.push({
      id: `short_term_${Date.now()}_1`,
      title: 'Route Optimization Program',
      description: 'Implement AI-powered route optimization to reduce transit times and costs',
      category: 'short_term',
      priority: 'high',
      impact: {
        costDelta: -8,
        delayDelta: -3,
        riskReduction: 15,
        revenueImpact: 3,
        customerSatisfaction: 10,
        implementationTime: 14
      },
      implementation: {
        steps: [
          'Deploy route optimization software',
          'Integrate with existing systems',
          'Train logistics team',
          'Monitor and adjust routes'
        ],
        resources: ['IT team', 'Logistics software', 'Training materials'],
        timeline: 14,
        cost: 25000,
        difficulty: 'medium',
        dependencies: ['Software integration', 'Team training']
      },
      tradeoffs: [
        {
          aspect: 'Cost',
          currentValue: 100,
          proposedValue: 92,
          change: -8,
          impact: 'positive',
          description: 'Reduced transportation costs'
        },
        {
          aspect: 'Delay',
          currentValue: 7,
          proposedValue: 4,
          change: -3,
          impact: 'positive',
          description: 'Faster delivery times'
        }
      ],
      confidence: 0.8,
      createdAt: new Date()
    });

    // Inventory optimization
    strategies.push({
      id: `short_term_${Date.now()}_2`,
      title: 'Smart Inventory Management',
      description: 'Implement predictive inventory management to reduce stockouts and excess inventory',
      category: 'short_term',
      priority: 'medium',
      impact: {
        costDelta: -5,
        delayDelta: -2,
        riskReduction: 20,
        revenueImpact: 2,
        customerSatisfaction: 5,
        implementationTime: 21
      },
      implementation: {
        steps: [
          'Analyze demand patterns',
          'Set up predictive models',
          'Implement automated reordering',
          'Monitor inventory levels'
        ],
        resources: ['Analytics team', 'Inventory software', 'Historical data'],
        timeline: 21,
        cost: 20000,
        difficulty: 'medium',
        dependencies: ['Data quality', 'Software implementation']
      },
      tradeoffs: [
        {
          aspect: 'Cost',
          currentValue: 100,
          proposedValue: 95,
          change: -5,
          impact: 'positive',
          description: 'Reduced inventory holding costs'
        },
        {
          aspect: 'Risk',
          currentValue: 60,
          proposedValue: 40,
          change: -20,
          impact: 'positive',
          description: 'Reduced stockout risk'
        }
      ],
      confidence: 0.75,
      createdAt: new Date()
    });

    return strategies;
  }

  private async generateLongTermStrategies(context: any): Promise<StrategyRecommendation[]> {
    const strategies: StrategyRecommendation[] = [];

    // Supply chain digitization
    strategies.push({
      id: `long_term_${Date.now()}_1`,
      title: 'End-to-End Supply Chain Digitization',
      description: 'Implement comprehensive digital transformation across the entire supply chain',
      category: 'long_term',
      priority: 'high',
      impact: {
        costDelta: -15,
        delayDelta: -5,
        riskReduction: 35,
        revenueImpact: 8,
        customerSatisfaction: 15,
        implementationTime: 90
      },
      implementation: {
        steps: [
          'Assess current digital maturity',
          'Design digital architecture',
          'Implement core systems',
          'Train all stakeholders',
          'Monitor and optimize'
        ],
        resources: ['Digital transformation team', 'Technology partners', 'Change management'],
        timeline: 90,
        cost: 150000,
        difficulty: 'hard',
        dependencies: ['Executive buy-in', 'Technology infrastructure', 'Change management']
      },
      tradeoffs: [
        {
          aspect: 'Cost',
          currentValue: 100,
          proposedValue: 85,
          change: -15,
          impact: 'positive',
          description: 'Significant operational cost reduction'
        },
        {
          aspect: 'Implementation Time',
          currentValue: 0,
          proposedValue: 90,
          change: 90,
          impact: 'negative',
          description: 'Long implementation timeline'
        }
      ],
      confidence: 0.7,
      createdAt: new Date()
    });

    // Global supplier network
    strategies.push({
      id: `long_term_${Date.now()}_2`,
      title: 'Global Supplier Network Expansion',
      description: 'Develop a diversified global supplier network to reduce regional dependencies',
      category: 'long_term',
      priority: 'medium',
      impact: {
        costDelta: 5,
        delayDelta: -2,
        riskReduction: 50,
        revenueImpact: 3,
        customerSatisfaction: 8,
        implementationTime: 180
      },
      implementation: {
        steps: [
          'Identify strategic regions',
          'Research potential suppliers',
          'Establish partnerships',
          'Develop logistics infrastructure',
          'Implement quality controls'
        ],
        resources: ['Global procurement team', 'Legal team', 'Quality assurance'],
        timeline: 180,
        cost: 100000,
        difficulty: 'hard',
        dependencies: ['Market research', 'Legal compliance', 'Quality standards']
      },
      tradeoffs: [
        {
          aspect: 'Cost',
          currentValue: 100,
          proposedValue: 105,
          change: 5,
          impact: 'negative',
          description: 'Initial setup and coordination costs'
        },
        {
          aspect: 'Risk',
          currentValue: 70,
          proposedValue: 20,
          change: -50,
          impact: 'positive',
          description: 'Significant risk reduction through diversification'
        }
      ],
      confidence: 0.65,
      createdAt: new Date()
    });

    return strategies;
  }

  private identifySingleSourceProducts(context: any): any[] {
    const productSupplierMap = new Map<string, Set<string>>();
    
    context.products.forEach((product: any) => {
      if (product.supplierId) {
        const productId = product._id.toString();
        if (!productSupplierMap.has(productId)) {
          productSupplierMap.set(productId, new Set());
        }
        productSupplierMap.get(productId)!.add(product.supplierId);
      }
    });

    const singleSourceProducts: any[] = [];
    for (const [productId, suppliers] of productSupplierMap.entries()) {
      if (suppliers.size === 1) {
        const product = context.products.find((p: any) => p._id.toString() === productId);
        if (product) {
          singleSourceProducts.push(product);
        }
      }
    }

    return singleSourceProducts;
  }

  async compareStrategies(strategies: StrategyRecommendation[]): Promise<StrategyComparison> {
    // Find best strategies by different criteria
    const bestCostEfficiency = strategies.reduce((best, current) => 
      current.impact.costDelta < best.impact.costDelta ? current : best
    );

    const bestRiskReduction = strategies.reduce((best, current) => 
      current.impact.riskReduction > best.impact.riskReduction ? current : best
    );

    const bestQuickWin = strategies.reduce((best, current) => 
      current.implementation.timeline < best.implementation.timeline ? current : best
    );

    // Overall recommendation based on weighted scoring
    const overallRecommendation = this.calculateOverallRecommendation(strategies);

    // Calculate summary metrics
    const totalCost = strategies.reduce((sum, s) => sum + s.implementation.cost, 0);
    const averageRiskReduction = strategies.reduce((sum, s) => sum + s.impact.riskReduction, 0) / strategies.length;
    const averageImplementationTime = strategies.reduce((sum, s) => sum + s.implementation.timeline, 0) / strategies.length;
    const expectedROI = this.calculateExpectedROI(strategies);

    return {
      strategies,
      comparison: {
        bestCostEfficiency,
        bestRiskReduction,
        bestQuickWin,
        overallRecommendation
      },
      summary: {
        totalCost,
        averageRiskReduction,
        averageImplementationTime,
        expectedROI
      }
    };
  }

  private calculateOverallRecommendation(strategies: StrategyRecommendation[]): StrategyRecommendation {
    // Weighted scoring system
    const weights = {
      costEfficiency: 0.25,
      riskReduction: 0.30,
      implementationTime: 0.20,
      confidence: 0.15,
      priority: 0.10
    };

    const priorityScores = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };

    let bestScore = -Infinity;
    let bestStrategy = strategies[0];

    strategies.forEach(strategy => {
      const costScore = -strategy.impact.costDelta; // Negative because lower cost is better
      const riskScore = strategy.impact.riskReduction;
      const timeScore = -strategy.implementation.timeline; // Negative because shorter time is better
      const confidenceScore = strategy.confidence * 100;
      const priorityScore = priorityScores[strategy.priority];

      const totalScore = 
        costScore * weights.costEfficiency +
        riskScore * weights.riskReduction +
        timeScore * weights.implementationTime +
        confidenceScore * weights.confidence +
        priorityScore * weights.priority;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestStrategy = strategy;
      }
    });

    return bestStrategy;
  }

  private calculateExpectedROI(strategies: StrategyRecommendation[]): number {
    const totalInvestment = strategies.reduce((sum, s) => sum + s.implementation.cost, 0);
    const totalAnnualSavings = strategies.reduce((sum, s) => {
      const annualCostReduction = (s.impact.costDelta / 100) * 1000000; // Assuming $1M baseline
      return sum + Math.abs(annualCostReduction);
    }, 0);

    return totalInvestment > 0 ? ((totalAnnualSavings - totalInvestment) / totalInvestment) * 100 : 0;
  }

  async generateCustomRecommendation(
    specificIssue: string,
    context: any
  ): Promise<StrategyRecommendation> {
    try {
      const prompt = `
        Given this specific supply chain issue:
        Issue: ${specificIssue}
        
        Context:
        - Shipments: ${context.shipments.length}
        - Products: ${context.products.length}
        - Suppliers: ${context.suppliers.length}
        
        Generate a specific, actionable strategy recommendation with:
        1. Clear title and description
        2. Impact metrics (cost, delay, risk changes)
        3. Implementation steps
        4. Trade-offs
        
        Return as a JSON object with the structure of a StrategyRecommendation.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const aiRecommendation = JSON.parse(response.text());

      return {
        id: `custom_${Date.now()}`,
        ...aiRecommendation,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error generating custom recommendation:', error);
      return {
        id: `custom_${Date.now()}`,
        title: 'Custom Strategy Recommendation',
        description: 'AI-generated recommendation based on specific issue analysis',
        category: 'short_term',
        priority: 'medium',
        impact: {
          costDelta: 0,
          delayDelta: 0,
          riskReduction: 10,
          revenueImpact: 0,
          customerSatisfaction: 5,
          implementationTime: 30
        },
        implementation: {
          steps: ['Analyze issue', 'Develop solution', 'Implement changes'],
          resources: ['Team resources', 'Budget allocation'],
          timeline: 30,
          cost: 10000,
          difficulty: 'medium',
          dependencies: ['Stakeholder approval']
        },
        tradeoffs: [
          {
            aspect: 'Risk',
            currentValue: 50,
            proposedValue: 40,
            change: -10,
            impact: 'positive',
            description: 'Risk reduction through targeted intervention'
          }
        ],
        confidence: 0.6,
        createdAt: new Date()
      };
    }
  }
}

// Export singleton instance
export const strategyRecommender = new StrategyRecommender();
