import axios from 'axios';

interface SearchResult {
    title: string;
    url: string;
    content: string; // or snippet
}

export async function searchWeb(query: string): Promise<SearchResult[]> {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
        console.warn('FIRECRAWL_API_KEY is not set. Skipping web search.');
        return [];
    }

    try {
        console.log(`Searching web for: "${query}"`);
        // Using Firecrawl Search endpoint
        // POST https://api.firecrawl.dev/v1/search
        const response = await axios.post(
            'https://api.firecrawl.dev/v1/search',
            {
                query: query,
                limit: 5,
                scrapeOptions: {
                    formats: ["markdown"]
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data && response.data.success && response.data.data) {
            return response.data.data.map((item: any) => ({
                title: item.title || 'No Title',
                url: item.url,
                content: item.markdown || item.description || ''
            }));
        }

        return [];

    } catch (error) {
        console.error('Firecrawl API Search Error:', error);
        return [];
    }
}
