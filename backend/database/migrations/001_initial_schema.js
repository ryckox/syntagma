// Migration: 001_initial_schema.js
// Creates the initial database schema

export async function up(db) {
  console.log('Creating initial schema...');
  
  // Users table
  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ruleset types
  await db.run(`
    CREATE TABLE IF NOT EXISTS ruleset_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#6B7280',
      icon TEXT DEFAULT 'document',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Topics
  await db.run(`
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      type_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (type_id) REFERENCES ruleset_types(id) ON DELETE CASCADE
    )
  `);

  // Rulesets
  await db.run(`
    CREATE TABLE IF NOT EXISTS rulesets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
      version INTEGER DEFAULT 1,
      type_id INTEGER NOT NULL,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      effective_date DATE,
      FOREIGN KEY (type_id) REFERENCES ruleset_types(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Ruleset-Topic junction
  await db.run(`
    CREATE TABLE IF NOT EXISTS ruleset_topics (
      ruleset_id INTEGER,
      topic_id INTEGER,
      PRIMARY KEY (ruleset_id, topic_id),
      FOREIGN KEY (ruleset_id) REFERENCES rulesets(id) ON DELETE CASCADE,
      FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Initial schema created');
}

export async function down(db) {
  console.log('Dropping initial schema...');
  
  await db.run('DROP TABLE IF EXISTS ruleset_topics');
  await db.run('DROP TABLE IF EXISTS rulesets');
  await db.run('DROP TABLE IF EXISTS topics');
  await db.run('DROP TABLE IF EXISTS ruleset_types');
  await db.run('DROP TABLE IF EXISTS users');
  
  console.log('✅ Initial schema dropped');
}
