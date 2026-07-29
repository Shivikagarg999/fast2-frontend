'use client';

import { usePathname } from 'next/navigation';

// Routes where the global Header hides itself (components/header/page.jsx)
// and renders its own nav instead — so the space reserved for the global
// header must not be applied there either.
const NO_GLOBAL_HEADER_ROUTES = ['/deliver', '/warehouse'];

export default function MainContent({ children }) {
  const pathname = usePathname();
  const hasGlobalHeader = !NO_GLOBAL_HEADER_ROUTES.some((route) => pathname.startsWith(route));

  return (
    <main className={`relative z-10 ${hasGlobalHeader ? 'pt-[150px] lg:pt-[70px]' : ''}`}>
      {children}
    </main>
  );
}
