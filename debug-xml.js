const https = require('https');

const videoId = 'WSe5nDN6xZ0';

function fetch(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function run() {
    console.log(`Fetching video page for ${videoId}...`);
    const pageHtml = await fetch(`https://www.youtube.com/watch?v=${videoId}`);

    // Extract captionTracks
    const match = pageHtml.match(/"captionTracks":\s*(\[.*?\])/);
    if (!match) {
        console.log('No captionTracks found');
        return;
    }

    const tracks = JSON.parse(match[1]);
    const track = tracks.find(t => t.languageCode === 'en') || tracks[0];

    console.log(`Fetching XML for track: ${track.name.simpleText} (${track.languageCode})`);
    console.log('BaseURL:', track.baseUrl);

    const xml = await fetch(track.baseUrl);
    console.log('\n--- XML START ---');
    console.log(xml.substring(0, 2000)); // Print first 2000 chars
    console.log('--- XML END ---');
}

run();
