// Rename credit_transactions.type to transaction_type
import { config } from 'dotenv';
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

config();
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
-- Rename column from 'type' to 'transaction_type'
ALTER TABLE credit_transactions
RENAME COLUMN type TO transaction_type;
`;

try {
  console.log('🔧 Renaming type column to transaction_type...');
  await pool.query(sql);
  console.log('✅ Column renamed successfully!');
  console.log('📊 credit_transactions.transaction_type is now available');
} catch (error) {
  console.error('❌ Error renaming column:', error.message);
  process.exit(1);
} finally {
  await pool.end();
}
