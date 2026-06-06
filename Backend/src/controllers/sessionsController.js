import prisma from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { sessionSelect, formatSession } from '../utils/sessionHelpers.js';

export const getEventSessions = async (req, res, next) => {
  const { eventId } = req.params;
  const { room: roomId } = req.query;

  try {
    const where = { eventId };
    if (roomId) where.roomId = roomId;

    const sessions = await prisma.session.findMany({
      where,
      orderBy: { startsAt: 'asc' },
      select: sessionSelect,
    });

    res.json({ success: true, data: sessions.map(formatSession) });
  } catch (err) {
    next(err);
  }
};

export const getSessionById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const session = await prisma.session.findUnique({
      where: { id },
      select: {
        ...sessionSelect,
        event: { select: { id: true, title: true, slug: true } },
        questions: {
          orderBy: { upvotes: 'desc' },
          select: { id: true, content: true, authorName: true, upvotes: true, createdAt: true },
        },
      },
    });

    if (!session) return next(new AppError('Session not found.', 404));

    res.json({ success: true, data: formatSession(session) });
  } catch (err) {
    next(err);
  }
};

export const getSessionQuestions = async (req, res, next) => {
  const { sessionId } = req.params;

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { id: true },
    });
    if (!session) return next(new AppError('Session not found.', 404));

    const questions = await prisma.question.findMany({
      where: { sessionId },
      orderBy: { upvotes: 'desc' },
    });

    res.json({ success: true, data: questions });
  } catch (err) {
    next(err);
  }
};