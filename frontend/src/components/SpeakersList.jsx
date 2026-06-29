'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSpeakers } from '@/lib/api';

const colors = [
  'bg-[#E1F5EE] text-[#085041]',
  'bg-[#EEEDFE] text-[#3C3489]',
  'bg-[#FAECE7] text-[#712B13]',
  'bg-[#FBEAF0] text-[#72243E]',
];

export default function SpeakersList() {
  const [speakers, setSpeakers] = useState([]);

  useEffect(() => {
    getSpeakers().then(setSpeakers).catch(console.error);
  }, []);

  return (
    <div className="px-6 py-5 bg-[#f2f4f8] dark:bg-[#0f0f13] border-t border-black/10 dark:border-white/10">
      <p className="text-[11px] font-medium text-[#6870a0] uppercase tracking-wider mb-3">
        Intervenants
      </p>
      <div className="grid grid-cols-2 gap-2">
        {speakers.map((s, i) => (
          <Link href={`/speakers/${s.slug}`} key={s.id}>
            <div className="bg-white dark:bg-[#181820] border border-black/10 dark:border-white/10 rounded-xl p-3.5 flex gap-3 cursor-pointer hover:border-[#7c6ff7] hover:-translate-y-px transition-all">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${colors[i % colors.length]}`}>
                {s.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-medium text-[#1a1c28] dark:text-[#f2f2f8] mb-0.5">{s.fullName}</div>
                <div className="text-[11px] text-[#6870a0] mb-1.5">{s.bio || 'Intervenant EventSync'}</div>
                <div className="text-[11px] text-[#1D9E75] dark:text-[#5bc8a8] flex items-center gap-1">
                  📅 {s._count?.sessions ?? 0} sessions
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}