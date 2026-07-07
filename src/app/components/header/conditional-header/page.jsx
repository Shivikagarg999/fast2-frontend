"use client";

import { usePathname } from "next/navigation";

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Don't render header on these paths
  if (pathname?.startsWith('/deliver') || pathname?.startsWith('/warehouse')) {
    return null;
  }

  // Your actual header content directly here
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            {/* Your logo and app name */}
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">F2</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
              GMkart
            </span>
          </div>
          <nav className="flex space-x-8">
            <a href="/" className="text-gray-700 hover:text-green-600 font-medium">Home</a>
            <a href="/about" className="text-gray-700 hover:text-green-600 font-medium">About</a>
            <a href="/contact" className="text-gray-700 hover:text-green-600 font-medium">Contact</a>
          </nav>
        </div>
      </div>
    </header>
  );
}