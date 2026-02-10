import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

// Middleware to protect routes
export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Paths that require auth
    const protectedPaths = ['/admin', '/user'];
    const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

    if (isProtected) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const payload = await verifyJWT(token);
        if (!payload) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Role-based protection
        if (pathname.startsWith('/admin') && (payload as any).role !== 'admin') {
            return NextResponse.redirect(new URL('/user', request.url)); // or 403
        }
    }

    // Auth pages (login/signup) - redirect if already logged in
    if (pathname === '/login' || pathname === '/signup') {
        if (token) {
            const payload = await verifyJWT(token);
            if (payload) {
                if ((payload as any).role === 'admin') {
                    return NextResponse.redirect(new URL('/admin', request.url));
                } else {
                    return NextResponse.redirect(new URL('/user', request.url));
                }
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/user/:path*', '/login', '/signup'],
};
