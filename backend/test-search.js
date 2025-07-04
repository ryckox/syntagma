async function testRulesetSearch() {
  try {
    // First login to get token
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login erfolgreich');
    
    if (loginData.token) {
      // Test search for "Anti-Korruption"
      const searchResponse = await fetch('http://localhost:3001/api/rulesets/audit-log?rulesetSearch=Anti-Korruption', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Search response status:', searchResponse.status);
      const searchData = await searchResponse.json();
      console.log('Search results for "Anti-Korruption":', searchData.auditLogs?.length, 'entries found');
      
      // Test search for "Arbeitsschutz"
      const searchResponse2 = await fetch('http://localhost:3001/api/rulesets/audit-log?rulesetSearch=Arbeitsschutz', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const searchData2 = await searchResponse2.json();
      console.log('Search results for "Arbeitsschutz":', searchData2.auditLogs?.length, 'entries found');
      
      // Test search for non-existent ruleset
      const searchResponse3 = await fetch('http://localhost:3001/api/rulesets/audit-log?rulesetSearch=NotExist', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const searchData3 = await searchResponse3.json();
      console.log('Search results for "NotExist":', searchData3.auditLogs?.length, 'entries found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testRulesetSearch();
