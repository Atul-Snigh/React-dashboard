const videoId = 'WSe5nDN6xZ0';

async function run() {
    console.log(`Fetching video page for ${videoId}...`);
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
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
    console.log('Original BaseURL:', track.baseUrl);

    // 1. Try original URL
    console.log('\n--- 1. Original URL ---');
    try {
        const res = await fetch(track.baseUrl);
        const text = await res.text();
        console.log(`Status: ${res.status}, Length: ${text.length}`);
    } catch (e) { console.log('Error:', e.message); }

    // 2. Try forcing fmt=json3
    console.log('\n--- 2. Force fmt=json3 ---');
    try {
        const url = track.baseUrl + '&fmt=json3';
        const res = await fetch(url);
        const text = await res.text();
        console.log(`Status: ${res.status}, Length: ${text.length}`);
        if (text.length > 0) console.log('Sample:', text.substring(0, 100));
    } catch (e) { console.log('Error:', e.message); }

    // 3. Try removing "kind=asr" if present (to get clean captions if available, though unlikely for this video)
    if (track.baseUrl.includes('kind=asr')) {
        console.log('\n--- 3. Remove kind=asr ---');
        try {
            const url = track.baseUrl.replace('&kind=asr', '');
            const res = await fetch(url);
            const text = await res.text();
            console.log(`Status: ${res.status}, Length: ${text.length}`);
        } catch (e) { console.log('Error:', e.message); }
    }
}

run();
