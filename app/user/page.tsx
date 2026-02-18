'use client';

import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';
import UserProfile from '@/components/dashboard/UserProfile';
import ActivityGraph from '@/components/dashboard/ActivityGraph';
import RecentLogs from '@/components/dashboard/RecentLogs';

export default function UserDashboard() {
    const { user, loading, logout } = useAuth();

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading...</div>;
    if (!user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Access Denied</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Dashboard</h1>
                        <p className="text-gray-500">Manage your account and view activity.</p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 hover:text-gray-900 shadow-sm"
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
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tools</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <a href="/user/tools/youtube-summarizer" className="block p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group shadow-sm">
                                <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">YouTube Summarizer</h3>
                                <p className="text-gray-500 text-sm">Generate clean study notes from any YouTube video instantly.</p>
                            </a>
                            <a href="/user/workspaces" className="block p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group shadow-sm relative overflow-hidden">
                                <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Documents & Chat</h3>
                                <p className="text-gray-500 text-sm">Organize documents into workspaces and use Deep Search for advanced answers.</p>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
