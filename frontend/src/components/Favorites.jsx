'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getFavorites, removeFavorite, getSessionById } from '@/lib/api';

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const isLive = (session) => {
  const now = new Date();
  return now >= new Date(session.startsAt) && now <= new Date(session.endsAt);
};

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
        const s = data.data || data;
        setSessions((prev) => ({ ...prev, [id]: s }));
      } catch {
        // session introuvable
      }
    });
  }, []);

  const handleRemove = (e, id) => {
    e.stopPropagation();
    const updated = removeFavorite(id);
    setFavoriteIds(updated);
  };

  return (
    <section className="bg-zinc-100 dark:bg-[#09090b] border-t border-zinc-200 dark:border-zinc-800 py-10">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Mon itinéraire</h2>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">Vos sessions sélectionnées</p>
          </div>
          {favoriteIds.length > 0 && (
            <Link href="/favoris" className="text-xs font-medium text-[#1D9E75] dark:text-[#7c6ff7] hover:underline">
              Voir tout →
            </Link>
          )}
        </div>

        {favoriteIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-zinc-400">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Aucun favori pour l&apos;instant</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              Cliquez sur ♡ dans le planning pour ajouter des sessions
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {favoriteIds.slice(0, 5).map((id) => {
              const session = sessions[id];
              const live = session ? isLive(session) : false;
              return (
                <div
                  key={id}
                  onClick={() => router.push(`/sessions/${id}`)}
                  className="group flex items-center gap-4 px-4 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer hover:border-[#1D9E75]/40 dark:hover:border-[#7c6ff7]/40 hover:shadow-sm transition-all duration-150"
                >
                  <div className="text-xs font-mono font-medium text-[#1D9E75] dark:text-[#7c6ff7] min-w-11 tabular-nums">
                    {session ? formatTime(session.startsAt) : '…'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {live && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse" />}
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate group-hover:text-[#1D9E75] dark:group-hover:text-[#7c6ff7] transition-colors">
                        {session?.title ?? 'Chargement…'}
                      </p>
                    </div>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">
                      {session?.room?.name ?? 'Sans salle'}
                      {session?.speakers?.length ? ` · ${session.speakers.map((sp) => sp.fullName).join(', ')}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleRemove(e, id)}
                    className="shrink-0 p-1.5 rounded-lg text-zinc-300 dark:text-zinc-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
                    title="Retirer des favoris"
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>
              );
            })}
            {favoriteIds.length > 5 && (
              <Link
                href="/favoris"
                className="flex items-center justify-center py-3 text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                +{favoriteIds.length - 5} autres sessions →
              </Link>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
