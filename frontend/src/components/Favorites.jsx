'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getFavorites, removeFavorite } from '@/lib/api';

export default function Favorites({ sessions = [] }) {
  const [favIds, setFavIds] = useState([]);

  useEffect(() => {
    setFavIds(getFavorites());
  }, []);

  const favSessions = sessions.filter(s => favIds.includes(s.id));

  const handleRemove = (id) => {
    removeFavorite(id);
    setFavIds(getFavorites());
  };

  return (
    <div className="px-6 py-5 bg-[#f2f4f8] dark:bg-[#0f0f13] border-t border-black/10 dark:border-white/10">
      <p className="text-[11px] font-medium text-[#6870a0] uppercase tracking-wider mb-3">
        Mon itinéraire personnel
      </p>
      <div className="flex flex-col gap-1.5">
        {favSessions.length === 0 && (
          <p className="text-xs text-[#6870a0] py-4 text-center">
            Aucun favori pour l'instant — cliquez sur ♡ dans le planning !
          </p>
        )}
        {favSessions.map((s) => (
          <Link href={`/sessions/${s.id}`} key={s.id}>
            <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#181820] border border-black/10 dark:border-white/10 rounded-xl transition-colors hover:border-[#7c6ff7]">
              <div className="text-[11px] text-[#1D9E75] dark:text-[#7c6ff7] font-medium min-w-[42px]">
                {new Date(s.startsAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium text-[#1a1c28] dark:text-[#f2f2f8]">{s.title}</div>
                <div className="text-[11px] text-[#6870a0] mt-0.5">
                  {s.room?.name} · {s.speakers?.map(sp => sp.fullName).join(', ')}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleRemove(s.id);
                }}
                className="text-[#D85A30] dark:text-[#f07060] text-base hover:scale-110 transition-transform"
              >
                ♥
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}