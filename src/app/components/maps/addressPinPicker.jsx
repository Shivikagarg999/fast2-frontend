"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import GooglePlaceSearch from "./googlePlaceSearch";
import { isGoogleMapsConfigured, loadGoogleMaps, reverseGeocode } from "../../utils/googleMaps";

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };

const toCoord = (value) => {
  const n = Number(value);
  return value != null && value !== "" && Number.isFinite(n) ? n : null;
};

// Lets the user search, use GPS, tap the map or drag the pin, and reports the exact
// pin coordinates (plus city/state/pincode) through onLocationChange.
const AddressPinPicker = ({ lat, lng, onLocationChange }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onLocationChange);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState("");
  const configured = isGoogleMapsConfigured();

  useEffect(() => {
    onChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  const placePin = useCallback(async (pLat, pLng, { reverse = true, fly = true, parts } = {}) => {
    const map = mapRef.current;
    if (!map) return;
    const position = { lat: pLat, lng: pLng };

    if (!markerRef.current) {
      const marker = new window.google.maps.Marker({ position, map, draggable: true });
      marker.addListener("dragend", () => {
        const p = marker.getPosition();
        placePin(p.lat(), p.lng(), { fly: false });
      });
      markerRef.current = marker;
    } else {
      markerRef.current.setPosition(position);
    }

    if (fly) {
      map.panTo(position);
      if ((map.getZoom() || 0) < 17) map.setZoom(17);
    }

    let resolved = parts;
    if (!resolved && reverse) {
      resolved = await reverseGeocode(pLat, pLng).catch(() => null);
    }
    onChangeRef.current?.({
      lat: pLat,
      lng: pLng,
      city: resolved?.city,
      state: resolved?.state,
      pinCode: resolved?.pinCode,
    });
  }, []);

  useEffect(() => {
    if (!configured || !containerRef.current) return;
    let cancelled = false;
    let map = null;

    (async () => {
      try {
        const maps = await loadGoogleMaps();
        const [{ Map }] = await Promise.all([maps.importLibrary("maps"), maps.importLibrary("marker")]);
        if (cancelled || !containerRef.current) return;

        const initLat = toCoord(lat);
        const initLng = toCoord(lng);
        const hasCoords = initLat != null && initLng != null;

        map = new Map(containerRef.current, {
          center: hasCoords ? { lat: initLat, lng: initLng } : INDIA_CENTER,
          zoom: hasCoords ? 17 : 5,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: "greedy",
        });
        mapRef.current = map;
        map.addListener("click", (e) => placePin(e.latLng.lat(), e.latLng.lng()));

        if (hasCoords) placePin(initLat, initLng, { reverse: false, fly: false });
      } catch {
        setMessage("Could not load Google Maps. Check the API key.");
      }
    })();

    return () => {
      cancelled = true;
      if (markerRef.current) markerRef.current.setMap(null);
      if (map && window.google?.maps?.event) window.google.maps.event.clearInstanceListeners(map);
      mapRef.current = null;
      markerRef.current = null;
    };
    // The map is created once; later coordinate changes come from the pin itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  const handleSearchResult = useCallback(
    (details) => {
      placePin(details.lat, details.lng, { parts: details });
    },
    [placePin]
  );

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Location is not supported in this browser.");
      return;
    }
    setLocating(true);
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        placePin(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLocating(false);
        setMessage("Could not get your location. Allow location access, or search / tap the map.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const pinLat = toCoord(lat);
  const pinLng = toCoord(lng);

  if (!configured) {
    return (
      <p className="text-sm text-red-600">
        Google Maps is not configured. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <GooglePlaceSearch onSelectLocation={handleSearchResult} />

      <button
        type="button"
        onClick={handleUseMyLocation}
        disabled={locating}
        className="text-sm font-medium text-green-700 hover:text-green-800 disabled:opacity-50"
      >
        {locating ? "Getting your location..." : "Use my current location"}
      </button>

      <div
        ref={containerRef}
        className="w-full h-64 rounded-lg overflow-hidden border border-gray-200"
      />

      <p className="text-xs text-gray-500">
        Tap the map or drag the pin to your exact door / gate — delivery charge is calculated
        from this pin.
      </p>
      {pinLat != null && pinLng != null && (
        <p className="text-xs text-green-700 font-medium">
          Pin saved at {pinLat.toFixed(6)}, {pinLng.toFixed(6)}
        </p>
      )}
      {message && <p className="text-xs text-red-600">{message}</p>}
    </div>
  );
};

export default AddressPinPicker;
