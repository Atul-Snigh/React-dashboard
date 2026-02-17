// Native fetch is available in Node 18+


async function main() {
    try {
        console.log('Querying debug route...');
        const res = await fetch('http://localhost:3000/api/debug', { method: 'POST' });
        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Body:', text);
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

main();
