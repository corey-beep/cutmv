// Add missing r2_url column to videos table
import { config } from 'dotenv';
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

config();
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
-- Add r2_url column to videos table if it doesn't exist
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS r2_url TEXT;
`;

try {
  console.log('🔧 Adding missing r2_url column to videos table...');
  await pool.query(sql);
  console.log('✅ Database schema updated successfully!');
} catch (error) {
  console.error('❌ Error updating database:', error);
  process.exit(1);
} finally {
  await pool.end();
}
