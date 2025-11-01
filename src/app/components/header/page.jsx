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

function LocationSelector({ isMobile = false }) {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const locationRef = useRef(null);

  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation && !savedLocation.includes('(') && !savedLocation.includes('Location near')) {
      setSelectedLocation(savedLocation);
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
        `&types=place,locality,neighborhood,address` +
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
      const countryContext = context.find(ctx => ctx.id.includes('country'));
      
      const locality = localityContext?.text;
      const place = placeContext?.text;
      const region = regionContext?.text;
      
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

  const reverseGeocode = async (lat, lng) => {
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      
      if (!token) {
        throw new Error('Mapbox token not found');
      }

      if (typeof lat !== 'number' || typeof lng !== 'number') {
        throw new Error('Invalid coordinates received');
      }

      const apiUrl = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`);
      apiUrl.searchParams.set('access_token', token);
      apiUrl.searchParams.set('types', 'region,place,locality,neighborhood,district,postcode');
      apiUrl.searchParams.set('limit', '10');
      apiUrl.searchParams.set('country', 'in');

      const response = await fetch(apiUrl.toString());

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.features || data.features.length === 0) {
        throw new Error('No location results found');
      }

      console.log('All reverse geocode results:', data.features.map(f => ({
        place_name: f.place_name,
        types: f.place_type,
        text: f.text,
        relevance: f.relevance
      })));

      let bestResult = null;
      
      for (const feature of data.features) {
        const locationName = extractLocationName(feature);
        
        if (!locationName) continue;
        
        if (locationName.includes('(') || 
            locationName.includes(lat.toFixed(2)) || 
            locationName.includes(lng.toFixed(2)) ||
            locationName.toLowerCase().includes('unnamed') ||
            locationName === 'Selected Location') {
          continue;
        }
        
        if (!bestResult) {
          bestResult = { feature, name: locationName };
          continue;
        }
        
        if (feature.place_type.includes('locality') && !bestResult.feature.place_type.includes('locality')) {
          bestResult = { feature, name: locationName };
        } else if (feature.place_type.includes('place') && !bestResult.feature.place_type.includes('locality') && !bestResult.feature.place_type.includes('place')) {
          bestResult = { feature, name: locationName };
        } else if (feature.place_type.includes('region') && !bestResult.feature.place_type.includes('locality') && !bestResult.feature.place_type.includes('place') && !bestResult.feature.place_type.includes('region')) {
          bestResult = { feature, name: locationName };
        }
      }

      if (bestResult && bestResult.name) {
        console.log('Selected location:', bestResult.name);
        return bestResult.name;
      }

      const firstResult = data.features[0];
      if (firstResult.place_name && !firstResult.place_name.includes(',')) {
        return firstResult.place_name;
      }

      if (firstResult.text) {
        return firstResult.text;
      }

      throw new Error('No valid location name found');

    } catch (error) {
      console.error('Reverse geocoding error:', error);
      
      if (lat > 28.5 && lat < 29.5 && lng > 77.0 && lng < 78.0) {
        return "Sonipat, Haryana";
      }
      else if (lat > 28.0 && lat < 29.0 && lng > 76.0 && lng < 77.0) {
        return "Rohtak, Haryana";
      }
      else if (lat > 28.4 && lat < 28.9 && lng > 77.0 && lng < 77.5) {
        return "Delhi";
      }
      else {
        return "North India Region";
      }
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Please search for your location manually.');
      setShowLocationDropdown(true);
      return;
    }

    setIsGettingLocation(true);
    setShowLocationDropdown(false);
    setLocationAccuracy(null);

    const geolocationOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 300000
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          console.log('Raw coordinates:', { latitude, longitude, accuracy });
          setLocationAccuracy(accuracy);

          const locationName = await reverseGeocode(latitude, longitude);
          
          if (locationName) {
            let finalLocationName = locationName;
            
            if (accuracy > 50000) {
              finalLocationName = `${locationName} (Approximate Area)`;
            }
            
            setSelectedLocation(finalLocationName);
            localStorage.setItem('userLocation', finalLocationName);
            console.log('Final location set:', finalLocationName);
            
            if (accuracy > 50000) {
              alert(`Your approximate location appears to be near ${locationName}. For precise delivery, please verify or search manually.`);
              setTimeout(() => setShowLocationDropdown(true), 500);
            } else {
              alert(`Location set to: ${locationName}`);
              setShowLocationDropdown(false);
            }
          } else {
            throw new Error('Could not determine location name');
          }
          
          setSearchQuery('');
          setSearchResults([]);
        } catch (error) {
          console.error('Error processing location:', error);
          alert('Could not determine your current location name. Please search for your location manually.');
          setShowLocationDropdown(true);
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsGettingLocation(false);
        setShowLocationDropdown(true);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Location access denied. Please allow location access in browser settings or search manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            alert('Location information unavailable. Please search for your location manually.');
            break;
          case error.TIMEOUT:
            alert('Location request timeout. Please try again or search manually.');
            break;
          default:
            alert('Unable to get current location. Please search manually.');
        }
      },
      geolocationOptions
    );
  };

  const handleLocationSelect = (location) => {
    const locationName = extractLocationName(location);
    
    if (locationName && locationName !== 'Selected Location') {
      setSelectedLocation(locationName);
      localStorage.setItem('userLocation', locationName);
      setShowLocationDropdown(false);
      setSearchQuery('');
      setSearchResults([]);
      alert(`Location set to: ${locationName}`);
    } else {
      alert('Please select a valid location from the list.');
    }
  };

  const handleManualLocationSelect = (location) => {
    setSelectedLocation(location);
    localStorage.setItem('userLocation', location);
    setShowLocationDropdown(false);
    setSearchQuery('');
    setSearchResults([]);
    alert(`Location set to: ${location}`);
  };

  const commonLocations = [
    'Sonipat, Haryana',
    'Panipat, Haryana',
    'Rohtak, Haryana',
    'Karnal, Haryana',
    'Connaught Place, New Delhi',
    'Gurugram Sector 14, Haryana', 
    'Noida Sector 18, Uttar Pradesh',
    'Greater Kailash, Delhi',
    'Saket, Delhi',
    'Hauz Khas, Delhi'
  ];

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
          </div>
          <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
            showLocationDropdown ? 'rotate-180' : ''
          }`} />
        </div>
      </div>

      {showLocationDropdown && (
        <div className={`
          absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden
          ${isMobile ? 'w-full' : 'w-80'}
        `}>
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900 mb-3">Select your location</h3>
            
            <div className="mb-3">
              <button
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGettingLocation ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-blue-700 font-medium">Detecting location...</span>
                  </>
                ) : (
                  <>
                    <MapPinIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700 font-medium">Use current location</span>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-1 text-center">
                We'll find the nearest proper location name
              </p>
            </div>

            <div className="flex items-center mb-3">
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
                    if (locationName && locationName !== 'Selected Location') {
                      return (
                        <div
                          key={location.id || index}
                          onClick={() => handleLocationSelect(location)}
                          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                        >
                          <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">
                            {locationName}
                          </span>
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
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  >
                    <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{location}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Always shows proper location names for accurate delivery
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
        const response = await fetch('https://api.fast2.in/api/user/me', {
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
                <LocationSelector isMobile={false} />
              </div>

              <div className="lg:hidden">
                <LocationSelector isMobile={true} />
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
                  {isLoggedIn && cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {cartItemCount}
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