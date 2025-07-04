import jwt from 'jsonwebtoken';
import Database from '../database/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Zugangstoken erforderlich' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Benutzer aus Datenbank laden
    const db = new Database();
    const user = await db.get(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [decoded.userId]
    );
    await db.close();

    if (!user) {
      return res.status(401).json({ error: 'Ungültiger Token' });
    }

    req.user = user;
    next();
  } catch (error) {
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
      
      const db = new Database();
      const user = await db.get(
        'SELECT id, username, email, role FROM users WHERE id = ?',
        [decoded.userId]
      );
      await db.close();

      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Token ungültig, aber das ist okay bei optionaler Auth
    }
  }
  
  next();
};
