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
  ChevronDownIcon,
  BuildingStorefrontIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Logo from '../../../assets/images/logo.png';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiZmFzdDIiLCJhIjoiY21mbW9qbzZlMDQ5dzJpcXhlOW82ODdlcSJ9.HYJxZbPDCZHD8_Q5faa6ig';

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
      placeholder="Search for products, categories..."
      className="w-full pl-10 pr-12 text-black py-2.5 border border-gray-200 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
      className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
      value={productSearchQuery}
      onChange={handleProductSearchChange}
    />
  );
}

const SearchInputFallback = () => (
  <input
    type="text"
    placeholder="Search any product..."
    className="w-full pl-10 pr-4 text-black py-2 border border-green-300 rounded-lg"
    disabled
  />
);

const MobileSearchInputFallback = () => (
  <input
    type="text"
    placeholder="Search for products..."
    className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg"
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
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [pincode, setPincode] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [locationError, setLocationError] = useState('');
  const locationRef = useRef(null);

  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    const savedPincode = localStorage.getItem('userPincode');
    const savedStreetAddress = localStorage.getItem('userStreetAddress');
    const savedLocationData = JSON.parse(localStorage.getItem('userLocationData') || 'null');

    if (savedLocation) {
      setSelectedLocation(savedLocation);
    }
    if (savedPincode) {
      setPincode(savedPincode);
    }
    if (savedStreetAddress) {
      setStreetAddress(savedStreetAddress);
    } else {
      autoDetectLocation();
    }
    if (savedLocationData?.latitude != null && savedLocationData?.longitude != null) {
      setSelectedCoordinates({
        latitude: savedLocationData.latitude,
        longitude: savedLocationData.longitude
      });
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
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${MAPBOX_TOKEN}` +
        `&country=in` +
        `&types=address,poi,place,locality,neighborhood,postcode` +
        `&autocomplete=true` +
        `&limit=10` +
        (selectedCoordinates ? `&proximity=${selectedCoordinates.longitude},${selectedCoordinates.latitude}` : '')
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      // console.error('Location search error:', error);
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

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?` +
        `access_token=${MAPBOX_TOKEN}` +
        `&country=in`
      );

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      return data.features && data.features.length > 0 ? data.features[0] : null;
    } catch (error) {
      // console.error('Reverse geocoding error:', error);
      throw error;
    }
  };

  const persistLocation = ({ address, locationName, locationPincode = '', latitude, longitude, accuracy }) => {
    const locationData = {
      streetAddress: address,
      pincode: locationPincode,
      locationName: locationName || address,
      latitude,
      longitude,
      ...(accuracy ? { accuracy } : {})
    };

    localStorage.setItem('userStreetAddress', locationData.streetAddress);
    localStorage.setItem('userPincode', locationData.pincode);
    localStorage.setItem('userLocation', locationData.locationName);
    localStorage.setItem('userLocationData', JSON.stringify(locationData));

    setSelectedLocation(locationData.locationName);
    setStreetAddress(locationData.streetAddress);
    setPincode(locationData.pincode);
    setSelectedCoordinates({ latitude, longitude });
    setShowLocationDropdown(false);
    setSearchQuery('');
    setSearchResults([]);

    if (onLocationSelect) {
      onLocationSelect(locationData);
    }

    window.dispatchEvent(new CustomEvent('locationUpdated', {
      detail: locationData
    }));
  };

  const autoDetectLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          setSelectedCoordinates({ latitude, longitude });
          setLocationAccuracy(accuracy);

          // Reverse geocode to get address details
          const locationData = await reverseGeocode(latitude, longitude);

          if (locationData) {
            const locationName = extractLocationName(locationData);
            const locationPincode = extractPincode(locationData);

            // Extract street address from place_name
            let address = locationData.place_name || '';
            // Remove country name from address
            address = address.replace(/, India$/, '');

            if (locationName) {
              setSelectedLocation(locationName);
              setStreetAddress(address);
            }

            if (locationPincode) {
              setPincode(locationPincode);
            }

            if (address) {
              persistLocation({
                address,
                locationName: locationName || address,
                locationPincode,
                latitude,
                longitude,
                accuracy
              });
            }
          }
        } catch (error) {
          // console.error('Error processing location:', error);
          setLocationError('Failed to get address details. Please enter manually.');
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = 'Unable to get your location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }

        setLocationError(errorMessage);
        // console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSaveLocation = () => {
    if (!selectedCoordinates) {
      alert('Please select an address from search results or use auto-detect location');
      return;
    }

    persistLocation({
      address: streetAddress || selectedLocation,
      locationName: selectedLocation || streetAddress,
      locationPincode: pincode,
      latitude: selectedCoordinates.latitude,
      longitude: selectedCoordinates.longitude
    });
  };

  const getDisplayAddress = (location) => {
    return (location?.place_name || location?.text || '').replace(/, India$/, '');
  };

  const handleLocationSelect = (location) => {
    const locationName = getDisplayAddress(location) || extractLocationName(location);
    const locationPincode = extractPincode(location);
    const [longitude, latitude] = location.center || [];

    if (locationName && locationName !== 'Selected Location') {
      setSelectedLocation(locationName);
      setStreetAddress(locationName);
      if (locationPincode) {
        setPincode(locationPincode);
      }
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        setSelectedCoordinates({ latitude, longitude });
      }
      setLocationError('');
    }
  };

  const displayLocation = isGettingLocation ? 'Detecting location...' : (selectedLocation || 'Select your location');

  return (
    <div className="relative" ref={locationRef}>
      <div
        data-location-selector
        className={`flex items-center cursor-pointer group ${isMobile ? 'w-full min-w-0' : 'w-64'
          }`}
        onClick={() => !isGettingLocation && setShowLocationDropdown(!showLocationDropdown)}
      >
        <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors w-full ${isGettingLocation ? 'opacity-75' : ''}`}>
          {isGettingLocation ? (
            <div className="h-5 w-5 flex-shrink-0 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
          ) : (
            <MapPinIcon className="h-5 w-5 flex-shrink-0 text-green-600" />
          )}
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-[11px] text-green-600 font-medium">Deliver to</span>
            <span className="text-sm font-bold text-gray-900 truncate max-w-[160px]">
              {isGettingLocation
                ? 'Detecting...'
                : pincode
                  ? `${displayLocation}, ${pincode}`
                  : displayLocation}
            </span>
          </div>
          <ChevronDownIcon className={`h-4 w-4 flex-shrink-0 text-green-600 transition-transform duration-200 ${showLocationDropdown ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {showLocationDropdown && (
        <div className={`
          absolute top-full left-0 mt-2 bg-white border border-green-200 rounded-lg shadow-lg z-50 overflow-hidden
          ${isMobile ? 'left-0 right-0 w-[calc(100vw-1.5rem)] max-w-sm' : 'w-96'}
        `}>
          <div className="p-4 border-b border-green-100">
            <h3 className="font-medium text-green-900 mb-3">Set Delivery Location</h3>

            <button
              onClick={autoDetectLocation}
              disabled={isGettingLocation}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
              title="Auto-detect my location"
            >
              {isGettingLocation ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Detecting...</span>
                </>
              ) : (
                <>
                  <MapPinIcon className="w-4 h-4" />
                  <span>Use Current Location</span>
                </>
              )}
            </button>

            {locationError && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600">{locationError}</p>
              </div>
            )}

            {locationAccuracy && (
              <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700">
                  Location detected with {Math.round(locationAccuracy)}m accuracy
                </p>
              </div>
            )}

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-green-200"></div>
              <span className="px-2 text-xs text-green-700">OR SEARCH ADDRESS</span>
              <div className="flex-1 border-t border-green-200"></div>
            </div>

            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search for area, street name..."
                className="w-full rounded-lg border border-green-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 caret-green-600 placeholder:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-green-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MagnifyingGlassIcon className="w-4 h-4 text-green-400 absolute left-3 top-1/2 transform -translate-y-1/2" />

              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="mb-3 max-h-40 overflow-y-auto">
                <h4 className="text-xs font-medium text-green-500 uppercase tracking-wide mb-2">
                  Search Results
                </h4>
                <div className="space-y-1">
                  {searchResults.map((location, index) => {
                    const locationName = getDisplayAddress(location) || extractLocationName(location);
                    const locationPincode = extractPincode(location);
                    if (locationName && locationName !== 'Selected Location') {
                      return (
                        <div
                          key={location.id || index}
                          onClick={() => handleLocationSelect(location)}
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-green-50 cursor-pointer transition-colors duration-150"
                        >
                          <div className="flex items-center space-x-3">
                            <MapPinIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <span className="text-sm text-green-700">
                              {locationName}
                            </span>
                          </div>
                          {locationPincode && (
                            <span className="text-xs text-green-500 bg-green-100 px-2 py-1 rounded">
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

            {selectedCoordinates && streetAddress && (
              <div className="mb-3 rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="flex items-start gap-2">
                  <MapPinIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-green-900">{streetAddress}</p>
                    <p className="mt-1 text-xs text-green-700">
                      {Number(selectedCoordinates.latitude).toFixed(5)}, {Number(selectedCoordinates.longitude).toFixed(5)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSaveLocation}
              disabled={!streetAddress || !selectedCoordinates}
              className="w-full rounded-lg bg-green-700 px-4 py-2.5 font-medium text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-300"
            >
              Save Location
            </button>

          </div>

          <div className="bg-green-50 px-4 py-3 border-t border-green-100">
            <p className="text-xs text-green-500 text-center">
              Products will be filtered by distance from your selected location
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
  const handleLogoClick = () => {
    router.push('/');
  };
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
        const response = await fetch('/proxy/api/user/me', {
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
        // console.error('Error fetching user data:', error);
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
        const response = await fetch('/proxy/api/cart/', {
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
        // console.error('Error fetching cart count:', error);
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
          const response = await fetch('/proxy/api/cart/', {
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
          // console.error('Error fetching updated cart count:', error);
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
        const response = await fetch('/proxy/api/category/getall');
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

  const handleCouponsClick = () => {
    closeMenu();
    router.push('/pages/coupons');
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
    <header className="bg-white text-black font-bold fixed top-0 left-0 right-0 w-full z-50">
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between gap-2">

            <div className="flex min-w-0 flex-1 items-center lg:flex-none lg:space-x-6">
              <div
                className="hidden lg:flex items-center cursor-pointer"
                onClick={handleLogoClick}
              >
                <Image
                  src={Logo}
                  alt="GMKart"
                  width={120}
                  height={50}
                  className="h-auto object-contain"
                />
              </div>

              <div className="hidden lg:block">
                <LocationSelector isMobile={false} onLocationSelect={handleLocationSelect} />
              </div>

              <div className="min-w-0 flex-1 lg:hidden">
                <LocationSelector isMobile={true} onLocationSelect={handleLocationSelect} />
              </div>
            </div>

            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                </div>
                <Suspense fallback={<SearchInputFallback />}>
                  <SearchInput
                    productSearchQuery={productSearchQuery}
                    setProductSearchQuery={setProductSearchQuery}
                  />
                </Suspense>
                <button
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
                  onClick={() => router.push(productSearchQuery ? `/?search=${encodeURIComponent(productSearchQuery)}` : '/')}
                >
                  <MagnifyingGlassIcon className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Desktop right icons: Shops | Account | Cart */}
            <div className="hidden lg:flex items-center gap-1">

              {/* Shops */}
              <button
                onClick={() => router.push('/shops')}
                className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <BuildingStorefrontIcon className="w-6 h-6 text-gray-700" />
                <span className="text-xs text-gray-700 font-medium">Shops</span>
              </button>

              {/* Account */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={isLoggedIn ? toggleProfileDropdown : handleLoginClick}
                  className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <UserIcon className="w-6 h-6 text-gray-700" />
                  <span className="text-xs text-gray-700 font-medium">{isLoggedIn ? userName.split(' ')[0] : 'Account'}</span>
                </button>

                {isProfileDropdownOpen && isLoggedIn && (
                  <div className="absolute top-full right-0 mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    {/* Wallet balance at top */}
                    <div className="flex items-center justify-between px-4 py-3 bg-yellow-50 border-b border-yellow-100">
                      <div className="flex items-center gap-2">
                        <BanknotesIcon className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Wallet</span>
                      </div>
                      <span className="text-sm font-bold text-yellow-700">₹{formatWalletBalance(walletBalance)}</span>
                    </div>

                    <div className="py-1">
                      <div className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors" onClick={handleProfileClick}>
                        <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-400" />
                        <span>My Profile</span>
                      </div>
                      <div className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors" onClick={handleSavedAddresses}>
                        <MapIcon className="w-5 h-5 mr-3 text-gray-400" />
                        <span>Saved Addresses</span>
                      </div>
                      <div className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors" onClick={handleOrdersClick}>
                        <InboxIcon className="w-5 h-5 mr-3 text-gray-400" />
                        <span>My Orders</span>
                      </div>
                      <div className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors" onClick={handleWalletClick}>
                        <BanknotesIcon className="w-5 h-5 mr-3 text-gray-400" />
                        <span>My Wallet</span>
                      </div>
                      <div className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors" onClick={handleCouponsClick}>
                        <TicketIcon className="w-5 h-5 mr-3 text-gray-400" />
                        <span>My Coupons</span>
                      </div>
                      <div className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors" onClick={handleReferralsClick}>
                        <UserGroupIcon className="w-5 h-5 mr-3 text-gray-400" />
                        <span>Refer & Earn</span>
                      </div>
                      <div className="border-t border-gray-100 my-1" />
                      <div className="flex items-center px-4 py-3 text-sm text-red-500 hover:bg-gray-50 cursor-pointer transition-colors" onClick={handleLogout}>
                        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                        <span>Log Out</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={isLoggedIn ? handleCartClick : undefined}
                disabled={!isLoggedIn}
                className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors ${isLoggedIn ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              >
                <div className="relative">
                  <ShoppingCartIcon className="w-6 h-6 text-gray-700" />
                  {isLoggedIn && cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-700 font-medium">Cart</span>
              </button>
            </div>

            {/* Mobile: cart + hamburger */}
            <div className="flex lg:hidden shrink-0 items-center gap-1">
              <div
                className={`flex items-center justify-center rounded-lg p-2 transition-colors ${isLoggedIn ? 'cursor-pointer hover:bg-green-50' : 'opacity-50 cursor-not-allowed'}`}
                onClick={isLoggedIn ? handleCartClick : undefined}
              >
                <div className="relative">
                  <ShoppingCartIcon className="h-7 w-7 text-black" />
                  {isLoggedIn && cartItemCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1 text-[11px] font-semibold text-white">
                      {cartItemCount}
                    </span>
                  )}
                </div>
              </div>
              <button
                className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 transition-colors hover:bg-green-50"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? (
                  <XMarkIcon className="h-8 w-8 text-black" />
                ) : (
                  <Bars3Icon className="h-8 w-8 text-black" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 px-3 py-3 sm:px-4 lg:hidden">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
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
          <div className="space-y-4 px-4 py-4">
            {isLoggedIn && (
              <>
                <div className="flex items-center space-x-3 bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100">
                    <UserIcon className="h-7 w-7 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900">{userName}</p>
                    <p className="text-xs text-green-500">Welcome back!</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <BanknotesIcon className="h-7 w-7 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Wallet Balance</p>
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
                  className="flex min-h-11 items-center space-x-3 py-2 text-green-700 transition-colors hover:text-green-600 cursor-pointer"
                  onClick={handleProfileClick}
                >
                  <UserIcon className="h-6 w-6 shrink-0" />
                  <span>My Profile</span>
                </div>
                <div
                  className="flex min-h-11 items-center space-x-3 py-2 text-green-700 transition-colors hover:text-green-600 cursor-pointer"
                  onClick={handleSavedAddresses}
                >
                  <MapIcon className="h-6 w-6 shrink-0" />
                  <span>Saved Addresses</span>
                </div>
                <div
                  className="flex min-h-11 items-center space-x-3 py-2 text-green-700 transition-colors hover:text-green-600 cursor-pointer"
                  onClick={handleOrdersClick}
                >
                  <InboxIcon className="h-6 w-6 shrink-0" />
                  <span>My Orders</span>
                </div>
                <div
                  className="flex min-h-11 items-center space-x-3 py-2 text-green-700 transition-colors hover:text-green-600 cursor-pointer"
                  onClick={handleCouponsClick}
                >
                  <TicketIcon className="h-6 w-6 shrink-0" />
                  <span>My Coupons</span>
                </div>
                <div
                  className="flex min-h-11 items-center space-x-3 py-2 text-green-700 transition-colors hover:text-green-600 cursor-pointer"
                  onClick={handleReferralsClick}
                >
                  <UserGroupIcon className="h-6 w-6 shrink-0" />
                  <span>Refer & Earn</span>
                </div>
                <div
                  className="flex min-h-11 items-center space-x-3 py-2 text-green-700 transition-colors hover:text-green-600 cursor-pointer"
                  onClick={handleLogout}
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6 shrink-0" />
                  <span>Logout</span>
                </div>
              </>
            ) : (
              <div
                className="flex min-h-11 items-center space-x-3 py-2 text-green-700 transition-colors hover:text-green-600 cursor-pointer"
                onClick={handleLoginClick}
              >
                <UserIcon className="h-6 w-6 shrink-0" />
                <span>Login/Signup</span>
              </div>
            )}

            {/* Shops link in mobile menu */}
            <div
              className="flex min-h-11 items-center space-x-3 py-2 text-green-700 transition-colors hover:text-green-600 cursor-pointer"
              onClick={() => { closeMenu(); router.push('/shops'); }}
            >
              <BuildingStorefrontIcon className="h-6 w-6 shrink-0" />
              <span>Browse Shops</span>
            </div>

            <div className="pt-4 border-t border-green-200">
              <h4 className="font-medium mb-2">Categories</h4>
              <div className="space-y-2">
                {loadingCategories ? (
                  <div className="text-green-500 py-1">Loading categories...</div>
                ) : (
                  categories.map((category, index) => (
                    <div
                      key={index}
                      className="flex min-h-11 items-center space-x-3 py-2 text-green-600 transition-colors hover:text-green-600 cursor-pointer"
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      {category.image && (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-8 w-8 shrink-0 rounded object-cover"
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
