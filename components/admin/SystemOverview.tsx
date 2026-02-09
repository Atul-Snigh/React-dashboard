import { Users, Server, Activity } from 'lucide-react';

export default function SystemOverview({ totalUsers }: { totalUsers: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Users Card */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl flex items-center justify-between">
                <div>
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Total Users</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{totalUsers}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <Users className="w-6 h-6 text-indigo-500" />
                </div>
            </div>

            {/* Server Status Card */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl flex items-center justify-between">
                <div>
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Server Status</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-xl font-bold text-emerald-500">Online</span>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Server className="w-6 h-6 text-emerald-500" />
                </div>
            </div>

            {/* Revenue / Usage Card */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl flex items-center justify-between">
                <div>
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">API Calls</p>
                    <h3 className="text-3xl font-bold text-white mt-1">24.5k</h3>
                    <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> +18% this month
                    </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <Activity className="w-6 h-6 text-purple-500" />
                </div>
            </div>
        </div>
    );
}
