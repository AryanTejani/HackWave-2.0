// lib/event-intelligence.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface DisruptionEvent {
  id: string;
  type: 'port_closure' | 'weather' | 'strike' | 'sanction' | 'cyber_attack' | 'natural_disaster' | 'geopolitical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  country: string;
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  durationDays: number;
  affectedPorts: string[];
  affectedRoutes: string[];
  impactRadius: number; // km
  sources: string[];
  confidence: number; // 0-1
  createdAt: Date;
}

export interface EventImpact {
  eventId: string;
  affectedShipments: string[];
  delayDays: number;
  additionalCost: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  alternativeRoutes: string[];
  recommendations: string[];
}

export class EventIntelligenceSystem {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  private events: DisruptionEvent[] = [];

  constructor() {
    this.initializeDemoEvents();
  }

  private initializeDemoEvents() {
    this.events = [
      {
        id: 'event_001',
        type: 'geopolitical',
        severity: 'high',
        location: 'Red Sea',
        country: 'Yemen',
        title: 'Red Sea Shipping Disruption',
        description: 'Ongoing geopolitical tensions affecting major shipping routes through the Red Sea, causing vessels to reroute via Cape of Good Hope',
        startDate: new Date('2024-01-15'),
        durationDays: 45,
        affectedPorts: ['Jeddah', 'Aqaba', 'Eilat'],
        affectedRoutes: ['Asia-Europe', 'Asia-Mediterranean'],
        impactRadius: 5000,
        sources: ['Maritime Intelligence', 'Trade Reports', 'Shipping Lines'],
        confidence: 0.95,
        createdAt: new Date()
      },
      {
        id: 'event_002',
        type: 'weather',
        severity: 'medium',
        location: 'Shanghai Port',
        country: 'China',
        title: 'Shanghai Port Congestion',
        description: 'High congestion at Shanghai port affecting container availability and causing extended waiting times',
        startDate: new Date('2024-02-01'),
        durationDays: 14,
        affectedPorts: ['Shanghai', 'Ningbo'],
        affectedRoutes: ['Asia-Pacific', 'Asia-Americas'],
        impactRadius: 1000,
        sources: ['Port Authorities', 'Shipping Lines', 'Container Tracking'],
        confidence: 0.85,
        createdAt: new Date()
      },
      {
        id: 'event_003',
        type: 'strike',
        severity: 'medium',
        location: 'Los Angeles Port',
        country: 'USA',
        title: 'LA Port Labor Dispute',
        description: 'Labor negotiations affecting port operations and container handling efficiency',
        startDate: new Date('2024-02-10'),
        durationDays: 7,
        affectedPorts: ['Los Angeles', 'Long Beach'],
        affectedRoutes: ['Asia-Americas', 'Europe-Americas'],
        impactRadius: 500,
        sources: ['Port Authorities', 'Labor Unions', 'Trade Publications'],
        confidence: 0.80,
        createdAt: new Date()
      },
      {
        id: 'event_004',
        type: 'natural_disaster',
        severity: 'high',
        location: 'Pacific Ocean',
        country: 'International Waters',
        title: 'Tropical Storm Warning',
        description: 'Tropical storm developing in Pacific affecting shipping routes and vessel schedules',
        startDate: new Date('2024-02-15'),
        durationDays: 5,
        affectedPorts: ['Manila', 'Hong Kong', 'Taipei'],
        affectedRoutes: ['Asia-Pacific', 'Asia-Americas'],
        impactRadius: 3000,
        sources: ['Weather Services', 'Maritime Alerts', 'Vessel Tracking'],
        confidence: 0.90,
        createdAt: new Date()
      }
    ];
  }

