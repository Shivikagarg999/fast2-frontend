"use client";
import { Suspense, useState, useEffect, useRef } from 'react';
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
  ArrowRightOnRectangleIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Logo from '../../../assets/images/logo.png';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

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

// Search input component that uses useSearchParams
function SearchInput({ productSearchQuery, setProductSearchQuery }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleProductSearchChange = (e) => {
    const query = e.target.value;
    setProductSearchQuery(query);
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <input
      type="text"
      placeholder="Search any product..."
      className="w-full pl-10 pr-4 text-black py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      value={productSearchQuery}
      onChange={handleProductSearchChange}
    />
  );
}

// Mobile search input component
function MobileSearchInput({ productSearchQuery, setProductSearchQuery }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleProductSearchChange = (e) => {
    const query = e.target.value;
    setProductSearchQuery(query);
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <input
      type="text"
      placeholder="Search for products..."
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      value={productSearchQuery}
      onChange={handleProductSearchChange}
    />
  );
}

// Fallback components for the search inputs
const SearchInputFallback = () => (
  <input
    type="text"
    placeholder="Search any product..."
    className="w-full pl-10 pr-4 text-black py-2 border border-gray-300 rounded-lg"
    disabled
  />
);

const MobileSearchInputFallback = () => (
  <input
    type="text"
    placeholder="Search for products..."
    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
    disabled
  />
);

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
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [useMapboxSearch, setUseMapboxSearch] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const locationDropdownRef = useRef(null);
  const mobileLocationDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Initialize product search query from URL on client side
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const searchQueryFromUrl = urlParams.get('search') || '';
      setProductSearchQuery(searchQueryFromUrl);
    }
  }, []);

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

  const filteredLocations = locations.filter(location => 
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Enhanced click outside handler for mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      // For desktop location dropdown
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setIsLocationDropdownOpen(false);
        setSearchQuery('');
        setUseMapboxSearch(false);
        setLocationError('');
      }
      
      // For mobile location dropdown
      if (mobileLocationDropdownRef.current && !mobileLocationDropdownRef.current.contains(event.target)) {
        setIsLocationDropdownOpen(false);
        setSearchQuery('');
        setUseMapboxSearch(false);
        setLocationError('');
      }
      
      // For profile dropdown
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    // Add both mouse and touch events for better mobile support
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    checkAuthStatus();
    window.addEventListener('storage', checkAuthStatus);
    const handleAuthChange = () => checkAuthStatus();
    window.addEventListener('authChange', handleAuthChange);
    const savedLocation = localStorage.getItem('selectedLocation');
    if (savedLocation) {
      setSelectedLocation(savedLocation);
    }

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoggedIn) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://api.fast2.in/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setWalletBalance(userData.wallet || 0);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch('https://api.fast2.in/api/category/getall');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.error('Failed to fetch categories');
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

  // Enhanced geolocation function for mobile
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);
    setLocationError('');

    // Mobile browsers often require user gesture for geolocation
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const location = await getLocationNameFromCoords(latitude, longitude);
          handleLocationSelect(location);
        } catch (error) {
          console.error('Error getting location name:', error);
          const fallbackLocation = {
            text: 'Current Location',
            place_name: `Your location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            center: [longitude, latitude]
          };
          handleLocationSelect(fallbackLocation);
          setLocationError('Location detected! You can search for exact address if needed.');
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        handleGeolocationError(error);
      },
      {
        enableHighAccuracy: true, // Better accuracy for mobile
        timeout: 15000, // Longer timeout for mobile
        maximumAge: 300000
      }
    );
  };

  const getLocationNameFromCoords = async (latitude, longitude) => {
    try {
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (mapboxToken) {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&limit=1`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            return data.features[0];
          }
        }
      }
      
      const osmResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      
      if (osmResponse.ok) {
        const data = await osmResponse.json();
        if (data.display_name) {
          return {
            text: data.display_name.split(',')[0],
            place_name: data.display_name,
            center: [longitude, latitude]
          };
        }
      }
      
      throw new Error('Could not get location name');
      
    } catch (error) {
      throw error;
    }
  };

  const handleGeolocationError = (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setLocationError('Location access denied. Please enable location permissions in your browser settings and refresh the page.');
        break;
      case error.POSITION_UNAVAILABLE:
        setLocationError('Your location is unavailable. Please check your device location services.');
        break;
      case error.TIMEOUT:
        setLocationError('Location request timed out. Please try again.');
        break;
      default:
        setLocationError('Could not get your location. Please try again or search manually.');
        break;
    }
  };

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

  const handleWalletClick = () => {
    closeMenu();
    router.push('/pages/wallet');
  };

  const handleReferralsClick = () => {
    closeMenu();
    router.push('/referrals');
  };

  const handleLogout = () => {
    closeMenu();
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsProfileDropdownOpen(false);
    setWalletBalance(0);
    window.dispatchEvent(new Event('authChange'));
    router.push('/');
  };

  const handleCartClick = () => {
    if (!isLoggedIn) return; 
    closeMenu();
    cartEvents.publish();
  };

  const handleCategoryClick = (categoryName) => {
    closeMenu();
    router.push(`/category/${encodeURIComponent(categoryName.toLowerCase())}`);
  };

  const handleLocationSelect = (location) => {
    let locationName;
    if (location.place_name) {
      locationName = location.text || location.place_name;
    } else {
      locationName = `${location.name}, ${location.area}`;
    }
    
    setSelectedLocation(locationName);
    localStorage.setItem('selectedLocation', locationName);
    localStorage.setItem('selectedLocationDetails', JSON.stringify(location));
    setIsLocationDropdownOpen(false);
    setSearchQuery('');
    setUseMapboxSearch(false);
    setLocationError('');
  };

  // Enhanced location click handler for mobile
  const handleLocationClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLocationDropdownOpen(!isLocationDropdownOpen);
    if (!isLocationDropdownOpen) {
      setSearchQuery('');
      setUseMapboxSearch(false);
      setLocationError('');
    }
  };

  // Enhanced location selection for mobile
  const handleLocationItemClick = (location) => {
    handleLocationSelect(location);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleSearchFocus = () => {
    setUseMapboxSearch(true);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 0) {
      setUseMapboxSearch(true);
    }
  };

  const formatWalletBalance = (balance) => {
    return parseFloat(balance).toFixed(2);
  };

  // Mobile-optimized location dropdown component
  const LocationDropdown = ({ isMobile = false }) => (
    <div className={`absolute top-full left-0 mt-2 ${
      isMobile ? 'w-full' : 'w-80'
    } bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden`}>
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Choose your location</h3>
        <p className="text-sm text-gray-600 mt-1">Select area for accurate delivery time</p>
      </div>
      
      <div className="p-4 border-b border-gray-100">
        <button
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border transition-colors ${
            isGettingLocation
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200'
          }`}
        >
          <DevicePhoneMobileIcon className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isGettingLocation ? 'Getting your location...' : 'Use my current location'}
          </span>
        </button>
        
        {locationError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600">{locationError}</p>
          </div>
        )}
      </div>
      
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
              className="w-full pl-9 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              autoFocus={!isMobile} // Don't auto-focus on mobile to prevent keyboard popup
            />
          </div>
        )}
      </div>
      
      {!useMapboxSearch && (
        <div className="max-h-72 overflow-y-auto">
          {filteredLocations.length > 0 ? (
            <div className="py-2">
              {filteredLocations.map((location) => (
                <div 
                  key={location.id}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 active:bg-blue-100"
                  onClick={() => handleLocationItemClick(location)}
                  onTouchStart={() => {}} // Add touch handler
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
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 active:bg-blue-100"
                  onClick={() => handleLocationItemClick(location)}
                  onTouchStart={() => {}}
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
      
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          Can't find your location? We're expanding soon!
        </div>
      </div>
    </div>
  );

  return (
    <header className="bg-white text-black sticky top-0 w-full z-50">
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
                  priority // Add priority for mobile loading
                />
              </div>

              {/* Mobile Location Picker */}
              <div className="md:hidden relative" ref={mobileLocationDropdownRef}>
                <div 
                  className="flex items-center space-x-2 cursor-pointer hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-50 min-w-0 active:bg-gray-100"
                  onClick={handleLocationClick}
                  onTouchStart={handleLocationClick}
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

                {isLocationDropdownOpen && <LocationDropdown isMobile={true} />}
              </div>

              {/* Desktop Location Picker */}
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

                {isLocationDropdownOpen && <LocationDropdown />}
              </div>

            </div>

            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                </div>
                <Suspense fallback={<SearchInputFallback />}>
                  <SearchInput 
                    productSearchQuery={productSearchQuery}
                    setProductSearchQuery={setProductSearchQuery}
                  />
                </Suspense>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="hidden md:flex items-center space-x-3 relative" ref={profileDropdownRef}>
                  <div className="flex items-center space-x-1 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5">
                    <BanknotesIcon className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-700">
                      ₹{formatWalletBalance(walletBalance)}
                    </span>
                  </div>

                  <div 
                    className="flex items-center space-x-2 cursor-pointer hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                    onClick={toggleProfileDropdown}
                    onTouchStart={toggleProfileDropdown}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      isProfileDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </div>
                  
                  {isProfileDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                      <div className="py-1">
                        <div 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100"
                          onClick={handleProfileClick}
                          onTouchStart={handleProfileClick}
                        >
                          <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-400" />
                          <span>My Profile</span>
                        </div>
                        
                        <div 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100"
                          onClick={handleSavedAddresses}
                          onTouchStart={handleSavedAddresses}
                        >
                          <MapIcon className="w-5 h-5 mr-3 text-gray-400" />
                          <span>Saved Addresses</span>
                        </div>
                        
                        <div 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100"
                          onClick={handleOrdersClick}
                          onTouchStart={handleOrdersClick}
                        >
                          <InboxIcon className="w-5 h-5 mr-3 text-gray-400" />
                          <span>My Orders</span>
                        </div>

                        <div 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100"
                          onClick={handleReferralsClick}
                          onTouchStart={handleReferralsClick}
                        >
                          <UserGroupIcon className="w-5 h-5 mr-3 text-gray-400" />
                          <span>Refer & Earn</span>
                        </div>
                        
                        <div className="border-t border-gray-100 my-1"></div>
                        
                        <div 
                          className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100"
                          onClick={handleLogout}
                          onTouchStart={handleLogout}
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
                  className="hidden md:flex items-center space-x-2 cursor-pointer hover:text-blue-600 transition-colors active:bg-gray-100 p-2 rounded-lg"
                  onClick={handleLoginClick}
                  onTouchStart={handleLoginClick}
                >
                  <UserIcon className="w-6 h-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Login/Signup</span>
                </div>
              )}

              <div 
                className={`flex items-center space-x-1 p-2 rounded-lg transition-colors ${
                  isLoggedIn 
                    ? 'text-gray-700 cursor-pointer hover:text-blue-600 hover:bg-gray-50 active:bg-gray-100' 
                    : 'text-gray-400 cursor-not-allowed opacity-60'
                }`}
                onClick={isLoggedIn ? handleCartClick : undefined}
                onTouchStart={isLoggedIn ? handleCartClick : undefined}
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

              <button 
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                onTouchStart={() => setIsMenuOpen(!isMenuOpen)}
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
      
      {/* Mobile Search */}
      <div className="lg:hidden px-4 py-3 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </div>
          <Suspense fallback={<MobileSearchInputFallback />}>
            <MobileSearchInput 
              productSearchQuery={productSearchQuery}
              setProductSearchQuery={setProductSearchQuery}
            />
          </Suspense>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-4">
            {isLoggedIn && (
              <div className="flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <BanknotesIcon className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Wallet Balance</p>
                  <p className="text-lg font-bold text-yellow-700">
                    ₹{formatWalletBalance(walletBalance)}
                  </p>
                </div>
              </div>
            )}
            
            {isLoggedIn ? (
              <>
                <div 
                  className="flex items-center space-x-2 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors py-2 active:bg-gray-100 p-2 rounded-lg"
                  onClick={handleProfileClick}
                  onTouchStart={handleProfileClick}
                >
                  <UserIcon className="w-5 h-5" />
                  <span>My Profile</span>
                </div>
                <div 
                  className="flex items-center space-x-2 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors py-2 active:bg-gray-100 p-2 rounded-lg"
                  onClick={handleSavedAddresses}
                  onTouchStart={handleSavedAddresses}
                >
                  <MapIcon className="w-5 h-5" />
                  <span>Saved Addresses</span>
                </div>
                <div 
                  className="flex items-center space-x-2 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors py-2 active:bg-gray-100 p-2 rounded-lg"
                  onClick={handleOrdersClick}
                  onTouchStart={handleOrdersClick}
                >
                  <InboxIcon className="w-5 h-5" />
                  <span>My Orders</span>
                </div>
                <div 
                  className="flex items-center space-x-2 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors py-2 active:bg-gray-100 p-2 rounded-lg"
                  onClick={handleReferralsClick}
                  onTouchStart={handleReferralsClick}
                >
                  <UserGroupIcon className="w-5 h-5" />
                  <span>Refer & Earn</span>
                </div>
                <div 
                  className="flex items-center space-x-2 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors py-2 active:bg-gray-100 p-2 rounded-lg"
                  onClick={handleLogout}
                  onTouchStart={handleLogout}
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Logout</span>
                </div>
              </>
            ) : (
              <div 
                className="flex items-center space-x-2 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors py-2 active:bg-gray-100 p-2 rounded-lg"
                onClick={handleLoginClick}
                onTouchStart={handleLoginClick}
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
                      className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors py-2 active:bg-gray-100 p-2 rounded-lg"
                      onClick={() => handleCategoryClick(category.name)}
                      onTouchStart={() => handleCategoryClick(category.name)}
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