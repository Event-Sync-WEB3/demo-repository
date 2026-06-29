'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getEvents, getSessions, getSpeakers } from '@/lib/api';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export default function Hero() {
  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState({ sessions: null, speakers: null, rooms: null });

  useEffect(() => {
    async function load() {
      try {
        const eventsData = await getEvents();
        const events = Array.isArray(eventsData) ? eventsData : (eventsData.data || []);
        if (!events.length) return;
        const ev = events[0];
        setEvent(ev);

        const [sessionsRaw, speakersRaw] = await Promise.all([
          getSessions(ev.id),
          getSpeakers(ev.id),
        ]);
        const sessions = Array.isArray(sessionsRaw) ? sessionsRaw : (sessionsRaw.data || []);
        const speakers = Array.isArray(speakersRaw) ? speakersRaw : (speakersRaw.data || []);
        const uniqueRooms = new Set(sessions.filter((s) => s.room).map((s) => s.room.id));

        setStats({ sessions: sessions.length, speakers: speakers.length, rooms: uniqueRooms.size });
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  return (
    <section className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex flex-col lg:flex-row lg:items-start gap-12">

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Événement en cours
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white leading-[1.1] tracking-tight mb-4">
              {event?.title ?? 'EventSync Conference'}
            </h1>

            {event?.description && (
              <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed mb-6 max-w-xl">
                {event.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-zinc-500 dark:text-zinc-400">
              {event?.startsAt && (
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{formatDate(event.startsAt)}</span>
                </span>
              )}
              {event?.location && (
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{event.location}</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/#planning"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D9E75] dark:bg-[#7c6ff7] text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[#1D9E75]/25 dark:shadow-[#7c6ff7]/25"
              >
                Voir le planning
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/favoris"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Mon itinéraire
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-row lg:flex-col gap-3 shrink-0 lg:min-w-[180px]">
            {[
              {
                val: stats.sessions,
                label: 'Sessions',
                icon: (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ),
              },
              {
                val: stats.speakers,
                label: 'Intervenants',
                icon: (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v5M8 23h8" />
                  </svg>
                ),
              },
              {
                val: stats.rooms,
                label: 'Salles actives',
                icon: (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                ),
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex-1 lg:flex-none bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-400 dark:text-zinc-500">{s.icon}</span>
                </div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-white tabular-nums">
                  {s.val ?? '—'}
                </div>
                <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 font-medium">{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
