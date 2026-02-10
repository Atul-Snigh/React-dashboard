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

    // Get Title
    const titleMatch = pageHtml.match(/<title>(.*?)<\/title>/);
    console.log('Page Title:', titleMatch ? titleMatch[1] : 'Not found');

    // Extract captionTracks
    const match = pageHtml.match(/"captionTracks":\s*(\[.*?\])/);
    if (!match) {
        console.log('No captionTracks found in HTML');
        return;
    }

    const tracks = JSON.parse(match[1]);
    console.log(`Found ${tracks.length} tracks:`);
    tracks.forEach(t => {
        console.log(`- Language: ${t.languageCode}, Name: ${t.name.simpleText}, Kind: ${t.kind}, vssId: ${t.vssId}`);
        console.log(`  BaseUrl: ${t.baseUrl.substring(0, 50)}...`);
    });
}

run();
