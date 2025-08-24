export interface DemoRiskAlert {
  id: string;
  type: 'geopolitical' | 'weather' | 'port_closure' | 'trade_disruption' | 'labor_strike' | 'regulatory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  region: string;
  title: string;
  description: string;
  impact: string;
  detectedAt: Date;
  sources: string[];
  affectedRoutes: string[];
  estimatedDuration: string;
  mitigationActions: string[];
  probability: number;
}

export const demoRiskAlerts: DemoRiskAlert[] = [
  {
    id: 'alert_001',
    type: 'geopolitical',
    severity: 'high',
    region: 'India',
    title: 'Red Sea Shipping Disruptions Escalate',
    description: 'Increased tensions in the Red Sea region causing major shipping companies to reroute vessels around the Cape of Good Hope.',
    impact: 'Potential 7-14 day delays, 15-25% cost increase for affected routes',
    detectedAt: new Date('2024-01-28'),
    sources: ['Reuters Maritime', 'Lloyd\'s List', 'TradeWinds'],
    affectedRoutes: ['Asia-Europe', 'Asia-Mediterranean'],
    estimatedDuration: '3-6 months',
    mitigationActions: [
      'Activate alternative routes via Cape of Good Hope',
      'Increase safety stock levels by 20-30%',
      'Negotiate premium rates with carriers'
    ],
    probability: 85
  },
  {
    id: 'alert_002',
    type: 'port_closure',
    severity: 'medium',
    region: 'Shanghai',
    title: 'Shanghai Port Congestion Worsens',
    description: 'COVID-related restrictions and increased container volumes causing significant delays at Shanghai port terminals.',
    impact: '3-5 day departure delays, increased container costs',
    detectedAt: new Date('2024-01-27'),
    sources: ['Port of Shanghai', 'Container News'],
    affectedRoutes: ['China-US West Coast', 'China-Europe'],
    estimatedDuration: '2-4 weeks',
    mitigationActions: [
      'Consider alternative ports (Ningbo, Qingdao)',
      'Book container space 2-3 weeks in advance'
    ],
    probability: 70
  },
  {
    id: 'alert_003',
    type: 'weather',
    severity: 'high',
    region: 'Panama Canal',
    title: 'Panama Canal Drought Restrictions',
    description: 'Severe drought conditions forcing Panama Canal Authority to implement transit restrictions.',
    impact: 'Increased transit times, higher canal fees, potential 5-7 day delays',
    detectedAt: new Date('2024-01-26'),
    sources: ['Panama Canal Authority', 'Weather Channel'],
    affectedRoutes: ['US East Coast-Asia', 'Europe-US West Coast'],
    estimatedDuration: '4-8 months',
    mitigationActions: [
      'Consider Suez Canal routing for Asia-US East Coast',
      'Use US West Coast ports with rail transport'
    ],
    probability: 90
  }
];
