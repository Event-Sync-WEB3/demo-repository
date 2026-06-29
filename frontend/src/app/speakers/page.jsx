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

const PLATFORM_ICONS = {
  twitter: 'X',
  linkedin: 'in',
  github: 'GH',
  youtube: 'YT',
  website: '↗',
  other: '↗',
};

export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSpeakers()
      .then((data) => setSpeakers(Array.isArray(data) ? data : (data.data || [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-[#09090b]">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* En-tête */}
        <div className="mb-8">
          <p className="text-xs font-medium text-[#1D9E75] dark:text-[#7c6ff7] uppercase tracking-widest mb-2">Intervenants</p>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Les speakers de l&apos;événement
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
            Experts et professionnels qui animent les sessions
          </p>
        </div>

        {/* Grille */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl h-40 animate-pulse" />
            ))}
          </div>
        ) : speakers.length === 0 ? (
          <div className="py-20 text-center text-zinc-400 text-sm">Aucun intervenant pour le moment.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {speakers.map((s, i) => {
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <Link href={`/speakers/${s.slug}`} key={s.id}>
                  <div className="group flex gap-4 p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-[#1D9E75]/40 dark:hover:border-[#7c6ff7]/40 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer h-full">

                    {/* Avatar */}
                    {s.photoUrl ? (
                      <img
                        src={s.photoUrl}
                        alt={s.fullName}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0 ring-1 ring-black/5"
                      />
                    ) : (
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-base font-bold shrink-0 ${color.bg} ${color.text}`}>
                        {initials(s.fullName)}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-[#1D9E75] dark:group-hover:text-[#7c6ff7] transition-colors mb-0.5">
                        {s.fullName}
                      </p>
                      {s.bio && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 line-clamp-2 mb-2">
                          {s.bio}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1D9E75] dark:text-[#7c6ff7]">
                          {s._count?.sessions ?? 0} session{(s._count?.sessions ?? 0) > 1 ? 's' : ''}
                        </span>
                        {s.links?.length > 0 && (
                          <div className="flex gap-1">
                            {s.links.slice(0, 3).map((link) => (
                              <span
                                key={link.id}
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                              >
                                {PLATFORM_ICONS[link.platform] ?? '↗'}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
