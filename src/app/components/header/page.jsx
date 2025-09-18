"use client";
import { useState, useEffect, useRef } from 'react';
import { 
  MagnifyingGlassIcon, 
  ShoppingCartIcon, 
  UserIcon, 
  Bars3Icon,
  XMarkIcon,
  MapPinIcon,
  ChevronDownIcon,
  ClockIcon,
  Cog6ToothIcon,
  MapIcon,
  InboxIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Logo from '../../../assets/images/logo.png';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import MapboxGeocoder to avoid SSR issues
const MapboxGeocoder = dynamic(() => import('../mapbox/mapboxGeocoder'), {
  ssr: false,
  loading: () => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search for area, street name..."
        className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        disabled
      />
    </div>
  )
});

const cartEvents = {
  listeners: [],
  subscribe: (callback) => {
    cartEvents.listeners.push(callback);
  },
  unsubscribe: (callback) => {
    cartEvents.listeners = cartEvents.listeners.filter(listener => listener !== callback);
  },
  publish: () => {
    cartEvents.listeners.forEach(listener => listener());
  }
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Select your location');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [useMapboxSearch, setUseMapboxSearch] = useState(false);
  const locationDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const router = useRouter();

  // Sample locations data
  const locations = [
    { id: 1, name: "Connaught Place", area: "New Delhi", deliveryTime: "10-15 min" },
    { id: 2, name: "Karol Bagh", area: "New Delhi", deliveryTime: "15-20 min" },
    { id: 3, name: "Rajouri Garden", area: "New Delhi", deliveryTime: "12-17 min" },
    { id: 4, name: "Hauz Khas", area: "New Delhi", deliveryTime: "8-12 min" },
    { id: 5, name: "Saket", area: "New Delhi", deliveryTime: "10-15 min" },
    { id: 6, name: "Greater Kailash", area: "New Delhi", deliveryTime: "12-18 min" },
    { id: 7, name: "Pitampura", area: "New Delhi", deliveryTime: "15-20 min" },
    { id: 8, name: "Dwarka", area: "New Delhi", deliveryTime: "18-25 min" },
    { id: 9, name: "Gurgaon Sector 14", area: "Gurugram", deliveryTime: "12-18 min" },
    { id: 10, name: "Cyber City", area: "Gurugram", deliveryTime: "10-15 min" },
    { id: 11, name: "MG Road", area: "Gurugram", deliveryTime: "15-20 min" },
    { id: 12, name: "DLF Phase 1", area: "Gurugram", deliveryTime: "8-13 min" }
  ];

  // Filter locations based on search query
  const filteredLocations = locations.filter(location => 
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setIsLocationDropdownOpen(false);
        setSearchQuery('');
        setUseMapboxSearch(false);
      }
      
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if token exists on component mount and when token changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    // Check initially
    checkAuthStatus();

    // Listen for storage changes
    window.addEventListener('storage', checkAuthStatus);
    
    // Custom event listener for login/logout
    const handleAuthChange = () => checkAuthStatus();
    window.addEventListener('authChange', handleAuthChange);

    // Check for saved location
    const savedLocation = localStorage.getItem('selectedLocation');
    if (savedLocation) {
      setSelectedLocation(savedLocation);
    }

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch('https://api.fast2.in/api/category/');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.error('Failed to fetch categories');
          // Fallback to hardcoded categories if API fails
          setCategories([
            { name: 'Groceries' },
            { name: 'Fruits & Vegetables' },
            { name: 'Dairy' },
            { name: 'Snacks' },
            { name: 'Home' },
            { name: 'Beauty' },
            { name: 'Ice Cream' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to hardcoded categories if API fails
        setCategories([
          { name: 'Groceries' },
          { name: 'Fruits & Vegetables' },
          { name: 'Dairy' },
          { name: 'Snacks' },
          { name: 'Home' },
          { name: 'Beauty' },
          { name: 'Ice Cream' }
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLoginClick = () => {
    closeMenu();
    router.push('/login');
  };

  const handleProfileClick = () => {
    closeMenu();
    router.push('/pages/profile');
  };

  const handleSavedAddresses = () => {
    closeMenu();
    router.push('/pages/addresses');
  };

  const handleOrdersClick = () => {
    closeMenu();
    router.push('/pages/orders');
  };

  const handleLogout = () => {
    closeMenu();
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsProfileDropdownOpen(false);
    window.dispatchEvent(new Event('authChange'));
    router.push('/');
  };

  const handleCartClick = () => {
    if (!isLoggedIn) return; // Don't open cart if not logged in
    closeMenu();
    cartEvents.publish();
  };

  const handleCategoryClick = (categoryName) => {
    closeMenu();
    router.push(`/category/${encodeURIComponent(categoryName.toLowerCase())}`);
  };

  const handleLocationSelect = (location) => {
    // Handle both Mapbox results and our sample locations
    let locationName;
    if (location.place_name) {
      // This is a Mapbox result
      locationName = location.text || location.place_name;
    } else {
      // This is a sample location
      locationName = `${location.name}, ${location.area}`;
    }
    
    setSelectedLocation(locationName);
    localStorage.setItem('selectedLocation', locationName);
    localStorage.setItem('selectedLocationDetails', JSON.stringify(location));
    setIsLocationDropdownOpen(false);
    setSearchQuery('');
    setUseMapboxSearch(false);
  };

  const handleLocationClick = () => {
    setIsLocationDropdownOpen(!isLocationDropdownOpen);
    if (!isLocationDropdownOpen) {
      setSearchQuery('');
      setUseMapboxSearch(false);
    }
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleSearchFocus = () => {
    setUseMapboxSearch(true);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Switch to Mapbox search if the user starts typing
    if (e.target.value.length > 0) {
      setUseMapboxSearch(true);
    }
  };

  return (
    <header className="bg-white text-black shadow-md sticky top-0 w-full z-50">
      {/* Top Section */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            
            <div className="flex items-center space-x-6">
              
              <div className="flex items-center">
                <Image
                  src={Logo}
                  alt="Fast2"
                  width={220}
                  height={100}
                  className="h-22 w-auto object-contain"
                />
              </div>

              {/* Location Selector Dropdown */}
              <div className="hidden md:block relative" ref={locationDropdownRef}>
                <div 
                  className="flex items-center space-x-2 cursor-pointer hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-50 min-w-0"
                  onClick={handleLocationClick}
                >
                  <MapPinIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs text-gray-500 whitespace-nowrap">Delivering to</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-800 max-w-[140px] truncate">
                        {selectedLocation}
                      </span>
                      <ChevronDownIcon className={`w-4 h-4 text-gray-500 ml-1 flex-shrink-0 transition-transform duration-200 ${
                        isLocationDropdownOpen ? 'rotate-180' : ''
                      }`} />
                    </div>
                  </div>
                </div>

                {/* Location Dropdown */}
                {isLocationDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                      <h3 className="text-lg font-semibold text-gray-900">Choose your location</h3>
                      <p className="text-sm text-gray-600 mt-1">Select area for accurate delivery time</p>
                    </div>
                    
                    {/* Search - Show either Mapbox or regular search, not both */}
                    <div className="p-4 border-b border-gray-100">
                      {useMapboxSearch ? (
                        <MapboxGeocoder 
                          onSelectLocation={handleLocationSelect}
                          placeholder="Search for area, street name..."
                        />
                      ) : (
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            placeholder="Search for area, street name..."
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={handleSearchFocus}
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Locations List - Only show when not using Mapbox search */}
                    {!useMapboxSearch && (
                      <div className="max-h-72 overflow-y-auto">
                        {filteredLocations.length > 0 ? (
                          <div className="py-2">
                            {filteredLocations.map((location) => (
                              <div 
                                key={location.id}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                                onClick={() => handleLocationSelect(location)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900 text-sm">
                                      {location.name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {location.area}
                                    </div>
                                  </div>
                                  <div className="flex items-center text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                                    <ClockIcon className="w-3 h-3 mr-1" />
                                    {location.deliveryTime}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : searchQuery.length > 0 ? (
                          <div className="p-6 text-center">
                            <div className="text-gray-400 mb-2">
                              <MapPinIcon className="w-8 h-8 mx-auto" />
                            </div>
                            <div className="text-sm text-gray-500">
                              No locations found
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Try a different search term
                            </div>
                          </div>
                        ) : (
                          <div className="py-2">
                            {locations.map((location) => (
                              <div 
                                key={location.id}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                                onClick={() => handleLocationSelect(location)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900 text-sm">
                                      {location.name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {location.area}
                                    </div>
                                  </div>
                                  <div className="flex items-center text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                                    <ClockIcon className="w-3 h-3 mr-1" />
                                    {location.deliveryTime}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Footer */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                      <div className="text-xs text-gray-500 text-center">
                        Can't find your location? We're expanding soon!
                      </div>
                    </div>
                  </div>
                )}
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
                  placeholder="Search any product..."
                  className="w-full pl-10 pr-4 text-black py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-4">
              {/* Login/Signup or Profile */}
              {isLoggedIn ? (
                <div className="hidden md:flex items-center space-x-3 relative" ref={profileDropdownRef}>
                  {/* Profile Dropdown */}
                  <div 
                    className="flex items-center space-x-2 cursor-pointer hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
                    onClick={toggleProfileDropdown}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">My Account</span>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      isProfileDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </div>
                  
                  {/* Profile Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                      <div className="py-1">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">Welcome!</p>
                        </div>
                        
                        <div 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={handleProfileClick}
                        >
                          <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-400" />
                          <span>My Profile</span>
                        </div>
                        
                        <div 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={handleSavedAddresses}
                        >
                          <MapIcon className="w-5 h-5 mr-3 text-gray-400" />
                          <span>Saved Addresses</span>
                        </div>
                        
                        <div 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={handleOrdersClick}
                        >
                          <InboxIcon className="w-5 h-5 mr-3 text-gray-400" />
                          <span>My Orders</span>
                        </div>
                        
                        <div className="border-t border-gray-100 my-1"></div>
                        
                        <div 
                          className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={handleLogout}
                        >
                          <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                          <span>Log Out</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="hidden md:flex items-center space-x-2 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={handleLoginClick}
                >
                  <UserIcon className="w-6 h-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Login/Signup</span>
                </div>
              )}

              {/* Cart - Disabled when not logged in */}
              <div 
                className={`flex items-center space-x-1 p-2 rounded-lg transition-colors ${
                  isLoggedIn 
                    ? 'text-gray-700 cursor-pointer hover:text-blue-600 hover:bg-gray-50' 
                    : 'text-gray-400 cursor-not-allowed opacity-60'
                }`}
                onClick={isLoggedIn ? handleCartClick : undefined}
              >
                <div className="relative">
                  <ShoppingCartIcon className="w-7 h-7" />
                  {isLoggedIn && cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {cartItemCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium">Cart</span>
              </div>

              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
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

      {/* Mobile Search Bar */}
      <div className="lg:hidden px-4 py-3 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-4">
            {/* Location in Mobile Menu */}
            <div 
              className="flex items-center space-x-2 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors py-2"
              onClick={handleLocationClick}
            >
              <MapPinIcon className="w-5 h-5 text-blue-600" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Delivering to</span>
                <span className="text-sm font-medium">{selectedLocation}</span>
              </div>
            </div>
            
            {isLoggedIn ? (
              <>
                <div 
                  className="flex items-center space-x-2 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors py-2"
                  onClick={handleProfileClick}
                >
                  <UserIcon className="w-5 h-5" />
                  <span>My Profile</span>
                </div>
                <div 
                  className="flex items-center space-x-2 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors py-2"
                  onClick={handleSavedAddresses}
                >
                  <MapIcon className="w-5 h-5" />
                  <span>Saved Addresses</span>
                </div>
                <div 
                  className="flex items-center space-x-2 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors py-2"
                  onClick={handleOrdersClick}
                >
                  <InboxIcon className="w-5 h-5" />
                  <span>My Orders</span>
                </div>
                <div 
                  className="flex items-center space-x-2 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors py-2"
                  onClick={handleLogout}
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Logout</span>
                </div>
              </>
            ) : (
              <div 
                className="flex items-center space-x-2 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors py-2"
                onClick={handleLoginClick}
              >
                <UserIcon className="w-5 h-5" />
                <span>Login/Signup</span>
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium mb-2">Categories</h4>
              <div className="space-y-2">
                {loadingCategories ? (
                  <div className="text-gray-500 py-1">Loading categories...</div>
                ) : (
                  categories.map((category, index) => (
                    <div 
                      key={index} 
                      className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors py-2"
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      {category.image && (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-6 h-6 object-cover rounded"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <span>{category.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export { cartEvents };