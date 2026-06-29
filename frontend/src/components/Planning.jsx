'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getEvents, getSessions, getFavorites, toggleFavorite } from '@/lib/api';

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const isSessionLive = (session) => {
  const now = new Date();
  return now >= new Date(session.startsAt) && now <= new Date(session.endsAt);
};

export default function Planning() {
  const router = useRouter();
  const [sessionsByRoom, setSessionsByRoom] = useState({});
  const [rooms, setRooms] = useState(['Tout']);
  const [activeRoom, setActiveRoom] = useState('Tout');
  const [favorites, setFavorites] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const eventsData = await getEvents();
        const events = Array.isArray(eventsData) ? eventsData : (eventsData.data || []);
        if (!events.length) { setLoading(false); return; }

        const sessionsRaw = await getSessions(events[0].id);
        const allSessions = Array.isArray(sessionsRaw) ? sessionsRaw : (sessionsRaw.data || []);

        const byRoom = {};
        allSessions.forEach((s) => {
          const roomName = s.room?.name || 'Sans salle';
          if (!byRoom[roomName]) byRoom[roomName] = [];
          byRoom[roomName].push(s);
        });

        Object.values(byRoom).forEach((arr) =>
          arr.sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
        );

        const slots = [...new Set(allSessions.map((s) => s.startsAt))].sort(
          (a, b) => new Date(a) - new Date(b)
        );

        setSessionsByRoom(byRoom);
        setRooms(['Tout', ...Object.keys(byRoom).sort()]);
        setTimeSlots(slots);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleFavorite = (e, sessionId) => {
    e.stopPropagation();
    const { favorites: updated } = toggleFavorite(sessionId);
    setFavorites(updated);
  };

  const visibleRooms = activeRoom === 'Tout'
    ? Object.keys(sessionsByRoom).sort()
    : [activeRoom];

  if (loading) {
    return (
      <div className="px-6 py-10 text-center text-xs text-[#6870a0]">
        Chargement du planning…
      </div>
    );
  }

  if (!visibleRooms.length) {
    return (
      <div className="px-6 py-10 text-center text-xs text-[#6870a0]">
        Aucune session disponible.
      </div>
    );
  }

  return (
    <div className="px-6 py-5 bg-[#f2f4f8] dark:bg-[#0f0f13]">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-[#1a1c28] dark:text-[#f2f2f8]">
          Planning multi-track
        </h2>
        <div className="flex gap-1 flex-wrap">
          {rooms.map((r) => (
            <button
              key={r}
              onClick={() => setActiveRoom(r)}
              className={`px-2.5 py-1 rounded-full border text-[11px] transition-all ${
                activeRoom === r
                  ? 'bg-[#EEEDFE] dark:bg-[#7c6ff720] text-[#534AB7] dark:text-[#a89df9] border-[#7c6ff7]'
                  : 'border-black/10 dark:border-white/10 text-[#6870a0] hover:text-[#1a1c28] dark:hover:text-[#f2f2f8]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Grille */}
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `44px repeat(${visibleRooms.length}, 1fr)` }}
      >
        {/* Colonne horaires */}
        <div className="pt-8 flex flex-col gap-1.5">
          {timeSlots.map((slot) => (
            <div
              key={slot}
              className="text-[10px] text-[#c0c4dc] dark:text-[#40405a] h-22.5 flex items-start"
            >
              {formatTime(slot)}
            </div>
          ))}
        </div>

        {/* Colonnes salles */}
        {visibleRooms.map((room) => (
          <div key={room}>
            <div className="text-[10px] font-medium text-[#6870a0] px-2 py-1 bg-[#e8eaf2] dark:bg-[#1c1c24] rounded-md text-center mb-1.5">
              {room}
            </div>
            <div className="flex flex-col gap-1.5">
              {(sessionsByRoom[room] || []).map((s) => {
                const live = isSessionLive(s);
                const isFav = favorites.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => router.push(`/sessions/${s.id}`)}
                    className={`bg-white dark:bg-[#181820] border border-black/10 dark:border-white/10 rounded-[10px] p-3 h-22.5 flex flex-col justify-between cursor-pointer hover:border-[#7c6ff7] hover:-translate-y-px transition-all ${
                      live ? 'rounded-l-none border-l-2 border-l-[#D85A30] dark:border-l-[#f07060]' : ''
                    }`}
                  >
                    <div className="text-[11px] font-medium leading-snug text-[#1a1c28] dark:text-[#f2f2f8] line-clamp-2">
                      {s.title}
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] text-[#6870a0] truncate">
                        {s.speakers.map((sp) => sp.fullName).join(', ')}
                      </span>
                      {live ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#f0706018] text-[#D85A30] dark:text-[#f07060] shrink-0">
                          Live
                        </span>
                      ) : (
                        <button
                          onClick={(e) => handleFavorite(e, s.id)}
                          className={`text-sm shrink-0 transition-colors ${
                            isFav
                              ? 'text-[#D85A30] dark:text-[#f07060]'
                              : 'text-[#c0c4dc] dark:text-[#40405a] hover:text-[#D85A30]'
                          }`}
                        >
                          {isFav ? '♥' : '♡'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
