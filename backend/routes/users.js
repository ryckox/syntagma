import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/database.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Neuen Benutzer erstellen (nur Admins)
router.post('/', [
  requireAdmin,
  body('username').isLength({ min: 3 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['admin', 'user']),
  body('active').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, role = 'user', active = true } = req.body;

  try {
    const db = await getDatabase();
    
    // Prüfen ob Username oder Email bereits existiert
    const existingUser = await db.get(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUser) {
      return res.status(400).json({ error: 'Benutzername oder E-Mail bereits vergeben' });
    }

    // Passwort hashen
    const passwordHash = await bcrypt.hash(password, 12);

    // Benutzer erstellen
    const result = await db.run(
      'INSERT INTO users (username, email, password_hash, role, active) VALUES (?, ?, ?, ?, ?)',
      [username, email, passwordHash, role, active ? 1 : 0]
    );

    // Erstellten Benutzer zurückgeben (ohne Passwort)
    const newUser = await db.get(
      'SELECT id, username, email, role, active, created_at, updated_at FROM users WHERE id = ?',
      [result.lastID]
    );

    // Convert active field from integer to boolean
    const userWithBoolean = {
      ...newUser,
      active: Boolean(newUser.active)
    };

    res.status(201).json(userWithBoolean);
  } catch (error) {
    console.error('Fehler beim Erstellen des Benutzers:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Alle Benutzer abrufen (nur Admins)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const db = await getDatabase();
    const users = await db.all(
      'SELECT id, username, email, role, active, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    
    // Convert active field from integer to boolean
    const usersWithBooleans = users.map(user => ({
      ...user,
      active: Boolean(user.active)
    }));
    
    res.json(usersWithBooleans);
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
      'SELECT id, username, email, role, active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    if (!user) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    // Convert active field from integer to boolean
    const userWithBoolean = {
      ...user,
      active: Boolean(user.active)
    };

    res.json(userWithBoolean);
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
  body('role').optional().isIn(['admin', 'user']),
  body('active').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { username, email, role, active } = req.body;

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
    if (active !== undefined) {
      updates.push('active = ?');
      values.push(active ? 1 : 0);
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
      'SELECT id, username, email, role, active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    // Convert active field from integer to boolean
    const userWithBoolean = {
      ...updatedUser,
      active: Boolean(updatedUser.active)
    };

    res.json(userWithBoolean);
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
