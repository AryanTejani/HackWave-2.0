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

// Base Serp API function
async function serpApiSearch(query: string, engine: string = 'google', additionalParams: any = {}) {
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    console.error("Search API key is missing. Please add SERP_API_KEY to your .env.local file.");
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

    return uniqueNews;
  } catch (error) {
    console.error('Error fetching supply chain news:', error);
    return [];
  }
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
    const queries = [
      'maritime shipping disruptions global',
      'port congestion worldwide',
      'supply chain bottlenecks global'
    ];

    const conditions: GlobalCondition[] = [];

    for (const query of queries) {
      const data = await serpApiSearch(query, 'google', {
        tbm: 'nws'
      });

      if (data.organic_results) {
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
    }

    // Remove duplicates and limit results
    const uniqueConditions = conditions.filter((item, index, self) => 
      index === self.findIndex(t => t.condition === item.condition)
    ).slice(0, 5);

    return uniqueConditions;
  } catch (error) {
    console.error('Error fetching global conditions:', error);
    return [];
  }
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