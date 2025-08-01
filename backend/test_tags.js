import { getDatabase } from './database/database.js';

(async () => {
  try {
    const db = await getDatabase();
    
    console.log('=== Testing Tag Search ===');
    
    // 1. Check all tags
    const allTags = await db.all('SELECT * FROM tags');
    console.log('All tags in database:', allTags);
    
    // 2. Check all ruleset-tag connections
    const rulesetTags = await db.all('SELECT * FROM ruleset_tags');
    console.log('All ruleset-tag connections:', rulesetTags);
    
    // 3. Test tag search for "mobile"
    console.log('\n=== Testing mobile search ===');
    const mobileSearch = await db.all(`
      SELECT DISTINCT r.id, r.title, t.name as tag_name
      FROM rulesets r
      JOIN ruleset_tags rt ON r.id = rt.ruleset_id
      JOIN tags t ON rt.tag_id = t.id
      WHERE t.name LIKE '%mobile%'
    `);
    console.log('Search results for "mobile":', mobileSearch);
    
    // 4. Test case insensitive search
    const caseInsensitiveSearch = await db.all(`
      SELECT DISTINCT r.id, r.title, t.name as tag_name
      FROM rulesets r
      JOIN ruleset_tags rt ON r.id = rt.ruleset_id
      JOIN tags t ON rt.tag_id = t.id
      WHERE LOWER(t.name) LIKE LOWER('%mobile%')
    `);
    console.log('Case insensitive search for "mobile":', caseInsensitiveSearch);
    
    // 5. List all rulesets with their tags
    console.log('\n=== All rulesets with tags ===');
    const rulesetsWithTags = await db.all(`
      SELECT r.id, r.title, r.status, GROUP_CONCAT(t.name, ', ') as tags
      FROM rulesets r
      LEFT JOIN ruleset_tags rt ON r.id = rt.ruleset_id
      LEFT JOIN tags t ON rt.tag_id = t.id
      GROUP BY r.id, r.title, r.status
      HAVING tags IS NOT NULL
    `);
    console.log('Rulesets with tags:', rulesetsWithTags);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();

(async () => {
  try {
    const db = await getDatabase();
    
    console.log('=== Testing Tag Search ===');
    
    // 1. Check all tags
    const allTags = await db.all('SELECT * FROM tags');
    console.log('All tags in database:', allTags);
    
    // 2. Check all ruleset-tag connections
    const rulesetTags = await db.all('SELECT * FROM ruleset_tags');
    console.log('All ruleset-tag connections:', rulesetTags);
    
    // 3. Test tag search for "mobile"
    console.log('\n=== Testing mobile search ===');
    const mobileSearch = await db.all(`
      SELECT DISTINCT r.id, r.title, t.name as tag_name
      FROM rulesets r
      JOIN ruleset_tags rt ON r.id = rt.ruleset_id
      JOIN tags t ON rt.tag_id = t.id
      WHERE t.name LIKE '%mobile%'
    `);
    console.log('Search results for "mobile":', mobileSearch);
    
    // 4. Test case insensitive search
    const caseInsensitiveSearch = await db.all(`
      SELECT DISTINCT r.id, r.title, t.name as tag_name
      FROM rulesets r
      JOIN ruleset_tags rt ON r.id = rt.ruleset_id
      JOIN tags t ON rt.tag_id = t.id
      WHERE LOWER(t.name) LIKE LOWER('%mobile%')
    `);
    console.log('Case insensitive search for "mobile":', caseInsensitiveSearch);
    
    // 5. List all rulesets with their tags
    console.log('\n=== All rulesets with tags ===');
    const rulesetsWithTags = await db.all(`
      SELECT r.id, r.title, r.status, GROUP_CONCAT(t.name, ', ') as tags
      FROM rulesets r
      LEFT JOIN ruleset_tags rt ON r.id = rt.ruleset_id
      LEFT JOIN tags t ON rt.tag_id = t.id
      GROUP BY r.id, r.title, r.status
      HAVING tags IS NOT NULL
    `);
    console.log('Rulesets with tags:', rulesetsWithTags);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
