'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSessionById, getFavorites, toggleFavorite } from '@/lib/api';
import QASection from '@/components/QASection';

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

const initials = (name) =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export default function SessionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSessionById(id);
        const s = data.data || data;
        setSession(s);
        setIsFav(getFavorites().includes(id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const handleFavorite = () => {
    const { isFavorite: nowFav } = toggleFavorite(id);
    setIsFav(nowFav);
  };

  const isLive = (s) => {
    const now = new Date();
    return now >= new Date(s.startsAt) && now <= new Date(s.endsAt);
  };

  const isPast = (s) => new Date() > new Date(s.endsAt);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-[#09090b] flex items-center justify-center">
        <div className="text-zinc-400 text-sm">Chargement…</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-[#09090b] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 text-sm font-medium">Session introuvable</p>
          <button onClick={() => router.back()} className="mt-3 text-xs text-[#1D9E75] dark:text-[#7c6ff7] hover:underline">
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  const live = isLive(session);
  const past = isPast(session);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-[#09090b]">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Retour */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 mb-6 transition-colors"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Retour au planning
        </button>

        {/* Carte principale */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden mb-4">
          <div className="p-8">

            {/* En-tête */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#1D9E75] dark:text-[#7c6ff7] uppercase tracking-widest mb-2">Session</p>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight leading-snug">
                  {session.title}
                </h1>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 pt-1">
                {live && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Live
                  </span>
                )}
                <button
                  onClick={handleFavorite}
                  title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  className={`p-2 rounded-xl transition-all ${
                    isFav
                      ? 'text-red-500 bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900'
                      : 'text-zinc-300 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950'
                  }`}
                >
                  <svg width="16" height="16" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
            </div>

            {session.description && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                {session.description}
              </p>
            )}

            {/* Métadonnées */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-zinc-400">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Horaire</span>
                </div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  {formatTime(session.startsAt)} – {formatTime(session.endsAt)}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 capitalize mt-0.5">
                  {formatDate(session.startsAt)}
                </p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-zinc-400">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Salle</span>
                </div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  {session.room?.name || 'Non définie'}
                </p>
                {session.capacity && (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {session.capacity} places
                  </p>
                )}
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-zinc-400">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Intervenants</span>
                </div>
                {session.speakers?.length > 0 ? (
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    {session.speakers.length} speaker{session.speakers.length > 1 ? 's' : ''}
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-zinc-400">—</p>
                )}
              </div>
            </div>
          </div>

          {/* Speakers détail */}
          {session.speakers?.length > 0 && (
            <div className="border-t border-zinc-100 dark:border-zinc-800 px-8 py-5">
              <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                Intervenants
              </p>
              <div className="flex flex-wrap gap-2">
                {session.speakers.map((speaker) => (
                  <Link
                    key={speaker.id}
                    href={`/speakers/${speaker.slug}`}
                    className="group inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 hover:border-[#1D9E75]/40 dark:hover:border-[#7c6ff7]/40 hover:shadow-sm transition-all duration-150"
                  >
                    {speaker.photoUrl ? (
                      <img
                        src={speaker.photoUrl}
                        alt={speaker.fullName}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-black/5"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[9px] font-bold">
                        {initials(speaker.fullName)}
                      </div>
                    )}
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 group-hover:text-[#1D9E75] dark:group-hover:text-[#7c6ff7] transition-colors">
                      {speaker.fullName}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section Q&A */}
        {live ? (
          <QASection session={session} />
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-zinc-400">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {past ? 'Cette session est terminée.' : 'Les questions seront disponibles au début de la session.'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
