// Migration 004: Add active field to users table
export async function up(db) {
  console.log('Adding active field to users table...');
  
  // Add active column to users table
  await db.run(`
    ALTER TABLE users ADD COLUMN active INTEGER DEFAULT 1
  `);
  
  // Update existing users to be active by default
  await db.run(`
    UPDATE users SET active = 1 WHERE active IS NULL
  `);
  
  console.log('✅ Active field added to users table');
}

export async function down(db) {
  console.log('Removing active field from users table...');
  
  // SQLite doesn't support DROP COLUMN, so we need to recreate the table
  await db.run('BEGIN TRANSACTION');
  
  try {
    // Create new users table without active column
    await db.run(`
      CREATE TABLE users_backup (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Copy data (excluding active column)
    await db.run(`
      INSERT INTO users_backup (id, username, email, password_hash, role, created_at, updated_at)
      SELECT id, username, email, password_hash, role, created_at, updated_at FROM users
    `);
    
    // Drop original table
    await db.run('DROP TABLE users');
    
    // Rename backup table
    await db.run('ALTER TABLE users_backup RENAME TO users');
    
    await db.run('COMMIT');
    console.log('✅ Active field removed from users table');
    
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
}
