'use client';

import { useState } from 'react';

const initial = [
  { time: '09h00', title: 'Intro Node.js & Express', room: 'Salle A', speaker: 'Thomas' },
  { time: '10h00', title: 'API REST avec Prisma', room: 'Salle A', speaker: 'Cassy' },
  { time: '11h00', title: 'Q&A interactif speakers', room: 'Salle C', speaker: 'Rahaga' },
];

export default function Favorites() {
  const [favs, setFavs] = useState(initial);

  const remove = (index) => setFavs(favs.filter((_, i) => i !== index));

  return (
    <div className="px-6 py-5 bg-[#f2f4f8] dark:bg-[#0f0f13] border-t border-black/10 dark:border-white/10">
      <p className="text-[11px] font-medium text-[#6870a0] uppercase tracking-wider mb-3">
        Mon itinéraire personnel
      </p>
      <div className="flex flex-col gap-1.5">
        {favs.length === 0 && (
          <p className="text-xs text-[#6870a0] py-4 text-center">
            Aucun favori pour l'instant — cliquez sur ♡ dans le planning !
          </p>
        )}
        {favs.map((f, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#181820] border border-black/10 dark:border-white/10 rounded-xl transition-colors"
          >
            <div className="text-[11px] text-[#1D9E75] dark:text-[#7c6ff7] font-medium min-w-[42px]">
              {f.time}
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-[#1a1c28] dark:text-[#f2f2f8]">{f.title}</div>
              <div className="text-[11px] text-[#6870a0] mt-0.5">{f.room} · {f.speaker}</div>
            </div>
            <button
              onClick={() => remove(i)}
              className="text-[#D85A30] dark:text-[#f07060] text-base hover:scale-110 transition-transform"
            >
              ♥
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}