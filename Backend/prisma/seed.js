import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Organizer de test
  const organizer = await prisma.organizer.create({
    data: {
      email: 'admin@eventsync.com',
      passwordHash: 'hashed_password',
      fullName: 'Admin EventSync',
    },
  });

  // Événement 1
  const event1 = await prisma.event.create({
    data: {
      organizerId: organizer.id,
      title: 'Conférence Web3 2026',
      description: 'Événement dédié aux technologies décentralisées.',
      location: 'Paris, Palais des Congrès',
      startsAt: new Date('2026-05-15T08:00:00Z'),
      endsAt: new Date('2026-05-16T18:00:00Z'),
      slug: 'web3-2026',
    },
  });

  // Événement 2
  const event2 = await prisma.event.create({
    data: {
      organizerId: organizer.id,
      title: 'Workshop Next.js',
      description: 'Atelier pratique.',
      location: 'Lyon',
      startsAt: new Date('2026-06-10T09:00:00Z'),
      endsAt: new Date('2026-06-10T17:00:00Z'),
      slug: 'nextjs-workshop',
    },
  });

  // Salles
  const roomA = await prisma.room.create({ data: { eventId: event1.id, name: 'Auditorium A' } });
  const roomB = await prisma.room.create({ data: { eventId: event1.id, name: 'Salle B' } });
  const roomC = await prisma.room.create({ data: { eventId: event1.id, name: 'Espace Workshop' } });
  const roomD = await prisma.room.create({ data: { eventId: event2.id, name: 'Labo 1' } });

  // Intervenants
  const speaker1 = await prisma.speaker.create({
    data: {
      eventId: event1.id,
      fullName: 'Alice Martin',
      bio: 'Blockchain dev',
      slug: 'alice-martin',
    },
  });
  const speaker2 = await prisma.speaker.create({
    data: {
      eventId: event1.id,
      fullName: 'Bob Dupont',
      slug: 'bob-dupont',
    },
  });

  // Sessions pour event1
  await prisma.session.create({
    data: {
      eventId: event1.id,
      roomId: roomA.id,
      title: 'Intro Web3',
      startsAt: new Date('2026-05-15T09:00:00Z'),
      endsAt: new Date('2026-05-15T10:00:00Z'),
      capacity: 200,
      speakers: { create: [{ speakerId: speaker1.id }] },
    },
  });

  await prisma.session.create({
    data: {
      eventId: event1.id,
      roomId: roomB.id,
      title: 'Smart Contracts',
      startsAt: new Date('2026-05-15T09:00:00Z'),
      endsAt: new Date('2026-05-15T11:00:00Z'),
      capacity: 50,
      speakers: { create: [{ speakerId: speaker2.id }] },
    },
  });

  // Session live (pour tester le badge live)
  const now = new Date();
  await prisma.session.create({
    data: {
      eventId: event1.id,
      roomId: roomA.id,
      title: 'Live Session Test',
      startsAt: new Date(now.getTime() - 30 * 60000), // commence il y a 30 min
      endsAt: new Date(now.getTime() + 30 * 60000),   // finit dans 30 min
      capacity: 100,
      speakers: { create: [{ speakerId: speaker1.id }] },
    },
  });

  console.log('Seed terminé !');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());