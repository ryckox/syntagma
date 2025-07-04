import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Zugangstoken erforderlich' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Benutzer aus Datenbank laden
    const db = await getDatabase();
    const user = await db.get(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({ error: 'Ungültiger Token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Ungültiger oder abgelaufener Token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Administrator-Berechtigung erforderlich' });
  }
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const db = await getDatabase();
      const user = await db.get(
        'SELECT id, username, email, role FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Token ungültig, aber das ist okay bei optionaler Auth
      console.error('Optional auth error:', error);
    }
  }
  
  next();
};
