const videoId = 'WSe5nDN6xZ0';

// List of some public instances to try
const instances = [
    'https://invidious.jing.rocks',
    'https://vid.puffyan.us',
    'https://inv.tux.pizza',
    'https://invidious.nerdvpn.de'
];

async function run() {
    console.log(`Testing Invidious instances for video: ${videoId}`);

    for (const instance of instances) {
        console.log(`\n--- Trying ${instance} ---`);
        try {
            // first get video info to find captions
            // /api/v1/videos/
            const infoUrl = `${instance}/api/v1/videos/${videoId}`;
            console.log(`Fetching info: ${infoUrl}`);

            const res = await fetch(infoUrl);
            if (!res.ok) {
                console.log(`Failed to fetch info: ${res.status}`);
                continue;
            }

            const data = await res.json();
            if (!data.captions || data.captions.length === 0) {
                console.log('No captions found in API response');
                continue;
            }

            console.log(`Found ${data.captions.length} captions`);
            const caption = data.captions.find(c => c.label === 'English' || c.label.startsWith('English')) || data.captions[0];

            console.log(`Selected caption: ${caption.label} (${caption.url})`);

            // fetch caption content
            // The url in response is relative e.g. /api/v1/captions/...
            const captionUrl = instance + caption.url;
            console.log(`Fetching caption: ${captionUrl}`);

            const captionRes = await fetch(captionUrl);
            const captionText = await captionRes.text(); // content is VTT

            console.log(`Length: ${captionText.length}`);
            if (captionText.length > 0) {
                console.log('Sample:', captionText.substring(0, 100));
                console.log('SUCCESS!');
                break; // Stop on first success
            }

        } catch (e) {
            console.log('Error:', e.message);
        }
    }
}

run();
