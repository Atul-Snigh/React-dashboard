const fs = require('fs');
const videoId = 'WSe5nDN6xZ0';

async function run() {
    console.log(`Fetching video page for ${videoId}...`);
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }
    });
    const pageHtml = await pageRes.text();

    // Extract captionTracks
    const match = pageHtml.match(/"captionTracks":\s*(\[.*?\])/);
    if (!match) {
        console.log('No captionTracks found');
        return;
    }

    const tracks = JSON.parse(match[1]);
    const track = tracks.find(t => t.languageCode === 'en') || tracks[0];

    console.log(`Track: ${track.name.simpleText} (${track.languageCode})`);

    fs.writeFileSync('track_url.txt', track.baseUrl);
    console.log('URL saved to track_url.txt');
}

run();
