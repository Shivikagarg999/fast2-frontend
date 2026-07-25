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
  metadataBase: new URL("https://www.gmkart.com"),
  title: {
    default: "GMKart - Online Grocery Delivery | Fresh Products, Fast Delivery",
    template: "%s | GMKart",
  },
  description:
    "Order groceries, fresh produce, and daily essentials online with GMKart. Fast delivery to your doorstep, best prices, and a wide range of trusted local shops.",
  keywords: [
    "GMKart",
    "online grocery delivery",
    "grocery shopping online",
    "fresh produce delivery",
    "quick commerce",
    "local shops online",
  ],
  icons: {
    icon: "/favicon/logo.png",
    shortcut: "/favicon/logo.png",
    apple: "/favicon/logo.png",
  },
  openGraph: {
    siteName: "GMKart",
    type: "website",
    locale: "en_IN",
    title: "GMKart - Online Grocery Delivery | Fresh Products, Fast Delivery",
    description:
      "Order groceries, fresh produce, and daily essentials online with GMKart. Fast delivery to your doorstep, best prices, and a wide range of trusted local shops.",
    url: "https://www.gmkart.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "GMKart - Online Grocery Delivery",
    description:
      "Order groceries, fresh produce, and daily essentials online with GMKart. Fast delivery to your doorstep.",
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