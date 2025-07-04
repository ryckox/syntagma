import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/database.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Alle Themen abrufen (öffentlich für Lesezugriff)
router.get('/', optionalAuth, async (req, res) => {
  const { type_id } = req.query;

  try {
    const db = await getDatabase();
    
    let query = `
      SELECT t.id, t.name, t.description, t.type_id, t.created_at, t.updated_at,
             rt.name as type_name, rt.color as type_color,
             COALESCE(COUNT(rt_junction.ruleset_id), 0) as ruleset_count
      FROM topics t
      JOIN ruleset_types rt ON t.type_id = rt.id
      LEFT JOIN ruleset_topics rt_junction ON t.id = rt_junction.topic_id
    `;
    let params = [];

    if (type_id) {
      query += ' WHERE t.type_id = ?';
      params.push(type_id);
    }

    query += ' GROUP BY t.id, t.name, t.description, t.type_id, t.created_at, t.updated_at, rt.name, rt.color ORDER BY rt.name, t.name';

    const topics = await db.all(query, params);
    

    res.json(topics);
  } catch (error) {
    console.error('Fehler beim Abrufen der Themen:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Thema nach ID abrufen
router.get('/:id', optionalAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDatabase();
    const topic = await db.get(`
      SELECT t.id, t.name, t.description, t.type_id, t.created_at, t.updated_at,
             rt.name as type_name, rt.color as type_color,
             COALESCE(COUNT(rt_junction.ruleset_id), 0) as ruleset_count
      FROM topics t
      JOIN ruleset_types rt ON t.type_id = rt.id
      LEFT JOIN ruleset_topics rt_junction ON t.id = rt_junction.topic_id
      WHERE t.id = ?
      GROUP BY t.id, t.name, t.description, t.type_id, t.created_at, t.updated_at, rt.name, rt.color
    `, [id]);
    

    if (!topic) {
      return res.status(404).json({ error: 'Thema nicht gefunden' });
    }

    res.json(topic);
  } catch (error) {
    console.error('Fehler beim Abrufen des Themas:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Neues Thema erstellen (nur Admins)
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('name').isLength({ min: 2 }).trim().escape(),
  body('description').optional().trim().escape(),
  body('type_id').isInt({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, type_id } = req.body;

  try {
    const db = await getDatabase();
    
    // Prüfen ob Typ existiert
    const typeExists = await db.get('SELECT id FROM ruleset_types WHERE id = ?', [type_id]);
    if (!typeExists) {
      
      return res.status(400).json({ error: 'Angegebener Typ existiert nicht' });
    }

    // Prüfen ob Name für diesen Typ bereits existiert
    const existingTopic = await db.get(
      'SELECT id FROM topics WHERE name = ? AND type_id = ?',
      [name, type_id]
    );
    if (existingTopic) {
      
      return res.status(400).json({ error: 'Ein Thema mit diesem Namen existiert bereits für diesen Typ' });
    }

    const result = await db.run(
      'INSERT INTO topics (name, description, type_id) VALUES (?, ?, ?)',
      [name, description, type_id]
    );

    const newTopic = await db.get(`
      SELECT t.id, t.name, t.description, t.type_id, t.created_at, t.updated_at,
             rt.name as type_name, rt.color as type_color,
             0 as ruleset_count
      FROM topics t
      JOIN ruleset_types rt ON t.type_id = rt.id
      WHERE t.id = ?
    `, [result.lastID]);

    

    res.status(201).json(newTopic);
  } catch (error) {
    console.error('Fehler beim Erstellen des Themas:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Thema aktualisieren (nur Admins)
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('name').optional().isLength({ min: 2 }).trim().escape(),
  body('description').optional().trim().escape(),
  body('type_id').optional().isInt({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, description, type_id } = req.body;

  try {
    const db = await getDatabase();
    
    // Prüfen ob Thema existiert
    const existingTopic = await db.get('SELECT id FROM topics WHERE id = ?', [id]);
    if (!existingTopic) {
      
      return res.status(404).json({ error: 'Thema nicht gefunden' });
    }

    // Update-Felder dynamisch aufbauen
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (type_id !== undefined) {
      // Prüfen ob neuer Typ existiert
      const typeExists = await db.get('SELECT id FROM ruleset_types WHERE id = ?', [type_id]);
      if (!typeExists) {
        
        return res.status(400).json({ error: 'Angegebener Typ existiert nicht' });
      }
      updates.push('type_id = ?');
      values.push(type_id);
    }

    if (updates.length === 0) {
      
      return res.status(400).json({ error: 'Keine Aktualisierungsdaten bereitgestellt' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await db.run(
      `UPDATE topics SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const updatedTopic = await db.get(`
      SELECT t.id, t.name, t.description, t.type_id, t.created_at, t.updated_at,
             rt.name as type_name, rt.color as type_color,
             COALESCE(COUNT(rt_junction.ruleset_id), 0) as ruleset_count
      FROM topics t
      JOIN ruleset_types rt ON t.type_id = rt.id
      LEFT JOIN ruleset_topics rt_junction ON t.id = rt_junction.topic_id
      WHERE t.id = ?
      GROUP BY t.id, t.name, t.description, t.type_id, t.created_at, t.updated_at, rt.name, rt.color
    `, [id]);

    

    res.json(updatedTopic);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Themas:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Thema löschen (nur Admins)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDatabase();
    
    // Prüfen ob Thema noch verwendet wird
    const usageCount = await db.get(
      'SELECT COUNT(*) as count FROM ruleset_topics WHERE topic_id = ?',
      [id]
    );

    if (usageCount.count > 0) {
      
      return res.status(400).json({ 
        error: `Thema kann nicht gelöscht werden, da es noch von ${usageCount.count} Regelwerk(en) verwendet wird` 
      });
    }

    const result = await db.run('DELETE FROM topics WHERE id = ?', [id]);
    
    

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Thema nicht gefunden' });
    }

    res.json({ message: 'Thema erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Themas:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

export default router;
