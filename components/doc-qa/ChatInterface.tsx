'use client';
import { useState, useRef, useEffect } from 'react';
import { Loader2, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function ChatInterface({ documentId }: { documentId: number | null }) {
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Reset chat when document changes - Optional: could load history if persisted
    useEffect(() => {
        setMessages([]);
    }, [documentId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !documentId) return;

        const userMessage = input;
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const res = await fetch('/api/documents/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId, message: userMessage }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to get answer');
            }

            setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
        } catch (err: any) {
            setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
        } finally {
            setLoading(false);
        }
    };

    if (!documentId) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-[500px] flex items-center justify-center text-zinc-500">
                Select a document to start chatting
            </div>
        );
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col h-[600px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-800 text-zinc-200'
                                }`}
                        >
                            <div className="prose prose-invert max-w-none text-sm">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-zinc-800 rounded-lg px-4 py-2">
                            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-zinc-800 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask a question about this document..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    disabled={loading}
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg disabled:opacity-50 transition-colors"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
