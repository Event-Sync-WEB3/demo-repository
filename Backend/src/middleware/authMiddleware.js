
import jwt from 'jsonwebtoken';
 
const JWT_SECRET = process.env.JWT_SECRET;
 

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
 
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant ou malformé' });
  }
 
  const token = header.split(' ')[1];
 
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.organizer = payload;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré' });
    }
    return res.status(401).json({ error: 'Token invalide' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.organizer?.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
}

