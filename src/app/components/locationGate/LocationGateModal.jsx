"use client";
import { useEffect, useRef, useState } from "react";
import { MapPinIcon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { searchPlaces, getPlaceDetails, reverseGeocode } from "../../utils/mapService";

// Persists a chosen location the same way the header's LocationSelector does, so
// every location-dependent screen (subcategory pages, nearby-product listings)
// picks it up immediately via the shared localStorage keys + 'locationUpdated' event.
const persistLocation = ({ address, locationName, locationPincode = "", latitude, longitude }) => {
  const locationData = {
    streetAddress: address,
    pincode: locationPincode,
    locationName: locationName || address,
    latitude,
    longitude,
  };

  localStorage.setItem("userStreetAddress", locationData.streetAddress);
  localStorage.setItem("userPincode", locationData.pincode);
  localStorage.setItem("userLocation", locationData.locationName);
  localStorage.setItem("userLocationData", JSON.stringify(locationData));

  window.dispatchEvent(new CustomEvent("locationUpdated", { detail: locationData }));
};

const hasSavedLocation = () => {
  try {
    const data = JSON.parse(localStorage.getItem("userLocationData") || "null");
    return data?.latitude != null && data?.longitude != null;
  } catch {
    return false;
  }
};

const LocationGateModal = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);

  useEffect(() => {
    // First-visit gate: open automatically once, only when no location is saved yet.
    if (!hasSavedLocation() && !sessionStorage.getItem("locationPromptDismissed")) {
      setOpen(true);
    }

    // Any page (e.g. a subcategory page that needs a location) can force this open again.
    const forceOpen = () => setOpen(true);
    window.addEventListener("openLocationPrompt", forceOpen);
    return () => window.removeEventListener("openLocationPrompt", forceOpen);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchPlaces(query.trim());
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const closeModal = (dismissed) => {
    if (dismissed) sessionStorage.setItem("locationPromptDismissed", "1");
    setOpen(false);
    setQuery("");
    setSuggestions([]);
    setError("");
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const details = await reverseGeocode(latitude, longitude);
          persistLocation({
            address: details?.formattedAddress || "",
            locationName: details?.locationName,
            locationPincode: details?.pinCode,
            latitude,
            longitude,
          });
          closeModal(false);
        } catch {
          setError("Could not resolve your address. Please search instead.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setError("Location access denied. Please search for your area instead.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handlePickSuggestion = async (suggestion) => {
    setError("");
    try {
      const details = await getPlaceDetails(suggestion.placeId);
      persistLocation({
        address: details.formattedAddress,
        locationName: details.locationName,
        locationPincode: details.pinCode,
        latitude: details.lat,
        longitude: details.lng,
      });
      closeModal(false);
    } catch {
      setError("Could not use that result. Please try another.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-6 relative animate-in fade-in slide-in-from-bottom-4 duration-200">
        <button
          onClick={() => closeModal(true)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Skip for now"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <MapPinIcon className="w-6 h-6 text-brand-600" />
          <h2 className="text-lg font-bold text-gray-900">Set your delivery location</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          We'll show you products and prices available near you.
        </p>

        <button
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl mb-4 transition-colors"
        >
          <MapPinIcon className="w-5 h-5" />
          {locating ? "Detecting your location..." : "Use my current location"}
        </button>

        <div className="relative mb-2">
          <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-brand-500 transition-colors">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Or search for your area, street..."
              className="w-full outline-none text-sm text-gray-800"
            />
          </div>

          {(suggestions.length > 0 || searching) && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg max-h-56 overflow-y-auto">
              {searching && (
                <div className="px-4 py-3 text-sm text-gray-400">Searching...</div>
              )}
              {!searching &&
                suggestions.map((s) => (
                  <button
                    key={s.placeId}
                    onClick={() => handlePickSuggestion(s)}
                    className="w-full text-left px-4 py-2.5 hover:bg-brand-50 flex items-start gap-2 border-b border-gray-50 last:border-b-0"
                  >
                    <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{s.description}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

        <button
          onClick={() => closeModal(true)}
          className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-4"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

export default LocationGateModal;
