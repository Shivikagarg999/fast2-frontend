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
