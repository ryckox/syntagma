import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_ADMIN_USER || 'postgres',
  password: process.env.DB_ADMIN_PASSWORD || '',
  database: 'postgres' // Connect to default database first
};

const appConfig = {
  database: process.env.DB_NAME || 'syntagma',
  user: process.env.DB_USER || 'syntagma_user',
  password: process.env.DB_PASSWORD || 'syntagma_password'
};

async function setupPostgreSQL() {
  console.log('🐘 Setting up PostgreSQL database...');
  
  const client = new Client(config);
  
  try {
    await client.connect();
    
    // Check if database exists
    const dbCheck = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [appConfig.database]
    );
    
    if (dbCheck.rows.length === 0) {
      console.log(`📦 Creating database: ${appConfig.database}`);
      await client.query(`CREATE DATABASE "${appConfig.database}"`);
    }
    
    // Check if user exists
    const userCheck = await client.query(
      'SELECT 1 FROM pg_roles WHERE rolname = $1',
      [appConfig.user]
    );
    
    if (userCheck.rows.length === 0) {
      console.log(`👤 Creating user: ${appConfig.user}`);
      await client.query(
        `CREATE USER "${appConfig.user}" WITH PASSWORD '${appConfig.password}'`
      );
    }
    
    // Grant privileges
    await client.query(
      `GRANT ALL PRIVILEGES ON DATABASE "${appConfig.database}" TO "${appConfig.user}"`
    );
    
    console.log('✅ PostgreSQL setup completed');
    
  } catch (error) {
    console.error('❌ PostgreSQL setup failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupPostgreSQL().catch(console.error);
}

export { setupPostgreSQL };
