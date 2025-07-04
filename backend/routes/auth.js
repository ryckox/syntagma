import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/database.js';

const router = express.Router();

// Registrierung (nur für Admins über separaten Endpunkt)
router.post('/register', [
  body('username').isLength({ min: 3 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['admin', 'user'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, role = 'user' } = req.body;

  try {
    const db = await getDatabase();
    
    // Prüfen ob Benutzer bereits existiert
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
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, role]
    );

    

    res.status(201).json({
      message: 'Benutzer erfolgreich erstellt',
      userId: result.lastID
    });
  } catch (error) {
    console.error('Registrierungsfehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Anmeldung
router.post('/login', [
  body('username').trim().escape(),
  body('password').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const db = await getDatabase();
    
    // Benutzer finden
    const user = await db.get(
      'SELECT id, username, email, password_hash, role FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    

    if (!user) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    // Passwort prüfen
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    // JWT Token erstellen
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Anmeldung erfolgreich',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Anmeldefehler:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Token validieren
router.get('/validate', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token erforderlich' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const db = await getDatabase();
    const user = await db.get(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [decoded.userId]
    );
    

    if (!user) {
      return res.status(401).json({ error: 'Ungültiger Token' });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Ungültiger Token' });
  }
});

export default router;
