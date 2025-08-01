import { getDatabase } from './database/database.js';

async function searchMobile() {
  try {
    const db = await getDatabase();
    
    console.log('=== Searching for tag "mobile" ===');
    
    // Check if mobile tag exists
    const mobileTag = await db.get('SELECT * FROM tags WHERE LOWER(name) = ?', ['mobile']);
    console.log('Mobile tag:', mobileTag);
    
    if (mobileTag) {
      // Find rulesets with mobile tag
      const rulesets = await db.all(`
        SELECT r.id, r.title, r.status 
        FROM rulesets r
        JOIN ruleset_tags rt ON r.id = rt.ruleset_id
        WHERE rt.tag_id = ?
      `, [mobileTag.id]);
      
      console.log('Rulesets with mobile tag:', rulesets);
    }
    
    // Test search API simulation
    console.log('\n=== Testing search logic ===');
    
    const searchTerm = 'mobile';
    
    // FTS search
    const ftsResults = await db.all(`
      SELECT r.id, r.title, r.content, 'fts' as source
      FROM rulesets r
      WHERE r.status = 'published' 
        AND (r.title MATCH ? OR r.content MATCH ?)
    `, [searchTerm, searchTerm]);
    
    console.log('FTS results:', ftsResults);
    
    // Tag search
    const tagResults = await db.all(`
      SELECT DISTINCT r.id, r.title, r.content, 'tag' as source
      FROM rulesets r
      JOIN ruleset_tags rt ON r.id = rt.ruleset_id
      JOIN tags t ON rt.tag_id = t.id
      WHERE r.status = 'published' 
        AND LOWER(t.name) LIKE ?
    `, ['%' + searchTerm.toLowerCase() + '%']);
    
    console.log('Tag results:', tagResults);
    
    // Combined results (like the search endpoint does)
    const allResultIds = new Set();
    const combinedResults = [];
    
    // Add FTS results
    ftsResults.forEach(result => {
      allResultIds.add(result.id);
      combinedResults.push({ ...result, foundViaTag: false });
    });
    
    // Add tag results (mark as found via tag if not already in FTS)
    tagResults.forEach(result => {
      if (!allResultIds.has(result.id)) {
        combinedResults.push({ ...result, foundViaTag: true });
      }
    });
    
    console.log('Combined results:', combinedResults);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

searchMobile();
