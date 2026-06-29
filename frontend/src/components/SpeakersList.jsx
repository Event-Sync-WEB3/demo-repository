'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSpeakers } from '@/lib/api';

const AVATAR_COLORS = [
  { bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-400' },
  { bg: 'bg-violet-100 dark:bg-violet-950', text: 'text-violet-700 dark:text-violet-400' },
  { bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-400' },
  { bg: 'bg-sky-100 dark:bg-sky-950', text: 'text-sky-700 dark:text-sky-400' },
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
    <section id="speakers" className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 py-10">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Intervenants</h2>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
              {loading ? '…' : `${speakers.length} intervenant${speakers.length > 1 ? 's' : ''} confirmé${speakers.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <Link
            href="/speakers"
            className="text-xs font-medium text-[#1D9E75] dark:text-[#7c6ff7] hover:underline"
          >
            Voir tous →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl h-28 animate-pulse" />
            ))}
          </div>
        ) : speakers.length === 0 ? (
          <div className="py-12 text-center text-sm text-zinc-400">Aucun intervenant pour le moment.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {speakers.map((s, i) => {
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <Link href={`/speakers/${s.slug}`} key={s.id}>
                  <div className="group flex flex-col items-center text-center p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-[#1D9E75]/40 dark:hover:border-[#7c6ff7]/40 hover:shadow-md hover:shadow-black/5 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer">

                    {/* Avatar */}
                    {s.photoUrl ? (
                      <img
                        src={s.photoUrl}
                        alt={s.fullName}
                        className="w-14 h-14 rounded-full object-cover mb-3 ring-2 ring-zinc-200 dark:ring-zinc-700 group-hover:ring-[#1D9E75]/40 dark:group-hover:ring-[#7c6ff7]/40 transition-all"
                      />
                    ) : (
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-base font-semibold mb-3 ${color.bg} ${color.text} ring-2 ring-zinc-200 dark:ring-zinc-700 group-hover:ring-[#1D9E75]/40 dark:group-hover:ring-[#7c6ff7]/40 transition-all`}>
                        {initials(s.fullName)}
                      </div>
                    )}

                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-1 line-clamp-1">
                      {s.fullName}
                    </p>
                    {s.bio && (
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-1 mb-2">
                        {s.bio}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1D9E75] dark:text-[#7c6ff7]">
                      <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
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
