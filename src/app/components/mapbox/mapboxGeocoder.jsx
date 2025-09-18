"use client";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

// Set your Mapbox access token
mapboxgl.accessToken =
  "pk.eyJ1IjoiZmFzdDIiLCJhIjoiY21mbW9qbzZlMDQ5dzJpcXhlOW82ODdlcSJ9.HYJxZbPDCZHD8_Q5faa6ig";

const MapboxGeocoderComponent = ({
  onSelectLocation,
  placeholder = "Search for area, street name...",
}) => {
  const geocoderContainerRef = useRef(null);
  const geocoderRef = useRef(null);
  const resultHandlerRef = useRef(null);

  useEffect(() => {
    if (!geocoderContainerRef.current) return;

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      types: "place,locality,neighborhood,address",
      countries: "in",
      placeholder,
      marker: false,
      collapsed: false,
    });

    geocoder.addTo(geocoderContainerRef.current);
    geocoderRef.current = geocoder;

    // Define and store the handler
    const handleResult = (e) => {
      if (onSelectLocation) {
        onSelectLocation(e.result);
      }
    };
    resultHandlerRef.current = handleResult;

    geocoder.on("result", handleResult);

    // ✅ Cleanup
    return () => {
      if (geocoderRef.current) {
        if (resultHandlerRef.current) {
          geocoderRef.current.off("result", resultHandlerRef.current);
        }
        geocoderRef.current.clear();
        geocoderRef.current = null;

        if (geocoderContainerRef.current) {
          geocoderContainerRef.current.innerHTML = "";
        }
      }
    };
  }, [onSelectLocation, placeholder]);

  return (
    <div
      ref={geocoderContainerRef}
      className="mapbox-geocoder-container w-full"
    />
  );
};

export default MapboxGeocoderComponent;
