import prisma from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { sessionSelect, formatSession } from '../utils/sessionHelpers.js';

// GET /rooms/:roomId/sessions
export const getRoomSessions = async (req, res, next) => {
  const { roomId } = req.params;

  try {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) return next(new AppError('Room not found.', 404));

    const sessions = await prisma.session.findMany({
      where: { roomId },
      orderBy: { startsAt: 'asc' },
      select: sessionSelect,
    });

    res.json({ success: true, data: sessions.map(formatSession) });
  } catch (err) {
    next(err);
  }
};