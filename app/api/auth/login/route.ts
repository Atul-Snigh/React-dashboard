import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';
import { signJWT } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = result.rows[0];

            if (!user) {
                return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
            }

            if (!user.is_approved) {
                return NextResponse.json({ error: 'Account pending admin approval' }, { status: 403 });
            }

            // Generate JWT
            const token = await signJWT({ id: user.id, email: user.email, role: user.role });

            // Create response with cookie used for Auth
            const response = NextResponse.json({
                message: 'Login successful',
                user: { email: user.email, role: user.role }
            });

            response.cookies.set('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 1 day
                path: '/',
            });

            return response;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Login error:', error);

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
