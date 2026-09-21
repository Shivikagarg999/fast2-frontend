"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import PlaceSearch from "./placeSearch";
import { GWALIOR_CENTER, MAPBOX_TOKEN, reverseGeocode } from "../../utils/mapService";

const DEFAULT_CENTER = [GWALIOR_CENTER.longitude, GWALIOR_CENTER.latitude];

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
  const [approximate, setApproximate] = useState(false);
  const [satellite, setSatellite] = useState(false);

  useEffect(() => {
    onChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  const placePin = useCallback(async (pLat, pLng, { reverse = true, fly = true, parts, isApproximate = false } = {}) => {
    const map = mapRef.current;
    if (!map) return;

    if (!markerRef.current) {
      const marker = new mapboxgl.Marker({ draggable: true, color: "#16a34a" })
        .setLngLat([pLng, pLat])
        .addTo(map);
      marker.on("dragend", () => {
        const p = marker.getLngLat();
        placePin(p.lat, p.lng, { fly: false });
      });
      markerRef.current = marker;
    } else {
      markerRef.current.setLngLat([pLng, pLat]);
    }

    if (fly) map.flyTo({ center: [pLng, pLat], zoom: Math.max(map.getZoom(), 17) });

    let resolved = parts;
    if (!resolved && reverse) {
      resolved = await reverseGeocode(pLat, pLng).catch(() => null);
    }
    setApproximate(isApproximate);
    onChangeRef.current?.({
      lat: pLat,
      lng: pLng,
      city: resolved?.city,
      state: resolved?.state,
      pinCode: resolved?.pinCode,
      approximate: isApproximate,
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const initLat = toCoord(lat);
    const initLng = toCoord(lng);
    const hasCoords = initLat != null && initLng != null;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: hasCoords ? [initLng, initLat] : DEFAULT_CENTER,
      zoom: hasCoords ? 17 : 12,
    });
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.on("click", (e) => placePin(e.lngLat.lat, e.lngLat.lng));
    map.on("load", () => {
      if (hasCoords) placePin(initLat, initLng, { reverse: false, fly: false });
    });
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // The map is created once; later coordinate changes come from the pin itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchResult = useCallback(
    (details) => {
      placePin(details.lat, details.lng, { parts: details, isApproximate: !details.precise });
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
        const weakFix = pos.coords.accuracy > 100;
        if (weakFix) {
          setMessage(
            `GPS is only accurate to about ${Math.round(pos.coords.accuracy)} m here. Drag the pin to your exact spot.`
          );
        }
        placePin(pos.coords.latitude, pos.coords.longitude, { isApproximate: weakFix });
      },
      () => {
        setLocating(false);
        setMessage("Could not get your location. Allow location access, or search / tap the map.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const toggleSatellite = () => {
    const map = mapRef.current;
    if (!map) return;
    const next = !satellite;
    map.setStyle(
      next ? "mapbox://styles/mapbox/satellite-streets-v12" : "mapbox://styles/mapbox/streets-v12"
    );
    setSatellite(next);
  };

  const pinLat = toCoord(lat);
  const pinLng = toCoord(lng);

  return (
    <div className="space-y-3">
      <PlaceSearch onSelectLocation={handleSearchResult} />

      <button
        type="button"
        onClick={handleUseMyLocation}
        disabled={locating}
        className="text-sm font-medium text-green-700 hover:text-green-800 disabled:opacity-50"
      >
        {locating ? "Getting your location..." : "Use my current location"}
      </button>

      <div className="relative">
        <div
          ref={containerRef}
          className="w-full h-72 rounded-lg overflow-hidden border border-gray-200"
        />
        <button
          type="button"
          onClick={toggleSatellite}
          className="absolute bottom-2 left-2 z-10 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 shadow border border-gray-200"
        >
          {satellite ? "Map view" : "Satellite view"}
        </button>
      </div>

      {approximate && (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          This is only an approximate spot. For accurate delivery, zoom in and drag the pin onto your exact building or gate.
        </p>
      )}

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
