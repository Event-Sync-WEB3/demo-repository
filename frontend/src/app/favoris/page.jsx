'use client';

import { useEffect, useState } from 'react';
import { getFavorites, removeFavorite, getSessionById } from '@/lib/api';

export default function FavorisPage() {
  const [favorites, setFavorites] = useState([]);
  const [sessions, setSessions] = useState({});

  useEffect(() => {
    const favs = getFavorites();
    setFavorites(favs);

    // Récupère les détails de chaque session
    favs.forEach(async (id) => {
      try {
        const data = await getSessionById(id);
        const session = data.data || data;
        setSessions(prev => ({ ...prev, [id]: session }));
      } catch (err) {
        console.error(err);
      }
    });
  }, []);

  const handleRemove = (id) => {
    const updated = removeFavorite(id);
    setFavorites(updated);
  };

  return (
    <div className="px-6 py-5 bg-[#f2f4f8] dark:bg-[#0f0f13] min-h-screen">
      <h1 className="text-xl font-semibold text-[#1a1c28] dark:text-[#f2f2f8] mb-4">
        Mon itinéraire personnel
      </h1>

      {favorites.length === 0 ? (
        <div className="bg-white dark:bg-[#181820] border border-black/10 dark:border-white/10 rounded-2xl p-8 text-center">
          <p className="text-sm text-[#6870a0] mb-2">Aucun favori pour l&apos;instant</p>
          <p className="text-xs text-[#c0c4dc] dark:text-[#40405a]">
            Cliquez sur ♡ dans le planning pour ajouter des sessions
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {favorites.map((id) => {
            const session = sessions[id];
            return (
              <div
                key={id}
                className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#181820] border border-black/10 dark:border-white/10 rounded-xl"
              >
                <div className="text-[11px] text-[#1D9E75] dark:text-[#7c6ff7] font-medium min-w-[42px]">
                  {session ? new Date(session.startsAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '...'}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-[#1a1c28] dark:text-[#f2f2f8]">
                    {session?.title || 'Chargement...'}
                  </div>
                  <div className="text-[11px] text-[#6870a0] mt-0.5">
                    {session?.room?.name || 'Sans salle'} · {session?.speakers?.map(s => s.fullName).join(', ') || ''}
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(id)}
                  className="text-[#D85A30] dark:text-[#f07060] text-base hover:scale-110 transition-transform"
                >
                  ♥
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}