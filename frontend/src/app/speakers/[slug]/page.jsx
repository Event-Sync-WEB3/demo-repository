'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSpeakerBySlug, getSpeakerSessions } from '@/lib/api';
import QASection from '@/components/QASection';

export default function SpeakerPage() {
  const { slug } = useParams();
  const [speaker, setSpeaker] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const s = await getSpeakerBySlug(slug);
        setSpeaker(s);
        const sess = await getSpeakerSessions(s.id);
        setSessions(sess);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-[#6870a0] text-sm">
      Chargement...
    </div>
  );

  if (!speaker) return (
    <div className="flex items-center justify-center h-40 text-[#6870a0] text-sm">
      Speaker introuvable.
    </div>
  );

  const initials = speaker.fullName
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="px-6 py-5 bg-[#f2f4f8] dark:bg-[#0f0f13] min-h-screen">

      {/* Profile card */}
      <div className="flex bg-white dark:bg-[#181820] border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden mb-5">

        {/* Left */}
        <div className="flex-1 p-5">
          <div className="text-[10px] text-[#1D9E75] dark:text-[#7c6ff7] uppercase tracking-widest mb-3 font-medium">
            Profil intervenant
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-[#E1F5EE] text-[#085041] flex items-center justify-center text-base font-medium flex-shrink-0">
              {initials}
            </div>
            <div>
              <div className="text-base font-medium text-[#1a1c28] dark:text-[#f2f2f8]">
                {speaker.fullName}
              </div>
              <div className="text-xs text-[#6870a0]">Intervenant · EventSync 2026</div>
            </div>
          </div>

          {speaker.bio && (
            <p className="text-xs text-[#6870a0] leading-relaxed mb-3">{speaker.bio}</p>
          )}

          {speaker.links?.length > 0 && (
            <div className="flex gap-3">
              {speaker.links.map((link) => (
                <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#6870a0] hover:text-[#1D9E75] dark:hover:text-[#7c6ff7] transition-colors capitalize"
                >
                {link.platform}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Right — Sessions */}
        <div className="w-48 bg-[#e8eaf2] dark:bg-[#1c1c24] border-l border-black/10 dark:border-white/10 p-4">
          <div className="text-[10px] text-[#6870a0] uppercase tracking-wider mb-3 font-medium">
            Ses sessions
          </div>
          {sessions.length === 0 ? (
            <p className="text-xs text-[#6870a0]">Aucune session</p>
          ) : (
            <div className="flex flex-col gap-2">
              {sessions.map((ss) => (
                <div
                  key={ss.sessionId}
                  className="bg-white dark:bg-[#181820] rounded-lg p-2.5 border border-black/10 dark:border-white/10"
                >
                  <div className="text-xs font-medium text-[#1a1c28] dark:text-[#f2f2f8] mb-1">
                    {ss.session?.title}
                  </div>
                  <div className="text-[10px] text-[#6870a0]">
                    {ss.session?.startsAt
                      ? new Date(ss.session.startsAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Q&A for each session */}
      {sessions.map((ss) =>
        ss.session ? (
          <QASection key={ss.sessionId} session={ss.session} />
        ) : null
      )}

    </div>
  );
}