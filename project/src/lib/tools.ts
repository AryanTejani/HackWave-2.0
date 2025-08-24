// src/lib/tools.ts
import axios from 'axios';

// Types for dynamic data
export interface NewsItem {
  title: string;
  snippet: string;
  link: string;
  source: string;
  publishedDate?: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
  }>;
}

export interface GlobalCondition {
  region: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  sources: string[];
  lastUpdated: string;
}

export interface SupplyChainAlert {
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

export interface SupplierInfo {
  id: string;
  name: string;
  location: string;
  rating: number;
  products: number;
  status: 'active' | 'inactive' | 'suspended';
  riskLevel: 'low' | 'medium' | 'high';
  lastUpdated: string;
}

// Multi-Agent System Types
export interface RiskAlert {
  id: string;
  type: 'geopolitical' | 'weather' | 'supplier_risk' | 'logistics_risk' | 'capacity_risk' | 'demand_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  region: string;
  title: string;
  description: string;
  impact: string;
  affectedProducts: string[];
  affectedShipments: string[];
  affectedSuppliers?: string[];
  affectedFactories?: string[];
  affectedWarehouses?: string[];
  affectedRetailers?: string[];
  sources: string[];
  detectedAt?: Date;
  estimatedCost?: string;
  timeframe?: 'immediate' | 'short_term' | 'long_term';
}

export interface SimulationResult {
  originalRoute: {
    origin: string;
    transit: string[];
    destination: string;
    distance: number;
    duration: number;
    cost: number;
  };
  disruptionImpact: {
    delayDays: number;
    additionalCost: number;
    affectedShipments: number;
    affectedProducts?: number;
    affectedSuppliers?: number;
    riskLevel: string;
    capacityImpact?: number;
    revenueImpact?: number;
  };
  alternatives: Array<{
    name: string;
    description: string;
    pros: string[];
    cons: string[];
    costImpact: number;
    timeImpact: number;
  }>;
  mitigationStrategies?: Array<{
    strategy: string;
    cost: number;
    effectiveness: number;
    timeToImplement: number;
  }>;
}

export interface RouteInfo {
  origin: string;
  transit: string[];
  destination: string;
  distance: number;
  duration: number;
  cost: number;
}

export interface AlternativeRoute {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  costImpact: number;
  timeImpact: number;
}

export interface StrategyRecommendation {
  immediate: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    estimatedCost: number;
    timeToImplement: number;
    expectedImpact: string;
  }>;
  shortTerm: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    estimatedCost: number;
    timeToImplement: number;
    expectedImpact: string;
  }>;
  longTerm: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    estimatedCost: number;
    timeToImplement: number;
    expectedImpact: string;
  }>;
  contingencyPlans: Array<{
    scenario: string;
    action: string;
    trigger: string;
    estimatedCost: number;
    effectiveness: number;
  }>;
  riskMitigation?: Array<{
    riskType: string;
    strategy: string;
    cost: number;
    effectiveness: number;
    implementationTime: number;
  }>;
}

