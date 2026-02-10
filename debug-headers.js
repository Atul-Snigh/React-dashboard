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

    console.log(`Testing track: ${track.name.simpleText} (${track.languageCode})`);

    // Try with FULL headers
    console.log('\n--- Full Headers Fetch ---');
    try {
        const res = await fetch(track.baseUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': `https://www.youtube.com/watch?v=${videoId}`,
                'Origin': 'https://www.youtube.com',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
            }
        });
        const text = await res.text();
        console.log(`Status: ${res.status}, Length: ${text.length}`);
        if (text.length > 0) console.log('Sample:', text.substring(0, 500));
    } catch (e) { console.log('Error:', e.message); }
}

run();
