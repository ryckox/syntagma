import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  const db = req.app.get('db');
  
  try {
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
        db.get('SELECT COUNT(*) as count FROM rulesets', (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        });
      }),
      
      // Total types
      new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM types', (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        });
      }),
      
      // Total topics
      new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM topics', (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        });
      }),
      
      // Total users
      new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        });
      }),
      
      // Count by status
      new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            status,
            COUNT(*) as count 
          FROM rulesets 
          GROUP BY status
        `, (err, rows) => {
          if (err) reject(err);
          else {
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

export default router;
