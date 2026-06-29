'use client';

import { useEffect, useState } from 'react';
import { getEvents, getSessions, getSpeakers } from '@/lib/api';

export default function Hero() {
  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState({ sessions: 0, speakers: 0, rooms: 0 });

  useEffect(() => {
    async function load() {
      try {
        const eventsData = await getEvents();
        const events = Array.isArray(eventsData) ? eventsData : (eventsData.data || []);
        if (!events.length) return;
        const ev = events[0];
        setEvent(ev);

        const [sessionsRaw, speakersRaw] = await Promise.all([
          getSessions(ev.id),
          getSpeakers(ev.id),
        ]);

        const sessions = Array.isArray(sessionsRaw) ? sessionsRaw : (sessionsRaw.data || []);
        const speakers = Array.isArray(speakersRaw) ? speakersRaw : (speakersRaw.data || []);
        const uniqueRooms = new Set(sessions.filter((s) => s.room).map((s) => s.room.id));

        setStats({
          sessions: sessions.length,
          speakers: speakers.length,
          rooms: uniqueRooms.size,
        });
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="flex border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#131318]">

      {/* Gauche */}
      <div className="flex-1 p-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E1F5EE] dark:bg-[#7c6ff720] text-[#085041] dark:text-[#a89df9] text-xs mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] dark:bg-[#7c6ff7] animate-pulse" />
          Événement en cours
        </div>

        <h1 className="text-2xl font-semibold leading-tight mb-2 text-[#1a1c28] dark:text-[#f2f2f8]">
          {event?.title || 'EventSync Conference'}
        </h1>

        {event?.description && (
          <p className="text-xs text-[#6870a0] leading-relaxed mb-4 max-w-md">
            {event.description}
          </p>
        )}

        {event?.startsAt && (
          <p className="text-xs text-[#6870a0] mb-4">
            {formatDate(event.startsAt)}
            {event.location ? ` · ${event.location}` : ''}
          </p>
        )}
      </div>

      {/* Droite — Stats */}
      <div className="w-48 p-5 bg-[#e8eaf2] dark:bg-[#1c1c24] border-l border-black/10 dark:border-white/10 flex flex-col gap-3">
        {[
          { val: stats.sessions, label: 'Sessions' },
          { val: stats.speakers, label: 'Intervenants' },
          { val: stats.rooms, label: 'Salles actives' },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-[#181820] rounded-xl p-3 border border-black/10 dark:border-white/10"
          >
            <div className="text-xl font-medium text-[#1a1c28] dark:text-[#f2f2f8]">{s.val}</div>
            <div className="text-[10px] text-[#6870a0] mt-0.5">{s.label}</div>
          </div>
        ))}
        {event?.location && (
          <div className="bg-[#1D9E75] dark:bg-[#7c6ff7] rounded-xl p-3">
            <div className="text-[10px] text-white/70 uppercase tracking-wider mb-1">Lieu</div>
            <div className="text-xs text-white font-medium">{event.location}</div>
          </div>
        )}
      </div>

    </div>
  );
}
