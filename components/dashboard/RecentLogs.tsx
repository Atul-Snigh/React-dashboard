export default function RecentLogs() {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
                <h3 className="text-lg font-semibold text-white">Recent Logs</h3>
            </div>
            <table className="w-full text-left text-sm text-zinc-400">
                <thead className="bg-zinc-900 text-zinc-500">
                    <tr>
                        <th className="px-6 py-3 font-medium">Event</th>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                    <tr className="hover:bg-zinc-800/50 transition">
                        <td className="px-6 py-4 text-white">System Login</td>
                        <td className="px-6 py-4">Today, 10:23 AM</td>
                        <td className="px-6 py-4 text-right text-emerald-500">Success</td>
                    </tr>
                    <tr className="hover:bg-zinc-800/50 transition">
                        <td className="px-6 py-4 text-white">Profile Updated</td>
                        <td className="px-6 py-4">Yesterday, 4:50 PM</td>
                        <td className="px-6 py-4 text-right text-emerald-500">Success</td>
                    </tr>
                    <tr className="hover:bg-zinc-800/50 transition">
                        <td className="px-6 py-4 text-white">Password Change</td>
                        <td className="px-6 py-4">Feb 5, 2026</td>
                        <td className="px-6 py-4 text-right text-zinc-500">Completed</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
