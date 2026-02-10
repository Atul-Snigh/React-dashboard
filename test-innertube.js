const { Innertube, UniversalCache, Utils } = require('youtubei.js');

async function run() {
    console.log('Creating Innertube instance...');
    const youtube = await Innertube.create({
        cache: new UniversalCache(false),
        generate_session_locally: true
    });

    const videoId = 'WSe5nDN6xZ0';
    console.log(`Testing youtubei.js for: ${videoId}`);

    try {
        const info = await youtube.getInfo(videoId);
        console.log('Video Title:', info.basic_info.title);

        try {
            const transcriptData = await info.getTranscript();
            console.log('Transcript data found');

            // properties might be different depending on version, let's dump keys
            // console.log('Keys:', Object.keys(transcriptData));

            if (transcriptData.transcript) {
                const lines = transcriptData.transcript.content.body.initial_segments.map(seg => seg.snippet.text);
                console.log('Success! Found ' + lines.length + ' lines.');
            }

        } catch (e) {
            console.error('getTranscript failed:', e);
        }

    } catch (error) {
        console.error('getInfo failed:', error);
    }
}

run();
