
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
