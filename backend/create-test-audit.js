import { getDatabase } from './database/database.js';

async function createTestAuditEntries() {
  try {
    const db = await getDatabase();
    
    // Insert some test audit log entries
    const testEntries = [
      {
        ruleset_id: 272,
        action: 'created',
        field_changes: JSON.stringify({ title: 'Anti-Korruptionsrichtlinie' }),
        old_values: JSON.stringify({}),
        new_values: JSON.stringify({ title: 'Anti-Korruptionsrichtlinie', status: 'draft' }),
        version_before: null,
        version_after: 1,
        user_id: 1,
        user_name: 'admin',
        ip_address: '127.0.0.1',
        user_agent: 'Test Script'
      },
      {
        ruleset_id: 272,
        action: 'updated',
        field_changes: JSON.stringify({ status: ['draft', 'published'] }),
        old_values: JSON.stringify({ status: 'draft' }),
        new_values: JSON.stringify({ status: 'published' }),
        version_before: 1,
        version_after: 2,
        user_id: 1,
        user_name: 'admin',
        ip_address: '127.0.0.1',
        user_agent: 'Test Script'
      },
      {
        ruleset_id: 268,
        action: 'created',
        field_changes: JSON.stringify({ title: 'Arbeitsschutzhandbuch' }),
        old_values: JSON.stringify({}),
        new_values: JSON.stringify({ title: 'Arbeitsschutzhandbuch', status: 'draft' }),
        version_before: null,
        version_after: 1,
        user_id: 2,
        user_name: 'testuser',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0'
      }
    ];
    
    for (const entry of testEntries) {
      await db.run(`
        INSERT INTO ruleset_audit_log (
          ruleset_id, action, field_changes, old_values, new_values, 
          version_before, version_after, user_id, user_name, 
          ip_address, user_agent, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `, [
        entry.ruleset_id,
        entry.action,
        entry.field_changes,
        entry.old_values,
        entry.new_values,
        entry.version_before,
        entry.version_after,
        entry.user_id,
        entry.user_name,
        entry.ip_address,
        entry.user_agent
      ]);
    }
    
    console.log('Test audit log entries created successfully!');
    
    // Verify entries were created
    const count = await db.get('SELECT COUNT(*) as count FROM ruleset_audit_log');
    console.log('Total audit log entries:', count.count);
    
  } catch (error) {
    console.error('Error creating test entries:', error);
  }
}

createTestAuditEntries();
