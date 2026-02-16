'use client';
import { useState } from 'react';
import { Loader2, Upload } from 'lucide-react';

export function FileUpload({ onUploadComplete }: { onUploadComplete: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Upload failed');
            }

            setFile(null);
            onUploadComplete();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Upload Document</h3>
            <div className="flex flex-col gap-4">
                <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-zinc-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-600 file:text-white
            hover:file:bg-blue-700
          "
                />
                {file && (
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Upload {file.name}
                    </button>
                )}
                {error && <p className="text-red-400 text-sm">{error}</p>}
            </div>
        </div>
    );
}
