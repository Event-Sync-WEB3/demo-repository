'use client';

import { useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import Planning from '@/components/Planning';
import SpeakersList from '@/components/SpeakersList';
import Favorites from '@/components/Favorites';
import { getEvents, getSessions, getSpeakers, getRooms } from '@/lib/api';

export default function Home() {
  const [allEvents, setAllEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [cachedSessions, setCachedSessions] = useState({});
  const [heroStats, setHeroStats] = useState({ sessions: null, speakers: null, rooms: null });

  // Charge tous les événements + toutes les sessions en parallèle
  useEffect(() => {
    async function load() {
      try {
        const eventsData = await getEvents();
        const events = Array.isArray(eventsData) ? eventsData : (eventsData.data || []);
        setAllEvents(events);
        if (!events.length) return;

        const results = await Promise.all(
          events.map(async (e) => {
            const data = await getSessions(e.id);
            return { id: e.id, sessions: Array.isArray(data) ? data : (data.data || []) };
          })
        );

        const cache = {};
        results.forEach(r => { cache[r.id] = r.sessions; });
        setCachedSessions(cache);

        // Événement avec le plus de sessions LIVE, sinon events[0]
        const now = new Date();
        let bestId = events[0].id;
        let bestLiveCount = -1;
        for (const { id, sessions } of results) {
          const liveCount = sessions.filter(
            s => now >= new Date(s.startsAt) && now <= new Date(s.endsAt)
          ).length;
          if (liveCount > bestLiveCount) { bestLiveCount = liveCount; bestId = id; }
        }
        setSelectedEventId(bestId);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  // Met à jour les stats du Hero quand l'événement sélectionné change
  useEffect(() => {
    if (!selectedEventId) return;
    Promise.all([
      getSpeakers(selectedEventId),
      getRooms(selectedEventId),
    ]).then(([speakersRaw, roomsRaw]) => {
      const sessions = cachedSessions[selectedEventId] || [];
      const speakers = Array.isArray(speakersRaw) ? speakersRaw : (speakersRaw.data || []);
      const rooms    = Array.isArray(roomsRaw)    ? roomsRaw    : (roomsRaw.data    || []);
      setHeroStats({ sessions: sessions.length, speakers: speakers.length, rooms: rooms.length });
    }).catch(console.error);
  }, [selectedEventId, cachedSessions]);

  const selectedEvent = allEvents.find(e => e.id === selectedEventId) || null;

  return (
    <>
      <Hero event={selectedEvent} stats={heroStats} />
      <Planning
        allEvents={allEvents}
        selectedEventId={selectedEventId}
        cachedSessions={cachedSessions}
        onSelectEvent={setSelectedEventId}
      />
      <SpeakersList />
      <Favorites />
    </>
  );
}
