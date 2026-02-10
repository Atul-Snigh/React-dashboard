'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, Copy, Check } from 'lucide-react';

export default function YouTubeSummarizerPage() {
    const [url, setUrl] = useState('');
    const [manualTranscript, setManualTranscript] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const handleGenerate = async () => {
        if (!url && !manualTranscript) return;

        setLoading(true);
        setError('');
        setNotes('');
        setStatusMessage('Fetching transcript...');

        try {
            let transcriptText = manualTranscript;

            // Step 1: Try to fetch transcript if not manually provided
            if (!manualTranscript) {
                try {
                    const transcriptResponse = await fetch('/api/youtube/transcript', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url }),
                    });

                    const transcriptData = await transcriptResponse.json();

                    if (!transcriptResponse.ok) {
                        // If fetch fails, trigger manual input mode
                        setShowManualInput(true);
                        throw new Error(transcriptData.error || 'Failed to fetch transcript. Please paste it manually.');
                    }

                    transcriptText = transcriptData.transcript;
                } catch (fetchErr: any) {
                    console.log('Auto-fetch failed, asking for manual input');
                    setStatusMessage('');
                    throw fetchErr; // Re-throw to catch block to show error and stay in manual mode
                }
            }

            // Step 2: Summarize
            setStatusMessage('Generating study notes...');
            const summarizeResponse = await fetch('/api/youtube/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript: transcriptText }),
            });

            const summarizeData = await summarizeResponse.json();

            if (!summarizeResponse.ok) {
                throw new Error(summarizeData.error || 'Failed to generate summary');
            }

            setNotes(summarizeData.notes);
            setStatusMessage('');
            // Reset manual input state if successful, or keep it?
            // Keep it so user can see what they used.

        } catch (err: any) {
            setError(err.message);
            setStatusMessage('');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(notes);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">YouTube Summarizer</h1>
                    <p className="text-zinc-500">
                        Paste a YouTube video link to generate AI-powered study notes.
                        If we can't fetch the transcript automatically, you can paste it manually.
                    </p>
                </header>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={url}
                            onChange={(e) => {
                                setUrl(e.target.value);
                                setShowManualInput(false);
                                setError('');
                                setNotes('');
                            }}
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={loading || (!url && !manualTranscript)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Notes'}
                        </button>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setShowManualInput(!showManualInput)}
                            className="text-sm text-zinc-400 hover:text-blue-400 transition-colors underline decoration-dotted underline-offset-4"
                        >
                            {showManualInput ? 'Hide Manual Input' : 'Paste Transcript Manually'}
                        </button>
                    </div>

                    {statusMessage && (
                        <div className="text-blue-400 text-sm flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {statusMessage}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900/20 border border-red-900/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {(showManualInput || manualTranscript) && (
                        <div className="animate-in fade-in slide-in-from-top-2 space-y-2">
                            <label className="text-sm font-medium text-zinc-400">
                                Manual Transcript Input
                                <span className="text-zinc-500 ml-2 font-normal">(Paste transcript here if auto-fetch fails)</span>
                            </label>
                            <textarea
                                value={manualTranscript}
                                onChange={(e) => setManualTranscript(e.target.value)}
                                rows={8}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-y"
                                placeholder="Paste the video transcript here..."
                            />
                        </div>
                    )}
                </div>

                {notes && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                            <h2 className="text-xl font-semibold text-white">Study Notes</h2>
                            <button
                                onClick={handleCopy}
                                className="text-zinc-400 hover:text-white transition-colors p-2 rounded-md hover:bg-zinc-800"
                                title="Copy to clipboard"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="prose prose-invert max-w-none">
                            <ReactMarkdown>{notes}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
