import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            // Check if user exists
            const existingUser = await client.query('SELECT * FROM users WHERE email = $1', [email]);
            if (existingUser.rows.length > 0) {
                return NextResponse.json({ error: 'User already exists' }, { status: 409 });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user (default role: user, is_approved: false)
            await client.query(
                'INSERT INTO users (email, password, role, is_approved) VALUES ($1, $2, $3, $4)',
                [email, hashedPassword, 'user', false]
            );

            return NextResponse.json({ message: 'User created successfully. Please wait for admin approval.' }, { status: 201 });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
