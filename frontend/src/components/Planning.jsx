'use client';

import { useState, useEffect } from 'react';
import { getEvents, getSessions, getFavorites, toggleFavorite } from '@/lib/api';

export default function Planning() {
  const [sessions, setSessions] = useState([]);
  const [activeRoom, setActiveRoom] = useState('Tout');
  const [roomList, setRoomList] = useState(['Tout']);
  const [loading, setLoading] = useState(true);
  const [favs, setFavs] = useState([]);

  useEffect(() => {
    setFavs(getFavorites());
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const eventsData = await getEvents();
        const events = eventsData.data || eventsData;
        if (!events.length) return;

        const eventId = events[0].id;
        const sessionsData = await getSessions(eventId);
        const sess = sessionsData.data || sessionsData;
        setSessions(sess);

        const uniqueRooms = [...new Set(sess.map(s => s.room?.name).filter(Boolean))];
        setRoomList(['Tout', ...uniqueRooms]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleFav = (sessionId) => {
    const { favorites } = toggleFavorite(sessionId);
    setFavs(favorites);
  };

  const visibleSessions = activeRoom === 'Tout'
    ? sessions
    : sessions.filter(s => s.room?.name === activeRoom);

  const sessionsByRoom = visibleSessions.reduce((acc, s) => {
    const roomName = s.room?.name || 'Sans salle';
    if (!acc[roomName]) acc[roomName] = [];
    acc[roomName].push(s);
    return acc;
  }, {});

  const roomNames = Object.keys(sessionsByRoom);

  if (loading) return (
    <div className="px-6 py-5 text-xs text-[#6870a0]">Chargement du planning...</div>
  );

  return (
    <div className="px-6 py-5 bg-[#f2f4f8] dark:bg-[#0f0f13]">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-[#1a1c28] dark:text-[#f2f2f8]">
          Planning multi-track
        </h2>
        <div className="flex gap-1">
          {roomList.map((r) => (
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

      {/* Sessions */}
      {sessions.length === 0 ? (
        <p className="text-xs text-[#6870a0]">Aucune session disponible.</p>
      ) : (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${Math.max(roomNames.length, 1)}, 1fr)` }}
        >
          {roomNames.map((room) => (
            <div key={room}>
              <div className="text-[10px] font-medium text-[#6870a0] px-2 py-1 bg-[#e8eaf2] dark:bg-[#1c1c24] rounded-md text-center mb-2">
                {room}
              </div>
              {sessionsByRoom[room].map((s) => (
                <div
                  key={s.id}
                  className={`bg-white dark:bg-[#181820] border border-black/10 dark:border-white/10 rounded-[10px] p-3 mb-2 cursor-pointer hover:border-[#7c6ff7] hover:-translate-y-px transition-all ${
                    s.isLive ? 'border-l-2 border-l-[#D85A30] dark:border-l-[#f07060] rounded-l-none' : ''
                  }`}
                >
                  <div className="text-[11px] font-medium text-[#1a1c28] dark:text-[#f2f2f8] mb-2 leading-snug">
                    {s.title}
                  </div>
                  <div className="text-[10px] text-[#6870a0] mb-2">
                    {new Date(s.startsAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    {' — '}
                    {new Date(s.endsAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      {s.speakers?.map((sp) => (
                        <span key={sp.id} className="text-[10px] text-[#6870a0]">{sp.fullName}</span>
                      ))}
                    </div>
                    {s.isLive ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#f0706018] text-[#D85A30] dark:text-[#f07060]">
                        Live
                      </span>
                    ) : (
                      <button
                        onClick={() => handleFav(s.id)}
                        className={`transition-colors text-sm ${
                          favs.includes(s.id)
                            ? 'text-[#D85A30] dark:text-[#f07060]'
                            : 'text-[#c0c4dc] dark:text-[#40405a] hover:text-[#D85A30]'
                        }`}
                      >
                        {favs.includes(s.id) ? '♥' : '♡'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}