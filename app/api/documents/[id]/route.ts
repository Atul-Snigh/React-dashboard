import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const documentId = parseInt(id);

        if (isNaN(documentId)) {
            return NextResponse.json({ error: 'Invalid document ID' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyJWT(token);
        if (!payload || !payload.id) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const client = await pool.connect();
        try {
            // Verify ownership: Join documents with workspaces to check user_id
            const { rows: check } = await client.query(
                `SELECT d.id 
                 FROM documents d
                 JOIN workspaces w ON d.workspace_id = w.id
                 WHERE d.id = $1 AND w.user_id = $2`,
                [documentId, payload.id]
            );

            if (check.length === 0) {
                return NextResponse.json({ error: 'Document not found or access denied' }, { status: 403 });
            }

            // Proceed with deletion
            await client.query('DELETE FROM documents WHERE id = $1', [documentId]);

            return NextResponse.json({ success: true });
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error('Error deleting document:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
