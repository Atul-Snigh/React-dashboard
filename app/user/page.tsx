'use client';

import { useAuth } from '@/hooks/useAuth';

export default function UserDashboard() {
    const { user, loading, logout } = useAuth();

    if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Loading...</div>;
    if (!user) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Access Denied</div>;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-10 pb-6 border-b border-zinc-800">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-zinc-500 text-sm">Welcome back, {user.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="text-zinc-400 hover:text-white text-sm font-medium transition-colors"
                    >
                        Sign Out
                    </button>
                </header>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/30">
                        <h3 className="text-sm font-medium text-zinc-400 mb-2">Account Status</h3>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            <span className="text-2xl font-semibold">Active</span>
                        </div>
                    </div>

                    <div className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/30">
                        <h3 className="text-sm font-medium text-zinc-400 mb-2">Member Since</h3>
                        <p className="text-2xl font-semibold">2024</p>
                    </div>
                </div>

                <div className="mt-8 p-6 rounded-lg border border-dashed border-zinc-800 text-center">
                    <p className="text-zinc-500 text-sm">More modules coming soon...</p>
                </div>
            </div>
        </div>
    );
}
