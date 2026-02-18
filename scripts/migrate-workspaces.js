require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: true,
    },
};

// Workaround for Neon DB local DNS issues if needed (copied from lib/db.ts logic)
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('ep-curly-dew-a1qy6f5w-pooler.ap-southeast-1.aws.neon.tech')) {
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

const pool = new Pool(dbConfig);

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration...');
        await client.query('BEGIN');

        // 0. Check user_id type in documents table to match workspaces schema
        const { rows: colInfo } = await client.query(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'documents' AND column_name = 'user_id'
        `);
        const userIdType = colInfo[0]?.data_type || 'uuid';
        console.log(`Detected user_id type in documents: ${userIdType}`);

        // 1. Create workspaces table (Dynamic type)
        console.log('Creating workspaces table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS workspaces (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id ${userIdType === 'integer' ? 'INTEGER' : 'UUID'} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        // 2. Add workspace_id to documents
        console.log('Adding workspace_id to documents table...');
        await client.query(`
            ALTER TABLE documents 
            ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
        `);

        // 3. Migrate existing documents
        console.log('Migrating existing documents...');

        // Get all users who have documents but no workspaces
        const { rows: users } = await client.query(`
            SELECT DISTINCT user_id 
            FROM documents 
            WHERE workspace_id IS NULL
        `);

        for (const user of users) {
            console.log(`Creating default workspace for user ${user.user_id}...`);

            // Create default workspace
            const { rows: workspaceRows } = await client.query(`
                INSERT INTO workspaces (user_id, name) 
                VALUES ($1, 'Default Workspace') 
                RETURNING id
            `, [user.user_id]);

            const workspaceId = workspaceRows[0].id;

            // Link existing documents to this workspace
            await client.query(`
                UPDATE documents 
                SET workspace_id = $1 
                WHERE user_id = $2 AND workspace_id IS NULL
            `, [workspaceId, user.user_id]);
        }

        // 4. Verification
        // Optional: Set workspace_id to NOT NULL if you want to enforce it strictly going forward
        // await client.query('ALTER TABLE documents ALTER COLUMN workspace_id SET NOT NULL');

        await client.query('COMMIT');
        console.log('Migration completed successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
