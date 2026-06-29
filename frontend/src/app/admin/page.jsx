'use client';

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:5173';

export default function AdminRedirectPage() {
  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-[#09090b] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xl shadow-black/5">

          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1D9E75] to-[#7c6ff7] flex items-center justify-center mb-5 shadow-lg shadow-[#7c6ff7]/20">
              <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight mb-1">
              Espace administrateur
            </h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              Interface de gestion EventSync — accès réservé aux organisateurs
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-6 flex flex-col gap-3">
            <a
              href={ADMIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#7c6ff7]/25 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #1D9E75 0%, #7c6ff7 100%)' }}
            >
              Ouvrir le panel admin
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="group-hover:translate-x-0.5 transition-transform">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>

            <p className="text-center text-[11px] text-zinc-300 dark:text-zinc-600">
              Ouvre sur{' '}
              <code className="font-mono text-zinc-400 dark:text-zinc-500">{ADMIN_URL}</code>
            </p>
          </div>
        </div>

        {/* Info */}
        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 mt-5">
          Le panel admin doit être lancé séparément :{' '}
          <code className="font-mono">npm run dev</code> dans <code className="font-mono">Event-Sync-Admin/admin</code>
        </p>
      </div>
    </div>
  );
}
