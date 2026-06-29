'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFavorites, removeFavorite, getSessionById } from '@/lib/api';

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

export default function Favorites() {
  const router = useRouter();
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [sessions, setSessions] = useState({});

  useEffect(() => {
    const ids = getFavorites();
    setFavoriteIds(ids);
    ids.forEach(async (id) => {
      try {
        const data = await getSessionById(id);
        const session = data.data || data;
        setSessions((prev) => ({ ...prev, [id]: session }));
      } catch {
        // session introuvable, on l'ignore
      }
    });
  }, []);

  const handleRemove = (id) => {
    const updated = removeFavorite(id);
    setFavoriteIds(updated);
  };

  return (
    <div className="px-6 py-5 bg-[#f2f4f8] dark:bg-[#0f0f13] border-t border-black/10 dark:border-white/10">
      <p className="text-[11px] font-medium text-[#6870a0] uppercase tracking-wider mb-3">
        Mon itinéraire personnel
      </p>

      {favoriteIds.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-xs text-[#6870a0] mb-1">Aucun favori pour l&apos;instant</p>
          <p className="text-[11px] text-[#c0c4dc] dark:text-[#40405a]">
            Cliquez sur ♡ dans le planning pour ajouter des sessions
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {favoriteIds.map((id) => {
            const session = sessions[id];
            return (
              <div
                key={id}
                onClick={() => router.push(`/sessions/${id}`)}
                className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#181820] border border-black/10 dark:border-white/10 rounded-xl cursor-pointer hover:border-[#7c6ff7] transition-colors"
              >
                <div className="text-[11px] text-[#1D9E75] dark:text-[#7c6ff7] font-medium min-w-10.5">
                  {session ? formatTime(session.startsAt) : '…'}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-[#1a1c28] dark:text-[#f2f2f8]">
                    {session?.title || 'Chargement…'}
                  </div>
                  <div className="text-[11px] text-[#6870a0] mt-0.5">
                    {session?.room?.name || 'Sans salle'}
                    {session?.speakers?.length
                      ? ` · ${session.speakers.map((s) => s.fullName).join(', ')}`
                      : ''}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(id); }}
                  className="text-[#D85A30] dark:text-[#f07060] text-base hover:scale-110 transition-transform shrink-0"
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
