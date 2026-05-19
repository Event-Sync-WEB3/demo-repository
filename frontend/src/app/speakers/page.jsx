'use client';

import SpeakersList from '@/components/SpeakersList';

export default function SpeakersPage() {
  return (
    <div className="min-h-screen bg-[#f2f4f8] dark:bg-[#0f0f13] px-6 py-8">
      <h1 className="text-xl font-semibold text-[#1a1c28] dark:text-[#f2f2f8] mb-6">
        Tous les intervenants
      </h1>
      <SpeakersList />
    </div>
  );
}