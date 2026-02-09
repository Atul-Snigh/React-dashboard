import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PATCH(request: Request) {
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

        const { userId, approved } = await request.json();
        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const isApproved = approved !== undefined ? approved : true;

        const client = await pool.connect();
        try {
            await client.query('UPDATE users SET is_approved = $1 WHERE id = $2', [isApproved, userId]);
            return NextResponse.json({ message: `User ${isApproved ? 'approved' : 'revoked'}` });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Admin approve error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
