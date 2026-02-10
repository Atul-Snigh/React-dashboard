const https = require('https');

const url = 'https://www.youtube.com/watch?v=WSe5nDN6xZ0';

console.log('Fetching:', url);

https.get(url, {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    }
}, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);

        // Check for "captionTracks"
        if (data.includes('captionTracks')) {
            console.log('SUCCESS: found "captionTracks" in HTML');
            const match = data.match(/"captionTracks":\s*(\[.*?\])/);
            if (match) {
                console.log('Tracks:', match[1].substring(0, 200) + '...');
            }
        } else {
            console.log('FAILURE: "captionTracks" NOT found in HTML');
            // Check if we got consent page
            if (data.includes('consent.youtube.com')) {
                console.log('Got consent page redirection/content');
            } else if (data.includes('class="g-recaptcha"')) {
                console.log('Got captcha');
            } else {
                console.log('Unknown error. Page title match:', data.match(/<title>(.*?)<\/title>/));
            }
        }
    });
}).on('error', (err) => {
    console.error('Error:', err);
});
