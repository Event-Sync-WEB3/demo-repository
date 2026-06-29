'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getFavorites, removeFavorite, getSessionById } from '@/lib/api';

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

const isLive = (session) => {
  const now = new Date();
  return now >= new Date(session.startsAt) && now <= new Date(session.endsAt);
};

const isPast = (session) => new Date() > new Date(session.endsAt);

const initials = (name) =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export default function FavorisPage() {
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

  const liveSessions = favoriteIds.filter((id) => sessions[id] && isLive(sessions[id]));

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-[#09090b]">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* En-tête */}
        <div className="mb-8">
          <p className="text-xs font-medium text-[#1D9E75] dark:text-[#7c6ff7] uppercase tracking-widest mb-2">Itinéraire</p>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Mes favoris</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
            Vos sessions sélectionnées pour la journée
          </p>
        </div>

        {/* Stats rapides */}
        {favoriteIds.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{favoriteIds.length}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">session{favoriteIds.length > 1 ? 's' : ''}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-red-500">{liveSessions.length}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">en direct</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                {favoriteIds.filter((id) => sessions[id] && isPast(sessions[id])).length}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">terminée{favoriteIds.filter((id) => sessions[id] && isPast(sessions[id])).length > 1 ? 's' : ''}</p>
            </div>
          </div>
        )}

        {/* Liste */}
        {favoriteIds.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-zinc-400">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Aucun favori pour l&apos;instant</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-5">
              Cliquez sur ♡ dans le planning pour ajouter des sessions
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Voir le planning
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {favoriteIds.map((id) => {
              const session = sessions[id];
              const live = session ? isLive(session) : false;
              const past = session ? isPast(session) : false;
              return (
                <div
                  key={id}
                  onClick={() => router.push(`/sessions/${id}`)}
                  className={`group bg-white dark:bg-zinc-900 border rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 transition-all duration-150 ${
                    live
                      ? 'border-red-200 dark:border-red-900/50'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-[#1D9E75]/40 dark:hover:border-[#7c6ff7]/40'
                  }`}
                >
                  <div className="flex gap-0">
                    {/* Barre latérale */}
                    <div className={`w-1 shrink-0 ${live ? 'bg-red-500' : past ? 'bg-zinc-200 dark:bg-zinc-700' : 'bg-[#1D9E75] dark:bg-[#7c6ff7]'}`} />

                    <div className="flex-1 flex items-start gap-4 px-5 py-4">
                      {/* Horaire */}
                      <div className="shrink-0 text-center min-w-10">
                        <p className="text-xs font-mono font-semibold text-[#1D9E75] dark:text-[#7c6ff7] tabular-nums">
                          {session ? formatTime(session.startsAt) : '…'}
                        </p>
                        {session && (
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                            {formatTime(session.endsAt)}
                          </p>
                        )}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {live && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse" />}
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate group-hover:text-[#1D9E75] dark:group-hover:text-[#7c6ff7] transition-colors">
                            {session?.title ?? 'Chargement…'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          {session?.room?.name && (
                            <span className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
                              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                              </svg>
                              {session.room.name}
                            </span>
                          )}
                          {session?.speakers?.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <div className="flex -space-x-1.5">
                                {session.speakers.slice(0, 3).map((sp) => (
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
                                      className="w-5 h-5 rounded-full ring-1 ring-white dark:ring-zinc-900 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[8px] font-bold"
                                    >
                                      {initials(sp.fullName)}
                                    </div>
                                  )
                                ))}
                              </div>
                              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                {session.speakers.map((sp) => sp.fullName).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                        {session && (
                          <p className="text-[10px] text-zinc-300 dark:text-zinc-600 capitalize mt-1">
                            {formatDate(session.startsAt)}
                          </p>
                        )}
                      </div>

                      {/* Bouton supprimer */}
                      <button
                        onClick={(e) => handleRemove(e, id)}
                        className="shrink-0 p-1.5 rounded-lg text-zinc-300 dark:text-zinc-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-all mt-0.5"
                        title="Retirer des favoris"
                      >
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* CTA planning */}
            <Link
              href="/"
              className="flex items-center justify-center gap-1.5 py-3 text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              + Ajouter d&apos;autres sessions depuis le planning
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
