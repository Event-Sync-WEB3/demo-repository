import { Router } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'eventsync_secret_2026';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    const organizer = await prisma.organizer.findUnique({ where: { email } });

    if (!organizer) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Pour le test, on compare en clair (en prod, utiliser bcrypt)
    if (password !== organizer.passwordHash) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: organizer.id, email: organizer.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, organizer: { id: organizer.id, email: organizer.email, fullName: organizer.fullName } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;