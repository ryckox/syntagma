import { getDatabase } from './database/database.js';

async function createTestAuditEntry() {
  try {
    const db = await getDatabase();
    
    // Check current audit log count
    const countResult = await db.get('SELECT COUNT(*) as count FROM ruleset_audit_log');
    console.log('Current audit log entries:', countResult.count);
    
    // Check if any rulesets exist
    const rulesetsResult = await db.all('SELECT id, title FROM rulesets LIMIT 5');
    console.log('Existing rulesets:', rulesetsResult);
    
    // Check users
    const usersResult = await db.all('SELECT id, username, role FROM users');
    console.log('Existing users:', usersResult);
    
    // Get the latest audit log entries
    const auditLogResult = await db.all(`
      SELECT 
        al.id, al.ruleset_id, al.action, al.timestamp, al.user_name,
        r.title as ruleset_title
      FROM ruleset_audit_log al
      LEFT JOIN rulesets r ON al.ruleset_id = r.id
      ORDER BY al.timestamp DESC
      LIMIT 5
    `);
    console.log('Latest audit log entries:', auditLogResult);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestAuditEntry();
