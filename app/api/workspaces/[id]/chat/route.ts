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
        const { rows: workspaceCheck } = await pool.query(
            'SELECT id FROM workspaces WHERE id = $1 AND user_id = $2',
            [workspaceId, payload.id]
        );

        if (workspaceCheck.length === 0) {
            return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
        }

        // 2. Retrieve relevant document chunks (Context Retrieval)
        // We need to embed the question first
        const questionEmbedding = await generateEmbedding(message);
        const embeddingString = `[${questionEmbedding.join(',')}]`;

        // Similar to before, query document_chunks, but join with documents to filter by workspace_id
        const { rows: chunks } = await pool.query(
            `SELECT content, 1 - (embedding <=> $1) as similarity
             FROM document_chunks dc
             JOIN documents d ON dc.document_id = d.id
             WHERE d.workspace_id = $2
             ORDER BY similarity DESC
             LIMIT 5`,
            [embeddingString, workspaceId]
        );

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
                contextParts.push(`--- WEB SEARCH FAILED ---\n(Could not retrieve external information)`);
            }
        }

        if (contextParts.length === 0 && !enableDeepSearch) {
            return NextResponse.json({ answer: "I don't have enough information in your documents to answer that. Try uploading relevant documents or enabling Deep Search." });
        }

        const context = contextParts.join('\n\n');

        // 4. Generate Answer with Combined Context
        const answer = await askDocumentQuestion(message, context);

        return NextResponse.json({ answer });

    } catch (error) {
        console.error('Error in chat:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
