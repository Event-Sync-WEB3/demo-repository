import prisma from '../config/prisma.js';

const EVENT_INCLUDE = {
  rooms: { orderBy: { name: 'asc' } },
  sessions: {
    orderBy: { startsAt: 'asc' },
    include: {
      room: true,
      speakers: {
        orderBy: { sortOrder: 'asc' },
        include: {
          speaker: {
            select: {
              id: true,
              fullName: true,
              photoUrl: true,
              slug: true,
            },
          },
        },
      },
    },
  },
  speakers: {
    orderBy: { fullName: 'asc' },
    include: { links: { orderBy: { sortOrder: 'asc' } } },
  },
};

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function uniqueSlug(base, excludeId = null) {
  let slug = base;
  let n = 1;
  while (true) {
    const found = await prisma.event.findUnique({ where: { slug } });
    if (!found || found.id === excludeId) break;
    slug = `${base}-${n++}`;
  }
  return slug;
}

export async function getEvents(req, res) {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const [total, events] = await Promise.all([
      prisma.event.count(),
      prisma.event.findMany({
        skip,
        take: limit,
        orderBy: { startsAt: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          startsAt: true,
          endsAt: true,
          slug: true,
          _count: { select: { sessions: true, speakers: true } },
        },
      }),
    ]);

    res.setHeader('X-Total-Count', total);
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
    res.json(events);
  } catch (err) {
    console.error('[getEvents]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function getEventBySlug(req, res) {
  try {
    const event = await prisma.event.findUnique({
      where:   { slug: req.params.slug },
      include: EVENT_INCLUDE,
    });

    if (!event) return res.status(404).json({ error: 'Événement introuvable' });
    res.json(event);
  } catch (err) {
    console.error('[getEventBySlug]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function createEvent(req, res) {
  try {
    const { title, description, location, startsAt, endsAt } = req.body;

    if (!title || !startsAt || !endsAt) {
      return res.status(400).json({ error: 'Champs requis : title, startsAt, endsAt' });
    }

    const start = new Date(startsAt);
    const end   = new Date(endsAt);

    if (isNaN(start.getTime())) return res.status(400).json({ error: 'startsAt invalide' });
    if (isNaN(end.getTime()))   return res.status(400).json({ error: 'endsAt invalide' });
    if (end <= start)           return res.status(400).json({ error: 'endsAt doit être après startsAt' });

    const slug = await uniqueSlug(slugify(title));

    const event = await prisma.event.create({
      data: {
        title,
        description: description ?? null,
        location:    location    ?? null,
        startsAt:    start,
        endsAt:      end,
        slug,
        organizerId: req.organizer.id,
      },
      include: EVENT_INCLUDE,
    });

    res.status(201).json(event);
  } catch (err) {
    console.error('[createEvent]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function updateEvent(req, res) {
  try {
    const existing = await prisma.event.findUnique({
      where: { slug: req.params.slug },
    });

    if (!existing) return res.status(404).json({ error: 'Événement introuvable' });

    if (existing.organizerId !== req.organizer.id) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    const { title, description, location, startsAt, endsAt } = req.body;
    const data = {};

    if (title !== undefined) {
      data.title = title;
      if (title !== existing.title) {
        data.slug = await uniqueSlug(slugify(title), existing.id);
      }
    }
    if (description !== undefined) data.description = description;
    if (location    !== undefined) data.location    = location;

    const start = startsAt ? new Date(startsAt) : existing.startsAt;
    const end   = endsAt   ? new Date(endsAt)   : existing.endsAt;

    if (startsAt && isNaN(start.getTime())) return res.status(400).json({ error: 'startsAt invalide' });
    if (endsAt   && isNaN(end.getTime()))   return res.status(400).json({ error: 'endsAt invalide' });
    if (end <= start) return res.status(400).json({ error: 'endsAt doit être après startsAt' });

    if (startsAt) data.startsAt = start;
    if (endsAt)   data.endsAt   = end;

    const event = await prisma.event.update({
      where:   { id: existing.id },
      data,
      include: EVENT_INCLUDE,
    });

    res.json(event);
  } catch (err) {
    console.error('[updateEvent]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

export async function deleteEvent(req, res) {
  try {
    const existing = await prisma.event.findUnique({
      where: { slug: req.params.slug },
    });

    if (!existing) return res.status(404).json({ error: 'Événement introuvable' });

    if (existing.organizerId !== req.organizer.id) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    await prisma.event.delete({ where: { id: existing.id } });
    res.status(204).send();
  } catch (err) {
    console.error('[deleteEvent]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}