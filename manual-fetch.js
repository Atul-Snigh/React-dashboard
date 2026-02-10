const https = require('https');
const { URL } = require('url');

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
    console.log('Fetching video page...');
    const pageHtml = await fetch(`https://www.youtube.com/watch?v=${videoId}`);

    // Extract captionTracks
    const match = pageHtml.match(/"captionTracks":\s*(\[.*?\])/);
    if (!match) {
        console.error('Could not find captionTracks');
        return;
    }

    const tracks = JSON.parse(match[1]);
    console.log(`Found ${tracks.length} tracks`);

    // Find English track (or first one)
    const enTrack = tracks.find(t => t.languageCode === 'en') || tracks[0];
    console.log('Selected track:', enTrack.name.simpleText, enTrack.languageCode);

    // Fetch transcript XML
    console.log('Fetching transcript XML...');
    const xml = await fetch(enTrack.baseUrl);

    // Simple XML parsing (looking for <text> tags)
    // <text start="0.06" dur="2.16">Hello world</text>
    const regex = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
    let transcript = '';
    let m;
    let count = 0;

    while ((m = regex.exec(xml)) !== null) {
        // m[3] is the text content, need to decode HTML entities
        let text = m[3].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
        transcript += text + ' ';
        count++;
    }

    console.log(`Parsed ${count} lines.`);
    console.log('Sample:', transcript.substring(0, 100));
}

run();
