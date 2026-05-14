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

