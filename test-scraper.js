const { getSubtitles } = require('youtube-caption-scraper');

const videoId = 'WSe5nDN6xZ0'; // User's video ID

console.log(`Testing youtube-caption-scraper for: ${videoId}`);

getSubtitles({
    videoID: videoId,
    lang: 'en'
})
    .then(captions => {
        console.log('Success! Found ' + captions.length + ' lines.');
        if (captions.length > 0) {
            console.log('Sample:', captions.slice(0, 3).map(c => c.text));
        }
    })
    .catch(err => {
        console.error('FAILED:', err);
    });
