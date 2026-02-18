'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, FileText, Trash2, Upload, MessageSquare, Plus, Send, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Document {
    id: string;
    filename: string;
    created_at: string;
}

interface Workspace {
    id: string;
    name: string;
    created_at: string;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function WorkspaceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.id as string;

    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    // Chat State
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [deepSearchEnabled, setDeepSearchEnabled] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Upload State
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (workspaceId) {
            fetchWorkspaceData();
        }
    }, [workspaceId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchWorkspaceData = async () => {
        try {
            const res = await fetch(`/api/workspaces/${workspaceId}`);
            if (res.ok) {
                const data = await res.json();
                setWorkspace(data.workspace);
                setDocuments(data.documents);
            } else {
                router.push('/user/workspaces'); // Redirect if not found
            }
        } catch (error) {
            console.error('Error fetching workspace:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('workspaceId', workspaceId);

        try {
            const res = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                // Refresh documents
                fetchWorkspaceData();
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                setUploadError(data.error || 'Upload failed');
            }
        } catch (error) {
            setUploadError('An error occurred during upload');
        } finally {
            setUploading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setChatInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setChatLoading(true);

        try {
            const res = await fetch(`/api/workspaces/${workspaceId}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, enableDeepSearch: deepSearchEnabled }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I encountered an error: ${data.error || 'Unknown error'}` }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Network error. Please try again." }]);
        } finally {
            setChatLoading(false);
        }
    };

    const handleDeleteDoc = async (docId: string) => {
        if (!confirm('Are you sure you want to delete this document? \nThis will also remove it from the chat context.')) return;

        try {
            const res = await fetch(`/api/documents/${docId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                // Remove from local state immediately for responsiveness
                setDocuments(prev => prev.filter(d => d.id !== docId));
                // Clear chat if it was about this document? optional.
                // Reset chat if needed or just let it be.
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete document');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('An error occurred while deleting');
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">Loading workspace...</div>;
    if (!workspace) return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">Workspace not found</div>;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar: Documents */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                    <Link href="/user/workspaces" className="text-gray-500 hover:text-gray-900 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h2 className="font-semibold text-gray-900 truncate flex-1">{workspace.name}</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Documents</h3>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{documents.length}</span>
                    </div>

                    <div className="space-y-2">
                        {documents.map(doc => (
                            <div key={doc.id} className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-700 truncate">{doc.filename}</p>
                                    <p className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteDoc(doc.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    title="Delete document"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {documents.length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg">
                                No documents yet
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50/50">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf,.txt"
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-gray-600 py-2.5 rounded-xl font-medium shadow-sm transition-all"
                    >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Upload Document
                    </button>
                    {uploadError && <p className="text-xs text-red-500 mt-2 text-center">{uploadError}</p>}
                </div>
            </div>

            {/* Main Content: Chat */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50/30">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 space-y-4">
                            <MessageSquare className="w-16 h-16" />
                            <p className="text-lg font-medium">Ask a question about your documents</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-6 py-4 shadow-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                    }`}>
                                    <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {chatLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-6 py-4 shadow-sm">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 md:p-6 bg-white border-t border-gray-200 space-y-3">
                    <div className="max-w-4xl mx-auto flex justify-between items-center px-1">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setDeepSearchEnabled(!deepSearchEnabled)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${deepSearchEnabled
                                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                    : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                                    }`}
                            >
                                <Globe className="w-3 h-3" />
                                Deep Search {deepSearchEnabled ? 'On' : 'Off'}
                            </button>
                        </div>
                    </div>
                    <div className="max-w-4xl mx-auto relative flex items-center gap-2">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type your question..."
                            className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
                            disabled={chatLoading}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={chatLoading || !chatInput.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-sm transform active:scale-95"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
