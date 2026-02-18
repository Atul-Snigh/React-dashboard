import { User } from '@/hooks/useAuth';
import { User as UserIcon, Calendar } from 'lucide-react';

export default function UserProfile({ user }: { user: User }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 lg:col-span-1 space-y-6 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                    <UserIcon className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">My Profile</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-sm text-emerald-600 font-medium">Online</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Email</label>
                    <p className="text-gray-900 mt-1">{user.email}</p>
                </div>
                <div>
                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Role</label>
                    <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {user.role.toUpperCase()}
                    </div>
                </div>
                <div>
                    <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Member Since</label>
                    <div className="mt-1 flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar className="w-4 h-4" />
                        Feb 2026
                    </div>
                </div>
            </div>
        </div>
    );
}
