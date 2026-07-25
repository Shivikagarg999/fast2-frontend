"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Logo from "../../../assets/images/logo.png";
import Link from "next/link";
import { POLICY_PAGES } from "../policyPage/page";

export default function Footer() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "/proxy/api/category/getall"
        );
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <footer className="bg-green-300 text-black py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Company info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <Image
                src={Logo}
                alt="GMKart"
                width={180}
                height={80}
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-black text-sm mb-4">
              Your trusted partner for quick grocery delivery. Fresh products at
              your doorstep in minutes.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4 text-black">Categories</h4>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
              </div>
            ) : (
              <ul className="space-y-2 text-sm text-black">
                {categories.map((category) => (
                  <li key={category._id}>
                    <Link
                      href={`/category/${category._id}`}
                      className="hover:text-black transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-black">Quick Links</h4>
            <ul className="space-y-2 text-sm text-black">
              <li>
                <a href="/about" className="hover:text-black transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-black transition-colors">
                  Contact
                </a>
              </li>
              {POLICY_PAGES.map((p) => (
                <li key={p.type}>
                  <a href={p.href} className="hover:text-black transition-colors">
                    {p.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="/shops" className="hover:text-black transition-colors">
                  Browse Shops
                </a>
              </li>
              <li>
                <a href="/deliver" className="hover:text-black transition-colors">
                  Become a Delivery Partner
                </a>
              </li>
              <li>
                <a
                  href="https://seller.gmkart.com/warehouse/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors"
                >
                  Warehouse
                </a>
              </li>
              <li>
                <a
                  href="https://seller.gmkart.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors"
                >
                  Seller
                </a>
              </li>
              <li>
                <a
                  href="https://promotor.gmkart.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors"
                >
                  Partner
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-black">Contact Us</h4>
            <ul className="space-y-2 text-sm text-black">
              <li className="flex items-start">
                <svg
                  className="w-4 h-4 mr-2 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                support@gmkart.com
              </li>
              <li className="flex items-start">
                <svg
                  className="w-4 h-4 mr-2 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 极速 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                +91 9981306588
              </li>
              <li className="flex items-start">
                <svg
                  className="w-4 h-4 mr-2 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                HNO39, Indra Nagar Road, Morar Road, Near Sai Devin School, Thatipur, Gwalior, Madhya Pradesh – 474011
              </li>
            </ul>

            {/* Social Media Links */}
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://www.facebook.com/share/p/1EnAXDKwC6/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GMKart on Facebook"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.63.771-1.63 1.562v1.878h2.773l-.443 2.91h-2.33V22c4.78-.756 8.438-4.92 8.438-9.94z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/gmkart_/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GMKart on Instagram"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.256 1.216.6 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.05 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.05-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.01 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.065.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.01 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.059-.976.045-1.505.207-1.858.344-.466.181-.8.399-1.15.748-.35.35-.566.683-.748 1.15-.137.352-.3.882-.344 1.857-.05 1.054-.06 1.37-.06 4.04 0 2.67.01 2.986.06 4.04.045.976.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.858.344 1.054.05 1.37.06 4.04.06 2.67 0 2.987-.01 4.04-.06.976-.045 1.506-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.352.3-.882.344-1.857.05-1.054.06-1.37.06-4.04 0-2.67-.01-2.986-.06-4.04-.045-.976-.207-1.505-.344-1.858a3.09 3.09 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.352-.137-.882-.3-1.857-.344-1.054-.05-1.37-.06-4.04-.06zm0 4.865a5.333 5.333 0 110 10.666 5.333 5.333 0 010-10.666zm0 8.798a3.465 3.465 0 100-6.93 3.465 3.465 0 000 6.93zm6.79-9.015a1.246 1.246 0 11-2.492 0 1.246 1.246 0 012.492 0z" />
                </svg>
              </a>
            </div>
          </div>
        </div>


        {/* Copyright and bottom links */}
        <div className="border-t border-gray-300 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-black mb-2 md:mb-0">
            © {new Date().getFullYear()} Fast2market Digital Solutions Inc. GMKart.com. All Rights Reserved.
          </p>
<div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-black">
            {POLICY_PAGES.map((p) => (
              <a key={p.type} href={p.href} className="hover:text-black transition-colors">
                {p.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
