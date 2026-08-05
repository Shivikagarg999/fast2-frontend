import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/header/page";
import Cart from "./components/cart/page";
import PopupManager from "./components/popup/PopupManager";
import ChatWidget from "./components/chatbot/page";
import MainContent from "./components/MainContent";
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
    // Brand
    "GMKart",
    "GMKart App",
    "GMKart India",
    "GMKart Grocery",
    "Download GMKart App",
    "GMKart Online Shopping",
    "GMKart Quick Commerce",
    "GMKart Hyperlocal Marketplace",
    // High-volume commercial
    "Online Grocery Shopping",
    "Grocery Delivery Near Me",
    "Grocery Delivery App",
    "Best Grocery Delivery App",
    "Instant Grocery Delivery",
    "10 Minute Grocery Delivery",
    "Fast Grocery Delivery",
    "Same Day Grocery Delivery",
    "Hyperlocal Delivery App",
    "Online Supermarket",
    "Daily Essentials Delivery",
    "Home Delivery Service",
    "Fresh Grocery Delivery",
    "Grocery Shopping Online India",
    "Online Kirana Store",
    // Fresh produce
    "Fresh Fruits Online",
    "Fresh Vegetables Online",
    "Farm Fresh Fruits Delivery",
    "Farm Fresh Vegetables Delivery",
    "Organic Fruits Online",
    "Organic Vegetables Online",
    "Fruits Delivery Near Me",
    "Vegetables Delivery Near Me",
    // Local SEO (Gwalior)
    "Grocery Delivery Gwalior",
    "Online Grocery Gwalior",
    "Grocery App Gwalior",
    "Quick Commerce Gwalior",
    "Hyperlocal Delivery Gwalior",
    "Grocery Home Delivery Gwalior",
    "Fruits Delivery Gwalior",
    "Vegetables Delivery Gwalior",
    "Kirana Delivery Gwalior",
    "Best Grocery Store Gwalior",
    // Seller & business
    "Become a GMKart Seller",
    "GMKart Seller Registration",
    "Sell Grocery Online",
    "Local Business Marketplace",
    "Grocery Vendor Registration",
    "Hyperlocal Seller Platform",
    "Delivery Partner Registration",
    "Dark Store Registration",
    "Dark Store Onboarding",
    "Grocery Marketplace India",
    // Long-tail
    "Best grocery delivery app in Gwalior",
    "Buy groceries online with fast delivery",
    "Grocery delivery within 30 minutes",
    "Order fruits and vegetables online",
    "Affordable grocery delivery service",
    "Daily essentials delivered at home",
    "Trusted online grocery shopping app",
    "Instant grocery delivery near me",
    "Grocery shopping with best offers",
    "Local grocery delivery app in India",
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

        <MainContent>{children}</MainContent>
        <Cart />
        <PopupManager />
        <ChatWidget />
      </body>
    </html>
  );
}