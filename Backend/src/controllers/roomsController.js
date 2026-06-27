import prisma from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export const getRooms = async (req, res, next) => {
  try {
    const { eventId } = req.query;
    const where = eventId ? { eventId } : {};

    const [total, rooms] = await Promise.all([
      prisma.room.count({ where }),
      prisma.room.findMany({
        where,
        orderBy: { name: 'asc' },
      }),
    ]);

    res.setHeader('X-Total-Count', total);
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
    res.json(rooms);
  } catch (err) {
    next(err);
  }
};

export const getRoomById = async (req, res, next) => {
  try {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
    });
    if (!room) return next(new AppError('Room not found.', 404));
    res.json(room);
  } catch (err) {
    next(err);
  }
};

export const createRoom = async (req, res, next) => {
  try {
    const { eventId, name } = req.body;
    if (!eventId || !name) {
      return next(new AppError('eventId and name are required.', 400));
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return next(new AppError('Event not found.', 404));

    const room = await prisma.room.create({
      data: { eventId, name },
    });

    res.status(201).json(room);
  } catch (err) {
    if (err.code === 'P2002') {
      return next(new AppError('Une salle avec ce nom existe déjà pour cet événement.', 409));
    }
    next(err);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const existing = await prisma.room.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) return next(new AppError('Room not found.', 404));

    const { name } = req.body;
    const room = await prisma.room.update({
      where: { id: req.params.id },
      data: { name: name ?? existing.name },
    });

    res.json(room);
  } catch (err) {
    if (err.code === 'P2002') {
      return next(new AppError('Une salle avec ce nom existe déjà pour cet événement.', 409));
    }
    next(err);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const existing = await prisma.room.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) return next(new AppError('Room not found.', 404));

    await prisma.room.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};