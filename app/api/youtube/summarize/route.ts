
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
});

export async function POST(req: Request) {
    try {
        const { transcript } = await req.json();

        if (!transcript) {
            return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
        }

        const completion = await openai.chat.completions.create({
            model: 'openai/gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are an AI assistant that summarizes YouTube videos and generates study notes. Output reliable, clean, and structured markdown.'
                },
                {
                    role: 'user',
                    content: `Please summarize the following video transcript and generate structured study notes. 
                    
                    Format your response in Markdown with two sections:
                    1. **Summary**: A concise paragraph summarizing the video.
                    2. **Study Notes**: Bullet points, key concepts, and takeaways.

                    Transcript:
                    ${transcript.substring(0, 30000)} // Truncate to avoid context limits if very long
                    `
                }
            ],
        });

        const content = completion.choices[0].message.content;

        // Parse content if possible, but for now just return the whole markdown as "notes"
        // The frontend expects { notes: string } (or summary + notes)
        // I will return the raw markdown in 'notes' field for now, as my prompt asks for sections.

        return NextResponse.json({ notes: content });

    } catch (error: any) {
        console.error('Summarization Error:', error);
        return NextResponse.json({
            error: 'Failed to generate summary',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
