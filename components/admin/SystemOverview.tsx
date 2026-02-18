import { Users, Server, Activity } from 'lucide-react';

export default function SystemOverview({ totalUsers }: { totalUsers: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Users Card */}
            <div className="bg-white border border-gray-200 p-6 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Users</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{totalUsers}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                    <Users className="w-6 h-6 text-indigo-600" />
                </div>
            </div>

            {/* Server Status Card */}
            <div className="bg-white border border-gray-200 p-6 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Server Status</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-xl font-bold text-emerald-600">Online</span>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                    <Server className="w-6 h-6 text-emerald-600" />
                </div>
            </div>

            {/* Revenue / Usage Card */}
            <div className="bg-white border border-gray-200 p-6 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">API Calls</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">24.5k</h3>
                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> +18% this month
                    </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100">
                    <Activity className="w-6 h-6 text-purple-600" />
                </div>
            </div>
        </div>
    );
}
