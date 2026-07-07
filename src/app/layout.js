import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/header/page";
import Cart from "./components/cart/page";
import PopupManager from "./components/popup/PopupManager";
import ChatWidget from "./components/chatbot/page";
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
  title: "GMKart",
  description: "GMKart - Your shopping partner",
  icons: {
    icon: "/favicon/logo.jpeg",
    shortcut: "/favicon/logo.jpeg",
    apple: "/favicon/logo.jpeg",
  },
};

const HeaderFallback = () => {
  return (
    <header className="bg-white fixed top-0 left-0 right-0 w-full z-50">
      <div className="border-b border-gray-200 h-[130px] lg:h-[70px]">
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

        <main className="relative z-10 pt-[150px] lg:pt-[70px]">{children}</main>
        <Cart />
        <PopupManager />
        <ChatWidget />
      </body>
    </html>
  );
}