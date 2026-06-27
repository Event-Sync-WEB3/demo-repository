import prisma from '../config/prisma.js';

export const getAllSpeakers = async (req, res) => {
  const { eventId } = req.query;
  try {
    const where = eventId ? { eventId } : undefined;

    const [total, speakers] = await Promise.all([
      prisma.speaker.count({ where }),
      prisma.speaker.findMany({
        where,
        include: { links: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { fullName: 'asc' },
      }),
    ]);

    res.setHeader('X-Total-Count', total);
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
    res.status(200).json(speakers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch speakers' });
  }
};

export const getSpeakerBySlug = async (req, res) => {
  const { slug } = req.params;
  const { eventId } = req.query;
  try {
    let speaker;
    if (eventId) {
      speaker = await prisma.speaker.findUnique({
        where: { eventId_slug: { eventId, slug } },
        include: { links: { orderBy: { sortOrder: 'asc' } } },
      });
    } else {
      speaker = await prisma.speaker.findFirst({
        where: { slug },
        include: { links: { orderBy: { sortOrder: 'asc' } } },
      });
    }

    if (!speaker) return res.status(404).json({ error: 'Speaker not found' });
    res.status(200).json(speaker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch speaker by slug' });
  }
};

export const getSpeakerById = async (req, res) => {
  const { id } = req.params;
  try {
    const speaker = await prisma.speaker.findUnique({
      where: { id },
      include: { links: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!speaker) return res.status(404).json({ error: 'Speaker not found' });
    res.status(200).json(speaker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch speaker by id' });
  }
};

export const createSpeaker = async (req, res) => {
  const { eventId, fullName, bio, photoUrl, slug, links } = req.body;

  if (!eventId || !fullName || !slug) {
    return res.status(400).json({ error: 'eventId, fullName and slug are required' });
  }

  try {
    const speaker = await prisma.speaker.create({
      data: {
        eventId,
        fullName,
        bio:      bio      || null,
        photoUrl: photoUrl || null,
        slug,
        links: {
          create: (links || []).map((link, index) => ({
            platform:  link.platform,
            label:     link.label || null,
            url:       link.url,
            sortOrder: index,
          })),
        },
      },
      include: { links: true },
    });

    res.status(201).json(speaker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to create speaker' });
  }
};

export const updateSpeaker = async (req, res) => {
  const { id } = req.params;
  const { fullName, bio, photoUrl, slug, links } = req.body;

  try {
    const existing = await prisma.speaker.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Speaker not found' });

    const speaker = await prisma.speaker.update({
      where: { id },
      data: {
        fullName: fullName   || existing.fullName,
        bio:      bio      !== undefined ? bio      : existing.bio,
        photoUrl: photoUrl !== undefined ? photoUrl : existing.photoUrl,
        slug:     slug       || existing.slug,
        links: {
          deleteMany: {},
          create: (links || []).map((link, index) => ({
            platform:  link.platform,
            label:     link.label || null,
            url:       link.url,
            sortOrder: index,
          })),
        },
      },
      include: { links: true },
    });

    res.status(200).json(speaker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to update speaker' });
  }
};

export const deleteSpeaker = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.speaker.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Speaker not found' });

    await prisma.speaker.delete({ where: { id } });
    res.status(200).json({ message: 'Speaker deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to delete speaker' });
  }
};

export const getSpeakerSessions = async (req, res) => {
  const { id } = req.params;
  try {
    const sessions = await prisma.sessionSpeaker.findMany({
      where: { speakerId: id },
      include: { session: true },
      orderBy: { sortOrder: 'asc' },
    });

    res.status(200).json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch speaker sessions' });
  }
};

export const linkSpeakerToSession = async (req, res) => {
  const { id } = req.params;
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  try {
    const link = await prisma.sessionSpeaker.create({
      data: { speakerId: id, sessionId },
    });

    res.status(201).json(link);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to link speaker to session' });
  }
};