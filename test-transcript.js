const { YoutubeTranscript } = require('youtube-transcript');

async function test(url) {
    console.log(`\nTesting: ${url}`);
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(url);
        console.log(`Success! Found ${transcript.length} lines.`);
        if (transcript.length > 0) {
            console.log('Sample:', transcript[0].text);
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

async function run() {
    await test('https://www.youtube.com/watch?v=dQw4w9WgXcQ'); // Rick Roll (Has captions)
    await test('https://youtu.be/WSe5nDN6xZ0'); // User's video
}

run();
