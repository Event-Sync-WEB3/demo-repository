import prisma from '../config/prisma.js';

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const createFullEvent = async (req, res) => {
  try {
    const { title, description, location, startsAt, endsAt, rooms, speakers, sessions } = req.body;

    if (!title || !startsAt || !endsAt) {
      return res.status(400).json({ error: 'title, startsAt, endsAt sont requis' });
    }

    const start = new Date(startsAt);
    const end = new Date(endsAt);

    if (isNaN(start) || isNaN(end) || end <= start) {
      return res.status(400).json({ error: 'Dates invalides' });
    }

    let slug = slugify(title);
    const exists = await prisma.event.findUnique({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now()}`;

    const organizer = await prisma.organizer.findFirst();
    const organizerId = req.organizer?.id || organizer?.id;

    if (!organizerId) {
      return res.status(500).json({ error: 'Aucun organizer trouvé. Lancez le seed d\'abord.' });
    }

    // Créer l'événement avec tout
    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        location: location || null,
        startsAt: start,
        endsAt: end,
        slug,
        organizerId,

        // Rooms
        rooms: rooms?.length ? {
          create: rooms.map(r => ({ name: r })),
        } : undefined,

        // Speakers
        speakers: speakers?.length ? {
          create: speakers.map(s => ({
            fullName: s.fullName || s,
            bio: s.bio || null,
            slug: slugify(typeof s === 'string' ? s : s.fullName) + '-' + Date.now(),
          })),
        } : undefined,

        // Sessions
        sessions: sessions?.length ? {
          create: sessions.map((sess, idx) => ({
            title: sess.title,
            description: sess.description || null,
            startsAt: new Date(sess.startsAt),
            endsAt: new Date(sess.endsAt),
            capacity: sess.capacity || null,
            room: sess.roomName ? {
              connectOrCreate: {
                where: { eventId_name: { eventId: '', name: sess.roomName } },
                create: { name: sess.roomName },
              },
            } : undefined,
            speakers: sess.speakerNames?.length ? {
              create: sess.speakerNames.map((name, i) => ({
                speaker: {
                  connectOrCreate: {
                    where: { eventId_slug: { eventId: '', slug: slugify(name) } },
                    create: {
                      fullName: name,
                      slug: slugify(name) + '-' + Date.now(),
                    },
                  },
                },
                sortOrder: i,
              })),
            } : undefined,
          })),
        } : undefined,
      },
      include: {
        rooms: true,
        speakers: true,
        sessions: { include: { room: true, speakers: { include: { speaker: true } } } },
      },
    });

    res.status(201).json(event);
  } catch (err) {
    console.error('[createFullEvent]', err);
    res.status(500).json({ error: err.message || 'Erreur serveur' });
  }
};