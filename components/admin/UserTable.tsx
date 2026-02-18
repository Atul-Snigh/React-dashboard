import { User } from '@/hooks/useAuth';
import { MoreHorizontal, Shield, Trash2, Edit } from 'lucide-react';

interface UserTableProps {
    users: User[];
    onApprove: (id: number, approved: boolean) => void;
    onDelete: (id: number) => void;
}

export default function UserTable({ users, onApprove, onDelete }: UserTableProps) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{users.length} Users</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-semibold border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition duration-150">
                                {/* User Column */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs uppercase border border-gray-300">
                                            {user.email.substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{user.email.split('@')[0]}</div>
                                            <div className="text-gray-500 text-xs">{user.email}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* Role Column */}
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'admin'
                                        ? 'bg-purple-100 text-purple-700 border-purple-200'
                                        : 'bg-gray-100 text-gray-600 border-gray-200'
                                        }`}>
                                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                        {user.role === 'admin' ? 'Admin' : 'Viewer'}
                                    </span>
                                </td>

                                {/* Status Column */}
                                <td className="px-6 py-4">
                                    {user.is_approved ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
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
                                                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded transition-colors border border-emerald-200"
                                            >
                                                Approve
                                            </button>
                                        ) : (
                                            user.role !== 'admin' && (
                                                <button
                                                    onClick={() => onApprove(user.id!, false)}
                                                    className="text-xs font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded transition-colors border border-orange-200"
                                                >
                                                    Revoke
                                                </button>
                                            )
                                        )}

                                        {/* Delete Action - Only for non-admins usually, or safe check */}
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => onDelete(user.id!)}
                                                className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
