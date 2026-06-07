'use client';

import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

const navLinks = [
  { label: 'Planning', href: '/' },
  { label: 'Speakers', href: '/speakers' },
  { label: 'Q&A', href: '/#qa' },
  { label: 'Favoris', href: '/#favoris' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-[#131318] border-b border-black/10 dark:border-white/10 px-6">
      <div className="flex items-center justify-between h-[52px]">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-[#1D9E75] dark:text-[#7c6ff7] font-semibold text-base">
          <div className="w-7 h-7 rounded-lg bg-[#1D9E75] dark:bg-[#7c6ff7] flex items-center justify-center">
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          EventSync
        </Link>

        {/* Nav links */}
        <div className="flex gap-1">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-3 py-1.5 rounded-full text-xs text-[#6870a0] hover:text-[#1a1c28] dark:hover:text-[#f2f2f8] hover:bg-[#e8eaf2] dark:hover:bg-[#1c1c24] transition-all"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/10 text-xs text-[#6870a0] hover:bg-[#e8eaf2] dark:hover:bg-[#1c1c24] transition-all"
        >
          {theme === 'dark' ? (
            <>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              Mode clair
            </>
          ) : (
            <>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              Mode sombre
            </>
          )}
        </button>

      </div>
    </nav>
  );
}