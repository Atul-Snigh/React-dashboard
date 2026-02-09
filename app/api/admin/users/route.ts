import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyJWT(token);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const client = await pool.connect();
        try {
            const result = await client.query('SELECT id, email, role, is_approved, created_at FROM users ORDER BY created_at DESC');
            return NextResponse.json(result.rows);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Admin users error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyJWT(token);
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            await client.query('DELETE FROM users WHERE id = $1', [userId]);
            return NextResponse.json({ message: 'User deleted' });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Admin delete user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
