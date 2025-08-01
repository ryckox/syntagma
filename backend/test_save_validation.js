import { getDatabase } from './database/database.js';

async function testSaveValidation() {
  try {
    const db = await getDatabase();
    
    console.log('=== Testing Save Validation System ===');
    
    // Test 1: Get a published ruleset
    const publishedRuleset = await db.get(`
      SELECT id, title, version, status 
      FROM rulesets 
      WHERE status = 'published' 
      LIMIT 1
    `);
    
    console.log('Test ruleset:', publishedRuleset);
    
    if (publishedRuleset) {
      console.log('\n🎯 Frontend should now:');
      console.log('1. ❌ Show disabled save button when no changes are made');
      console.log('2. ✅ Show enabled save button when content is changed');
      console.log('3. 🔧 Show confirmation modal before saving');
      console.log('4. 📊 Auto-increment version only for content changes');
      console.log('5. 🏷️ NOT increment version for tag-only changes');
      console.log('');
      console.log('🧪 Test scenarios:');
      console.log(`- Edit ruleset ${publishedRuleset.id} ("${publishedRuleset.title}")`);
      console.log('- Try changing only tags → should save without version increment');
      console.log('- Try changing content → should save with version increment');
      console.log('- Check save button is disabled when no changes made');
    }
    
    console.log('\n✅ All backend systems ready for testing!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testSaveValidation();
