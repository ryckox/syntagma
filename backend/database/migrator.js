import { getDatabase } from './database.js';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// Migration versioning system
const MIGRATION_VERSION_TABLE = 'schema_migrations';

async function ensureMigrationTable(db) {
  await db.run(`
    CREATE TABLE IF NOT EXISTS ${MIGRATION_VERSION_TABLE} (
      version INTEGER PRIMARY KEY,
      filename TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      checksum TEXT
    )
  `);
}

async function getAppliedMigrations(db) {
  const migrations = await db.all(`SELECT * FROM ${MIGRATION_VERSION_TABLE} ORDER BY version`);
  return new Set(migrations.map(m => m.version));
}

async function getAllMigrationFiles() {
  const migrationsDir = path.join(process.cwd(), 'database', 'migrations');
  
  // Create migrations directory if it doesn't exist
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js'))
    .sort();
  
  return files.map(file => {
    const version = parseInt(file.split('_')[0]);
    return {
      version,
      filename: file,
      path: path.join(migrationsDir, file)
    };
  });
}

async function createBackup(db) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Determine backup directory based on environment
  let backupDir;
  if (process.env.NODE_ENV === 'production' || fs.existsSync('/app/backups')) {
    backupDir = '/app/backups';
  } else {
    // Development or traditional deployment
    backupDir = path.join(process.cwd(), '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      backupDir = path.join(process.cwd(), 'backups');
    }
  }
  
  const backupPath = path.join(backupDir, `backup_${timestamp}.db`);
  
  // Create backups directory
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // For SQLite, copy the file
  if (process.env.DB_TYPE === 'sqlite' || !process.env.DB_TYPE) {
    // Determine database path
    let dbPath = process.env.DB_PATH;
    if (!dbPath) {
      // Try to find existing database
      const possiblePaths = [
        './data/syntagma.db',
        '../data/syntagma.db',
        './database/syntagma.db'
      ];
      
      for (const possPath of possiblePaths) {
        if (fs.existsSync(possPath)) {
          dbPath = possPath;
          break;
        }
      }
    }
    
    if (dbPath && fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath);
      console.log(`📦 Backup created: ${backupPath}`);
      return backupPath;
    } else {
      console.warn('⚠️ Database file not found for backup');
    }
  } else {
    // For PostgreSQL, use pg_dump
    const { exec } = await import('child_process');
    const util = await import('util');
    const execAsync = util.promisify(exec);
    
    try {
      const dumpCommand = `pg_dump "${process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`}" > ${backupPath}.sql`;
      await execAsync(dumpCommand);
      console.log(`📦 PostgreSQL backup created: ${backupPath}.sql`);
      return `${backupPath}.sql`;
    } catch (error) {
      console.warn('⚠️ PostgreSQL backup failed:', error.message);
    }
  }
  
  return null;
}

async function runMigrations(forceBackup = false) {
  console.log('🔄 Starting database migration process...');
  
  const db = await getDatabase();
  
  try {
    // Ensure migration tracking table exists
    await ensureMigrationTable(db);
    
    // Get current state
    const appliedMigrations = await getAppliedMigrations(db);
    const allMigrations = await getAllMigrationFiles();
    const pendingMigrations = allMigrations.filter(m => !appliedMigrations.has(m.version));
    
    if (pendingMigrations.length === 0) {
      console.log('✅ Database is up to date, no migrations needed');
      return true;
    }
    
    console.log(`📋 Found ${pendingMigrations.length} pending migrations`);
    
    // Create backup before applying migrations
    if (forceBackup || pendingMigrations.length > 0) {
      await createBackup(db);
    }
    
    // Apply migrations in transaction
    await db.run('BEGIN TRANSACTION');
    
    try {
      for (const migration of pendingMigrations) {
        console.log(`🔄 Applying migration: ${migration.filename}`);
        
        // Import and run migration - fix Windows path issue
        const migrationUrl = pathToFileURL(migration.path).href;
        const migrationModule = await import(migrationUrl);
        
        if (typeof migrationModule.up === 'function') {
          await migrationModule.up(db);
        } else {
          throw new Error(`Migration ${migration.filename} missing 'up' function`);
        }
        
        // Record successful migration
        await db.run(
          `INSERT INTO ${MIGRATION_VERSION_TABLE} (version, filename) VALUES (?, ?)`,
          [migration.version, migration.filename]
        );
        
        console.log(`✅ Migration applied: ${migration.filename}`);
      }
      
      await db.run('COMMIT');
      console.log('🎉 All migrations applied successfully!');
      return true;
      
    } catch (error) {
      await db.run('ROLLBACK');
      console.error('❌ Migration failed, rolled back:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    return false;
  }
}

async function rollbackLastMigration() {
  console.log('⏪ Rolling back last migration...');
  
  const db = await getDatabase();
  
  try {
    // Get last applied migration
    const lastMigration = await db.get(
      `SELECT * FROM ${MIGRATION_VERSION_TABLE} ORDER BY version DESC LIMIT 1`
    );
    
    if (!lastMigration) {
      console.log('ℹ️ No migrations to rollback');
      return;
    }
    
    // Create backup before rollback
    await createBackup(db);
    
    // Import and run rollback
    const migrationPath = path.join(process.cwd(), 'database', 'migrations', lastMigration.filename);
    const migrationUrl = pathToFileURL(migrationPath).href;
    const migrationModule = await import(migrationUrl);
    
    if (typeof migrationModule.down === 'function') {
      await db.run('BEGIN TRANSACTION');
      
      try {
        await migrationModule.down(db);
        await db.run(
          `DELETE FROM ${MIGRATION_VERSION_TABLE} WHERE version = ?`,
          [lastMigration.version]
        );
        
        await db.run('COMMIT');
        console.log(`✅ Rolled back migration: ${lastMigration.filename}`);
        
      } catch (error) {
        await db.run('ROLLBACK');
        throw error;
      }
    } else {
      throw new Error(`Migration ${lastMigration.filename} missing 'down' function`);
    }
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

export { runMigrations, rollbackLastMigration, createBackup };
