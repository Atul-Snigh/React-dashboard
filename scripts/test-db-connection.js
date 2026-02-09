const { Pool } = require('pg');

const originalUrl = 'postgresql://neondb_owner:npg_9GdVJ7AZxRop@ep-curly-dew-a1qy6f5w-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
// Hardcoded IP for ap-southeast-1.aws.neon.tech from nslookup
const ipParams = {
    host: '52.220.170.93',
    user: 'neondb_owner',
    password: 'npg_9GdVJ7AZxRop',
    database: 'neondb',
    port: 5432,
    ssl: {
        rejectUnauthorized: true,
        servername: 'ep-curly-dew-a1qy6f5w-pooler.ap-southeast-1.aws.neon.tech', // Crucial for SNI
    },
};

const pool = new Pool(ipParams);

async function test() {
    try {
        console.log('Connecting to DB via IP...');
        const client = await pool.connect();
        console.log('Connected successfully!');
        const res = await client.query('SELECT NOW()');
        console.log('Time:', res.rows[0].now);
        client.release();
    } catch (err) {
        console.error('Connection failed:', err);
    } finally {
        await pool.end();
    }
}

test();
