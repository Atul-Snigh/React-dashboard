export default function RecentLogs() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Logs</h3>
            </div>
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 font-medium">Event</th>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-gray-900">System Login</td>
                        <td className="px-6 py-4">Today, 10:23 AM</td>
                        <td className="px-6 py-4 text-right text-emerald-600">Success</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-gray-900">Profile Updated</td>
                        <td className="px-6 py-4">Yesterday, 4:50 PM</td>
                        <td className="px-6 py-4 text-right text-emerald-600">Success</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-gray-900">Password Change</td>
                        <td className="px-6 py-4">Feb 5, 2026</td>
                        <td className="px-6 py-4 text-right text-gray-500">Completed</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
