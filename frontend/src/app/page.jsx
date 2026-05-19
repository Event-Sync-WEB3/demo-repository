'use client';

import Hero from '@/components/Hero';
import Planning from '@/components/Planning';
import SpeakersList from '@/components/SpeakersList';
import Favorites from '@/components/Favorites';

export default function Home() {
  return (
    <div>
      <Hero />
      <Planning />
      <SpeakersList />
      <Favorites />
    </div>
  );
}