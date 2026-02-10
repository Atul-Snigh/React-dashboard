import { NextResponse } from 'next/server';
import { getTranscript, extractVideoId } from '@/lib/youtube';
import { generateStudyNotes } from '@/lib/ai';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const videoId = extractVideoId(url);
        if (!videoId) {
            return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
        }

        const transcript = await getTranscript(videoId);
        const notes = await generateStudyNotes(transcript);

        return NextResponse.json({ notes });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
