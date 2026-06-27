import prisma from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { sessionSelect, formatSession } from '../utils/sessionHelpers.js';

export const getSessions = async (req, res, next) => {
  try {
    const { eventId, roomId } = req.query;
    const where = {};
    if (eventId) where.eventId = eventId;
    if (roomId)  where.roomId  = roomId;

    const [total, sessions] = await Promise.all([
      prisma.session.count({ where }),
      prisma.session.findMany({
        where,
        orderBy: { startsAt: 'asc' },
        select: sessionSelect,
      }),
    ]);

    res.setHeader('X-Total-Count', total);
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
    res.json(sessions.map(formatSession));
  } catch (err) {
    next(err);
  }
};

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
          select: {
            id: true,
            content: true,
            authorName: true,
            upvotes: true,
            createdAt: true,
          },
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

export const createSession = async (req, res, next) => {
  try {
    const { eventId, roomId, title, description, startsAt, endsAt, capacity, speakerIds } = req.body;

    if (!eventId || !title || !startsAt || !endsAt) {
      return next(new AppError('eventId, title, startsAt and endsAt are required.', 400));
    }

    const start = new Date(startsAt);
    const end   = new Date(endsAt);

    if (isNaN(start.getTime())) return next(new AppError('startsAt invalide.', 400));
    if (isNaN(end.getTime()))   return next(new AppError('endsAt invalide.', 400));
    if (end <= start)           return next(new AppError('endsAt doit être après startsAt.', 400));

    const session = await prisma.session.create({
      data: {
        eventId,
        roomId:      roomId      ?? null,
        title,
        description: description ?? null,
        startsAt:    start,
        endsAt:      end,
        capacity:    capacity    ?? null,
        speakers: {
          create: (speakerIds || []).map((speakerId, index) => ({
            speakerId,
            sortOrder: index,
          })),
        },
      },
      select: sessionSelect,
    });

    res.status(201).json(formatSession(session));
  } catch (err) {
    next(err);
  }
};

export const updateSession = async (req, res, next) => {
  try {
    const existing = await prisma.session.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) return next(new AppError('Session not found.', 404));

    const { roomId, title, description, startsAt, endsAt, capacity, speakerIds } = req.body;

    const start = startsAt ? new Date(startsAt) : existing.startsAt;
    const end   = endsAt   ? new Date(endsAt)   : existing.endsAt;

    if (end <= start) return next(new AppError('endsAt doit être après startsAt.', 400));

    const data = {
      title:       title       ?? existing.title,
      description: description ?? existing.description,
      roomId:      roomId      ?? existing.roomId,
      startsAt:    start,
      endsAt:      end,
      capacity:    capacity    ?? existing.capacity,
    };

    if (speakerIds !== undefined) {
      await prisma.sessionSpeaker.deleteMany({ where: { sessionId: req.params.id } });
      data.speakers = {
        create: speakerIds.map((speakerId, index) => ({
          speakerId,
          sortOrder: index,
        })),
      };
    }

    const session = await prisma.session.update({
      where: { id: req.params.id },
      data,
      select: sessionSelect,
    });

    res.json(formatSession(session));
  } catch (err) {
    next(err);
  }
};

export const deleteSession = async (req, res, next) => {
  try {
    const existing = await prisma.session.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) return next(new AppError('Session not found.', 404));

    await prisma.session.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};