"use client";
import { useEffect, useRef, useState } from "react";
import { getPlaceDetails, searchPlaces } from "../../utils/googleMaps";

// Address search box with Google Places suggestions. Calls onSelectLocation with
// { lat, lng, city, state, pinCode, formattedAddress, ... } once a suggestion is picked.
const GooglePlaceSearch = ({
  onSelectLocation,
  placeholder = "Search area, street, landmark...",
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const wrapperRef = useRef(null);
  const requestId = useRef(0);
  const skipNextSearch = useRef(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        let bias = null;
        try {
          const saved = JSON.parse(localStorage.getItem("userLocationData") || "null");
          if (saved?.latitude != null && saved?.longitude != null) bias = saved;
        } catch {
          bias = null;
        }
        const list = await searchPlaces(query.trim(), bias);
        if (id === requestId.current) {
          setSuggestions(list);
          setError("");
          setOpen(true);
        }
      } catch (err) {
        if (id === requestId.current) {
          setSuggestions([]);
          setError(
            String(err.message).includes("API_KEY")
              ? "Google Maps key is not configured"
              : "Search is unavailable right now"
          );
        }
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = async (suggestion) => {
    skipNextSearch.current = true;
    setQuery(suggestion.description);
    setSuggestions([]);
    setOpen(false);
    try {
      const details = await getPlaceDetails(suggestion.placeId);
      onSelectLocation?.(details);
    } catch {
      setError("Could not load that place. Try another result.");
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
      )}

      {open && suggestions.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {suggestions.map((s) => (
            <li key={s.placeId}>
              <button
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full text-left px-4 py-2.5 hover:bg-green-50 border-b border-gray-50 last:border-b-0"
              >
                <span className="block text-sm font-medium text-gray-900">{s.mainText}</span>
                {s.secondaryText && (
                  <span className="block text-xs text-gray-500">{s.secondaryText}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default GooglePlaceSearch;
