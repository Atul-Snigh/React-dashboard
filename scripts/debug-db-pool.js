const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Mimic lib/db.ts logic EXACTLY
const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: true,
    },
};

console.log('Original Config:', { ...dbConfig, connectionString: '***' });

if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('ep-curly-dew-a1qy6f5w-pooler.ap-southeast-1.aws.neon.tech')) {
    console.log('Applying using workaround logic...');
    const url = new URL(process.env.DATABASE_URL);
    dbConfig.host = '13.228.184.177';
    dbConfig.user = url.username;
    dbConfig.password = url.password;
    dbConfig.database = url.pathname.slice(1);
    dbConfig.port = 5432;
    dbConfig.ssl = {
        rejectUnauthorized: true,
        servername: 'ep-curly-dew-a1qy6f5w-pooler.ap-southeast-1.aws.neon.tech',
    };
    delete dbConfig.connectionString;
}

console.log('Final Config:', { ...dbConfig, password: '***' });

const pool = new Pool(dbConfig);

async function testPool() {
    try {
        console.log('Connecting via Pool...');
        const client = await pool.connect();
        console.log('Connected!');
        const res = await client.query('SELECT NOW()');
        console.log('Query result:', res.rows[0]);
        client.release();
        await pool.end();
    } catch (err) {
        console.error('POOL ERROR:', err);
    }
}

testPool();
