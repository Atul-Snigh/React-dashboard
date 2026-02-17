import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

// Singleton for pipeline to avoid reloading model
let pipelineInstance: any = null;

async function getPipeline() {
    if (!pipelineInstance) {
        const { pipeline } = await import('@xenova/transformers');
        pipelineInstance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return pipelineInstance;
}

export async function generateEmbedding(text: string) {
    try {
        console.log('Generating embedding for text length:', text.length);
        const pipe = await getPipeline();
        const output = await pipe(text, { pooling: 'mean', normalize: true });
        console.log('Embedding generated successfully');
        return Array.from(output.data);
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw new Error('Failed to generate embedding.');
    }
}

export async function askDocumentQuestion(question: string, context: string) {
    try {
        const response = await openai.chat.completions.create({
            model: 'google/gemini-2.0-flash-001', // Using a valid model
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful AI assistant.
          Use the following pieces of context to answer the user's question.
          If the answer is not in the context, say you don't know.
          
          Context:
          ${context}`,
                },
                {
                    role: 'user',
                    content: question,
                },
            ],
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error asking document question:', error);
        throw new Error('Failed to answer question.');
    }
}

export async function generateStudyNotes(transcript: string) {
    try {
        const response = await openai.chat.completions.create({
            model: 'google/gemini-2.0-flash-001', // Using a valid model
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
