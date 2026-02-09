'use client';

import { useEffect, useState } from 'react';
import { useAuth, User } from '@/hooks/useAuth';
import SystemOverview from '@/components/admin/SystemOverview';
import UserTable from '@/components/admin/UserTable';
import { LogOut } from 'lucide-react';

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

    const handleDelete = async (userId: number) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Failed to delete user', error);
        }
    };

    if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Loading...</div>;
    if (!user || user.role !== 'admin') return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Access Denied</div>;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex justify-between items-center mb-10 pb-6 border-b border-zinc-800">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
                        <p className="text-zinc-500 mt-1">Manage system performance and user access.</p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-sm font-medium text-zinc-300 hover:text-white"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </header>

                <SystemOverview totalUsers={users.length} />

                <UserTable
                    users={users}
                    onApprove={handleApprove}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
}
