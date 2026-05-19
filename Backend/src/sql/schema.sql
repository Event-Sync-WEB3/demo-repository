-- Insert données directement dans pgAdmin juste pour tester
INSERT INTO "Organizer" (id, email, "passwordHash", "fullName", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid(),
    'admin@eventsync.com',
    'hash_temporaire',
    'Admin EventSync',
    NOW(),
    NOW()
);

INSERT INTO "Event" (id, "organizerId", title, "startsAt", "endsAt", slug, "createdAt", "updatedAt")
VALUES (
    gen_random_uuid(),
    '51571e98-553f-4958-9227-62f290473dfc',
    'EventSync Conference 2026',
    '2026-06-01T08:00:00.000Z',
    '2026-06-01T18:00:00.000Z',
    'eventsync-2026',
    NOW(),
    NOW()
);

INSERT INTO "Session" (id, "eventId", title, "startsAt", "endsAt", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid(),
    'eb4aeaa4-6d97-4740-b48f-6ce66341efc4',
    'Session Test',
    '2026-06-01T09:00:00.000Z',
    '2026-06-01T10:00:00.000Z',
    NOW(),
    NOW()
);


