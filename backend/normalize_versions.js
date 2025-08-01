import { getDatabase } from './database/database.js';

async function normalizeVersions() {
  try {
    const db = await getDatabase();
    
    console.log('=== Normalizing versions to simple integers ===');
    
    // Get all rulesets
    const rulesets = await db.all('SELECT id, title, version FROM rulesets ORDER BY id');
    
    for (const ruleset of rulesets) {
      let newVersion;
      
      if (typeof ruleset.version === 'string') {
        // Extract first number from version string (e.g., "2.1.01111111" -> 2, "1.8.3" -> 1)
        const firstNumber = parseInt(ruleset.version.split('.')[0]) || 1;
        newVersion = firstNumber;
      } else if (typeof ruleset.version === 'number') {
        newVersion = ruleset.version;
      } else {
        newVersion = 1; // Default
      }
      
      console.log(`Updating ruleset ${ruleset.id} (${ruleset.title}): ${ruleset.version} -> ${newVersion}`);
      
      await db.run('UPDATE rulesets SET version = ? WHERE id = ?', [newVersion, ruleset.id]);
    }
    
    console.log('=== Version normalization complete ===');
    
    // Verify results
    const updatedRulesets = await db.all('SELECT id, title, version FROM rulesets ORDER BY id');
    console.log('Updated versions:', updatedRulesets);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

normalizeVersions();
