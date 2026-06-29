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

function HeartIcon({ filled }) {
  return (
    <svg width="14" height="14" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

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

  return (
    <section id="planning" className="bg-zinc-100 dark:bg-[#09090b] py-10">
      <div className="max-w-7xl mx-auto px-6">

        {/* En-tête de section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Planning multi-track</h2>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
              {timeSlots.length} créneaux · {Object.keys(sessionsByRoom).length} salles
            </p>
          </div>

          {/* Filtre par salle */}
          <div className="flex flex-wrap gap-1.5">
            {rooms.map((r) => (
              <button
                key={r}
                onClick={() => setActiveRoom(r)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150 ${
                  activeRoom === r
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-sm'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-zinc-400 text-sm">
            Chargement du planning…
          </div>
        ) : visibleRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-3">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24" className="text-zinc-400">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Aucune session disponible</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Les sessions apparaîtront ici une fois ajoutées</p>
          </div>
        ) : (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `64px repeat(${visibleRooms.length}, 1fr)` }}
          >
            {/* Colonne temps */}
            <div className="pt-10 flex flex-col gap-3">
              {timeSlots.map((slot) => (
                <div
                  key={slot}
                  className="h-28 flex items-start pt-1 text-[11px] font-mono font-medium text-zinc-400 dark:text-zinc-600"
                >
                  {formatTime(slot)}
                </div>
              ))}
            </div>

            {/* Colonnes salles */}
            {visibleRooms.map((room) => (
              <div key={room} className="flex flex-col gap-3">
                {/* En-tête de salle */}
                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] dark:bg-[#7c6ff7]" />
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">
                    {room}
                  </span>
                </div>

                {/* Cards sessions */}
                {(sessionsByRoom[room] || []).map((s) => {
                  const live = isSessionLive(s);
                  const isFav = favorites.includes(s.id);

                  return (
                    <div
                      key={s.id}
                      onClick={() => router.push(`/sessions/${s.id}`)}
                      className={`relative h-28 flex flex-col justify-between p-4 bg-white dark:bg-zinc-900 border rounded-xl cursor-pointer transition-all duration-150 group overflow-hidden ${
                        live
                          ? 'border-red-200 dark:border-red-900 shadow-md shadow-red-500/5'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-[#1D9E75]/40 dark:hover:border-[#7c6ff7]/40 hover:shadow-md hover:shadow-black/5 hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Barre live à gauche */}
                      {live && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500 rounded-l-xl" />
                      )}

                      <div>
                        {live && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-red-500">
                              Live
                            </span>
                          </div>
                        )}
                        <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100 leading-snug line-clamp-2 group-hover:text-[#1D9E75] dark:group-hover:text-[#7c6ff7] transition-colors">
                          {s.title}
                        </p>
                      </div>

                      <div className="flex items-end justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
                            {s.speakers.map((sp) => sp.fullName).join(', ') || 'Aucun intervenant'}
                          </p>
                          <p className="text-[10px] text-zinc-300 dark:text-zinc-600 font-mono mt-0.5">
                            {formatTime(s.startsAt)} – {formatTime(s.endsAt)}
                          </p>
                        </div>
                        {!live && (
                          <button
                            onClick={(e) => handleFavorite(e, s.id)}
                            className={`shrink-0 p-1 rounded-lg transition-colors ${
                              isFav
                                ? 'text-red-500 hover:text-red-400'
                                : 'text-zinc-300 dark:text-zinc-600 hover:text-red-400 dark:hover:text-red-400'
                            }`}
                          >
                            <HeartIcon filled={isFav} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
