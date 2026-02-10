import { NextResponse } from 'next/server';

// Helper to fetch URL with headers mimicking a browser to avoid some restrictions
async function fetchUrl(url: string) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    };
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    return response.text();
}

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log(`Fetching transcript for: ${url}`);

        // Basic validation
        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
        }

        try {
            // 1. Fetch the video page
            const pageHtml = await fetchUrl(url);

            // 2. Extract captionTracks
            const match = pageHtml.match(/"captionTracks":\s*(\[.*?\])/);
            if (!match) {
                return NextResponse.json({ error: 'No captions found for this video' }, { status: 404 });
            }

            const tracks = JSON.parse(match[1]);
            // Prefer English, otherwise take the first available
            const track = tracks.find((t: any) => t.languageCode === 'en') || tracks[0];

            if (!track) {
                return NextResponse.json({ error: 'No usable caption track found' }, { status: 404 });
            }

            console.log(`Using track: ${track.name.simpleText} (${track.languageCode})`);

            // 3. Fetch the transcript XML
            const transcriptXml = await fetchUrl(track.baseUrl);

            // 4. Parse XML (simple regex approach to avoid heavy xml parsers)
            const regex = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
            let transcriptText = '';
            let m;

            while ((m = regex.exec(transcriptXml)) !== null) {
                // Decode HTML entities
                const text = m[3]
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'");
                transcriptText += text + ' ';
            }

            // Truncate to avoid huge prompts
            if (transcriptText.length > 20000) {
                console.log('Truncating transcript > 20k chars');
                transcriptText = transcriptText.substring(0, 20000) + "...[TRUNCATED]";
            }

            if (!transcriptText.trim()) {
                return NextResponse.json({ error: 'Transcript is empty' }, { status: 404 });
            }

            return NextResponse.json({ transcript: transcriptText.trim() });

        } catch (error: any) {
            console.error('Custom transcript fetch error:', error);
            return NextResponse.json({
                error: 'Failed to fetch transcript. Video might be disabled or have no captions.',
                details: error.message
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
