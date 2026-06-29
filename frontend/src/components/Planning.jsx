'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFavorites, toggleFavorite } from '@/lib/api';

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const getDuration = (startsAt, endsAt) => {
  const mins = Math.round((new Date(endsAt) - new Date(startsAt)) / 60000);
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
};

const isSessionLive = (s) => {
  const now = new Date();
  return now >= new Date(s.startsAt) && now <= new Date(s.endsAt);
};

const initials = (name) =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

const AVATAR_COLORS = [
  'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400',
  'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-400',
  'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400',
  'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400',
];

function SpeakerStack({ speakers }) {
  if (!speakers?.length) return null;
  const visible = speakers.slice(0, 3);
  return (
    <div className="flex -space-x-1.5 shrink-0">
      {visible.map((sp, i) => (
        sp.photoUrl ? (
          <img
            key={sp.id}
            src={sp.photoUrl}
            alt={sp.fullName}
            className="w-5 h-5 rounded-full ring-1 ring-white dark:ring-zinc-900 object-cover"
          />
        ) : (
          <div
            key={sp.id}
            className={`w-5 h-5 rounded-full ring-1 ring-white dark:ring-zinc-900 flex items-center justify-center text-[7px] font-bold ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
          >
            {initials(sp.fullName)}
          </div>
        )
      ))}
    </div>
  );
}

export default function Planning({ allEvents = [], selectedEventId, cachedSessions = {}, onSelectEvent }) {
  const router = useRouter();
  const [sessionsByRoom, setSessionsByRoom] = useState({});
  const [rooms, setRooms] = useState(['Tout']);
  const [activeRoom, setActiveRoom] = useState('Tout');
  const [favorites, setFavorites] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setFavorites(getFavorites()); }, []);

  // Met à jour l'affichage depuis le cache quand l'événement sélectionné change
  useEffect(() => {
    if (!selectedEventId || !cachedSessions[selectedEventId]) return;
    setLoading(true);
    const allSessions = cachedSessions[selectedEventId];

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
    setLoading(false);
  }, [selectedEventId, cachedSessions]);

  const handleFavorite = (e, sessionId) => {
    e.stopPropagation();
    const { favorites: updated } = toggleFavorite(sessionId);
    setFavorites(updated);
  };

  const handleSelectEvent = (id) => {
    onSelectEvent?.(id);
    setActiveRoom('Tout');
  };

  const visibleRooms = activeRoom === 'Tout'
    ? Object.keys(sessionsByRoom).sort()
    : [activeRoom];

  const selectedEvent = allEvents.find(e => e.id === selectedEventId);

  return (
    <section id="planning" className="bg-zinc-100 dark:bg-[#09090b] py-12">
      <div className="max-w-7xl mx-auto px-6">

        {/* Sélecteur d'événement (si plusieurs) */}
        {allEvents.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {allEvents.map((ev) => {
              const now = new Date();
              const isActive = new Date(ev.startsAt) <= now && new Date(ev.endsAt) >= now;
              return (
                <button
                  key={ev.id}
                  onClick={() => handleSelectEvent(ev.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all duration-150 ${
                    selectedEventId === ev.id
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />}
                  {ev.title}
                </button>
              );
            })}
          </div>
        )}

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium text-[#1D9E75] dark:text-[#7c6ff7] uppercase tracking-widest mb-1.5">Programme</p>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              {selectedEvent?.title || 'Planning multi-track'}
            </h2>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
              {timeSlots.length} créneau{timeSlots.length > 1 ? 'x' : ''} · {Object.keys(sessionsByRoom).length} salle{Object.keys(sessionsByRoom).length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Filtres salles */}
          <div className="flex flex-wrap gap-1.5">
            {rooms.map((r) => (
              <button
                key={r}
                onClick={() => setActiveRoom(r)}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-150 ${
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
          <div className="grid gap-4" style={{ gridTemplateColumns: '64px repeat(2, 1fr)' }}>
            <div />
            {[0, 1].map((col) => (
              <div key={col} className="flex flex-col gap-3">
                <div className="h-9 rounded-xl skeleton" />
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-28 rounded-xl skeleton" />
                ))}
              </div>
            ))}
          </div>
        ) : visibleRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24" className="text-zinc-400">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Aucune session disponible</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Les sessions apparaîtront ici une fois ajoutées</p>
          </div>
        ) : (
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `56px repeat(${visibleRooms.length}, 1fr)` }}
          >
            {/* Colonne heures */}
            <div className="pt-11 flex flex-col gap-3">
              {timeSlots.map((slot) => (
                <div key={slot} className="h-32 flex items-start pt-2">
                  <span className="text-[11px] font-mono font-medium text-zinc-400 dark:text-zinc-600">
                    {formatTime(slot)}
                  </span>
                </div>
              ))}
            </div>

            {/* Colonnes salles */}
            {visibleRooms.map((room) => (
              <div key={room} className="flex flex-col gap-3">
                {/* Header salle */}
                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl h-9">
                  <div className="w-1.5 h-1.5 rounded-full bg-linear-to-br from-[#1D9E75] to-[#7c6ff7] shrink-0" />
                  <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider truncate">
                    {room}
                  </span>
                </div>

                {/* Session cards */}
                {(sessionsByRoom[room] || []).map((s) => {
                  const live = isSessionLive(s);
                  const isFav = favorites.includes(s.id);
                  const duration = getDuration(s.startsAt, s.endsAt);

                  return (
                    <div
                      key={s.id}
                      onClick={() => router.push(`/sessions/${s.id}`)}
                      className={`relative h-32 flex flex-col justify-between p-3.5 bg-white dark:bg-zinc-900 border rounded-xl cursor-pointer transition-all duration-150 group overflow-hidden ${
                        live
                          ? 'border-red-200 dark:border-red-900/60 shadow-md shadow-red-500/5'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-[#1D9E75]/50 dark:hover:border-[#7c6ff7]/50 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Barre live */}
                      {live && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500" />
                      )}

                      {/* Gradient hover overlay */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                        style={{ background: 'linear-gradient(135deg, rgba(29,158,117,0.03) 0%, rgba(124,111,247,0.03) 100%)' }}
                      />

                      {/* Haut */}
                      <div>
                        {live && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Live</span>
                          </div>
                        )}
                        <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100 leading-snug line-clamp-2 group-hover:text-[#1D9E75] dark:group-hover:text-[#7c6ff7] transition-colors">
                          {s.title}
                        </p>
                      </div>

                      {/* Bas */}
                      <div className="flex items-end justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {/* Avatars + noms */}
                          <div className="flex items-center gap-1.5 mb-1">
                            <SpeakerStack speakers={s.speakers} />
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate leading-tight">
                              {s.speakers?.length ? s.speakers.map((sp) => sp.fullName).join(', ') : 'Aucun intervenant'}
                            </p>
                          </div>
                          {/* Durée */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-zinc-300 dark:text-zinc-600">
                              {formatTime(s.startsAt)}
                            </span>
                            <span className="text-[10px] text-zinc-200 dark:text-zinc-700">·</span>
                            <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">
                              {duration}
                            </span>
                          </div>
                        </div>

                        {!live && (
                          <button
                            onClick={(e) => handleFavorite(e, s.id)}
                            className={`shrink-0 p-1.5 rounded-lg transition-all duration-150 ${
                              isFav
                                ? 'text-red-500 bg-red-50 dark:bg-red-950/50'
                                : 'text-zinc-300 dark:text-zinc-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50'
                            }`}
                          >
                            <svg width="13" height="13" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
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
