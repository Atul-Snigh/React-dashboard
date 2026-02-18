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

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading...</div>;
    if (!user || user.role !== 'admin') return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Access Denied</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500 mt-1">Manage system performance and user access.</p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 hover:text-gray-900 shadow-sm"
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
