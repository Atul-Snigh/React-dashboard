import { Pool, PoolConfig } from 'pg';

const dbConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
  },
};

const pool = new Pool(dbConfig);

export default pool;
