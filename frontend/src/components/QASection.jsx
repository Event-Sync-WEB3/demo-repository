'use client';

import { useState, useEffect } from 'react';
import { getQuestions, createQuestion, upvoteQuestion } from '@/lib/api';

export default function QASection({ session }) {
  const [questions, setQuestions] = useState([]);
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const live = (() => {
    const now = new Date();
    return now >= new Date(session.startsAt) && now <= new Date(session.endsAt);
  })();

  useEffect(() => {
    if (!live) return;
    getQuestions(session.id)
      .then((data) => setQuestions(Array.isArray(data) ? data : (data.data || [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session.id, live]);

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      const q = await createQuestion(session.id, { content, authorName });
      setQuestions((prev) =>
        [...prev, q].sort((a, b) => b.upvotes - a.upvotes)
      );
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
      await upvoteQuestion(session.id, questionId);
      setQuestions((prev) =>
        prev
          .map((q) => (q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q))
          .sort((a, b) => b.upvotes - a.upvotes)
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (!live) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">

      {/* En-tête */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Questions en direct</h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            {questions.length} question{questions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Session live
        </div>
      </div>

      {/* Formulaire */}
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

      {/* Liste des questions */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {loading ? (
          <div className="py-8 text-center text-sm text-zinc-400">Chargement…</div>
        ) : questions.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">Aucune question pour l&apos;instant</p>
            <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-1">Soyez le premier à en poser une !</p>
          </div>
        ) : (
          questions.map((q) => (
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
          ))
        )}
      </div>
    </div>
  );
}
