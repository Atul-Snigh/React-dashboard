const videoId = 'WSe5nDN6xZ0';

async function run() {
    console.log(`Fetching video page for ${videoId}...`);
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
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

    // Try original
    await testUrl("Original", track.baseUrl);

    // Try forcing json3
    await testUrl("Force json3", track.baseUrl + '&fmt=json3');

    // Try no signature
    const noSig = track.baseUrl.replace(/&signature=[^&]*/, '');
    await testUrl("No Signature", noSig);

    // Try no signature + json3
    await testUrl("No Signature + json3", noSig + '&fmt=json3');
}

async function testUrl(name, url) {
    console.log(`\n--- Test: ${name} ---`);
    try {
        const res = await fetch(url);
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Length: ${text.length}`);
        if (text.length > 0) console.log('Sample:', text.substring(0, 100));
    } catch (e) {
        console.log('Error:', e.message);
    }
}

run();
