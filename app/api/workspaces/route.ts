import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
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

        const userId = payload.id;

        const { rows } = await pool.query(
            `SELECT w.id, w.name, w.created_at, COUNT(d.id) as document_count 
             FROM workspaces w 
             LEFT JOIN documents d ON w.id = d.workspace_id 
             WHERE w.user_id = $1 
             GROUP BY w.id 
             ORDER BY w.created_at DESC`,
            [userId]
        );

        return NextResponse.json({ workspaces: rows });
    } catch (error) {
        console.error('Error fetching workspaces:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

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

        const { name } = await req.json();
        if (!name || !name.trim()) {
            return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
        }

        const { rows } = await pool.query(
            'INSERT INTO workspaces (user_id, name) VALUES ($1, $2) RETURNING id, name, created_at',
            [payload.id, name]
        );

        return NextResponse.json({ workspace: rows[0] }, { status: 201 });
    } catch (error) {
        console.error('Error creating workspace:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
