'use client';

const speakers = [
  { initials: 'CR', name: 'Cassy Rakoto', role: 'Fullstack dev · STD24121', sessions: 2, color: 'bg-[#E1F5EE] text-[#085041]' },
  { initials: 'TH', name: 'Thomas', role: 'Backend expert · STD24086', sessions: 3, color: 'bg-[#EEEDFE] text-[#3C3489]' },
  { initials: 'BR', name: 'Bradon', role: 'DevOps engineer · STD24099', sessions: 2, color: 'bg-[#FAECE7] text-[#712B13]' },
  { initials: 'RA', name: 'Rahaga', role: 'Frontend lead · STD24092', sessions: 2, color: 'bg-[#FBEAF0] text-[#72243E]' },
];

export default function SpeakersList() {
  return (
    <div className="px-6 py-5 bg-[#f2f4f8] dark:bg-[#0f0f13] border-t border-black/10 dark:border-white/10">
      <p className="text-[11px] font-medium text-[#6870a0] uppercase tracking-wider mb-3">
        Intervenants
      </p>
      <div className="grid grid-cols-2 gap-2">
        {speakers.map((s) => (
          <div
            key={s.name}
            className="bg-white dark:bg-[#181820] border border-black/10 dark:border-white/10 rounded-xl p-3.5 flex gap-3 cursor-pointer hover:border-[#7c6ff7] hover:-translate-y-px transition-all"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${s.color}`}>
              {s.initials}
            </div>
            <div>
              <div className="text-sm font-medium text-[#1a1c28] dark:text-[#f2f2f8] mb-0.5">{s.name}</div>
              <div className="text-[11px] text-[#6870a0] mb-1.5">{s.role}</div>
              <div className="text-[11px] text-[#1D9E75] dark:text-[#5bc8a8] flex items-center gap-1">
                📅 {s.sessions} sessions
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}