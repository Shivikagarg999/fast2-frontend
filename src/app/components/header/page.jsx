"use client";
import { Suspense, useState, useEffect, useRef } from 'react';
import { 
  MagnifyingGlassIcon, 
  ShoppingCartIcon, 
  UserIcon, 
  Bars3Icon,
  XMarkIcon,
  Cog6ToothIcon,
  MapIcon,
  InboxIcon,
  ArrowRightOnRectangleIcon,
  BanknotesIcon,
  UserGroupIcon,
  MapPinIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Logo from '../../../assets/images/logo.png';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

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

function LocationSelector({ isMobile = false, onLocationSelect }) {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [pincode, setPincode] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const locationRef = useRef(null);

  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    const savedPincode = localStorage.getItem('userPincode');
    const savedStreetAddress = localStorage.getItem('userStreetAddress');
    
    if (savedLocation) {
      setSelectedLocation(savedLocation);
    }
    if (savedPincode) {
      setPincode(savedPincode);
    }
    if (savedStreetAddress) {
      setStreetAddress(savedStreetAddress);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
        setSearchResults([]);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!token) {
        throw new Error('Mapbox token not configured');
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${token}` +
        `&country=in` +
        `&types=place,locality,neighborhood,address,postcode` +
        `&autocomplete=true` +
        `&limit=5`
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error('Location search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchLocations(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const extractLocationName = (feature) => {
    if (!feature) return null;
    
    if (feature.place_name && !feature.place_name.includes(',')) {
      return feature.place_name;
    }
    
    const { text, context } = feature;
    
    if (text && context) {
      const localityContext = context.find(ctx => ctx.id.includes('locality'));
      const placeContext = context.find(ctx => ctx.id.includes('place'));
      const regionContext = context.find(ctx => ctx.id.includes('region'));
      const postcodeContext = context.find(ctx => ctx.id.includes('postcode'));
      
      const locality = localityContext?.text;
      const place = placeContext?.text;
      const region = regionContext?.text;
      const pincode = postcodeContext?.text;
      
      if (locality && region && locality !== region) {
        return `${locality}, ${region}`;
      } else if (place && region && place !== region) {
        return `${place}, ${region}`;
      } else if (locality) {
        return locality;
      } else if (place) {
        return place;
      } else if (region) {
        return region;
      } else if (text) {
        return text;
      }
    }
    
    if (text) {
      return text;
    }
    
    return null;
  };

  const extractPincode = (feature) => {
    if (!feature) return '';
    
    const postcodeContext = feature.context?.find(ctx => ctx.id.includes('postcode'));
    return postcodeContext?.text || '';
  };

  const handleSaveLocation = () => {
    if (!pincode || !streetAddress) {
      alert('Please enter both street address and pincode');
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }

    const locationData = {
      streetAddress,
      pincode,
      locationName: selectedLocation || streetAddress
    };

    localStorage.setItem('userStreetAddress', streetAddress);
    localStorage.setItem('userPincode', pincode);
    localStorage.setItem('userLocation', locationData.locationName);
    localStorage.setItem('userLocationData', JSON.stringify(locationData));

    setShowLocationDropdown(false);
    
    if (onLocationSelect) {
      onLocationSelect(locationData);
    }

    alert(`Location set to: ${streetAddress}, ${pincode}`);
  };

  const handleLocationSelect = (location) => {
    const locationName = extractLocationName(location);
    const locationPincode = extractPincode(location);
    
    if (locationName && locationName !== 'Selected Location') {
      setSelectedLocation(locationName);
      setStreetAddress(locationName);
      if (locationPincode) {
        setPincode(locationPincode);
      }
    }
  };

  const commonLocations = [
    { name: 'Sonipat, Haryana', pincode: '131001' },
    { name: 'Panipat, Haryana', pincode: '132103' },
    { name: 'Rohtak, Haryana', pincode: '124001' },
    { name: 'Karnal, Haryana', pincode: '132001' },
    { name: 'Connaught Place, New Delhi', pincode: '110001' },
    { name: 'Gurugram Sector 14, Haryana', pincode: '122001' },
    { name: 'Noida Sector 18, Uttar Pradesh', pincode: '201301' },
    { name: 'Greater Kailash, Delhi', pincode: '110048' },
    { name: 'Saket, Delhi', pincode: '110017' },
    { name: 'Hauz Khas, Delhi', pincode: '110016' }
  ];

  const handleManualLocationSelect = (location) => {
    setSelectedLocation(location.name);
    setStreetAddress(location.name);
    setPincode(location.pincode);
  };

  const displayLocation = selectedLocation || 'Select your location';

  return (
    <div className="relative" ref={locationRef}>
      <div 
        className={`flex items-center cursor-pointer group ${
          isMobile ? 'w-full' : 'w-64'
        }`}
        onClick={() => setShowLocationDropdown(!showLocationDropdown)}
      >
        <div className={`
          flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg 
          transition-colors duration-200 border border-gray-200 w-full
          ${isMobile ? 'justify-center' : ''}
        `}>
          <MapPinIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs text-gray-500 whitespace-nowrap">Delivery to</span>
            <span className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
              {displayLocation}
            </span>
            {pincode && (
              <span className="text-xs text-gray-500">Pincode: {pincode}</span>
            )}
          </div>
          <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
            showLocationDropdown ? 'rotate-180' : ''
          }`} />
        </div>
      </div>

      {showLocationDropdown && (
        <div className={`
          absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden
          ${isMobile ? 'w-full' : 'w-96'}
        `}>
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900 mb-3">Set Delivery Location</h3>
            
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="Enter your street address..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit pincode"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={pincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setPincode(value);
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleSaveLocation}
              disabled={!pincode || !streetAddress || pincode.length !== 6}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Save Location
            </button>

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-2 text-xs text-gray-500">OR</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search for area, street name..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="mb-3 max-h-40 overflow-y-auto">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Search Results
                </h4>
                <div className="space-y-1">
                  {searchResults.map((location, index) => {
                    const locationName = extractLocationName(location);
                    const locationPincode = extractPincode(location);
                    if (locationName && locationName !== 'Selected Location') {
                      return (
                        <div
                          key={location.id || index}
                          onClick={() => handleLocationSelect(location)}
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                        >
                          <div className="flex items-center space-x-3">
                            <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-700">
                              {locationName}
                            </span>
                          </div>
                          {locationPincode && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {locationPincode}
                            </span>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Popular Locations
              </h4>
              <div className="space-y-1">
                {commonLocations.map((location, index) => (
                  <div
                    key={index}
                    onClick={() => handleManualLocationSelect(location)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  >
                    <div className="flex items-center space-x-3">
                      <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{location.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {location.pincode}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Products will be filtered based on your pincode
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

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

function HeaderContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [userName, setUserName] = useState('User');
  const [userPincode, setUserPincode] = useState('');
  const profileDropdownRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  if (pathname.startsWith('/deliver') || pathname.startsWith('/warehouse')) {
    return null;
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const searchQueryFromUrl = urlParams.get('search') || '';
      setProductSearchQuery(searchQueryFromUrl);
      
      const savedPincode = localStorage.getItem('userPincode');
      if (savedPincode) {
        setUserPincode(savedPincode);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        const response = await fetch('http://localhost:5000/api/user/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
       
        if (response.ok) {
          const userData = await response.json();
          setWalletBalance(userData.wallet || 0);
          setUserName(userData.name || 'User');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchCartItemCount = async () => {
      if (!isLoggedIn) {
        setCartItemCount(0);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/cart/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const cartData = await response.json();
          const totalItems = cartData.items?.reduce((total, item) => {
            return total + (item.quantity || 0);
          }, 0) || 0;
          
          setCartItemCount(totalItems);
        } else {
          setCartItemCount(0);
        }
      } catch (error) {
        console.error('Error fetching cart count:', error);
        setCartItemCount(0);
      }
    };

    fetchCartItemCount();
  }, [isLoggedIn]);

  useEffect(() => {
    const handleCartUpdate = () => {
      const fetchCartCount = async () => {
        if (!isLoggedIn) {
          setCartItemCount(0);
          return;
        }

        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/api/cart/', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const cartData = await response.json();
            const totalItems = cartData.items?.reduce((total, item) => {
              return total + (item.quantity || 0);
            }, 0) || 0;
            
            setCartItemCount(totalItems);
          }
        } catch (error) {
          console.error('Error fetching updated cart count:', error);
        }
      };

      fetchCartCount();
    };

    cartEvents.subscribe(handleCartUpdate);
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      cartEvents.unsubscribe(handleCartUpdate);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch('http://localhost:5000/api/category/getall');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
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

  const handleLocationSelect = (locationData) => {
    setUserPincode(locationData.pincode);
    window.dispatchEvent(new CustomEvent('locationUpdated', { detail: locationData }));
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
    setUserName('User');
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

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const formatWalletBalance = (balance) => {
    return parseFloat(balance).toFixed(2);
  };

  return (
    <header className="bg-white text-black sticky top-0 w-full z-50">
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            
            <div className="flex items-center space-x-6">
              <div className="hidden lg:flex items-center">
                <Image
                  src={Logo}
                  alt="Fast2"
                  width={120}
                  height={50}
                  className="h-auto object-contain"
                />
              </div>

              <div className="hidden lg:block">
                <LocationSelector isMobile={false} onLocationSelect={handleLocationSelect} />
              </div>

              <div className="lg:hidden">
                <LocationSelector isMobile={true} onLocationSelect={handleLocationSelect} />
              </div>
            </div>

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
                    className="flex items-center space-x-2 cursor-pointer hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
                    onClick={toggleProfileDropdown}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{userName}</span>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      isProfileDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </div>
                  
                  {isProfileDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                      <div className="py-1">
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

                        <div 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={handleReferralsClick}
                        >
                          <UserGroupIcon className="w-5 h-5 mr-3 text-gray-400" />
                          <span>Refer & Earn</span>
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
                  {isLoggedIn && (
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {cartItemCount > 0 ? cartItemCount : 0}
                    </span>
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium">Cart</span>
              </div>

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

      {isMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-4">
            {isLoggedIn && (
              <>
                <div className="flex items-center space-x-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">Welcome back!</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <BanknotesIcon className="w-6 h-6 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Wallet Balance</p>
                    <p className="text-lg font-bold text-yellow-700">
                      ₹{formatWalletBalance(walletBalance)}
                    </p>
                  </div>
                </div>
              </>
            )}
            
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
                  onClick={handleReferralsClick}
                >
                  <UserGroupIcon className="w-5 h-5" />
                  <span>Refer & Earn</span>
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

export default function Header() {
  return <HeaderContent />;
}

export { cartEvents };