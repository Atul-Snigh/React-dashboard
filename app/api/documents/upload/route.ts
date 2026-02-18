import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';
import { generateEmbedding } from '@/lib/ai';
import PDFParser from 'pdf2json';

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
        const workspaceId = formData.get('workspaceId') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        let finalWorkspaceId = workspaceId;

        // If no workspace provided, find or create a default one
        if (!finalWorkspaceId) {
            const { rows: defaultWs } = await pool.query(
                'SELECT id FROM workspaces WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1',
                [payload.id]
            );

            if (defaultWs.length > 0) {
                finalWorkspaceId = defaultWs[0].id;
            } else {
                // Create a default workspace
                const { rows: newWs } = await pool.query(
                    'INSERT INTO workspaces (user_id, name) VALUES ($1, $2) RETURNING id',
                    [payload.id, 'Default Workspace']
                );
                finalWorkspaceId = newWs[0].id;
            }
        } else {
            // Verify workspace access if ID was provided
            const { rows: workspaceCheck } = await pool.query(
                'SELECT id FROM workspaces WHERE id = $1 AND user_id = $2',
                [finalWorkspaceId, payload.id]
            );

            if (workspaceCheck.length === 0) {
                return NextResponse.json({ error: 'Workspace not found or access denied' }, { status: 403 });
            }
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        let text = '';

        if (file.type === 'application/pdf') {
            const pdfParser = new PDFParser(null, true);

            text = await new Promise((resolve, reject) => {
                pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
                pdfParser.on("pdfParser_dataReady", (pdfData) => {
                    resolve(pdfParser.getRawTextContent());
                });
                pdfParser.parseBuffer(buffer);
            });
        } else {
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
                'INSERT INTO documents (user_id, filename, workspace_id) VALUES ($1, $2, $3) RETURNING id',
                [payload.id, file.name, finalWorkspaceId]
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
