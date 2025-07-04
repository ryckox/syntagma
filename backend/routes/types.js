import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/database.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Alle Regelwerk-Typen abrufen (öffentlich für Lesezugriff)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const db = await getDatabase();
    const types = await db.all(
      'SELECT id, name, description, color, icon, created_at, updated_at FROM ruleset_types ORDER BY name'
    );
    

    res.json(types);
  } catch (error) {
    console.error('Fehler beim Abrufen der Typen:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Typ nach ID abrufen
router.get('/:id', optionalAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDatabase();
    const type = await db.get(
      'SELECT id, name, description, color, icon, created_at, updated_at FROM ruleset_types WHERE id = ?',
      [id]
    );
    

    if (!type) {
      return res.status(404).json({ error: 'Typ nicht gefunden' });
    }

    res.json(type);
  } catch (error) {
    console.error('Fehler beim Abrufen des Typs:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Neuen Typ erstellen (nur Admins)
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('name').isLength({ min: 2 }).trim().escape(),
  body('description').optional().trim().escape(),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i),
  body('icon').optional().trim().escape()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, color = '#007bff', icon } = req.body;

  try {
    const db = await getDatabase();
    
    // Prüfen ob Name bereits existiert
    const existingType = await db.get('SELECT id FROM ruleset_types WHERE name = ?', [name]);
    if (existingType) {
      
      return res.status(400).json({ error: 'Ein Typ mit diesem Namen existiert bereits' });
    }

    const result = await db.run(
      'INSERT INTO ruleset_types (name, description, color, icon) VALUES (?, ?, ?, ?)',
      [name, description, color, icon]
    );

    const newType = await db.get(
      'SELECT id, name, description, color, icon, created_at, updated_at FROM ruleset_types WHERE id = ?',
      [result.lastID]
    );

    

    res.status(201).json(newType);
  } catch (error) {
    console.error('Fehler beim Erstellen des Typs:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Typ aktualisieren (nur Admins)
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('name').optional().isLength({ min: 2 }).trim().escape(),
  body('description').optional().trim().escape(),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i),
  body('icon').optional().trim().escape()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, description, color, icon } = req.body;

  try {
    const db = await getDatabase();
    
    // Prüfen ob Typ existiert
    const existingType = await db.get('SELECT id FROM ruleset_types WHERE id = ?', [id]);
    if (!existingType) {
      
      return res.status(404).json({ error: 'Typ nicht gefunden' });
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
    if (color !== undefined) {
      updates.push('color = ?');
      values.push(color);
    }
    if (icon !== undefined) {
      updates.push('icon = ?');
      values.push(icon);
    }

    if (updates.length === 0) {
      
      return res.status(400).json({ error: 'Keine Aktualisierungsdaten bereitgestellt' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await db.run(
      `UPDATE ruleset_types SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const updatedType = await db.get(
      'SELECT id, name, description, color, icon, created_at, updated_at FROM ruleset_types WHERE id = ?',
      [id]
    );

    

    res.json(updatedType);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Typs:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Typ löschen (nur Admins)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDatabase();
    
    // Prüfen ob Typ noch verwendet wird
    const usageCount = await db.get(
      'SELECT COUNT(*) as count FROM rulesets WHERE type_id = ?',
      [id]
    );

    if (usageCount.count > 0) {
      
      return res.status(400).json({ 
        error: `Typ kann nicht gelöscht werden, da er noch von ${usageCount.count} Regelwerk(en) verwendet wird` 
      });
    }

    const result = await db.run('DELETE FROM ruleset_types WHERE id = ?', [id]);
    
    

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Typ nicht gefunden' });
    }

    res.json({ message: 'Typ erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Typs:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

export default router;
