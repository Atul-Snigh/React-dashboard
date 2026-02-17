import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateEmbedding, askDocumentQuestion } from '@/lib/ai';

export async function POST(req: Request) {
    const logs: string[] = [];
    const log = (msg: any) => logs.push(typeof msg === 'string' ? msg : JSON.stringify(msg));

    try {
        log('Starting Debug Route');

        // 1. Test Embedding
        log('Testing Embedding Generation...');
        const text = 'Hello Debug';
        const embedding = await generateEmbedding(text);
        log(`Embedding Generated. Length: ${embedding.length}`);

        // 2. Test DB Connection
        log('Testing DB Connect...');
        const client = await pool.connect();
        log('DB Connected');

        // 3. Test Vector Search (Dummy)
        log('Testing Vector Search SQL...');
        const embeddingString = `[${embedding.join(',')}]`;
        // Use a non-existent ID just to test syntax
        await client.query(
            `SELECT content FROM document_chunks 
             WHERE document_id = -1 
             ORDER BY embedding <=> $1 
             LIMIT 1`,
            [embeddingString]
        );
        log('Vector Search Syntax OK');
        client.release();

        // 4. Test LLM
        log('Testing LLM...');
        const answer = await askDocumentQuestion('Is this working?', 'Context: Debugging.');
        log(`LLM Answer: ${answer}`);

        return NextResponse.json({ success: true, logs });
    } catch (error: any) {
        log(`ERROR: ${error.message}`);
        log(`STACK: ${error.stack}`);
        if (error.response) {
            log(`API RESPONSE: ${JSON.stringify(error.response.data)}`);
        }
        return NextResponse.json({ success: false, logs, error: error.message }, { status: 500 });
    }
}
