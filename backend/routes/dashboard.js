import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => { // Removed requireAdmin temporarily
  const db = req.app.get('db');
  
  console.log('Dashboard stats requested by user:', req.user);
  
  if (!db) {
    console.error('Database not available');
    return res.status(500).json({ error: 'Datenbankverbindung nicht verfügbar' });
  }
  
  try {
    console.log('Starting database queries...');
    
    // Get total counts with single queries for better performance
    const [
      rulesetsCount,
      typesCount, 
      topicsCount,
      usersCount,
      statusCounts
    ] = await Promise.all([
      // Total rulesets
      new Promise((resolve, reject) => {
        console.log('Querying rulesets count...');
        db.get('SELECT COUNT(*) as count FROM rulesets', (err, row) => {
          if (err) {
            console.error('Rulesets count error:', err);
            reject(err);
          } else {
            console.log('Rulesets count result:', row);
            resolve(row.count);
          }
        });
      }),
      
      // Total types
      new Promise((resolve, reject) => {
        console.log('Querying types count...');
        db.get('SELECT COUNT(*) as count FROM types', (err, row) => {
          if (err) {
            console.error('Types count error:', err);
            reject(err);
          } else {
            console.log('Types count result:', row);
            resolve(row.count);
          }
        });
      }),
      
      // Total topics
      new Promise((resolve, reject) => {
        console.log('Querying topics count...');
        db.get('SELECT COUNT(*) as count FROM topics', (err, row) => {
          if (err) {
            console.error('Topics count error:', err);
            reject(err);
          } else {
            console.log('Topics count result:', row);
            resolve(row.count);
          }
        });
      }),
      
      // Total users
      new Promise((resolve, reject) => {
        console.log('Querying users count...');
        db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
          if (err) {
            console.error('Users count error:', err);
            reject(err);
          } else {
            console.log('Users count result:', row);
            resolve(row.count);
          }
        });
      }),
      
      // Count by status
      new Promise((resolve, reject) => {
        console.log('Querying status counts...');
        db.all(`
          SELECT 
            status,
            COUNT(*) as count 
          FROM rulesets 
          GROUP BY status
        `, (err, rows) => {
          if (err) {
            console.error('Status counts error:', err);
            reject(err);
          } else {
            console.log('Status counts result:', rows);
            const counts = {
              published: 0,
              draft: 0,
              archived: 0
            };
            rows.forEach(row => {
              if (counts.hasOwnProperty(row.status)) {
                counts[row.status] = row.count;
              }
            });
            resolve(counts);
          }
        });
      })
    ]);

    console.log('All queries completed successfully');
    console.log('Final counts:', { rulesetsCount, typesCount, topicsCount, usersCount, statusCounts });

    res.json({
      totalRulesets: rulesetsCount,
      totalTypes: typesCount,
      totalTopics: topicsCount,
      totalUsers: usersCount,
      publishedRulesets: statusCounts.published,
      draftRulesets: statusCounts.draft,
      archivedRulesets: statusCounts.archived
    });
    
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Dashboard-Statistiken' });
  }
});

// Debug endpoint to check users
router.get('/debug-users', authenticateToken, async (req, res) => {
  const db = req.app.get('db');
  
  try {
    db.all('SELECT id, username, role FROM users', (err, users) => {
      if (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({ error: 'Fehler beim Laden der Benutzer' });
      }
      
      res.json({ 
        currentUser: req.user,
        allUsers: users
      });
    });
  } catch (error) {
    console.error('Debug users error:', error);
    res.status(500).json({ error: 'Debug-Fehler' });
  }
});

// Temporary endpoint without admin requirement for debugging
router.get('/stats-debug', authenticateToken, async (req, res) => {
  const db = req.app.get('db');
  
  console.log('Dashboard stats-debug requested by user:', req.user);
  
  if (!db) {
    console.error('Database not available');
    return res.status(500).json({ error: 'Datenbankverbindung nicht verfügbar' });
  }
  
  try {
    // Simple test query
    db.get('SELECT COUNT(*) as count FROM rulesets', (err, row) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Datenbankfehler', details: err.message });
      }
      
      res.json({
        user: req.user,
        testQuery: row,
        message: 'Debug endpoint working'
      });
    });
  } catch (error) {
    console.error('Debug stats error:', error);
    res.status(500).json({ error: 'Debug-Fehler', details: error.message });
  }
});

export default router;
