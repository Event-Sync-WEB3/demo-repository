'use client';

import { useEffect, useState } from 'react';
import { getEvents, getSessions, getQuestions, createQuestion, upvoteQuestion } from '@/lib/api';

const isLive = (session) => {
  if (!session) return false;
  const now = new Date();
  return now >= new Date(session.startsAt) && now <= new Date(session.endsAt);
};

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

export default function QAPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const eventsData = await getEvents();
        const events = eventsData.data || eventsData;
        if (!events.length) return;
        const now = new Date();
        const best =
          events.find(e => new Date(e.startsAt) <= now && new Date(e.endsAt) >= now) ||
          events.find(e => new Date(e.startsAt) > now) ||
          events[events.length - 1] ||
          events[0];
        const sessionsData = await getSessions(best.id);
        const sess = sessionsData.data || sessionsData;
        setSessions(Array.isArray(sess) ? sess : []);
        if (sess.length) setSelectedSession(sess[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedSession) return;
    getQuestions(selectedSession.id)
      .then((data) => setQuestions(Array.isArray(data) ? data : (data.data || [])))
      .catch(console.error);
  }, [selectedSession]);

  const handleSubmit = async () => {
    if (!content.trim() || !selectedSession || submitting) return;
    setSubmitting(true);
    try {
      const q = await createQuestion(selectedSession.id, { content, authorName });
      setQuestions((prev) => [...prev, q].sort((a, b) => b.upvotes - a.upvotes));
      setContent('');
      setAuthorName('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (questionId) => {
    try {
      await upvoteQuestion(selectedSession.id, questionId);
      setQuestions((prev) =>
        prev
          .map((q) => (q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q))
          .sort((a, b) => b.upvotes - a.upvotes)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const liveSessions = sessions.filter(isLive);
  const live = selectedSession ? isLive(selectedSession) : false;

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-[#09090b]">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* En-tête */}
        <div className="mb-8">
          <p className="text-xs font-medium text-[#1D9E75] dark:text-[#7c6ff7] uppercase tracking-widest mb-2">Q&A</p>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Questions en direct</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">
            Posez vos questions aux intervenants pendant les sessions live
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-white dark:bg-zinc-900 animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-zinc-400">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-500">Aucune session disponible</p>
          </div>
        ) : (
          <>
            {/* Sélecteur de sessions */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden mb-4">
              <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Choisir une session
                </p>
                {liveSessions.length > 0 && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {liveSessions.length} session{liveSessions.length > 1 ? 's' : ''} en direct
                  </p>
                )}
              </div>
              <div className="p-3 flex flex-col gap-1 max-h-56 overflow-y-auto">
                {sessions.map((s) => {
                  const liveSession = isLive(s);
                  const selected = selectedSession?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSession(s)}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        selected
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <span className="text-xs font-mono tabular-nums text-zinc-400 dark:text-zinc-500 min-w-10">
                        {formatTime(s.startsAt)}
                      </span>
                      <span className={`text-sm font-medium flex-1 truncate ${selected ? 'text-white dark:text-zinc-900' : ''}`}>
                        {s.title}
                      </span>
                      {liveSession && (
                        <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold text-red-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          Live
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Panel Q&A */}
            {selectedSession && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                      {selectedSession.title}
                    </h2>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                      {questions.length} question{questions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {live ? (
                    <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950 px-2.5 py-1 rounded-full ml-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      Session live
                    </span>
                  ) : (
                    <span className="shrink-0 text-xs text-zinc-400 ml-3">Non active</span>
                  )}
                </div>

                {/* Formulaire (si live) */}
                {live && (
                  <div className="px-5 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Votre prénom (optionnel)"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="sm:w-40 px-3 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-[#1D9E75] dark:focus:border-[#7c6ff7] focus:ring-2 focus:ring-[#1D9E75]/10 dark:focus:ring-[#7c6ff7]/10 transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Posez votre question…"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-[#1D9E75] dark:focus:border-[#7c6ff7] focus:ring-2 focus:ring-[#1D9E75]/10 dark:focus:ring-[#7c6ff7]/10 transition-all"
                      />
                      <button
                        onClick={handleSubmit}
                        disabled={!content.trim() || submitting}
                        className="px-4 py-2.5 rounded-xl bg-[#1D9E75] dark:bg-[#7c6ff7] text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 active:scale-[0.98] transition-all"
                      >
                        {submitting ? '…' : 'Envoyer'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Questions */}
                {!live ? (
                  <div className="py-12 text-center">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-zinc-400">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <p className="text-sm text-zinc-400">Les questions s&apos;affichent pendant la session live</p>
                  </div>
                ) : questions.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-zinc-400 dark:text-zinc-500">Aucune question pour l&apos;instant</p>
                    <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-1">Soyez le premier à en poser une !</p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {questions.map((q) => (
                      <div key={q.id} className="flex gap-3 px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <button
                          onClick={() => handleUpvote(q.id)}
                          className="flex flex-col items-center gap-0.5 min-w-8 group shrink-0"
                        >
                          <svg
                            width="14" height="14"
                            fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                            viewBox="0 0 24 24"
                            className="text-zinc-300 dark:text-zinc-600 group-hover:text-[#1D9E75] dark:group-hover:text-[#7c6ff7] transition-colors"
                          >
                            <polyline points="18 15 12 9 6 15" />
                          </svg>
                          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 tabular-nums group-hover:text-[#1D9E75] dark:group-hover:text-[#7c6ff7] transition-colors">
                            {q.upvotes}
                          </span>
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">{q.content}</p>
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1.5">
                            {q.authorName || 'Anonyme'}
                            {' · '}
                            {new Date(q.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
