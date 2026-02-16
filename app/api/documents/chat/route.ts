import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';
import { generateEmbedding, askDocumentQuestion } from '@/lib/ai';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyJWT(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { documentId, message } = await req.json();

        if (!documentId || !message) {
            return NextResponse.json({ error: 'Document ID and message are required' }, { status: 400 });
        }

        // 1. Generate embedding for the question
        const questionEmbedding = await generateEmbedding(message);
        const embeddingString = `[${questionEmbedding.join(',')}]`;

        // 2. Retrieve relevant chunks using pgvector
        // Using <=> for cosine distance (lower is better check if correct operator for pgvector version, usually <-> is L2 distance, <=> is cosine distance)
        // Wait, standard pgvector syntax for cosine distance is <=>
        // We want most similar, so smallest distance.
        const { rows: chunks } = await pool.query(
            `SELECT content 
             FROM document_chunks 
             WHERE document_id = $1 
             ORDER BY embedding <=> $2 
             LIMIT 5`,
            [documentId, embeddingString]
        );

        if (chunks.length === 0) {
            return NextResponse.json({ error: 'No content found for this document' }, { status: 404 });
        }

        // 3. Construct context
        const context = chunks.map(c => c.content).join('\n\n');

        // 4. Ask LLM
        const answer = await askDocumentQuestion(message, context);

        return NextResponse.json({ answer });

    } catch (error) {
        console.error('Error in chat route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
