import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function generateStudyNotes(transcript: string) {
    try {
        const response = await openai.chat.completions.create({
            model: 'google/gemini-2.0-flash-lite-preview-02-05:free', // Using a fast, free model
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful AI assistant that generates clean, structured study notes from video transcripts.
          Format the output using Markdown.
          Use headings, bullet points, and bold text to make it easy to read.
          Focus on key concepts, definitions, and important takeaways.`,
                },
                {
                    role: 'user',
                    content: `Generate study notes from the following transcript:\n\n${transcript}`,
                },
            ],
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error generating study notes:', error);
        throw new Error('Failed to generate study notes.');
    }
}
