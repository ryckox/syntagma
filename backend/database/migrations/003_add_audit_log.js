// Migration: 003_add_audit_log.js
// Adds audit logging system for tracking changes

export async function up(db) {
  console.log('Adding audit log system...');
  
  await db.run(`
    CREATE TABLE IF NOT EXISTS ruleset_audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ruleset_id INTEGER NOT NULL,
      action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
      field_changes TEXT, -- JSON string of changes
      old_values TEXT,    -- JSON string of old values
      new_values TEXT,    -- JSON string of new values
      version_before TEXT,
      version_after TEXT,
      user_id INTEGER,
      user_name TEXT,
      ip_address TEXT,
      user_agent TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ruleset_id) REFERENCES rulesets(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Create indexes for performance
  await db.run('CREATE INDEX IF NOT EXISTS idx_audit_log_ruleset ON ruleset_audit_log(ruleset_id)');
  await db.run('CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON ruleset_audit_log(timestamp)');
  await db.run('CREATE INDEX IF NOT EXISTS idx_audit_log_user ON ruleset_audit_log(user_id)');

  console.log('✅ Audit log system added');
}

export async function down(db) {
  console.log('Removing audit log system...');
  
  await db.run('DROP INDEX IF EXISTS idx_audit_log_user');
  await db.run('DROP INDEX IF EXISTS idx_audit_log_timestamp');
  await db.run('DROP INDEX IF EXISTS idx_audit_log_ruleset');
  await db.run('DROP TABLE IF EXISTS ruleset_audit_log');
  
  console.log('✅ Audit log system removed');
}
