import { User } from '@/hooks/useAuth';
import { User as UserIcon, Calendar } from 'lucide-react';

export default function UserProfile({ user }: { user: User }) {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 lg:col-span-1 space-y-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                    <UserIcon className="w-8 h-8 text-zinc-400" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-white">My Profile</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-sm text-emerald-500 font-medium">Online</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                <div>
                    <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Email</label>
                    <p className="text-zinc-200 mt-1">{user.email}</p>
                </div>
                <div>
                    <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Role</label>
                    <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {user.role.toUpperCase()}
                    </div>
                </div>
                <div>
                    <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Member Since</label>
                    <div className="mt-1 flex items-center gap-2 text-zinc-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        Feb 2026
                    </div>
                </div>
            </div>
        </div>
    );
}
