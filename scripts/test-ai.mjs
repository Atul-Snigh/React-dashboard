import { pipeline } from '@xenova/transformers';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

console.log('Testing AI functions...');
console.log('OpenRouter Key present:', !!process.env.OPENROUTER_API_KEY);

async function testEmbedding() {
    console.log('--- Testing Embedding ---');
    try {
        console.log('Loading pipeline...');
        const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log('Pipeline loaded. Generating embedding...');
        const output = await pipe('Hello world', { pooling: 'mean', normalize: true });
        console.log('Embedding generated. Dimensions:', output.data.length);
        return true;
    } catch (error) {
        console.error('Embedding failed:', error);
        return false;
    }
}

async function testLLM() {
    console.log('--- Testing LLM ---');
    try {
        const openai = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: process.env.OPENROUTER_API_KEY,
        });

        const response = await openai.chat.completions.create({
            model: 'google/gemini-2.0-flash-exp:free',
            messages: [{ role: 'user', content: 'Say hello' }],
        });

        console.log('LLM Response:', response.choices[0].message.content);
        return true;
    } catch (error) {
        console.error('LLM failed:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        return false;
    }
}

async function main() {
    await testEmbedding();
    await testLLM();
}

main();
