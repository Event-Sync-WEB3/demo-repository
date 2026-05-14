import prisma from '../config/prisma.js';

export async function sessionLive(req, res, next) {
  const { sessionId } = req.params;
  try {
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) return res.status(404).json({ error: 'Session non trouvée' });
    const now = new Date();
    if (now < session.startsAt || now > session.endsAt) {
      return res.status(403).json({ error: 'Les questions ne sont ouvertes que pendant la session live' });
    }
    req.session = session;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}