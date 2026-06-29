'use client';

import { useState, useEffect } from 'react';
import { getQuestions, createQuestion, upvoteQuestion } from '@/lib/api';

export default function QASection({ session }) {
  const [questions, setQuestions] = useState([]);
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(true);

  const isLive = () => {
    const now = new Date();
    return now >= new Date(session.startsAt) && now <= new Date(session.endsAt);
  };

  useEffect(() => {
    async function load() {
      try {
        const q = await getQuestions(session.id);
        setQuestions(q);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session.id]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    try {
      const q = await createQuestion(session.id, { content, authorName });
      setQuestions([q, ...questions]);
      setContent('');
      setAuthorName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpvote = async (questionId) => {
    try {
      await upvoteQuestion(session.id, questionId);
      setQuestions(questions.map(q =>
        q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const live = isLive();

  if (!live) return null;

  return (
    <div className="bg-white dark:bg-[#181820] border border-black/10 dark:border-white/10 rounded-2xl p-5 mb-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#1a1c28] dark:text-[#f2f2f8]">
          {session.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] text-[#D85A30] dark:text-[#f07060]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D85A30] dark:bg-[#f07060] animate-pulse"></span>
          Session live
        </div>
      </div>

      {/* Form — visible uniquement si live */}
      {live && (
        <div className="mb-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ton prénom (optionnel)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-32 px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-[#e8eaf2] dark:bg-[#1c1c24] text-[#1a1c28] dark:text-[#f2f2f8] text-xs outline-none focus:border-[#1D9E75] dark:focus:border-[#7c6ff7] transition-colors"
            />
            <input
              type="text"
              placeholder="Pose ta question..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="flex-1 px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-[#e8eaf2] dark:bg-[#1c1c24] text-[#1a1c28] dark:text-[#f2f2f8] text-xs outline-none focus:border-[#1D9E75] dark:focus:border-[#7c6ff7] transition-colors"
            />
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-[#7c6ff7] text-white text-xs font-medium hover:opacity-85 transition-opacity"
            >
              Envoyer
            </button>
          </div>
        </div>
      )}

      {/* Questions */}
      {loading ? (
        <p className="text-xs text-[#6870a0]">Chargement...</p>
      ) : questions.length === 0 ? (
        <p className="text-xs text-[#6870a0] py-2">
          {live ? 'Aucune question pour l\'instant — sois le premier !' : 'Aucune question.'}
        </p>
      ) : (
        <div className="flex flex-col">
          {questions
            .sort((a, b) => b.upvotes - a.upvotes)
            .map((q) => (
              <div key={q.id} className="flex gap-3 py-2.5 border-t border-black/10 dark:border-white/10">
                <button
                  onClick={() => handleUpvote(q.id)}
                  className="flex flex-col items-center gap-0.5 min-w-[26px] cursor-pointer group"
                >
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
  );
}