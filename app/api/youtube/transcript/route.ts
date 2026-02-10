import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import util from 'util';

const execFilePromise = util.promisify(execFile);

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log(`yt-dlp (manual): Fetching transcript for: ${url}`);

        // Basic validation
        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
        }

        // Create a temporary file path for the output
        const tempDir = os.tmpdir();
        const tempId = Math.random().toString(36).substring(7);
        const outputTemplate = path.join(tempDir, `${tempId}.%(ext)s`);

        // Explicitly point to the binary
        const binaryPath = path.join(process.cwd(), 'node_modules', 'yt-dlp-exec', 'bin', 'yt-dlp.exe');
        console.log('Using yt-dlp binary at:', binaryPath);

        // Check if binary exists
        if (!fs.existsSync(binaryPath)) {
            console.error('yt-dlp binary not found at:', binaryPath);
            return NextResponse.json({ error: 'Server configuration error: yt-dlp binary missing' }, { status: 500 });
        }

        try {
            await execFilePromise(binaryPath, [
                url,
                '--write-auto-sub',
                '--skip-download',
                '--sub-format', 'json3',
                '--sub-langs', 'en.*',
                '--output', outputTemplate,
                '--no-check-certificates',
                '--no-warnings',
                '--prefer-free-formats',
                '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            ]);

            // Find the generated file. yt-dlp appends language code like .en.json3
            // We search for files starting with tempId in tempDir
            const files = fs.readdirSync(tempDir);
            const subtitleFile = files.find(f => f.startsWith(tempId) && f.includes('json3'));

            if (!subtitleFile) {
                console.log('No subtitle file created by yt-dlp.');
                return NextResponse.json({ error: 'No captions found for this video' }, { status: 404 });
            }

            const filePath = path.join(tempDir, subtitleFile);
            const fileContent = fs.readFileSync(filePath, 'utf-8');

            // Clean up
            try {
                fs.unlinkSync(filePath);
            } catch (e) { console.error('Error deleting temp file', e); }

            const transcriptJson = JSON.parse(fileContent);
            let transcriptText = '';

            if (transcriptJson.events) {
                transcriptText = transcriptJson.events
                    .map((e: any) => e.segs ? e.segs.map((s: any) => s.utf8).join('') : '')
                    .join(' ')
                    .replace(/\s+/g, ' ')
                    .trim();
            }

            if (!transcriptText) {
                return NextResponse.json({ error: 'Transcript text is empty' }, { status: 404 });
            }

            // Truncate to avoid huge prompts (as suggested by user)
            if (transcriptText.length > 20000) {
                console.log('Truncating transcript > 20k chars');
                transcriptText = transcriptText.substring(0, 20000) + "...[TRUNCATED]";
            }

            return NextResponse.json({ transcript: transcriptText });

        } catch (ytError: any) {
            console.error('yt-dlp execution error:', ytError);
            return NextResponse.json({ error: 'Failed to fetch transcript with yt-dlp', details: ytError.message }, { status: 500 });
        }

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
