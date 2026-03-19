import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/header/page";
import Cart from "./components/cart/page";
import PopupManager from "./components/popup/PopupManager";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Fast2",
  description: "Fast2 - Your shopping partner",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

const HeaderFallback = () => {
  return (
    <header className="bg-white sticky top-0 w-full z-50">
      <div className="border-b border-gray-200 h-[70px]">
      </div>
    </header>
  );
};

// Client component for conditional header
const ConditionalHeader = () => {
  // This will be rendered on client side
  return (
    <Suspense fallback={<HeaderFallback />}>
      <Header />
    </Suspense>
  );
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Use the conditional header component */}
        <ConditionalHeader />

        <main className="relative z-10">{children}</main>
        <Cart />
        <PopupManager />
      </body>
    </html>
  );
}