import express from 'express';
import { getDatabase } from '../database/database.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Suchfunktion
router.get('/', optionalAuth, async (req, res) => {
  const { q, type, topic, status = 'published' } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Suchbegriff muss mindestens 2 Zeichen lang sein' });
  }

  try {
    const db = await getDatabase();
    
    let baseQuery = `
      SELECT DISTINCT r.id, r.title, r.content, r.status, r.version, r.created_at, r.updated_at,
             rt.name as type_name, rt.color as type_color, rt.icon as type_icon,
             u.username as created_by_name
      FROM rulesets r
      JOIN ruleset_types rt ON r.type_id = rt.id
      JOIN users u ON r.created_by = u.id
    `;

    const conditions = [];
    const params = [];

    // Nur veröffentlichte Regelwerke für normale Benutzer
    if (!req.user || req.user.role !== 'admin') {
      conditions.push("r.status = 'published'");
    } else if (status) {
      conditions.push("r.status = ?");
      params.push(status);
    }

    // Typ-Filter
    if (type) {
      conditions.push("r.type_id = ?");
      params.push(type);
    }

    // Thema-Filter  
    if (topic) {
      baseQuery += ` JOIN ruleset_topics rt_junction ON r.id = rt_junction.ruleset_id`;
      conditions.push("rt_junction.topic_id = ?");
      params.push(topic);
    }

    // Full-Text-Suche
    const searchQuery = q.trim();
    
    // Erstelle eine FTS-Abfrage
    const ftsQuery = `
      SELECT r.id, r.title, r.content, r.status, r.version, r.created_at, r.updated_at,
             rt.name as type_name, rt.color as type_color, rt.icon as type_icon,
             u.username as created_by_name,
             rank
      FROM rulesets_fts 
      JOIN rulesets r ON rulesets_fts.rowid = r.id
      JOIN ruleset_types rt ON r.type_id = rt.id
      JOIN users u ON r.created_by = u.id
      WHERE rulesets_fts MATCH ?
    `;

    // Parameter für FTS
    const ftsParams = [`"${searchQuery.replace(/"/g, '""')}"`];

    let finalQuery = ftsQuery;
    let finalParams = [...ftsParams];

    // Thema-Filter zur FTS-Query hinzufügen
    if (topic) {
      finalQuery = `
        SELECT DISTINCT sq.id, sq.title, sq.content, sq.status, sq.version, sq.created_at, sq.updated_at,
               sq.type_name, sq.type_color, sq.type_icon, sq.created_by_name, sq.rank
        FROM (${ftsQuery}) sq
        JOIN ruleset_topics rt_junction ON sq.id = rt_junction.ruleset_id
        WHERE rt_junction.topic_id = ?
      `;
      finalParams.push(topic);
    }

    // Andere Bedingungen hinzufügen
    const otherConditions = conditions.filter(c => !c.includes('rt_junction.topic_id'));
    if (otherConditions.length > 0) {
      const otherParams = params.filter((_, index) => {
        const condition = conditions[index];
        return condition && !condition.includes('rt_junction.topic_id');
      });
      
      if (topic) {
        finalQuery += ` AND ${otherConditions.join(' AND ')}`;
      } else {
        finalQuery += ` AND ${otherConditions.join(' AND ')}`;
      }
      finalParams.push(...otherParams);
    }

    finalQuery += ` ORDER BY rank LIMIT 50`;

    const results = await db.all(finalQuery, finalParams);

    // Themen für jedes Suchergebnis laden
    for (const result of results) {
      const topics = await db.all(`
        SELECT t.id, t.name, t.description
        FROM topics t
        JOIN ruleset_topics rt ON t.id = rt.topic_id
        WHERE rt.ruleset_id = ?
      `, [result.id]);
      result.topics = topics;
    }
    

    res.json(results);
  } catch (error) {
    console.error('Suchfehler:', error);
    
    // Fallback auf einfache LIKE-Suche wenn FTS fehlschlägt
    try {
      const db = await getDatabase();
      
      const fallbackQuery = `
        SELECT DISTINCT r.id, r.title, r.content, r.status, r.version, r.created_at, r.updated_at,
               rt.name as type_name, rt.color as type_color, rt.icon as type_icon,
               u.username as created_by_name
        FROM rulesets r
        JOIN ruleset_types rt ON r.type_id = rt.id
        JOIN users u ON r.created_by = u.id
        WHERE (r.title LIKE ? OR r.content LIKE ?)
        AND r.status = 'published'
        ORDER BY r.updated_at DESC
        LIMIT 50
      `;

      const searchTerm = `%${q}%`;
      const results = await db.all(fallbackQuery, [searchTerm, searchTerm]);
      
      // Themen für jedes Fallback-Suchergebnis laden
      for (const result of results) {
        const topics = await db.all(`
          SELECT t.id, t.name, t.description
          FROM topics t
          JOIN ruleset_topics rt ON t.id = rt.topic_id
          WHERE rt.ruleset_id = ?
        `, [result.id]);
        result.topics = topics;
      }
      

      res.json(results);
    } catch (fallbackError) {
      console.error('Fallback-Suchfehler:', fallbackError);
      res.status(500).json({ error: 'Interner Serverfehler bei der Suche' });
    }
  }
});

// Erweiterte Suchoptionen abrufen
router.get('/options', optionalAuth, async (req, res) => {
  try {
    const db = await getDatabase();
    
    const [types, topics] = await Promise.all([
      db.all('SELECT id, name, color FROM ruleset_types ORDER BY name'),
      db.all(`
        SELECT t.id, t.name, t.type_id, rt.name as type_name 
        FROM topics t 
        JOIN ruleset_types rt ON t.type_id = rt.id 
        ORDER BY rt.name, t.name
      `)
    ]);

    

    res.json({ types, topics });
  } catch (error) {
    console.error('Fehler beim Abrufen der Suchoptionen:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Suchvorschläge (Autocomplete)
router.get('/suggestions', optionalAuth, async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.json([]);
  }

  try {
    const db = await getDatabase();
    
    const suggestions = await db.all(`
      SELECT DISTINCT title
      FROM rulesets 
      WHERE title LIKE ? 
      AND status = 'published'
      ORDER BY title
      LIMIT 10
    `, [`%${q}%`]);

    

    res.json(suggestions.map(s => s.title));
  } catch (error) {
    console.error('Fehler beim Abrufen der Suchvorschläge:', error);
    res.json([]);
  }
});

export default router;
