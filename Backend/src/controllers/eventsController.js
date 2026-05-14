import slugify from 'slugify';
import prisma from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

function buildSlug(title) {
  const base = slugify(title, { lower: true, strict: true, trim: true });
  const suffix = Math.random().toString(16).slice(2, 7);
  return `${base}-${suffix}`;
}

function paginate(page = 1, limit = 20) {
  const p = Math.max(1, parseInt(page, 10));
  const l = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const offset = (p - 1) * l;
  return { page: p, limit: l, offset };
}

import { sessionSelect, formatSession } from '../utils/sessionHelpers.js';

export const listEvents = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const upcoming = req.query.upcoming === 'true';
    const where = upcoming ? { endsAt: { gte: new Date() } } : {};

    const [events, total] = await prisma.$transaction([
      prisma.event.findMany({
        where,
        orderBy: upcoming ? { startsAt: 'asc' } : { startsAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true, title: true, description: true,
          location: true, startsAt: true, endsAt: true,
          slug: true, createdAt: true,
        },
      }),
      prisma.event.count({ where }),
    ]);

    res.json({
      success: true,
      data: events,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { sessions: { orderBy: { startsAt: 'asc' }, select: sessionSelect } },
    });

    if (!event) return next(new AppError('Event not found.', 404));

    res.json({ success: true, data: { ...event, sessions: event.sessions.map(formatSession) } });
  } catch (err) {
    next(err);
  }
};

export const getEventBySlug = async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({
      where: { slug: req.params.slug },
      include: { sessions: { orderBy: { startsAt: 'asc' }, select: sessionSelect } },
    });

    if (!event) return next(new AppError('Event not found.', 404));

    res.json({ success: true, data: { ...event, sessions: event.sessions.map(formatSession) } });
  } catch (err) {
    next(err);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const { title, description, location, starts_at, ends_at } = req.body;

    const event = await prisma.event.create({
      data: {
        organizerId: req.organizer.id,
        title,
        description: description ?? null,
        location: location ?? null,
        startsAt: new Date(starts_at),
        endsAt: new Date(ends_at),
        slug: buildSlug(title),
      },
    });

    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { title, description, location, starts_at, ends_at } = req.body;

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        title,
        description: description ?? null,
        location: location ?? null,
        startsAt: new Date(starts_at),
        endsAt: new Date(ends_at),
      },
    });

    res.json({ success: true, data: event });
  } catch (err) {
    if (err.code === 'P2025') return next(new AppError('Event not found.', 404));
    next(err);
  }
};

export const patchEvent = async (req, res, next) => {
  try {
    const allowed = ['title', 'description', 'location', 'starts_at', 'ends_at'];
    const body = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

    if (!Object.keys(body).length) {
      return next(new AppError('No valid fields provided.', 400));
    }

    if (body.starts_at || body.ends_at) {
      const current = await prisma.event.findUnique({ where: { id: req.params.id } });
      if (!current) return next(new AppError('Event not found.', 404));

      const newStart = new Date(body.starts_at ?? current.startsAt);
      const newEnd = new Date(body.ends_at ?? current.endsAt);
      if (newEnd <= newStart) return next(new AppError('ends_at must be after starts_at.', 422));
    }

    const data = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.location !== undefined) data.location = body.location;
    if (body.starts_at) data.startsAt = new Date(body.starts_at);
    if (body.ends_at) data.endsAt = new Date(body.ends_at);

    const event = await prisma.event.update({ where: { id: req.params.id }, data });

    res.json({ success: true, data: event });
  } catch (err) {
    if (err.code === 'P2025') return next(new AppError('Event not found.', 404));
    next(err);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') return next(new AppError('Event not found.', 404));
    next(err);
  }
};

export const getLiveSessions = async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return next(new AppError('Event not found.', 404));

    const now = new Date();
    const sessions = await prisma.session.findMany({
      where: { eventId: req.params.id, startsAt: { lte: now }, endsAt: { gte: now } },
      orderBy: { startsAt: 'asc' },
      select: sessionSelect,
    });

    res.json({ success: true, data: sessions.map(formatSession) });
  } catch (err) {
    next(err);
  }
};