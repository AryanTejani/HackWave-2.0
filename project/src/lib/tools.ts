// src/lib/tools.ts
import axios from 'axios';

export async function googleSearch(queries: string[]): Promise<string[][]> {
  const allResults: string[][] = [];
  const apiKey = process.env.YOUR_SEARCH_API_KEY;

  if (!apiKey) {
    console.error("Search API key is missing. Please add YOUR_SEARCH_API_KEY to your .env.local file.");
    return queries.map(query => [`Could not fetch real-time data for "${query}" because the API key is missing.`]);
  }

  for (const query of queries) {
    try {
      const response = await axios.get(`https://serpapi.com/search.json`, {
        params: {
          api_key: apiKey,
          q: query,
          engine: "google",
        },
      });

      const organicResults = response.data?.organic_results;

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