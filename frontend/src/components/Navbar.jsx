'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useState, useEffect } from 'react';

const navLinks = [
  { label: 'Planning', href: '/' },
  { label: 'Speakers', href: '/speakers' },
  { label: 'Q&A', href: '/qa' },
  { label: 'Favoris', href: '/favoris' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80 shadow-sm shadow-black/5'
        : 'bg-white/70 dark:bg-[#09090b]/70 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#1D9E75] to-[#7c6ff7] flex items-center justify-center shadow-md shadow-[#1D9E75]/20 group-hover:scale-105 transition-transform duration-150">
              <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2.5" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span className="text-[15px] font-bold tracking-tight text-zinc-900 dark:text-white">
              Event<span className="gradient-text">Sync</span>
            </span>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-900 px-1 py-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
            {navLinks.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                    active
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm shadow-black/5'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Droite */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Changer le thème"
              className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-150"
            >
              {theme === 'dark' ? (
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            {/* Bouton Admin */}
            <a
              href="/admin"
              title="Espace admin"
              className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-[#7c6ff7] hover:border-[#7c6ff7]/40 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-150"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </a>

            {/* Hamburger mobile */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
              className="md:hidden w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
            >
              <div className="w-3.75 flex flex-col gap-[4.5px]">
                <span className={`block h-[1.5px] w-full bg-current rounded-full origin-center transition-all duration-200 ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block h-[1.5px] w-full bg-current rounded-full transition-all duration-200 ${mobileOpen ? 'opacity-0 -translate-x-2' : ''}`} />
                <span className={`block h-[1.5px] w-full bg-current rounded-full origin-center transition-all duration-200 ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-250 ${mobileOpen ? 'max-h-72 border-t border-zinc-100 dark:border-zinc-800' : 'max-h-0'}`}>
        <div className="px-4 py-3 flex flex-col gap-1 bg-white/97 dark:bg-[#09090b]/97 backdrop-blur-xl">
          {navLinks.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
              >
                {item.label}
                {active && <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] dark:bg-[#7c6ff7]" />}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
