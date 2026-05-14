
import { PrismaClient } from '@prisma/client';
 
const prisma = new PrismaClient();
 
 
const EVENT_INCLUDE = {
  rooms: {
    orderBy: { name: 'asc' },
  },
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
    include: {
      links: { orderBy: { sortOrder: 'asc' } },
    },
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
 
    res.json({
      data: events,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
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
