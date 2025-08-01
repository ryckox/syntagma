// Migration: 002_add_tags_system.js
// Adds the tag system for rulesets

export async function up(db) {
  console.log('Adding tags system...');
  
  // Tags table
  await db.run(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ruleset-Tags junction
  await db.run(`
    CREATE TABLE IF NOT EXISTS ruleset_tags (
      ruleset_id INTEGER,
      tag_id INTEGER,
      PRIMARY KEY (ruleset_id, tag_id),
      FOREIGN KEY (ruleset_id) REFERENCES rulesets(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  await db.run('CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name)');
  await db.run('CREATE INDEX IF NOT EXISTS idx_ruleset_tags_ruleset ON ruleset_tags(ruleset_id)');
  await db.run('CREATE INDEX IF NOT EXISTS idx_ruleset_tags_tag ON ruleset_tags(tag_id)');

  console.log('✅ Tags system added');
}

export async function down(db) {
  console.log('Removing tags system...');
  
  await db.run('DROP INDEX IF EXISTS idx_ruleset_tags_tag');
  await db.run('DROP INDEX IF EXISTS idx_ruleset_tags_ruleset');
  await db.run('DROP INDEX IF EXISTS idx_tags_name');
  await db.run('DROP TABLE IF EXISTS ruleset_tags');
  await db.run('DROP TABLE IF EXISTS tags');
  
  console.log('✅ Tags system removed');
}
