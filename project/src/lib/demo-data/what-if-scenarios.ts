export interface WhatIfScenario {
  id: string;
  title: string;
  description: string;
  category: 'geopolitical' | 'weather' | 'infrastructure' | 'regulatory' | 'economic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  duration: string;
  probability: number;
}

export interface WhatIfSimulationResult {
  scenario: string;
  impact: {
    delayDays: number;
    additionalCost: number;
    affectedShipments: number;
    riskLevel: string;
    supplyChainDisruption: string;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  alternativeRoutes: {
    name: string;
    description: string;
    pros: string[];
    cons: string[];
    costImpact: number;
    timeImpact: number;
  }[];
  timestamp: Date;
}

export const demoWhatIfScenarios: WhatIfScenario[] = [
  {
    id: 'scenario_001',
    title: 'Panama Canal Complete Closure',
    description: 'Complete closure of Panama Canal due to severe drought or infrastructure failure',
    category: 'infrastructure',
    severity: 'critical',
    duration: '6-12 months',
    probability: 15
  },
  {
    id: 'scenario_002',
    title: 'Major Port Strike in Los Angeles',
    description: 'Extended labor strike affecting all major ports on US West Coast',
    category: 'geopolitical',
    severity: 'high',
    duration: '2-4 weeks',
    probability: 25
  },
  {
    id: 'scenario_003',
    title: 'Hurricane Season - Category 5',
    description: 'Multiple Category 5 hurricanes affecting Gulf Coast ports and shipping lanes',
    category: 'weather',
    severity: 'high',
    duration: '3-6 months',
    probability: 30
  },
  {
    id: 'scenario_004',
    title: 'New EU Import Tariffs',
    description: 'Implementation of 25% tariffs on electronics imports from Asia',
    category: 'regulatory',
    severity: 'medium',
    duration: 'Ongoing',
    probability: 40
  },
  {
    id: 'scenario_005',
    title: 'Suez Canal Blockage',
    description: 'Container ship grounding causing complete blockage of Suez Canal',
    category: 'infrastructure',
    severity: 'critical',
    duration: '1-3 months',
    probability: 10
  },
  {
    id: 'scenario_006',
    title: 'Fuel Price Spike',
    description: '200% increase in marine fuel prices due to geopolitical tensions',
    category: 'economic',
    severity: 'high',
    duration: '6-12 months',
    probability: 35
  }
];

export function generateWhatIfSimulation(scenario: string): WhatIfSimulationResult {
  const scenarioLower = scenario.toLowerCase();
  
  // Panama Canal scenarios
  if (scenarioLower.includes('panama') || scenarioLower.includes('canal')) {
    return {
      scenario,
      impact: {
        delayDays: 21,
        additionalCost: 450000,
        affectedShipments: 45,
        riskLevel: 'critical',
        supplyChainDisruption: 'Severe disruption to Asia-US East Coast routes requiring complete rerouting'
      },
      recommendations: {
        immediate: [
          'Activate Cape of Good Hope routing for all Asia-US East Coast shipments',
          'Contact customers immediately about 3-week delays',
          'Increase air freight capacity for time-critical orders',
          'Review and update all delivery commitments'
        ],
        shortTerm: [
          'Negotiate premium rates with carriers using alternative routes',
          'Establish partnerships with West Coast ports for rail transport',
          'Increase safety stock levels by 40% for critical components',
          'Implement emergency air freight protocols'
        ],
        longTerm: [
          'Develop permanent alternative routing strategies',
          'Invest in regional distribution centers to reduce shipping distances',
          'Diversify supplier base to include more local options',
          'Build strategic partnerships with multiple carriers'
        ]
      },
      alternativeRoutes: [
        {
          name: 'Cape of Good Hope Route',
          description: 'Route shipments around Africa via Cape of Good Hope',
          pros: ['Avoids Panama Canal completely', 'More predictable timing', 'Lower risk of future disruptions'],
          cons: ['15-20 days longer transit', '50-60% higher costs', 'Higher fuel consumption'],
          costImpact: 55,
          timeImpact: 18
        },
        {
          name: 'Suez Canal + Transatlantic',
          description: 'Use Suez Canal then cross Atlantic to US East Coast',
          pros: ['Faster than Cape route', 'Established shipping lanes', 'Multiple carrier options'],
          cons: ['Still 10-12 days longer', '30-40% higher costs', 'Dependent on Suez Canal'],
          costImpact: 35,
          timeImpact: 12
        },
        {
          name: 'West Coast + Rail',
          description: 'Ship to US West Coast then rail to East Coast',
          pros: ['Fastest alternative', 'Established infrastructure', 'Multiple port options'],
          cons: ['Rail capacity limitations', 'Additional handling costs', 'Weather-dependent'],
          costImpact: 25,
          timeImpact: 8
        }
      ],
      timestamp: new Date()
    };
  }
  
  // Port strike scenarios
  if (scenarioLower.includes('strike') || scenarioLower.includes('labor')) {
    return {
      scenario,
      impact: {
        delayDays: 14,
        additionalCost: 280000,
        affectedShipments: 32,
        riskLevel: 'high',
        supplyChainDisruption: 'Major delays at West Coast ports affecting all Asia-US shipments'
      },
      recommendations: {
        immediate: [
          'Divert shipments to alternative West Coast ports (Seattle, Oakland)',
          'Activate air freight for critical shipments',
          'Communicate delays to customers',
          'Review port capacity at alternative locations'
        ],
        shortTerm: [
          'Establish relationships with multiple port operators',
          'Increase buffer inventory by 25%',
          'Negotiate priority handling with carriers',
          'Monitor strike negotiations daily'
        ],
        longTerm: [
          'Develop multi-port strategy to reduce single-point-of-failure',
          'Build relationships with East Coast ports for diversification',
          'Invest in predictive analytics for labor relations',
          'Create contingency agreements with multiple carriers'
        ]
      },
      alternativeRoutes: [
        {
          name: 'Alternative West Coast Ports',
          description: 'Use Seattle, Oakland, or Vancouver ports',
          pros: ['Same general region', 'Established infrastructure', 'Multiple options'],
          cons: ['Limited capacity', 'Potential congestion', 'Additional inland transport'],
          costImpact: 15,
          timeImpact: 5
        },
        {
          name: 'East Coast Routing',
          description: 'Route via Suez Canal to US East Coast',
          pros: ['Completely avoids West Coast', 'Established route', 'Multiple port options'],
          cons: ['10-15 days longer', '25-30% higher costs', 'Suez Canal dependency'],
          costImpact: 30,
          timeImpact: 12
        },
        {
          name: 'Air Freight',
          description: 'Use air freight for time-critical shipments',
          pros: ['Fastest option', 'Reliable timing', 'No port dependency'],
          cons: ['Very expensive', 'Limited capacity', 'Not suitable for all goods'],
          costImpact: 200,
          timeImpact: -10
        }
      ],
      timestamp: new Date()
    };
  }
  
  // Hurricane scenarios
  if (scenarioLower.includes('hurricane') || scenarioLower.includes('storm')) {
    return {
      scenario,
      impact: {
        delayDays: 18,
        additionalCost: 320000,
        affectedShipments: 28,
        riskLevel: 'high',
        supplyChainDisruption: 'Gulf Coast port closures and shipping lane disruptions'
      },
      recommendations: {
        immediate: [
          'Monitor hurricane forecasts and port status updates',
          'Divert shipments to unaffected ports',
          'Activate emergency air freight protocols',
          'Communicate with customers about potential delays'
        ],
        shortTerm: [
          'Establish relationships with alternative ports',
          'Increase safety stock for affected regions',
          'Implement flexible routing protocols',
          'Monitor recovery progress'
        ],
        longTerm: [
          'Develop hurricane season contingency plans',
          'Build relationships with ports in multiple regions',
          'Invest in weather monitoring and prediction systems',
          'Create regional distribution strategies'
        ]
      },
      alternativeRoutes: [
        {
          name: 'East Coast Ports',
          description: 'Route to US East Coast ports',
          pros: ['Avoids Gulf Coast', 'Established infrastructure', 'Multiple options'],
          cons: ['5-7 days longer', '15-20% higher costs', 'Different market access'],
          costImpact: 20,
          timeImpact: 6
        },
        {
          name: 'West Coast + Rail',
          description: 'Use West Coast ports with rail transport',
          pros: ['Completely avoids affected area', 'Established route', 'Reliable timing'],
          cons: ['10-12 days longer', '25-30% higher costs', 'Rail capacity limitations'],
          costImpact: 30,
          timeImpact: 10
        },
        {
          name: 'Canadian Ports',
          description: 'Use Vancouver or Montreal ports',
          pros: ['Avoids US hurricane zone', 'Established infrastructure', 'Reliable operations'],
          cons: ['Customs complications', 'Additional transport costs', 'Limited capacity'],
          costImpact: 25,
          timeImpact: 8
        }
      ],
      timestamp: new Date()
    };
  }
  
  // Default scenario for other cases
  return {
    scenario,
    impact: {
      delayDays: 10,
      additionalCost: 180000,
      affectedShipments: 20,
      riskLevel: 'medium',
      supplyChainDisruption: 'Moderate disruption requiring route adjustments and cost increases'
    },
    recommendations: {
      immediate: [
        'Assess current shipment status and routing options',
        'Contact logistics partners for alternative solutions',
        'Communicate potential delays to customers',
        'Review and update delivery schedules'
      ],
      shortTerm: [
        'Implement alternative routing strategies',
        'Increase buffer inventory by 15%',
        'Negotiate with carriers for priority handling',
        'Monitor situation for improvements'
      ],
      longTerm: [
        'Develop comprehensive contingency planning',
        'Build relationships with multiple logistics partners',
        'Invest in supply chain visibility tools',
        'Create regional diversification strategies'
      ]
    },
    alternativeRoutes: [
      {
        name: 'Alternative Route 1',
        description: 'Primary alternative routing option',
        pros: ['Avoids main disruption', 'Reliable timing', 'Established route'],
        cons: ['5-7 days longer', '15-20% higher costs', 'Limited capacity'],
        costImpact: 20,
        timeImpact: 6
      },
      {
        name: 'Alternative Route 2',
        description: 'Secondary alternative routing option',
        pros: ['Completely different route', 'Multiple carrier options', 'Lower risk'],
        cons: ['8-10 days longer', '25-30% higher costs', 'More complex logistics'],
        costImpact: 30,
        timeImpact: 9
      }
    ],
    timestamp: new Date()
  };
}
