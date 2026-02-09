'use client';

import { useEffect, useState } from 'react';
import { useAuth, User } from '@/hooks/useAuth';

export default function AdminDashboard() {
    const { user, loading, logout } = useAuth();
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchUsers();
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    const handleApprove = async (userId: number, approved: boolean) => {
        try {
            const res = await fetch('/api/admin/approve', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, approved }),
            });

            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Failed to update user status', error);
        }
    };

    if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Loading...</div>;
    if (!user || user.role !== 'admin') return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Access Denied</div>;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
                        <p className="text-zinc-500 text-sm">User Verification & Management</p>
                    </div>
                    <button
                        onClick={logout}
                        className="text-zinc-400 hover:text-white text-sm font-medium transition-colors"
                    >
                        Sign Out
                    </button>
                </header>

                <div className="border border-zinc-800 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-zinc-800">
                        <thead className="bg-zinc-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-zinc-950 divide-y divide-zinc-800">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-zinc-900/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 font-mono">{u.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-200">{u.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                                        {u.role}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {u.is_approved ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500">
                                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                                        {!u.is_approved ? (
                                            <button
                                                onClick={() => handleApprove(u.id!, true)}
                                                className="text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded text-xs transition-colors border border-zinc-700"
                                            >
                                                Approve
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleApprove(u.id!, false)}
                                                className="text-white bg-red-900/30 hover:bg-red-900/50 text-red-400 px-3 py-1 rounded text-xs transition-colors border border-red-900/50"
                                            >
                                                Revoke
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
