'use client';

import { useEffect, useState } from 'react';
import { getEvents } from '@/lib/api';

export default function Hero() {
  const [event, setEvent] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getEvents();
        const events = data.data || data;
        if (events.length) setEvent(events[0]);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const isLive = () => {
    if (!event) return false;
    const now = new Date();
    return now >= new Date(event.startsAt) && now <= new Date(event.endsAt);
  };

  return (
    <div className="flex border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#131318]">

      {/* Left */}
      <div className="flex-1 p-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E1F5EE] dark:bg-[#7c6ff720] text-[#085041] dark:text-[#a89df9] text-xs mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] dark:bg-[#7c6ff7] animate-pulse"></span>
          {isLive() ? 'Événement en cours' : 'Événement à venir'}
        </div>

        <h1 className="text-2xl font-semibold leading-tight mb-2 text-[#1a1c28] dark:text-[#f2f2f8]">
          {event?.title || 'EventSync Conference 2026'}
        </h1>

        <p className="text-xs text-[#6870a0] leading-relaxed mb-4 max-w-md">
          {event?.description || 'La conférence tech annuelle de Madagascar — développeurs, designers et innovateurs réunis à Antananarivo.'}
        </p>

        <div className="flex gap-2 flex-wrap mb-5">
          {['Node.js', 'React', 'PostgreSQL', 'DevOps', 'UI/UX'].map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full border border-black/10 dark:border-white/10 text-[#6870a0]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <button className="px-5 py-2 rounded-lg bg-[#1D9E75] dark:bg-[#7c6ff7] text-white text-xs font-medium hover:opacity-85 transition-opacity">
            Voir le planning
          </button>
          <button className="px-5 py-2 rounded-lg border border-black/10 dark:border-white/10 text-xs text-[#1a1c28] dark:text-[#f2f2f8] hover:bg-[#e8eaf2] dark:hover:bg-[#1c1c24] transition-colors">
            Mes favoris
          </button>
        </div>
      </div>

      {/* Right — Stats */}
      <div className="w-48 p-5 bg-[#e8eaf2] dark:bg-[#1c1c24] border-l border-black/10 dark:border-white/10 flex flex-col gap-3">
        {[
          { val: event?._count?.sessions ?? '—', label: "Sessions aujourd'hui" },
          { val: event?._count?.speakers ?? '—', label: 'Intervenants' },
          { val: '3', label: 'Salles actives' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#181820] rounded-xl p-3 border border-black/10 dark:border-white/10">
            <div className="text-xl font-medium text-[#1a1c28] dark:text-[#f2f2f8]">{s.val}</div>
            <div className="text-[10px] text-[#6870a0] mt-0.5">{s.label}</div>
          </div>
        ))}
        <div className="bg-[#1D9E75] dark:bg-[#7c6ff7] rounded-xl p-3">
          <div className="text-[10px] text-white/70 uppercase tracking-wider mb-1">Lieu</div>
          <div className="text-xs text-white font-medium">
            {event?.location || 'Antananarivo, Madagascar'}
          </div>
        </div>
      </div>

    </div>
  );
}