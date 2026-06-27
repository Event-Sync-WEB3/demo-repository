export const sessionSelect = {
  id: true,
  title: true,
  description: true,
  startsAt: true,
  endsAt: true,
  capacity: true,
  eventId: true,
  roomId: true,
  createdAt: true,
  updatedAt: true,
  room: {
    select: {
      id: true,
      name: true,
    },
  },
  speakers: {
    orderBy: { sortOrder: 'asc' },
    select: {
      sortOrder: true,
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
};

export function formatSession(session) {
  const { speakers, ...rest } = session;
  return {
    ...rest,
    speakers: speakers?.map((s) => ({
      ...s.speaker,
      sortOrder: s.sortOrder,
    })) ?? [],
  };
}