'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSessions, getFavorites, toggleFavorite } from '@/lib/api';

const borderColor = {
  live: 'border-l-2 border-l-[#D85A30] dark:border-l-[#f07060]',
  default: '',
};

export default function Planning() {
  const [sessions, setSessions] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState('Tout');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSessions();
        setSessions(data);
        const uniqueRooms = [...new Set(data.map(s => s.room?.name).filter(Boolean))];
        setRooms(uniqueRooms);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const visibleRooms = activeRoom === 'Tout' ? rooms : [activeRoom];

  const getSessionsByRoom = (roomName) => {
    return sessions.filter(s => s.room?.name === roomName);
  };

  const handleToggleFavorite = (sessionId) => {
    const result = toggleFavorite(sessionId);
    setFavorites(result.favorites);
  };

  const isSessionLive = (session) => {
    const now = new Date();
    return now >= new Date(session.startsAt) && now <= new Date(session.endsAt);
  };

  if (loading) {
    return (
      <div className="px-6 py-5 text-center text-xs text-[#6870a0]">
        Chargement du planning...
      </div>
    );
  }

  const allRooms = ['Tout', ...rooms];

  return (
    <div className="px-6 py-5 bg-[#f2f4f8] dark:bg-[#0f0f13]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-[#1a1c28] dark:text-[#f2f2f8]">
          Planning multi-track
        </h2>
        <div className="flex gap-1">
          {allRooms.map((r) => (
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

      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${visibleRooms.length}, 1fr)` }}>
        {visibleRooms.map((room) => (
          <div key={room}>
            <div className="text-[10px] font-medium text-[#6870a0] px-2 py-1 bg-[#e8eaf2] dark:bg-[#1c1c24] rounded-md text-center mb-2">
              {room}
            </div>
            {getSessionsByRoom(room).map((s) => {
              const live = isSessionLive(s);
              const isFav = favorites.includes(s.id);
              return (
                <Link href={`/sessions/${s.id}`} key={s.id}>
                  <div
                    className={`bg-white dark:bg-[#181820] border border-black/10 dark:border-white/10 rounded-[10px] p-3 mb-2 flex flex-col gap-1 cursor-pointer hover:border-[#7c6ff7] hover:-translate-y-px transition-all ${
                      live ? `rounded-l-none ${borderColor.live}` : ''
                    }`}
                  >
                    <div className="text-[11px] font-medium leading-snug text-[#1a1c28] dark:text-[#f2f2f8]">
                      {s.title}
                    </div>
                    <div className="text-[10px] text-[#6870a0]">
                      {new Date(s.startsAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {new Date(s.endsAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#6870a0]">
                        {s.speakers?.map(sp => sp.fullName).join(', ')}
                      </span>
                      <div className="flex items-center gap-2">
                        {live && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#f0706018] text-[#D85A30] dark:text-[#f07060]">
                            Live
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleToggleFavorite(s.id);
                          }}
                          className={`transition-colors text-sm ${
                            isFav ? 'text-[#D85A30]' : 'text-[#c0c4dc] dark:text-[#40405a] hover:text-[#D85A30]'
                          }`}
                        >
                          {isFav ? '♥' : '♡'}
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}