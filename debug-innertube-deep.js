const { Innertube, UniversalCache } = require('youtubei.js');

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

        // Detailed inspection of transcript options
        if (info.transcript_data) {
            console.log('Found transcript_data in info response');
            console.log('Available languages:', info.transcript_data.captions.map(c => c.language));
        } else {
            console.log('No transcript_data in initial info');
        }

        try {
            const transcriptData = await info.getTranscript();
            console.log('Transcript data retrieved via getTranscript()');

            if (transcriptData.transcript) {
                const lines = transcriptData.transcript.content.body.initial_segments.map(seg => seg.snippet.text);
                console.log('Success! Found ' + lines.length + ' lines.');
            }

        } catch (e) {
            console.error('getTranscript failed:', e.message);
            if (e.info) console.log('Error Info:', e.info);
        }

    } catch (error) {
        console.error('getInfo failed:', error);
    }
}

run();
