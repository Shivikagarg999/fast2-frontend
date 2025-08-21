"use client";
import { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  ShoppingCartIcon, 
  UserIcon, 
  MapPinIcon,
  Bars3Icon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Logo from '../../../assets/images/logo.jpeg';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItems] = useState(3); // Mock cart count
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Section */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            
            {/* Left: Logo and Location */}
            <div className="flex items-center space-x-6">
              
              <div className="flex items-center">
                <Image
                  src={Logo}
                  alt="Blinkit"
                  width={220}
                  height={100}
                  className="h-20 w-auto object-contain"
                />
              </div>

            </div>

            {/* Center: Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full pl-10 pr-4 text-black py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-4">
              
              {/* Login/Signup */}
              <div 
                className="hidden md:flex items-center space-x-2 cursor-pointer"
                onClick={handleLoginClick}
              >
                <UserIcon className="w-6 h-6 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Login/Signup</span>
              </div>

              {/* Cart */}
              <div className="flex items-center space-x-1 text-gray-700 cursor-pointer">
                <div className="relative">
                  <ShoppingCartIcon className="w-7 h-7" />
                  {cartItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItems}
                    </span>
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium">Cart</span>
              </div>

              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Categories */}
      <div className="hidden lg:block bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <nav className="flex items-center space-x-8 overflow-x-auto scrollbar-hide">
            {[
              'Groceries & Essentials',
              'Fruits & Vegetables',
              'Dairy & Breakfast',
              'Snacks & Beverages',
              'Home & Kitchen',
              'Beauty & Hygiene',
              'Ice Cream & Desserts'
            ].map((category, index) => (
              <span
                key={index}
                className="text-sm font-medium text-gray-600 hover:text-green-600 whitespace-nowrap cursor-pointer"
              >
                {category}
              </span>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="lg:hidden px-4 py-3 border-t border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <MapPinIcon className="w-5 h-5 text-green-600" />
              <span>Connaught Place, Delhi</span>
            </div>
            <div 
              className="flex items-center space-x-2 text-gray-700 cursor-pointer"
              onClick={handleLoginClick}
            >
              <UserIcon className="w-5 h-5" />
              <span>Login/Signup</span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium mb-2">Categories</h4>
              <div className="space-y-2">
                {[
                  'Groceries',
                  'Fruits & Vegetables',
                  'Dairy',
                  'Snacks',
                  'Home',
                  'Beauty',
                  'Ice Cream'
                ].map((item, index) => (
                  <div key={index} className="text-gray-600">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}