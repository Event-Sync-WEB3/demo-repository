'use client';

import { useEffect, useState } from 'react';
import { getEvents, getSessions, getQuestions, createQuestion, upvoteQuestion } from '@/lib/api';

export default function QAPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const eventsData = await getEvents();
        const events = eventsData.data || eventsData;
        if (!events.length) return;
        const sessionsData = await getSessions(events[0].id);
        const sess = sessionsData.data || sessionsData;
        setSessions(sess);
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
      .then(data => setQuestions(data.data || data))
      .catch(console.error);
  }, [selectedSession]);

  const isLive = (session) => {
    if (!session) return false;
    const now = new Date();
    return now >= new Date(session.startsAt) && now <= new Date(session.endsAt);
  };

  const handleSubmit = async () => {
    if (!content.trim() || !selectedSession) return;
    try {
      const q = await createQuestion(selectedSession.id, { content, authorName });
      setQuestions([q, ...questions]);
      setContent('');
      setAuthorName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpvote = async (questionId) => {
    try {
      await upvoteQuestion(selectedSession.id, questionId);
      setQuestions(questions.map(q =>
        q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q
      ));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-[#6870a0] text-sm">
      Chargement...
    </div>
  );

  return (
    <div className="px-6 py-5 bg-[#f2f4f8] dark:bg-[#0f0f13] min-h-screen">
      <h1 className="text-xl font-semibold text-[#1a1c28] dark:text-[#f2f2f8] mb-4">
        Questions en direct
      </h1>

      <div className="flex gap-2 flex-wrap mb-5">
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSession(s)}
            className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
              selectedSession?.id === s.id
                ? 'bg-[#EEEDFE] dark:bg-[#7c6ff720] text-[#534AB7] dark:text-[#a89df9] border-[#7c6ff7]'
                : 'border-black/10 dark:border-white/10 text-[#6870a0] hover:text-[#1a1c28] dark:hover:text-[#f2f2f8]'
            }`}
          >
            {s.title}
            {isLive(s) && (
              <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-md bg-[#f0706018] text-[#D85A30] dark:text-[#f07060]">
                Live
              </span>
            )}
          </button>
        ))}
      </div>

      {selectedSession && (
        <div className="bg-white dark:bg-[#181820] border border-black/10 dark:border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-[#1a1c28] dark:text-[#f2f2f8]">
              {selectedSession.title}
            </h2>
            {isLive(selectedSession) ? (
              <div className="flex items-center gap-1.5 text-[11px] text-[#D85A30] dark:text-[#f07060]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D85A30] animate-pulse"></span>
                Session live
              </div>
            ) : (
              <div className="text-[11px] text-[#6870a0]">Session non active</div>
            )}
          </div>

          {isLive(selectedSession) && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Ton prénom (optionnel)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-36 px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-[#e8eaf2] dark:bg-[#1c1c24] text-[#1a1c28] dark:text-[#f2f2f8] text-xs outline-none focus:border-[#7c6ff7] transition-colors"
              />
              <input
                type="text"
                placeholder="Pose ta question..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="flex-1 px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-[#e8eaf2] dark:bg-[#1c1c24] text-[#1a1c28] dark:text-[#f2f2f8] text-xs outline-none focus:border-[#7c6ff7] transition-colors"
              />
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-[#7c6ff7] text-white text-xs font-medium hover:opacity-85 transition-opacity"
              >
                Envoyer
              </button>
            </div>
          )}

          {questions.length === 0 ? (
            <p className="text-xs text-[#6870a0] py-2">Aucune question pour l&apos;instant.</p>
          ) : (
            <div className="flex flex-col">
              {[...questions].sort((a, b) => b.upvotes - a.upvotes).map((q) => (
                <div key={q.id} className="flex gap-3 py-3 border-t border-black/10 dark:border-white/10">
                  <button onClick={() => handleUpvote(q.id)} className="flex flex-col items-center gap-0.5 min-w-[26px] group">
                    <span className="text-[#c0c4dc] dark:text-[#40405a] group-hover:text-[#7c6ff7] transition-colors text-sm">▲</span>
                    <span className="text-[10px] text-[#6870a0] font-medium">{q.upvotes}</span>
                  </button>
                  <div className="flex-1">
                    <div className="text-xs text-[#1a1c28] dark:text-[#f2f2f8] mb-1">{q.content}</div>
                    <div className="text-[10px] text-[#c0c4dc] dark:text-[#40405a]">
                      {q.authorName || 'Anonyme'} · {new Date(q.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}