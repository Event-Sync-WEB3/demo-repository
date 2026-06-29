'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSpeakers } from '@/lib/api';

const AVATAR_COLORS = [
  { bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-400', ring: 'ring-emerald-200 dark:ring-emerald-900' },
  { bg: 'bg-violet-100 dark:bg-violet-950',   text: 'text-violet-700 dark:text-violet-400',   ring: 'ring-violet-200 dark:ring-violet-900' },
  { bg: 'bg-amber-100 dark:bg-amber-950',     text: 'text-amber-700 dark:text-amber-400',     ring: 'ring-amber-200 dark:ring-amber-900' },
  { bg: 'bg-sky-100 dark:bg-sky-950',         text: 'text-sky-700 dark:text-sky-400',         ring: 'ring-sky-200 dark:ring-sky-900' },
];

const initials = (name) =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export default function SpeakersList() {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSpeakers()
      .then((data) => setSpeakers(Array.isArray(data) ? data : (data.data || [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="speakers" className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 py-12">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-medium text-[#1D9E75] dark:text-[#7c6ff7] uppercase tracking-widest mb-1.5">Speakers</p>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Intervenants</h2>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
              {loading ? '—' : `${speakers.length} expert${speakers.length > 1 ? 's' : ''} confirmé${speakers.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <Link
            href="/speakers"
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            Voir tous
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-2xl skeleton" />
            ))}
          </div>
        ) : speakers.length === 0 ? (
          <div className="py-14 text-center text-sm text-zinc-400">Aucun intervenant pour le moment.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {speakers.map((s, i) => {
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <Link href={`/speakers/${s.slug}`} key={s.id} className="group">
                  <div className="relative flex flex-col items-center text-center p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-transparent hover:shadow-xl hover:shadow-black/8 hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden">

                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{ background: 'linear-gradient(160deg, rgba(29,158,117,0.06) 0%, rgba(124,111,247,0.06) 100%)' }}
                    />

                    {/* Avatar */}
                    {s.photoUrl ? (
                      <img
                        src={s.photoUrl}
                        alt={s.fullName}
                        className={`relative w-14 h-14 rounded-full object-cover mb-3 ring-2 ${color.ring} group-hover:ring-[#1D9E75]/50 dark:group-hover:ring-[#7c6ff7]/50 transition-all duration-200`}
                      />
                    ) : (
                      <div className={`relative w-14 h-14 rounded-full flex items-center justify-center text-base font-bold mb-3 ring-2 ${color.ring} ${color.bg} ${color.text} group-hover:ring-[#1D9E75]/50 dark:group-hover:ring-[#7c6ff7]/50 transition-all duration-200`}>
                        {initials(s.fullName)}
                      </div>
                    )}

                    <p className="relative text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-0.5 line-clamp-1 group-hover:text-[#1D9E75] dark:group-hover:text-[#7c6ff7] transition-colors duration-200">
                      {s.fullName}
                    </p>
                    {s.bio && (
                      <p className="relative text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-1 mb-2.5">
                        {s.bio}
                      </p>
                    )}
                    <span className="relative inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-[#1D9E75]/10 dark:group-hover:bg-[#7c6ff7]/10 group-hover:text-[#1D9E75] dark:group-hover:text-[#7c6ff7] transition-all duration-200">
                      {s._count?.sessions ?? 0} session{(s._count?.sessions ?? 0) > 1 ? 's' : ''}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
