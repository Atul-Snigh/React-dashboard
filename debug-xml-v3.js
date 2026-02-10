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

    console.log(`Fetching XML for track: ${track.name.simpleText} (${track.languageCode})`);
    console.log('BaseURL:', track.baseUrl);

    const xmlRes = await fetch(track.baseUrl);
    console.log('Status:', xmlRes.status);
    const xmlText = await xmlRes.text();
    console.log('Length:', xmlText.length);
    console.log('\n--- XML START ---');
    console.log(xmlText.substring(0, 2000));
    console.log('--- XML END ---');
}

run();
