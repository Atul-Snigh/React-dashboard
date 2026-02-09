import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

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

        if (pathname.startsWith('/user') && (payload as any).role !== 'user' && (payload as any).role !== 'admin') {
            // Admins can view user pages? implementation_plan said "Admin -> Admin Page, User -> User Page".
            // Let's strict route: Admin -> /admin, User -> /user.
            if ((payload as any).role === 'admin') {
                // Allow admin to see user page? Or redirect to admin?
                // User request: "When admin login they go to admin and user will go to user page"
                // I'll redirect admin to /admin if they try to go to /user?
                // No, let's keep it simple. Admin is admin.
                return NextResponse.redirect(new URL('/admin', request.url));
            }
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
