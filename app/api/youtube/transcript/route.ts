import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

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
            const transcriptItems = await YoutubeTranscript.fetchTranscript(url);

            if (!transcriptItems || transcriptItems.length === 0) {
                return NextResponse.json({ error: 'No captions found for this video' }, { status: 404 });
            }

            let transcriptText = transcriptItems.map(item => item.text).join(' ');

            // Truncate to avoid huge prompts
            if (transcriptText.length > 20000) {
                console.log('Truncating transcript > 20k chars');
                transcriptText = transcriptText.substring(0, 20000) + "...[TRUNCATED]";
            }

            return NextResponse.json({ transcript: transcriptText });

        } catch (ytError: any) {
            console.error('youtube-transcript error:', ytError);
            return NextResponse.json({ 
                error: 'Failed to fetch transcript. Video might be disabled or have no captions.', 
                details: ytError.message 
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
