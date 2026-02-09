import { Pool, PoolConfig } from 'pg';

const dbConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
};

// Workaround for local DNS issue resolving .tech domains
// Only apply if the hostname matches the known problematic one
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('ep-curly-dew-a1qy6f5w-pooler.ap-southeast-1.aws.neon.tech')) {
  try {
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
  } catch (e) {
    console.error('Failed to parse DATABASE_URL for DNS workaround', e);
  }
}

console.log('Pool Config:', { ...dbConfig, password: '***' });
const pool = new Pool(dbConfig);

export default pool;
