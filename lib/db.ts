import { Pool, PoolConfig } from 'pg';

const dbConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
  },
};

// Workaround for local DNS issue resolving .tech domains
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('ep-curly-dew-a1qy6f5w-pooler.ap-southeast-1.aws.neon.tech')) {
  const url = new URL(process.env.DATABASE_URL);
  dbConfig.host = '13.228.184.177'; // Alternative Resolved IP for ap-southeast-1.aws.neon.tech
  dbConfig.user = url.username;
  dbConfig.password = url.password;
  dbConfig.database = url.pathname.slice(1);
  dbConfig.port = 5432;
  dbConfig.ssl = {
    rejectUnauthorized: true,
    servername: 'ep-curly-dew-a1qy6f5w-pooler.ap-southeast-1.aws.neon.tech', // SNI requires the hostname
  };
  delete dbConfig.connectionString;
}

const pool = new Pool({
  ...dbConfig,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Use a global variable to store the pool instance in development
// to avoid creating multiple connections during hot reloading
let globalPool: Pool;

if (process.env.NODE_ENV === 'production') {
  globalPool = pool;
} else {
  if (!(global as any).postgres) {
    (global as any).postgres = pool;
  }
  globalPool = (global as any).postgres;
}

export default globalPool;