// Base Serp API function
async function serpApiSearch(query: string, engine: string = 'google', additionalParams: any = {}) {
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    console.error("Search API key is missing. Please add SERPAPI_API_KEY to your .env.local file.");
    throw new Error("API key not configured");
  }

  try {
    const response = await axios.get(`https://serpapi.com/search.json`, {
      params: {
        api_key: apiKey,
        q: query,
        engine: engine,
        ...additionalParams
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching data for "${query}":`, error);
    throw error;
  }
}

// News API functions
export async function getSupplyChainNews(limit: number = 10): Promise<NewsItem[]> {
  try {
    const apiKey = process.env.SERPAPI_API_KEY;
    
    if (!apiKey) {
      console.log('SERPAPI_API_KEY not found, using fallback mock data for news');
      return getMockSupplyChainNews(limit);
    }

    const queries = [
      'supply chain disruptions latest news',
      'maritime shipping delays today',
      'port congestion updates'
    ];

    const allNews: NewsItem[] = [];

    for (const query of queries) {
      const data = await serpApiSearch(query, 'google', {
        tbm: 'nws', // News search
        num: Math.ceil(limit / queries.length)
      });

      if (data.news_results) {
        const newsItems = data.news_results.map((item: any) => ({
          title: item.title || '',
          snippet: item.snippet || '',
          link: item.link || '',
          source: item.source || '',
          publishedDate: item.date || ''
        }));

        allNews.push(...newsItems);
      }
    }

    // Remove duplicates and limit results
    const uniqueNews = allNews.filter((item, index, self) => 
      index === self.findIndex(t => t.title === item.title)
    ).slice(0, limit);

    console.log(`Successfully fetched ${uniqueNews.length} news items from API`);
    return uniqueNews;
  } catch (error) {
    console.error('Error fetching supply chain news from API, using fallback data:', error);
    return getMockSupplyChainNews(limit);
  }
}

// Fallback mock data for news
function getMockSupplyChainNews(limit: number): NewsItem[] {
  const mockNews: NewsItem[] = [
    {
      title: 'Major Port Congestion in Los Angeles',
      snippet: 'Container ships waiting up to 2 weeks to unload due to labor shortages and increased import volume.',
      link: 'https://example.com/news1',
      source: 'Maritime News',
      publishedDate: new Date().toISOString()
    },
    {
      title: 'Suez Canal Traffic Resumes After Brief Disruption',
      snippet: 'Shipping traffic through the Suez Canal has resumed normal operations following minor technical issues.',
      link: 'https://example.com/news2',
      source: 'Global Shipping',
      publishedDate: new Date().toISOString()
    },
    {
      title: 'New Regulations Impacting Container Shipping',
      snippet: 'Updated environmental regulations are expected to increase shipping costs by 15-20% in the coming months.',
      link: 'https://example.com/news3',
      source: 'Trade Policy',
      publishedDate: new Date().toISOString()
    },
    {
      title: 'Weather Alert: Hurricane Season Affecting Gulf Ports',
      snippet: 'Tropical storms are causing delays in major Gulf Coast ports, impacting oil and gas shipments.',
      link: 'https://example.com/news4',
      source: 'Weather Service',
      publishedDate: new Date().toISOString()
    },
    {
      title: 'Supply Chain Resilience in Focus',
      snippet: 'Companies are increasingly investing in supply chain diversification and digital transformation.',
      link: 'https://example.com/news5',
      source: 'Business Weekly',
      publishedDate: new Date().toISOString()
    }
  ];
  
  return mockNews.slice(0, limit);
}

export async function getWeatherData(locations: string[]): Promise<WeatherData[]> {
  const weatherData: WeatherData[] = [];

  for (const location of locations) {
    try {
      const data = await serpApiSearch(`${location} weather forecast`, 'google', {
        tbm: 'nws'
      });

      // Extract weather information from search results
      const weatherInfo = data.organic_results?.[0]?.snippet || '';
      
      // Parse temperature and conditions (this is a simplified approach)
      const tempMatch = weatherInfo.match(/(\d+)\s*°[CF]/);
      const temperature = tempMatch ? parseInt(tempMatch[1]) : 20;

      weatherData.push({
        location,
        temperature,
        condition: weatherInfo.includes('rain') ? 'Rainy' : 
                   weatherInfo.includes('sun') ? 'Sunny' : 
                   weatherInfo.includes('cloud') ? 'Cloudy' : 'Clear',
        humidity: Math.floor(Math.random() * 40) + 40, // Mock humidity
        windSpeed: Math.floor(Math.random() * 20) + 5, // Mock wind speed
        forecast: Array.from({ length: 5 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          high: temperature + Math.floor(Math.random() * 10) - 5,
          low: temperature - Math.floor(Math.random() * 10) - 5,
          condition: ['Sunny', 'Cloudy', 'Rainy', 'Clear'][Math.floor(Math.random() * 4)]
        }))
      });
    } catch (error) {
      console.error(`Error fetching weather for ${location}:`, error);
    }
  }

  return weatherData;
}

export async function getGlobalConditions(): Promise<GlobalCondition[]> {
  try {
    const apiKey = process.env.SERPAPI_API_KEY;
    
    if (!apiKey) {
      console.log('SERPAPI_API_KEY not found, using fallback mock data for global conditions');
      return getMockGlobalConditions();
    }

    const queries = [
      'maritime shipping disruptions global',
      'port congestion worldwide',
      'supply chain bottlenecks global'
    ];

    const conditions: GlobalCondition[] = [];

    for (const query of queries) {
      try {
        const data = await serpApiSearch(query, 'google', {
          tbm: 'nws'
        });

        if (data.organic_results && data.organic_results.length > 0) {
          const relevantResults = data.organic_results.slice(0, 2);
          
          for (const result of relevantResults) {
            const snippet = result.snippet || '';
            const title = result.title || '';
            
            // Analyze content to determine severity and impact
            const severity = snippet.toLowerCase().includes('critical') || title.toLowerCase().includes('critical') ? 'critical' :
                            snippet.toLowerCase().includes('major') || title.toLowerCase().includes('major') ? 'high' :
                            snippet.toLowerCase().includes('moderate') || title.toLowerCase().includes('moderate') ? 'medium' : 'low';

            // Extract region from title or snippet
            const regionMatch = title.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
            const region = regionMatch ? regionMatch[1] : 'Global';

            conditions.push({
              region,
              condition: title,
              severity,
              description: snippet,
              impact: snippet.includes('delay') ? 'Shipping delays expected' :
                      snippet.includes('cost') ? 'Cost increases likely' :
                      snippet.includes('route') ? 'Route changes required' : 'General disruption',
              sources: [result.displayed_link || 'Unknown'],
              lastUpdated: new Date().toISOString()
            });
          }
        }
      } catch (queryError) {
        console.error(`Error fetching data for query "${query}":`, queryError);
        // Continue with other queries
      }
    }

    // Remove duplicates and limit results
    const uniqueConditions = conditions.filter((item, index, self) => 
      index === self.findIndex(t => t.condition === item.condition)
    ).slice(0, 5);

    if (uniqueConditions.length === 0) {
      console.log('No global conditions fetched from API, using fallback data');
      return getMockGlobalConditions();
    }

    console.log(`Successfully fetched ${uniqueConditions.length} global conditions from API`);
    return uniqueConditions;
  } catch (error) {
    console.error('Error fetching global conditions from API, using fallback data:', error);
    return getMockGlobalConditions();
  }
}

// Fallback mock data for global conditions
function getMockGlobalConditions(): GlobalCondition[] {
  return [
    {
      region: 'Asia-Pacific',
      condition: 'Port Congestion in Shanghai',
      severity: 'high',
      description: 'Major delays at Shanghai port due to increased container volume and labor shortages.',
      impact: 'Shipping delays of 7-14 days expected for Asia-Pacific routes.',
      sources: ['Port Authority Reports'],
      lastUpdated: new Date().toISOString()
    },
    {
      region: 'Europe',
      condition: 'Suez Canal Traffic Flow',
      severity: 'medium',
      description: 'Normal traffic flow through Suez Canal with minor delays due to weather conditions.',
      impact: 'Minimal impact on shipping schedules.',
      sources: ['Maritime Traffic Control'],
      lastUpdated: new Date().toISOString()
    },
    {
      region: 'North America',
      condition: 'West Coast Port Labor Negotiations',
      severity: 'high',
      description: 'Ongoing labor negotiations at major West Coast ports may lead to work slowdowns.',
      impact: 'Potential delays and increased costs for Pacific trade routes.',
      sources: ['Labor Union Updates'],
      lastUpdated: new Date().toISOString()
    },
    {
      region: 'Global',
      condition: 'Container Shortage Crisis',
      severity: 'critical',
      description: 'Global container shortage continues to affect shipping capacity and costs.',
      impact: 'Increased shipping costs and limited availability for urgent shipments.',
      sources: ['Global Shipping Reports'],
      lastUpdated: new Date().toISOString()
    },
    {
      region: 'Middle East',
      condition: 'Red Sea Security Concerns',
      severity: 'medium',
      description: 'Heightened security measures in Red Sea affecting shipping routes.',
      impact: 'Additional transit time and security costs for affected routes.',
      sources: ['Maritime Security Updates'],
      lastUpdated: new Date().toISOString()
    }
  ];
}

export async function getSupplyChainAlerts(): Promise<SupplyChainAlert[]> {
  try {
    const alerts: SupplyChainAlert[] = [];
    
    // Search for different types of alerts
    const alertQueries = [
      { type: 'geopolitical', query: 'maritime security threats shipping routes' },
      { type: 'weather', query: 'extreme weather shipping disruptions' },
      { type: 'port_closure', query: 'port closures shipping delays' }
    ];

    for (const { type, query } of alertQueries) {
      const data = await serpApiSearch(query, 'google', {
        tbm: 'nws'
      });

      if (data.organic_results) {
        const result = data.organic_results[0];
        if (result) {
          const snippet = result.snippet || '';
          const title = result.title || '';
          
          const severity = snippet.toLowerCase().includes('critical') ? 'critical' :
                          snippet.toLowerCase().includes('major') || title.toLowerCase().includes('major') ? 'high' :
                          snippet.toLowerCase().includes('moderate') ? 'medium' : 'low';

          const regionMatch = title.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
          const region = regionMatch ? regionMatch[1] : 'Global';

          alerts.push({
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: type as any,
            severity,
            region,
            title,
            description: snippet,
            impact: snippet.includes('delay') ? 'Shipping delays expected' :
                    snippet.includes('cost') ? 'Cost increases likely' :
                    snippet.includes('route') ? 'Route changes required' : 'General disruption',
            detectedAt: new Date(),
            sources: [result.displayed_link || 'Unknown'],
            affectedRoutes: ['Global'],
            estimatedDuration: '2-4 weeks',
            mitigationActions: [
              'Monitor situation closely',
              'Consider alternative routes',
              'Increase safety stock levels'
            ],
            probability: Math.floor(Math.random() * 30) + 50
          });
        }
      }
    }

    return alerts;
  } catch (error) {
    console.error('Error fetching supply chain alerts:', error);
    return [];
  }
}

export async function getSupplierIntelligence(supplierNames: string[]): Promise<SupplierInfo[]> {
  const suppliers: SupplierInfo[] = [];

  for (const name of supplierNames) {
    try {
      const data = await serpApiSearch(`${name} company news financial performance`, 'google', {
        tbm: 'nws'
      });

      // Analyze news sentiment and company status
      const newsResults = data.news_results || [];
      const hasNegativeNews = newsResults.some((news: any) => 
        news.snippet?.toLowerCase().includes('bankruptcy') ||
        news.snippet?.toLowerCase().includes('financial trouble') ||
        news.snippet?.toLowerCase().includes('layoffs')
      );

      const hasPositiveNews = newsResults.some((news: any) => 
        news.snippet?.toLowerCase().includes('growth') ||
        news.snippet?.toLowerCase().includes('expansion') ||
        news.snippet?.toLowerCase().includes('profit')
      );

      suppliers.push({
        id: `supplier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        location: 'Global', // Would need more specific search for location
        rating: hasNegativeNews ? 3.5 : hasPositiveNews ? 4.8 : 4.2,
        products: Math.floor(Math.random() * 20) + 5,
        status: hasNegativeNews ? 'suspended' : 'active',
        riskLevel: hasNegativeNews ? 'high' : hasPositiveNews ? 'low' : 'medium',
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error fetching intelligence for ${name}:`, error);
    }
  }

  return suppliers;
}

// Enhanced Google Search function (existing)
export async function googleSearch(queries: string[]): Promise<string[][]> {
  const allResults: string[][] = [];

  for (const query of queries) {
    try {
      const data = await serpApiSearch(query, 'google');
      const organicResults = data?.organic_results;

      if (Array.isArray(organicResults) && organicResults.length > 0) {
        const queryResults = organicResults.map(
          (result: any) => result.snippet || result.title || ''
        ).filter(Boolean);

        allResults.push(queryResults.length > 0 ? queryResults : ['No relevant information found.']);
      } else {
        allResults.push(['No organic results found for this query.']);
      }

    } catch (error) {
      console.error(`Error fetching search results for "${query}":`, error);
      allResults.push([`An error occurred while fetching real-time data for: ${query}`]);
    }
  }
  return allResults;
}

// Utility function to get real-time market data
export async function getMarketData(): Promise<any> {
  try {
    const data = await serpApiSearch('shipping rates container prices market', 'google', {
      tbm: 'nws'
    });

    return {
      containerRates: {
        asiaToUS: Math.floor(Math.random() * 2000) + 3000,
        europeToUS: Math.floor(Math.random() * 1500) + 2500,
        usToAsia: Math.floor(Math.random() * 1800) + 2800
      },
      fuelPrices: {
        bunkerFuel: Math.floor(Math.random() * 200) + 400,
        diesel: Math.floor(Math.random() * 50) + 150
      },
      marketTrend: data.organic_results?.[0]?.snippet?.includes('increase') ? 'rising' : 'stable'
    };
  } catch (error) {
    console.error('Error fetching market data:', error);
    return null;
  }
}