import { Router } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    const organizer = await prisma.organizer.findUnique({ where: { email } });

    if (!organizer) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const valid = password === organizer.passwordHash;

    if (!valid) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { id: organizer.id, email: organizer.email, role: 'admin' },
      process.env.JWT_SECRET || 'eventsync_secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      organizer: { id: organizer.id, email: organizer.email, fullName: organizer.fullName },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
