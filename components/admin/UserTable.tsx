import { User } from '@/hooks/useAuth';
import { MoreHorizontal, Shield, Trash2, Edit } from 'lucide-react';

interface UserTableProps {
    users: User[];
    onApprove: (id: number, approved: boolean) => void;
    onDelete: (id: number) => void;
}

export default function UserTable({ users, onApprove, onDelete }: UserTableProps) {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">User Management</h3>
                <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-1 rounded-full">{users.length} Users</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="bg-zinc-900/50 text-zinc-500 uppercase tracking-wider text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-zinc-800/50 transition duration-150">
                                {/* User Column */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-300 font-bold text-xs uppercase border border-zinc-600">
                                            {user.email.substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{user.email.split('@')[0]}</div>
                                            <div className="text-zinc-500 text-xs">{user.email}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* Role Column */}
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'admin'
                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            : 'bg-zinc-700/50 text-zinc-300 border-zinc-700'
                                        }`}>
                                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                        {user.role === 'admin' ? 'Admin' : 'Viewer'}
                                    </span>
                                </td>

                                {/* Status Column */}
                                <td className="px-6 py-4">
                                    {user.is_approved ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                            Pending
                                        </span>
                                    )}
                                </td>

                                {/* Actions Column */}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {/* Approve/Revoke Action */}
                                        {!user.is_approved ? (
                                            <button
                                                onClick={() => onApprove(user.id!, true)}
                                                className="text-xs font-medium text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded transition-colors border border-emerald-500/20"
                                            >
                                                Approve
                                            </button>
                                        ) : (
                                            user.role !== 'admin' && (
                                                <button
                                                    onClick={() => onApprove(user.id!, false)}
                                                    className="text-xs font-medium text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 px-3 py-1.5 rounded transition-colors border border-orange-500/20"
                                                >
                                                    Revoke
                                                </button>
                                            )
                                        )}

                                        {/* Delete Action - Only for non-admins usually, or safe check */}
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => onDelete(user.id!)}
                                                className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