  async ingestNewsEvent(newsText: string): Promise<DisruptionEvent | null> {
    try {
      const prompt = `
        Analyze this news text and extract supply chain disruption information:
        
        "${newsText}"
        
        Return a JSON object with the following structure:
        {
          "type": "port_closure|weather|strike|sanction|cyber_attack|natural_disaster|geopolitical",
          "severity": "low|medium|high|critical",
          "location": "specific location",
          "country": "country name",
          "title": "brief title",
          "description": "detailed description",
          "durationDays": estimated_duration_in_days,
          "affectedPorts": ["port1", "port2"],
          "affectedRoutes": ["route1", "route2"],
          "impactRadius": radius_in_km,
          "sources": ["source1", "source2"],
          "confidence": confidence_score_0_to_1
        }
        
        If this is not a supply chain disruption, return null.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const aiAnalysis = response.text();

      try {
        const eventData = JSON.parse(aiAnalysis);
        const event: DisruptionEvent = {
          id: `event_${Date.now()}`,
          ...eventData,
          startDate: new Date(),
          createdAt: new Date()
        };

        this.events.push(event);
        return event;
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return null;
      }
    } catch (error) {
      console.error('Error ingesting news event:', error);
      return null;
    }
  }

  getActiveEvents(): DisruptionEvent[] {
    const now = new Date();
    return this.events.filter(event => {
      const endDate = event.endDate || new Date(event.startDate.getTime() + event.durationDays * 24 * 60 * 60 * 1000);
      return now >= event.startDate && now <= endDate;
    });
  }

  getEventsByLocation(location: string): DisruptionEvent[] {
    return this.events.filter(event => 
      event.location.toLowerCase().includes(location.toLowerCase()) ||
      event.country.toLowerCase().includes(location.toLowerCase())
    );
  }

  getEventsByType(type: DisruptionEvent['type']): DisruptionEvent[] {
    return this.events.filter(event => event.type === type);
  }

  async calculateEventImpact(eventId: string, shipments: any[]): Promise<EventImpact> {
    const event = this.events.find(e => e.id === eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Find affected shipments based on location and routes
    const affectedShipments = shipments.filter(shipment => {
      const origin = shipment.origin?.toLowerCase() || '';
      const destination = shipment.destination?.toLowerCase() || '';
      const carrier = shipment.carrier?.toLowerCase() || '';
      
      return (
        origin.includes(event.location.toLowerCase()) ||
        destination.includes(event.location.toLowerCase()) ||
        event.affectedPorts.some(port => 
          origin.includes(port.toLowerCase()) || 
          destination.includes(port.toLowerCase())
        )
      );
    });

    // Calculate impact metrics
    const delayDays = event.durationDays * 0.7; // 70% of event duration
    const additionalCost = affectedShipments.reduce((sum, s) => sum + (s.totalValue || 0), 0) * 0.15;
    const riskLevel = event.severity;

    // Generate alternative routes
    const alternativeRoutes = await this.generateAlternativeRoutes(event, affectedShipments);
    
    // Generate recommendations
    const recommendations = await this.generateEventRecommendations(event, affectedShipments);

    return {
      eventId,
      affectedShipments: affectedShipments.map(s => s._id.toString()),
      delayDays,
      additionalCost,
      riskLevel,
      alternativeRoutes,
      recommendations
    };
  }

  private async generateAlternativeRoutes(event: DisruptionEvent, affectedShipments: any[]): Promise<string[]> {
    try {
      const prompt = `
        Given this disruption event:
        Location: ${event.location}
        Type: ${event.type}
        Affected Routes: ${event.affectedRoutes.join(', ')}
        
        Suggest 3 alternative routes that avoid this disruption. Focus on practical, realistic alternatives.
        
        Return as a simple list of route names.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const routes = response.text().split('\n').filter(route => route.trim());
      
      return routes.slice(0, 3);
    } catch (error) {
      console.error('Error generating alternative routes:', error);
      return ['Alternative Route 1', 'Alternative Route 2', 'Alternative Route 3'];
    }
  }

  private async generateEventRecommendations(event: DisruptionEvent, affectedShipments: any[]): Promise<string[]> {
    try {
      const prompt = `
        Given this disruption event affecting ${affectedShipments.length} shipments:
        Event: ${event.title}
        Type: ${event.type}
        Severity: ${event.severity}
        
        Provide 3 specific, actionable recommendations for managing this disruption.
        Focus on immediate actions, communication strategies, and contingency planning.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const recommendations = response.text().split('\n').filter(rec => rec.trim());
      
      return recommendations.slice(0, 3);
    } catch (error) {
      console.error('Error generating event recommendations:', error);
      return [
        'Contact affected carriers for status updates',
        'Notify customers about potential delays',
        'Activate contingency shipping routes'
      ];
    }
  }

  getEventStatistics() {
    const activeEvents = this.getActiveEvents();
    const totalEvents = this.events.length;
    
    const eventsByType = this.events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsBySeverity = this.events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents,
      activeEvents: activeEvents.length,
      eventsByType,
      eventsBySeverity,
      averageConfidence: this.events.reduce((sum, e) => sum + e.confidence, 0) / totalEvents
    };
  }
}

// Export singleton instance
export const eventIntelligence = new EventIntelligenceSystem();

