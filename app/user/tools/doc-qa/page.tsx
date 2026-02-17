'use client';

import { useState, useEffect } from 'react';
import { FileUpload } from '@/components/doc-qa/FileUpload';
import { ChatInterface } from '@/components/doc-qa/ChatInterface';
import { FileText, Loader2, Trash2 } from 'lucide-react';

interface Document {
    id: number;
    filename: string;
    created_at: string;
}

export default function DocQAPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchDocuments = async () => {
        try {
            const res = await fetch('/api/documents/list');
            if (res.ok) {
                const data = await res.json();
                setDocuments(data.documents);
                // Select most recent if none selected? Or just leave null
            }
        } catch (error) {
            console.error('Failed to fetch documents', error);
        } finally {
            setLoadingDocs(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this document?')) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setDocuments(prev => prev.filter(doc => doc.id !== id));
                if (selectedDocId === id) setSelectedDocId(null);
            } else {
                alert('Failed to delete document');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Error deleting document');
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Document Q&A</h1>
                    <p className="text-zinc-500">
                        Upload PDF or Text files and ask questions to extract information instantly.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Sidebar / Document List */}
                    <div className="md:col-span-4 space-y-6">
                        <FileUpload onUploadComplete={fetchDocuments} />

                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 min-h-[400px]">
                            <h3 className="text-lg font-semibold text-white mb-4">My Documents</h3>
                            {loadingDocs ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                                </div>
                            ) : documents.length === 0 ? (
                                <p className="text-zinc-500 text-center py-8">No documents uploaded yet.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {documents.map((doc) => (
                                        <li key={doc.id} className="flex gap-2 group">
                                            <button
                                                onClick={() => setSelectedDocId(doc.id)}
                                                className={`flex-1 text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${selectedDocId === doc.id
                                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                                                    : 'hover:bg-zinc-800 text-zinc-300 border border-transparent'
                                                    }`}
                                            >
                                                <FileText className="w-4 h-4 shrink-0" />
                                                <span className="truncate">{doc.filename}</span>
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(e, doc.id)}
                                                disabled={deletingId === doc.id}
                                                className="p-3 bg-zinc-900 border border-zinc-800 hover:bg-red-900/20 hover:border-red-900/50 hover:text-red-400 text-zinc-500 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                                title="Delete document"
                                            >
                                                {deletingId === doc.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Main Chat Area */}
                    <div className="md:col-span-8">
                        <ChatInterface documentId={selectedDocId} />
                    </div>
                </div>
            </div>
        </div>
    );
}
