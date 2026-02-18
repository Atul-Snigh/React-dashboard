'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Folder, Loader2, Trash2, ArrowRight } from 'lucide-react';

interface Workspace {
    id: string;
    name: string;
    created_at: string;
    document_count: string;
}

export default function WorkspaceListPage() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [creatingLoading, setCreatingLoading] = useState(false);

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            const res = await fetch('/api/workspaces');
            const data = await res.json();
            if (res.ok) {
                setWorkspaces(data.workspaces);
            }
        } catch (error) {
            console.error('Error fetching workspaces:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWorkspaceName.trim()) return;

        setCreatingLoading(true);
        try {
            const res = await fetch('/api/workspaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newWorkspaceName }),
            });
            const data = await res.json();
            if (res.ok) {
                setWorkspaces([data.workspace, ...workspaces]);
                setNewWorkspaceName('');
                setIsCreating(false);
            }
        } catch (error) {
            console.error('Error creating workspace:', error);
        } finally {
            setCreatingLoading(false);
        }
    };

    const handleDeleteWorkspace = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent navigation
        if (!confirm('Are you sure you want to delete this workspace and all its documents?')) return;

        try {
            const res = await fetch(`/api/workspaces/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setWorkspaces(workspaces.filter(w => w.id !== id));
            }
        } catch (error) {
            console.error('Error deleting workspace:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex justify-between items-center pb-8 border-b border-gray-200">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Workspaces</h1>
                        <p className="text-gray-500">Manage your document collections. <strong>Click on a workspace to upload documents.</strong></p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        New Workspace
                    </button>
                </header>

                {/* Create Modal/Inline Form */}
                {isCreating && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6 animate-in slide-in-from-top-2">
                        <form onSubmit={handleCreateWorkspace} className="flex gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium text-gray-700">Workspace Name</label>
                                <input
                                    type="text"
                                    value={newWorkspaceName}
                                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                                    placeholder="e.g., Marketing Q1 Reports"
                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={creatingLoading || !newWorkspaceName.trim()}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                            >
                                {creatingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                )}

                {/* Workspace Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : workspaces.length === 0 ? (
                    <div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-xl">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Folder className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No workspaces yet</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">Create a workspace to start uploading documents and asking questions.</p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors shadow-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Create Workspace
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workspaces.map((workspace) => (
                            <Link
                                key={workspace.id}
                                href={`/user/workspaces/${workspace.id}`}
                                className="group block bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all shadow-sm relative"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Folder className="w-6 h-6" />
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteWorkspace(e, workspace.id)}
                                        className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                        title="Delete Workspace"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    {workspace.name}
                                </h3>
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                                    <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md">
                                        {workspace.document_count} Documents
                                    </span>
                                    <span className="flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:underline">
                                        Open <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
