'use client';

import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';
import UserProfile from '@/components/dashboard/UserProfile';
import ActivityGraph from '@/components/dashboard/ActivityGraph';
import RecentLogs from '@/components/dashboard/RecentLogs';

export default function UserDashboard() {
    const { user, loading, logout } = useAuth();

    if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Loading...</div>;
    if (!user) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Access Denied</div>;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Dashboard</h1>
                        <p className="text-zinc-500">Manage your account and view activity.</p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-sm font-medium text-zinc-300 hover:text-white"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <UserProfile user={user} />

                    <div className="lg:col-span-2 space-y-8">
                        <ActivityGraph />

                        <RecentLogs />
                    </div>

                    <div className="lg:col-span-3">
                        <h2 className="text-xl font-semibold text-white mb-4">Tools</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <a href="/user/tools/youtube-summarizer" className="block p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors group">
                                <h3 className="text-lg font-medium text-white mb-2 group-hover:text-blue-400 transition-colors">YouTube Summarizer</h3>
                                <p className="text-zinc-400 text-sm">Generate clean study notes from any YouTube video instantly.</p>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
