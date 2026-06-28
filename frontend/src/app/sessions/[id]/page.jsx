'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import QASection from '@/components/QASection';

export default function SessionPage() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/sessions/${id}`)
      .then(res => res.json())
      .then(data => {
        setSession(data.data || data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-6 text-xs text-[#6870a0]">Chargement...</div>;
  if (!session) return <div className="p-6 text-xs text-[#6870a0]">Session introuvable.</div>;

  return (
    <div className="min-h-screen bg-[#f2f4f8] dark:bg-[#0f0f13] px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-[#1a1c28] dark:text-[#f2f2f8] mb-2">{session.title}</h1>
        <p className="text-xs text-[#6870a0] mb-4">{session.description}</p>
        <div className="flex gap-4 text-xs text-[#6870a0] mb-6">
          <span>🕐 {new Date(session.startsAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {new Date(session.endsAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          <span>📍 {session.room?.name}</span>
          <span>👥 {session.speakers?.map(s => s.fullName).join(', ')}</span>
        </div>
        <QASection session={session} />
      </div>
    </div>
  );
}