import { YoutubeTranscript } from 'youtube-transcript';

export async function getTranscript(videoId: string) {
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        return transcript.map((item) => item.text).join(' ');
    } catch (error) {
        console.error('Error fetching transcript:', error);
        throw new Error('Failed to fetch transcript. Video might not have captions enabled.');
    }
}

export function extractVideoId(url: string) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}
