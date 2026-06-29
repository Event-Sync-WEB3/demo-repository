'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSpeakerBySlug, getSpeakerSessions } from '@/lib/api';
import QASection from '@/components/QASection';

const PLATFORM_LABELS = {
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  youtube: 'YouTube',
  website: 'Site web',
  other: 'Lien',
};

const PLATFORM_ICONS = {
  twitter: (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.635 5.903-5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  linkedin: (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  github: (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  ),
  youtube: (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  website: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  other: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
};

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const isLive = (session) => {
  const now = new Date();
  return now >= new Date(session.startsAt) && now <= new Date(session.endsAt);
};

const initials = (name) =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export default function SpeakerPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [speaker, setSpeaker] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const s = await getSpeakerBySlug(slug);
        setSpeaker(s);
        const sess = await getSpeakerSessions(s.id);
        setSessions(Array.isArray(sess) ? sess : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-[#09090b] flex items-center justify-center">
        <div className="text-zinc-400 text-sm">Chargement…</div>
      </div>
    );
  }

  if (!speaker) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-[#09090b] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 text-sm font-medium">Intervenant introuvable</p>
          <button onClick={() => router.back()} className="mt-3 text-xs text-[#1D9E75] dark:text-[#7c6ff7] hover:underline">
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-[#09090b]">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Retour */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 mb-6 transition-colors"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Retour aux speakers
        </button>

        {/* Carte profil */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden mb-6">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">

              {/* Avatar */}
              {speaker.photoUrl ? (
                <img
                  src={speaker.photoUrl}
                  alt={speaker.fullName}
                  className="w-20 h-20 rounded-2xl object-cover ring-1 ring-black/5 shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold shrink-0">
                  {initials(speaker.fullName)}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-xs font-medium text-[#1D9E75] dark:text-[#7c6ff7] uppercase tracking-widest mb-1">
                      Intervenant
                    </p>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                      {speaker.fullName}
                    </h1>
                  </div>
                  <span className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                    {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {speaker.bio && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
                    {speaker.bio}
                  </p>
                )}

                {speaker.links?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {speaker.links.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        {PLATFORM_ICONS[link.platform] ?? PLATFORM_ICONS.other}
                        {link.label || PLATFORM_LABELS[link.platform] || link.platform}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sessions */}
          {sessions.length > 0 && (
            <div className="border-t border-zinc-100 dark:border-zinc-800 px-8 py-5">
              <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                Ses sessions
              </p>
              <div className="flex flex-col gap-2">
                {sessions.map((ss) => {
                  if (!ss.session) return null;
                  const live = isLive(ss.session);
                  return (
                    <Link
                      key={ss.sessionId}
                      href={`/sessions/${ss.sessionId}`}
                      className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 hover:border-[#1D9E75]/40 dark:hover:border-[#7c6ff7]/40 hover:shadow-sm transition-all duration-150"
                    >
                      <div className="text-xs font-mono font-medium text-zinc-400 dark:text-zinc-500 min-w-10 tabular-nums">
                        {formatTime(ss.session.startsAt)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {live && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse" />}
                          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 truncate group-hover:text-[#1D9E75] dark:group-hover:text-[#7c6ff7] transition-colors">
                            {ss.session.title}
                          </p>
                        </div>
                      </div>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-zinc-300 dark:text-zinc-600 group-hover:text-[#1D9E75] dark:group-hover:text-[#7c6ff7] shrink-0 transition-colors">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Q&A pour les sessions live */}
        {sessions.map((ss) => {
          if (!ss.session) return null;
          const live = isLive(ss.session);
          return live ? <QASection key={ss.sessionId} session={ss.session} /> : null;
        })}

      </div>
    </div>
  );
}
