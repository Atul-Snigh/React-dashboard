import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';
import { generateEmbedding, askDocumentQuestion } from '@/lib/ai';
import { searchWeb } from '@/lib/firecrawl'; // Import the search function

// POST /api/workspaces/[id]/chat
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyJWT(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const workspaceId = id;
        const { message, enableDeepSearch } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // 1. Verify access
        let workspaceCheck;
        try {
            const result = await pool.query(
                'SELECT id FROM workspaces WHERE id = $1 AND user_id = $2',
                [workspaceId, payload.id]
            );
            workspaceCheck = result.rows;
        } catch (dbError) {
            console.error('Database error during workspace check:', dbError);
            throw new Error(`Database check failed: ${(dbError as Error).message}`);
        }

        if (workspaceCheck.length === 0) {
            return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
        }

        // 2. Retrieve relevant document chunks (Context Retrieval)
        // We need to embed the question first
        let questionEmbedding;
        try {
            questionEmbedding = await generateEmbedding(message);
        } catch (embedError) {
            console.error('Embedding error:', embedError);
            throw new Error(`Embedding generation failed: ${(embedError as Error).message}`);
        }

        const embeddingString = `[${questionEmbedding.join(',')}]`;

        let chunks;
        try {
            // Similar to before, query document_chunks, but join with documents to filter by workspace_id
            const result = await pool.query(
                `SELECT content, 1 - (embedding <=> $1) as similarity
                 FROM document_chunks dc
                 JOIN documents d ON dc.document_id = d.id
                 WHERE d.workspace_id = $2
                 ORDER BY similarity DESC
                 LIMIT 5`,
                [embeddingString, workspaceId]
            );
            chunks = result.rows;
        } catch (queryError) {
            console.error('Vector search error:', queryError);
            throw new Error(`Vector search failed: ${(queryError as Error).message}`);
        }

        const contextParts = chunks.map(c => c.content);

        // 3. Deep Search (Optional)
        if (enableDeepSearch) {
            try {
                const searchResults = await searchWeb(message);
                if (searchResults.length > 0) {
                    const webContext = searchResults.map(r => `Source: [${r.title}](${r.url})\nContent: ${r.content}`).join('\n\n');
                    contextParts.push(`--- INFORMATION FROM WEB SEARCH ---\n${webContext}`);
                }
            } catch (err) {
                console.error("Deep search failed:", err);
                contextParts.push(`--- WEB SEARCH FAILED ---\n(Could not retrieve external information: ${(err as Error).message})`);
            }
        }

        if (contextParts.length === 0 && !enableDeepSearch) {
            console.log("No value in contextParts and deepSearch off");
            return NextResponse.json({ answer: "I don't have enough information in your documents to answer that. Try uploading relevant documents or enabling Deep Search." });
        }

        const context = contextParts.join('\n\n');

        // 4. Generate Answer with Combined Context
        console.log("Generating answer with context length:", context.length);
        let answer;
        try {
            answer = await askDocumentQuestion(message, context);
        } catch (llmError) {
            console.error('LLM error:', llmError);
            throw new Error(`LLM generation failed: ${(llmError as Error).message}`);
        }
        console.log("Answer generated");

        return NextResponse.json({ answer });

    } catch (error) {
        console.error('Error in chat route:', error);
        // Log the full error object if possible
        if (typeof error === 'object' && error !== null) {
            console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        }
        return NextResponse.json({ error: `Internal server error: ${(error as Error).message}` }, { status: 500 });
    }
}
