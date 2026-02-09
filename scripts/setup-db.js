const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Workaround for local DNS issue resolving .tech domains
const dbConfig = {
    connectionString: process.env.DATABASE_URL,
};

// Override with IP if specific hostname matches (hack for local dev environment)
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('ep-curly-dew-a1qy6f5w-pooler.ap-southeast-1.aws.neon.tech')) {
    console.log('Applying local DNS workaround for Neon DB...');
    const url = new URL(process.env.DATABASE_URL);
    dbConfig.host = '52.220.170.93'; // Resolved IP for ap-southeast-1.aws.neon.tech
    dbConfig.user = url.username;
    dbConfig.password = url.password;
    dbConfig.database = url.pathname.slice(1);
    dbConfig.port = 5432;
    dbConfig.ssl = {
        rejectUnauthorized: true,
        servername: 'ep-curly-dew-a1qy6f5w-pooler.ap-southeast-1.aws.neon.tech',
    };
    delete dbConfig.connectionString;
    console.log('DB Config:', { ...dbConfig, password: '***' });
}

const pool = new Pool(dbConfig);

async function main() {
    const client = await pool.connect();
    try {
        console.log('Connected to database.');
        console.log('Creating users table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        is_approved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Seed admin user
        const adminEmail = 'test@test.com';
        const adminPassword = 'Test123@123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const res = await client.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
        if (res.rows.length === 0) {
            console.log('Seeding admin user...');
            await client.query(`
        INSERT INTO users (email, password, role, is_approved)
        VALUES ($1, $2, 'admin', true)
      `, [adminEmail, hashedPassword]);
            console.log('Admin user created: test@test.com / Test123@123');
        } else {
            console.log('Admin user already exists.');
        }

        console.log('Database setup complete.');
    } catch (err) {
        console.error('Error setting up database:', err);
        console.error('Error details:', JSON.stringify(err, null, 2));
    } finally {
        client.release();
        await pool.end();
    }
}

main();
