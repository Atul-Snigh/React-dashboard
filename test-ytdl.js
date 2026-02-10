const ytdl = require('@distube/ytdl-core');
const fs = require('fs');

const videoId = 'WSe5nDN6xZ0';

async function run() {
    console.log(`Getting info for ${videoId}...`);
    try {
        const info = await ytdl.getInfo(videoId);
        console.log('Title:', info.videoDetails.title);

        const tracks = info.player_response.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        if (!tracks || tracks.length === 0) {
            console.log('No captions found');
            return;
        }

        console.log(`Found ${tracks.length} tracks.`);
        const track = tracks.find(t => t.languageCode === 'en') || tracks[0];
        console.log(`Selected: ${track.name.simpleText} (${track.languageCode})`);
        console.log(`URL: ${track.baseUrl.substring(0, 50)}...`);

        // Try fetching the URL provided by ytdl-core
        console.log('Fetching track URL...');
        const res = await fetch(track.baseUrl);
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Length: ${text.length}`);
        if (text.length > 0) console.log('Sample:', text.substring(0, 100));

    } catch (e) {
        console.log('Error:', e.message);
    }
}

run();
