'use client';

import Link from 'next/link';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export default function Hero({ event, stats = {} }) {
  const isLive = event ? (() => {
    const now = new Date();
    return now >= new Date(event.startsAt) && now <= new Date(event.endsAt);
  })() : false;

  const titleWords = (event?.title || 'EventSync').split(' ');
  const titleStart = titleWords.slice(0, -1).join(' ');
  const titleEnd   = titleWords.slice(-1)[0];

  return (
    <section className="relative overflow-hidden bg-white dark:bg-[#09090b] border-b border-zinc-100 dark:border-zinc-900">

      {/* Gradient blobs */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute -top-48 -left-24 w-[650px] h-[550px] bg-[#1D9E75] rounded-full blur-[160px] opacity-[0.07] dark:opacity-[0.14]" />
        <div className="absolute -top-16 right-0 w-[550px] h-[450px] bg-[#7c6ff7] rounded-full blur-[140px] opacity-[0.07] dark:opacity-[0.14]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-gradient-to-r from-[#1D9E75] to-[#7c6ff7] blur-[100px] opacity-[0.04] dark:opacity-[0.06]" />
        <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.045]"
          style={{ backgroundImage: 'radial-gradient(#71717a 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-28">
        <div className="flex flex-col lg:flex-row gap-14 items-start lg:items-center justify-between">

          {/* Contenu gauche */}
          <div className="flex-1 max-w-2xl">

            {/* Badge */}
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 border ${
              isLive
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'
            }`}>
              <span className="relative flex w-2 h-2 shrink-0">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? 'animate-ping bg-emerald-500' : 'bg-zinc-400'}`} />
                <span className={`relative inline-flex rounded-full w-2 h-2 ${isLive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
              </span>
              {isLive ? 'Événement en cours' : 'Événement à venir'}
            </div>

            {/* Titre */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-zinc-900 dark:text-white mb-5">
              {titleStart && <>{titleStart}<br /></>}
              <span className="gradient-text">{titleEnd}</span>
            </h1>

            {event?.description && (
              <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6 max-w-xl">
                {event.description}
              </p>
            )}

            {/* Métadonnées */}
            <div className="flex flex-wrap items-center gap-2.5 mb-9">
              {event?.startsAt && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {formatDate(event.startsAt)}
                </div>
              )}
              {event?.location && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {event.location}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/#planning"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#7c6ff7]/25 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #1D9E75 0%, #7c6ff7 100%)' }}
              >
                Voir le planning
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="group-hover:translate-x-0.5 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link
                href="/favoris"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                Mon itinéraire
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-row lg:flex-col gap-3 shrink-0 w-full lg:w-auto">
            {[
              {
                val: stats.sessions, label: 'Sessions',
                color: 'text-[#1D9E75]', bg: 'bg-emerald-50 dark:bg-emerald-950/50',
                icon: (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                ),
              },
              {
                val: stats.speakers, label: 'Intervenants',
                color: 'text-[#7c6ff7]', bg: 'bg-violet-50 dark:bg-violet-950/50',
                icon: (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                ),
              },
              {
                val: stats.rooms, label: 'Salles actives',
                color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/50',
                icon: (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                ),
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex-1 lg:flex-none flex items-center gap-4 px-5 py-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl lg:min-w-[210px] hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-sm transition-all duration-150"
              >
                <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white tabular-nums leading-none">
                    {s.val ?? <span className="text-zinc-300 dark:text-zinc-700 text-xl">—</span>}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
