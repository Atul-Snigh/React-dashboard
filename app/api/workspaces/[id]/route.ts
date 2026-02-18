import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET /api/workspaces/[id] - Get workspace details and documents
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

        // Verify ownership and get workspace details
        const { rows: workspaces } = await pool.query(
            'SELECT * FROM workspaces WHERE id = $1 AND user_id = $2',
            [workspaceId, payload.id]
        );

        if (workspaces.length === 0) {
            return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
        }

        // Get documents for this workspace
        const { rows: documents } = await pool.query(
            'SELECT id, filename, created_at FROM documents WHERE workspace_id = $1 ORDER BY created_at DESC',
            [workspaceId]
        );

        return NextResponse.json({
            workspace: workspaces[0],
            documents: documents
        });

    } catch (error) {
        console.error('Error fetching workspace:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/workspaces/[id] - Delete a workspace
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

        // Check ownership first
        const { rows: check } = await pool.query(
            'SELECT id FROM workspaces WHERE id = $1 AND user_id = $2',
            [workspaceId, payload.id]
        );

        if (check.length === 0) {
            return NextResponse.json({ error: 'Workspace not found or access denied' }, { status: 403 });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Delete documents associated with this workspace
            // Note: document_chunks should cascade delete if set up correctly, but let's be safe or rely on cascade
            // Assuming ON DELETE CASCADE is set on foreign keys, deleting workspace strictly might fail if documents exist and no cascade on documents->workspace
            // But documents have workspace_id. Let's checking schema or force delete.
            // Earlier migration script: "user_id ${userIdType === 'integer' ? 'INTEGER' : 'UUID'} NOT NULL REFERENCES users(id) ON DELETE CASCADE"
            // Documents table: "ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE" (This was likely in my head or migration script)
            // Let's verify migration script content if needed, but manual clean up is safer if unsure.

            // Delete documents (chunks cascade from documents usually)
            await client.query('DELETE FROM documents WHERE workspace_id = $1', [workspaceId]);

            // Delete existing chat/other related items if any (none yet)

            // Delete workspace
            await client.query('DELETE FROM workspaces WHERE id = $1', [workspaceId]);

            await client.query('COMMIT');
            return NextResponse.json({ success: true });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error deleting workspace:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
