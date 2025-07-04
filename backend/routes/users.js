import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Alle Benutzer abrufen (nur Admins)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const db = await getDatabase();
    const users = await db.all(
      'SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    

    res.json(users);
  } catch (error) {
    console.error('Fehler beim Abrufen der Benutzer:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Benutzer nach ID abrufen
router.get('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDatabase();
    const user = await db.get(
      'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    

    if (!user) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    res.json(user);
  } catch (error) {
    console.error('Fehler beim Abrufen des Benutzers:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Benutzer aktualisieren
router.put('/:id', [
  requireAdmin,
  body('username').optional().isLength({ min: 3 }).trim().escape(),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['admin', 'user'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { username, email, role } = req.body;

  try {
    const db = await getDatabase();
    
    // Prüfen ob Benutzer existiert
    const existingUser = await db.get('SELECT id FROM users WHERE id = ?', [id]);
    if (!existingUser) {
      
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    // Update-Felder dynamisch aufbauen
    const updates = [];
    const values = [];

    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }

    if (updates.length === 0) {
      
      return res.status(400).json({ error: 'Keine Aktualisierungsdaten bereitgestellt' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await db.run(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Aktualisierten Benutzer zurückgeben
    const updatedUser = await db.get(
      'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    

    res.json(updatedUser);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Benutzers:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Benutzer löschen
router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  // Verhindere, dass sich Admin selbst löscht
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'Sie können sich nicht selbst löschen' });
  }

  try {
    const db = await getDatabase();
    
    const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
    
    

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    res.json({ message: 'Benutzer erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Benutzers:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

export default router;
