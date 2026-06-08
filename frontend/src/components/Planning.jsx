'use client';

import { useState } from 'react';

const sessions = {
  'Salle A': [
    { title: 'Intro Node.js & Express', speaker: 'Thomas', type: 'live' },
    { title: 'API REST avec Prisma', speaker: 'Cassy', type: 'violet' },
    { title: 'PostgreSQL avancé', speaker: 'Bradon', type: 'default' },
  ],
  'Salle B': [
    { title: 'UI/UX moderne 2026', speaker: 'Cassy', type: 'green' },
    { title: 'Git & collaboration', speaker: 'Thomas', type: 'default' },
    { title: 'Deploy & DevOps', speaker: 'Bradon', type: 'green' },
  ],
  'Salle C': [
    { title: 'React & state management', speaker: 'Rahaga', type: 'default' },
    { title: 'TypeScript avancé', speaker: 'Thomas', type: 'violet' },
    { title: 'Q&A interactif speakers', speaker: 'Rahaga', type: 'live' },
  ],
};

const times = ['09h', '10h', '11h'];
const rooms = ['Tout', 'Salle A', 'Salle B', 'Salle C'];

const borderColor = {
  live:    'border-l-2 border-l-[#D85A30] dark:border-l-[#f07060]',
  violet:  'border-l-2 border-l-[#7c6ff7]',
  green:   'border-l-2 border-l-[#1D9E75] dark:border-l-[#5bc8a8]',
  default: '',
};

export default function Planning() {
  const [activeRoom, setActiveRoom] = useState('Tout');

  const visibleRooms = activeRoom === 'Tout'
    ? Object.keys(sessions)
    : [activeRoom];

  return (
    <div className="px-6 py-5 bg-[#f2f4f8] dark:bg-[#0f0f13]">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-[#1a1c28] dark:text-[#f2f2f8]">
          Planning multi-track
        </h2>
        <div className="flex gap-1">
          {rooms.map((r) => (
            <button
              key={r}
              onClick={() => setActiveRoom(r)}
              className={`px-2.5 py-1 rounded-full border text-[11px] transition-all ${
                activeRoom === r
                  ? 'bg-[#EEEDFE] dark:bg-[#7c6ff720] text-[#534AB7] dark:text-[#a89df9] border-[#7c6ff7]'
                  : 'border-black/10 dark:border-white/10 text-[#6870a0] hover:text-[#1a1c28] dark:hover:text-[#f2f2f8]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `44px repeat(${visibleRooms.length}, 1fr)` }}>
        
        {/* Time column */}
        <div className="pt-8 flex flex-col gap-1.5">
          {times.map((t) => (
            <div key={t} className="text-[10px] text-[#c0c4dc] dark:text-[#40405a] h-[90px] flex items-start">
              {t}
            </div>
          ))}
        </div>

        {/* Room columns */}
        {visibleRooms.map((room) => (
          <div key={room}>
            <div className="text-[10px] font-medium text-[#6870a0] px-2 py-1 bg-[#e8eaf2] dark:bg-[#1c1c24] rounded-md text-center mb-1.5">
              {room}
            </div>
            {sessions[room].map((s, i) => (
              <div
                key={i}
                className={`bg-white dark:bg-[#181820] border border-black/10 dark:border-white/10 rounded-[10px] p-3 h-[90px] flex flex-col justify-between cursor-pointer mb-1.5 hover:border-[#7c6ff7] hover:-translate-y-px transition-all ${
                  s.type !== 'default' ? `rounded-l-none ${borderColor[s.type]}` : ''
                }`}
              >
                <div className="text-[11px] font-medium leading-snug text-[#1a1c28] dark:text-[#f2f2f8]">
                  {s.title}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#6870a0]">{s.speaker}</span>
                  {s.type === 'live' ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#f0706018] text-[#D85A30] dark:text-[#f07060]">
                      Live
                    </span>
                  ) : (
                    <button className="text-[#c0c4dc] dark:text-[#40405a] hover:text-[#D85A30] transition-colors text-sm">
                      ♡
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}