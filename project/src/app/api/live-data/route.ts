// src/app/api/live-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// This is your new server-side function to call SerpApi
async function serpApiSearch(query: string, engine: string = 'google', additionalParams: any = {}) {
  // IMPORTANT: Your API key is now securely on the server-side
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    throw new Error("SerpApi API key is not configured in .env.local");
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

export async function GET(request: NextRequest) {
  try {
    const newsData = await serpApiSearch('supply chain disruptions latest news', 'google', { tbm: 'nws', num: 10 });
    const weatherData = await serpApiSearch('global shipping weather forecast', 'google');
    
    // Process and combine the data here as needed
    const liveData = {
      news: newsData.news_results || [],
      weather: weatherData.organic_results?.[0]?.snippet || 'Weather data not available.',
    };

    return NextResponse.json({ success: true, data: liveData });
  } catch (error) {
    console.error('Error in live-data API route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live data' },
      { status: 500 }
    );
  }
}