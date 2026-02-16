import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
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
            'SELECT id, filename, created_at FROM documents WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        return NextResponse.json({ documents: rows });
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
