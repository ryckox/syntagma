import { getDatabase } from './database/database.js';

async function testSearchAPI() {
  try {
    console.log('=== Testing Search API directly ===');
    
    // Simple test - just use SQL to verify tag search works
    const db = await getDatabase();
    
    const searchTerm = 'mobile';
    
    // Test tag search (same as in search.js)
    const tagResults = await db.all(`
      SELECT DISTINCT r.id, r.title, r.content, 'tag' as source
      FROM rulesets r
      JOIN ruleset_tags rt ON r.id = rt.ruleset_id
      JOIN tags t ON rt.tag_id = t.id
      WHERE r.status = 'published' 
        AND LOWER(t.name) LIKE ?
    `, ['%' + searchTerm.toLowerCase() + '%']);
    
    console.log('Tag search results for "mobile":', tagResults);
    
    // Test if result would be marked as foundViaTag
    const allResultIds = new Set();
    const ftsResults = []; // Assume empty FTS results
    const combinedResults = [];
    
    // Add FTS results (empty in this test)
    ftsResults.forEach(result => {
      allResultIds.add(result.id);
      combinedResults.push({ ...result, foundViaTag: false });
    });
    
    // Add tag results
    tagResults.forEach(result => {
      if (!allResultIds.has(result.id)) {
        combinedResults.push({ ...result, foundViaTag: true });
        allResultIds.add(result.id);
      }
    });
    
    console.log('Final search results:', combinedResults.map(r => ({
      id: r.id,
      title: r.title,
      foundViaTag: r.foundViaTag
    })));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testSearchAPI();
