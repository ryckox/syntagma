async function testAuditLogAPI() {
  try {
    // First login to get token
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginData.token) {
      // Test audit log endpoint
      const auditResponse = await fetch('http://localhost:3001/api/rulesets/audit-log', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Audit log response status:', auditResponse.status);
      const auditData = await auditResponse.json();
      console.log('Audit log data:', auditData);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testAuditLogAPI();
