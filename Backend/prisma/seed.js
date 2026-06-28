import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Nettoyer la base (optionnel)
  await prisma.question.deleteMany();
  await prisma.sessionSpeaker.deleteMany();
  await prisma.session.deleteMany();
  await prisma.speakerLink.deleteMany();
  await prisma.speaker.deleteMany();
  await prisma.room.deleteMany();
  await prisma.event.deleteMany();
  await prisma.organizer.deleteMany();

  console.log('Base nettoyée.');

  // Créer un organizer
  const organizer = await prisma.organizer.create({
    data: {
      email: 'admin@eventsync.com',
      passwordHash: 'hashed_password_123',
      fullName: 'Admin EventSync',
    },
  });
  console.log('Organizer créé :', organizer.email);

  // Créer un événement
  const event = await prisma.event.create({
    data: {
      organizerId: organizer.id,
      title: 'EventSync Conference 2026',
      description: 'La conférence tech annuelle de Madagascar',
      location: 'Antananarivo, Madagascar',
      startsAt: new Date('2026-07-01T08:00:00Z'),
      endsAt: new Date('2026-07-02T18:00:00Z'),
      slug: 'eventsync-2026',
    },
  });
  console.log('Événement créé :', event.title);

  // Créer des salles
  const roomA = await prisma.room.create({ data: { eventId: event.id, name: 'Salle A' } });
  const roomB = await prisma.room.create({ data: { eventId: event.id, name: 'Salle B' } });
  const roomC = await prisma.room.create({ data: { eventId: event.id, name: 'Salle C' } });
  console.log('Salles créées : 3');

  // Créer des intervenants
  const speaker1 = await prisma.speaker.create({
    data: {
      eventId: event.id,
      fullName: 'Thomas Rakoto',
      bio: 'Développeur full-stack, expert Node.js et React',
      slug: 'thomas-rakoto',
    },
  });

  const speaker2 = await prisma.speaker.create({
    data: {
      eventId: event.id,
      fullName: 'Cassy Andria',
      bio: 'Designer UI/UX, spécialiste en design systems',
      slug: 'cassy-andria',
    },
  });

  const speaker3 = await prisma.speaker.create({
    data: {
      eventId: event.id,
      fullName: 'Bradon Razafy',
      bio: 'DevOps engineer, expert PostgreSQL et Docker',
      slug: 'bradon-razafy',
    },
  });

  const speaker4 = await prisma.speaker.create({
    data: {
      eventId: event.id,
      fullName: 'Rahaga Tsiky',
      bio: 'Lead frontend, spécialiste React et TypeScript',
      slug: 'rahaga-tsiky',
    },
  });
  console.log('Intervenants créés : 4');

  // Créer des sessions
  const now = new Date();

  await prisma.session.create({
    data: {
      eventId: event.id,
      roomId: roomA.id,
      title: 'Intro Node.js & Express',
      description: 'Découvrez les bases de Node.js et du framework Express.',
      startsAt: new Date('2026-07-01T09:00:00Z'),
      endsAt: new Date('2026-07-01T10:00:00Z'),
      capacity: 100,
      speakers: {
        create: [{ speakerId: speaker1.id, sortOrder: 0 }],
      },
    },
  });

  await prisma.session.create({
    data: {
      eventId: event.id,
      roomId: roomA.id,
      title: 'API REST avec Prisma',
      description: 'Construire une API REST robuste avec Prisma ORM.',
      startsAt: new Date('2026-07-01T10:30:00Z'),
      endsAt: new Date('2026-07-01T11:30:00Z'),
      capacity: 80,
      speakers: {
        create: [{ speakerId: speaker2.id, sortOrder: 0 }],
      },
    },
  });

  await prisma.session.create({
    data: {
      eventId: event.id,
      roomId: roomA.id,
      title: 'PostgreSQL avancé',
      description: 'Optimisation et bonnes pratiques PostgreSQL.',
      startsAt: new Date('2026-07-01T14:00:00Z'),
      endsAt: new Date('2026-07-01T15:00:00Z'),
      capacity: 60,
      speakers: {
        create: [{ speakerId: speaker3.id, sortOrder: 0 }],
      },
    },
  });

  await prisma.session.create({
    data: {
      eventId: event.id,
      roomId: roomB.id,
      title: 'UI/UX moderne 2026',
      description: 'Les tendances design pour les applications web.',
      startsAt: new Date('2026-07-01T09:00:00Z'),
      endsAt: new Date('2026-07-01T10:30:00Z'),
      capacity: 70,
      speakers: {
        create: [{ speakerId: speaker2.id, sortOrder: 0 }],
      },
    },
  });

  await prisma.session.create({
    data: {
      eventId: event.id,
      roomId: roomB.id,
      title: 'Git & collaboration',
      description: 'Workflow Git pour les équipes de développement.',
      startsAt: new Date('2026-07-01T11:00:00Z'),
      endsAt: new Date('2026-07-01T12:00:00Z'),
      capacity: 90,
      speakers: {
        create: [{ speakerId: speaker1.id, sortOrder: 0 }],
      },
    },
  });

  await prisma.session.create({
    data: {
      eventId: event.id,
      roomId: roomC.id,
      title: 'React & state management',
      description: 'Gérer l\'état dans une application React moderne.',
      startsAt: new Date('2026-07-01T09:00:00Z'),
      endsAt: new Date('2026-07-01T11:00:00Z'),
      capacity: 120,
      speakers: {
        create: [{ speakerId: speaker4.id, sortOrder: 0 }],
      },
    },
  });

  await prisma.session.create({
    data: {
      eventId: event.id,
      roomId: roomC.id,
      title: 'Q&A interactif speakers',
      description: 'Session de questions-réponses avec tous les intervenants.',
      startsAt: new Date('2026-07-01T14:00:00Z'),
      endsAt: new Date('2026-07-01T16:00:00Z'),
      capacity: 150,
      speakers: {
        create: [
          { speakerId: speaker1.id, sortOrder: 0 },
          { speakerId: speaker4.id, sortOrder: 1 },
        ],
      },
    },
  });

  // Session LIVE (maintenant)
  await prisma.session.create({
    data: {
      eventId: event.id,
      roomId: roomB.id,
      title: 'Live Session Test',
      description: 'Cette session est en cours pour tester le badge Live.',
      startsAt: new Date(now.getTime() - 30 * 60000),
      endsAt: new Date(now.getTime() + 30 * 60000),
      capacity: 50,
      speakers: {
        create: [{ speakerId: speaker3.id, sortOrder: 0 }],
      },
    },
  });

  console.log('Sessions créées : 8');
  console.log('Seed terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });