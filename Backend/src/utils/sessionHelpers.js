export const sessionSelect = {
  id: true,
  title: true,
  description: true,
  startsAt: true,
  endsAt: true,
  capacity: true,
  room: {
    select: { id: true, name: true },
  },
  speakers: {
    orderBy: { sortOrder: 'asc' },
    select: {
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

export const formatSession = (session) => {
  const now = new Date();
  const isLive =
    now >= new Date(session.startsAt) && now <= new Date(session.endsAt);

  return {
    ...session,
    isLive,
    speakers: session.speakers?.map((ss) => ss.speaker) || [],
  };
};