import { Activity, TrendingUp } from 'lucide-react';

export default function ActivityGraph() {
    const activityData = [40, 65, 45, 80, 55, 90, 70];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-lg font-semibold text-white">Weekly Activity</h3>
                </div>
                <div className="text-sm text-zinc-500 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +12.5% vs last week
                </div>
            </div>

            {/* Custom CSS/SVG Graph */}
            <div className="relative h-64 w-full flex items-end justify-between gap-2 md:gap-4 pt-8">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="border-t border-zinc-500 w-full"></div>
                    <div className="border-t border-zinc-500 w-full"></div>
                    <div className="border-t border-zinc-500 w-full"></div>
                    <div className="border-t border-zinc-500 w-full"></div>
                    <div className="border-t border-zinc-500 w-full"></div>
                </div>

                {activityData.map((value, index) => (
                    <div key={index} className="w-full h-full flex flex-col justify-end group cursor-pointer">
                        <div className="relative w-full bg-zinc-800 rounded-t-sm hover:bg-zinc-700 transition-all duration-300" style={{ height: `${value}%` }}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {value}%
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent opacity-50"></div>
                            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        </div>
                        <span className="text-xs text-zinc-500 text-center mt-3 font-medium">{days[index]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
