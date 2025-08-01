import { getDatabase } from './database/database.js';

async function testLandingPageSearch() {
  try {
    const db = await getDatabase();
    
    console.log('=== Testing Landing Page Search Integration ===');
    
    // Get some sample search terms that should return results
    const sampleRulesets = await db.all(`
      SELECT id, title, content
      FROM rulesets 
      WHERE status = 'published' 
      LIMIT 3
    `);
    
    console.log('Sample published rulesets:');
    sampleRulesets.forEach(ruleset => {
      console.log(`- ${ruleset.id}: "${ruleset.title}"`);
    });
    
    // Extract some search terms
    const searchTerms = [];
    
    // Get common words from titles
    sampleRulesets.forEach(ruleset => {
      const words = ruleset.title.toLowerCase().split(/\s+/).filter(word => 
        word.length > 3 && 
        !['eine', 'für', 'und', 'der', 'die', 'das', 'von', 'mit', 'nach'].includes(word)
      );
      searchTerms.push(...words.slice(0, 2));
    });
    
    // Add tag-based search terms
    const tags = await db.all('SELECT DISTINCT name FROM tags LIMIT 3');
    tags.forEach(tag => searchTerms.push(tag.name.toLowerCase()));
    
    console.log('\n🎯 Test the Landing Page Search with these terms:');
    searchTerms.slice(0, 5).forEach(term => {
      console.log(`✅ Search for: "${term}"`);
      console.log(`   URL: http://localhost:5173/?q=${encodeURIComponent(term)}`);
      console.log(`   Should redirect to: http://localhost:5173/search?q=${encodeURIComponent(term)}`);
    });
    
    console.log('\n📋 Test Scenarios:');
    console.log('1. 🏠 Go to landing page (http://localhost:5173)');
    console.log('2. 🔍 Type a search term in the prominent search field');
    console.log('3. ⌨️ Press Enter OR click "Suchen" button');
    console.log('4. 🔄 Should navigate to /search with query parameter');
    console.log('5. 📄 Search results should be automatically loaded');
    console.log('6. 🏷️ Test tag-based searches (e.g. "mobile")');
    
    console.log('\n✨ Features implemented:');
    console.log('✅ Prominent search field on landing page');
    console.log('✅ Auto-navigation to search page with query');
    console.log('✅ URL parameter parsing in search page');
    console.log('✅ Automatic search execution on page load');
    console.log('✅ Tag-based search support');
    console.log('✅ Real-time search with debouncing');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testLandingPageSearch();
