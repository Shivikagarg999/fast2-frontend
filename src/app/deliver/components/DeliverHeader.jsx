"use client";

import { useState } from 'react';
import Image from 'next/image';
import Logo from '@/assets/images/gmkart-captain-logo.png';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.gmkart.door';

const LINKS = [
  { href: '/deliver#why-gmkart', label: 'Why GMKart' },
  { href: '/deliver#partner-app', label: 'Partner App' },
  { href: '/deliver/register', label: 'Register' },
  { href: '/contact', label: 'Support' },
];

export default function DeliverHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-[#eceae6] sticky top-0 z-50 bg-white">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-12 h-20 flex items-center justify-between">
        <a href="/deliver" className="flex items-center" onClick={() => setMenuOpen(false)}>
          <Image src={Logo} alt="GMKart Captain" width={160} height={64} priority className="h-16 w-auto object-contain" />
        </a>

        <nav className="hidden md:flex items-center gap-9">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-semibold text-[#14181c] hover:text-[#C9491D] transition-colors">
              {link.label}
            </a>
          ))}
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#C9491D] text-white px-[22px] py-[11px] rounded-[3px] font-bold text-sm hover:bg-[#b03e18] transition-colors"
          >
            Download App
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="md:hidden flex items-center justify-center w-10 h-10 -mr-2 text-[#14181c]"
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-[#eceae6] bg-white px-6 py-5 flex flex-col gap-4">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-[15px] font-semibold text-[#14181c] hover:text-[#C9491D] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="inline-flex items-center justify-center gap-2 bg-[#C9491D] text-white px-[22px] py-3 rounded-[3px] font-bold text-sm hover:bg-[#b03e18] transition-colors mt-1"
          >
            Download App
          </a>
        </nav>
      )}
    </header>
  );
}
