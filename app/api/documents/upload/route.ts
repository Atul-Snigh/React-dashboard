import '@/lib/polyfill';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';
import { generateEmbedding } from '@/lib/ai';
import { PDFParse } from 'pdf-parse';

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

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        let text = '';

        if (file.type === 'application/pdf') {
            console.log('Starting PDF parsing...');
            try {
                const parser = new PDFParse({ data: buffer });
                console.log('PDF parser created');
                const data = await parser.getText();
                console.log('PDF text extracted, length:', data.text.length);
                text = data.text;
            } catch (pdfError) {
                console.error('PDF parsing error:', pdfError);
                throw new Error('Failed to parse PDF: ' + (pdfError as Error).message);
            }
        } else {
            console.log('Processing text file...');
            text = buffer.toString('utf-8');
        }

        if (!text.trim()) {
            return NextResponse.json({ error: 'Could not extract text from file' }, { status: 400 });
        }

        // 1. Insert Document
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const docRes = await client.query(
                'INSERT INTO documents (user_id, filename) VALUES ($1, $2) RETURNING id',
                [payload.id, file.name]
            );
            const documentId = docRes.rows[0].id;

            // 2. Chunking
            const chunkSize = 500; // Characters roughly
            const chunks = [];
            for (let i = 0; i < text.length; i += chunkSize) {
                chunks.push(text.substring(i, i + chunkSize));
            }

            // 3. Embedding and Inserting Chunks
            for (const chunk of chunks) {
                if (!chunk.trim()) continue;
                const embedding = await generateEmbedding(chunk);
                // Convert embedding array to string format for pgvector: '[0.1, 0.2, ...]'
                const embeddingString = `[${embedding.join(',')}]`;

                await client.query(
                    'INSERT INTO document_chunks (document_id, content, embedding) VALUES ($1, $2, $3)',
                    [documentId, chunk, embeddingString]
                );
            }

            await client.query('COMMIT');
            return NextResponse.json({ success: true, documentId });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error uploading document:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Internal server error',
            details: String(error)
        }, { status: 500 });
    }
}
