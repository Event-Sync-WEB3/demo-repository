'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSessionById, getFavorites, toggleFavorite } from '@/lib/api';
import QASection from '@/components/QASection';

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

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
      <div className="flex items-center justify-center h-40 text-[#6870a0] text-sm">
        Chargement…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-40 text-[#6870a0] text-sm">
        Session introuvable.
      </div>
    );
  }

  const live = isLive(session);

  return (
    <div className="px-6 py-5 bg-[#f2f4f8] dark:bg-[#0f0f13] min-h-screen">

      {/* Retour */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs text-[#6870a0] hover:text-[#1a1c28] dark:hover:text-[#f2f2f8] mb-4 transition-colors"
      >
        ← Retour
      </button>

      {/* Carte principale */}
      <div className="bg-white dark:bg-[#181820] border border-black/10 dark:border-white/10 rounded-2xl p-5 mb-4">

        {/* En-tête */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="text-[10px] text-[#1D9E75] dark:text-[#7c6ff7] uppercase tracking-widest mb-2 font-medium">
              Session
            </div>
            <h1 className="text-lg font-semibold text-[#1a1c28] dark:text-[#f2f2f8] leading-snug">
              {session.title}
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {live && (
              <div className="flex items-center gap-1.5 text-[11px] text-[#D85A30] dark:text-[#f07060]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D85A30] animate-pulse" />
                Live
              </div>
            )}
            <button
              onClick={handleFavorite}
              title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              className={`text-lg transition-colors ${
                isFav
                  ? 'text-[#D85A30] dark:text-[#f07060]'
                  : 'text-[#c0c4dc] dark:text-[#40405a] hover:text-[#D85A30]'
              }`}
            >
              {isFav ? '♥' : '♡'}
            </button>
          </div>
        </div>

        {session.description && (
          <p className="text-xs text-[#6870a0] leading-relaxed mb-4">{session.description}</p>
        )}

        {/* Infos */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-[#e8eaf2] dark:bg-[#1c1c24] rounded-xl p-3">
            <div className="text-[10px] text-[#6870a0] uppercase tracking-wider mb-1">Horaire</div>
            <div className="text-xs font-medium text-[#1a1c28] dark:text-[#f2f2f8]">
              {formatTime(session.startsAt)} – {formatTime(session.endsAt)}
            </div>
            <div className="text-[10px] text-[#6870a0] capitalize mt-0.5">
              {formatDate(session.startsAt)}
            </div>
          </div>
          <div className="bg-[#e8eaf2] dark:bg-[#1c1c24] rounded-xl p-3">
            <div className="text-[10px] text-[#6870a0] uppercase tracking-wider mb-1">Salle</div>
            <div className="text-xs font-medium text-[#1a1c28] dark:text-[#f2f2f8]">
              {session.room?.name || 'Non définie'}
            </div>
            {session.capacity && (
              <div className="text-[10px] text-[#6870a0] mt-0.5">
                Capacité : {session.capacity} pers.
              </div>
            )}
          </div>
        </div>

        {/* Intervenants */}
        {session.speakers?.length > 0 && (
          <div>
            <div className="text-[10px] text-[#6870a0] uppercase tracking-wider mb-2">
              Intervenants
            </div>
            <div className="flex flex-wrap gap-2">
              {session.speakers.map((speaker) => (
                <Link
                  key={speaker.id}
                  href={`/speakers/${speaker.slug}`}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#e8eaf2] dark:bg-[#1c1c24] rounded-lg hover:bg-[#EEEDFE] dark:hover:bg-[#7c6ff720] transition-colors"
                >
                  {speaker.photoUrl ? (
                    <img
                      src={speaker.photoUrl}
                      alt={speaker.fullName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#E1F5EE] text-[#085041] flex items-center justify-center text-[9px] font-medium">
                      {speaker.fullName
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs text-[#1a1c28] dark:text-[#f2f2f8]">
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
        <div className="bg-white dark:bg-[#181820] border border-black/10 dark:border-white/10 rounded-2xl p-5 text-center">
          <p className="text-xs text-[#6870a0]">
            {isPast(session)
              ? 'Cette session est terminée.'
              : 'Les questions seront disponibles au début de la session.'}
          </p>
        </div>
      )}
    </div>
  );
}
