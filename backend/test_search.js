import express from 'express';
import { getDatabase } from './database/database.js';

const testSearch = async () => {
  try {
    const db = await getDatabase();
    const searchQuery = 'mobile';
    
    console.log('=== Testing Search Components ===');
    
    // 1. Test FTS
    console.log('\n1. Testing FTS...');
    try {
      const ftsTest = await db.all(`
        SELECT r.id, r.title
        FROM rulesets_fts 
        JOIN rulesets r ON rulesets_fts.rowid = r.id
        WHERE rulesets_fts MATCH ?
      `, [`"${searchQuery}"`]);
      console.log('FTS results:', ftsTest);
    } catch (ftsError) {
      console.log('FTS error:', ftsError.message);
    }
    
    // 2. Test Tag Query
    console.log('\n2. Testing Tag Query...');
    const tagResults = await db.all(`
      SELECT DISTINCT r.id, r.title, r.content, r.status, r.version, r.created_at, r.updated_at,
             rt.name as type_name, rt.color as type_color, rt.icon as type_icon,
             u.username as created_by_name,
             0 as rank,
             'tag' as match_type
      FROM rulesets r
      JOIN ruleset_types rt ON r.type_id = rt.id
      JOIN users u ON r.created_by = u.id
      JOIN ruleset_tags rt_tags ON r.id = rt_tags.ruleset_id
      JOIN tags t ON rt_tags.tag_id = t.id
      WHERE t.name LIKE ?
    `, [`%${searchQuery}%`]);
    console.log('Tag query results:', tagResults);
    
    // 3. Test conditions
    console.log('\n3. Testing with status condition...');
    const statusResults = await db.all(`
      SELECT DISTINCT r.id, r.title, r.status
      FROM rulesets r
      JOIN ruleset_types rt ON r.type_id = rt.id
      JOIN users u ON r.created_by = u.id
      JOIN ruleset_tags rt_tags ON r.id = rt_tags.ruleset_id
      JOIN tags t ON rt_tags.tag_id = t.id
      WHERE t.name LIKE ? AND r.status = 'published'
    `, [`%${searchQuery}%`]);
    console.log('Results with status filter:', statusResults);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testSearch();
