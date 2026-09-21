'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { loadGoogleMaps } from '../../utils/googleMaps';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const STATUS_LABEL = {
  accepted: 'Driver is heading to the shop',
  'picked-up': 'Order picked up — on the way to you',
  delivered: 'Order delivered!',
};
const STATUS_COLOR = {
  accepted: 'bg-blue-100 text-blue-700',
  'picked-up': 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
};

export default function TrackOrderPage() {
  const { orderId } = useParams();
  const router = useRouter();

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const socketRef = useRef(null);
  const mapReadyRef = useRef(false);

  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const updateDriverMarker = useCallback((lat, lng) => {
    if (!mapRef.current || !mapReadyRef.current || !window.google?.maps) return;
    const position = { lat, lng };

    if (driverMarkerRef.current) {
      driverMarkerRef.current.setPosition(position);
      mapRef.current.panTo(position);
    } else {
      driverMarkerRef.current = new window.google.maps.Marker({
        position,
        map: mapRef.current,
        icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 0 },
        label: { text: '🛵', fontSize: '32px' },
        zIndex: 2,
      });
      mapRef.current.setZoom(15);
      mapRef.current.panTo(position);
    }
  }, []);

  const placeDestinationMarker = useCallback((lat, lng, address) => {
    if (!mapRef.current || !mapReadyRef.current || destinationMarkerRef.current || !window.google?.maps) return;

    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapRef.current,
      icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 0 },
      label: { text: '📍', fontSize: '28px' },
      zIndex: 1,
    });

    const content = document.createElement('div');
    const title = document.createElement('p');
    title.className = 'font-semibold text-sm';
    title.textContent = 'Delivery Address';
    const detail = document.createElement('p');
    detail.className = 'text-xs text-gray-500 mt-1';
    detail.textContent = address || '';
    content.append(title, detail);

    const infoWindow = new window.google.maps.InfoWindow({ content });
    marker.addListener('click', () => infoWindow.open({ anchor: marker, map: mapRef.current }));
    destinationMarkerRef.current = marker;
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const maps = await loadGoogleMaps();
        const [{ Map }] = await Promise.all([maps.importLibrary('maps'), maps.importLibrary('marker')]);
        if (cancelled || !mapContainer.current || mapRef.current) return;

        const map = new Map(mapContainer.current, {
          center: { lat: 20.5937, lng: 78.9629 },
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        mapRef.current = map;
        maps.event.addListenerOnce(map, 'idle', () => {
          mapReadyRef.current = true;
        });
      } catch {
        setError('Could not load the map. Please try again later.');
      }
    })();

    return () => {
      cancelled = true;
      if (driverMarkerRef.current) driverMarkerRef.current.setMap(null);
      if (destinationMarkerRef.current) destinationMarkerRef.current.setMap(null);
      if (mapRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(mapRef.current);
      }
      mapRef.current = null;
      mapReadyRef.current = false;
      driverMarkerRef.current = null;
      destinationMarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { router.push('/login'); return; }

    fetch(`${API_URL}/api/order/${orderId}/tracking`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) {
          setError(data.message || 'Order is not trackable yet');
        } else {
          setTracking(data.data);
          if (data.data.location) {
            // Wait for map to be ready then place marker
            const tryPlace = () => {
              if (mapReadyRef.current) {
                updateDriverMarker(data.data.location.lat, data.data.location.lng);
              } else {
                setTimeout(tryPlace, 200);
              }
            };
            tryPlace();
          }
          if (data.data.destination) {
            const { lat, lng, address } = data.data.destination;
            const tryPlace = () => {
              if (mapReadyRef.current) {
                placeDestinationMarker(lat, lng, address);
              } else {
                setTimeout(tryPlace, 200);
              }
            };
            tryPlace();
          }
        }
      })
      .catch(() => setError('Failed to load tracking info'))
      .finally(() => setLoading(false));
  }, [orderId, router, updateDriverMarker, placeDestinationMarker]);

  // Socket connection
  useEffect(() => {
    if (!orderId) return;

    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : '';
    const socket = io(API_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('track_order', { orderId, userId: userId || '' });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('driver_location', ({ lat, lng, timestamp }) => {
      setLastUpdated(new Date(timestamp || Date.now()));
      updateDriverMarker(lat, lng);
      setTracking((prev) =>
        prev ? { ...prev, location: { lat, lng, lastUpdated: new Date() } } : prev
      );
    });

    return () => {
      socket.emit('stop_tracking', { orderId });
      socket.disconnect();
    };
  }, [orderId, updateDriverMarker]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading tracking...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-6 text-center">
        <div className="text-5xl">📦</div>
        <h2 className="text-xl font-bold text-gray-800">Not trackable yet</h2>
        <p className="text-gray-500 text-sm">{error}</p>
        <button
          onClick={() => router.push('/pages/orders')}
          className="mt-2 px-5 py-2.5 bg-green-500 text-white rounded-xl font-semibold text-sm"
        >
          View Orders
        </button>
      </div>
    );
  }

  const status = tracking?.orderStatus;

  return (
    <div className="flex flex-col bg-gray-50" style={{ height: 'calc(100vh - 70px)' }}>
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm z-10">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 text-lg font-light"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-900 text-base truncate">
            Track Order #{tracking?.orderId}
          </h1>
          {status && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[status] || 'bg-gray-100 text-gray-600'}`}>
              {STATUS_LABEL[status] || status}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-400">{connected ? 'Live' : 'Connecting…'}</span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />

        {/* No location overlay */}
        {!tracking?.location && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-4 text-center shadow-lg mx-6">
              <p className="text-2xl mb-2">🛵</p>
              <p className="font-semibold text-gray-700 text-sm">Waiting for driver location</p>
              <p className="text-xs text-gray-400 mt-1">The map will update automatically</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom info panel */}
      <div className="bg-white border-t shadow-lg px-4 py-4 z-10">
        {tracking?.driver && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg flex-shrink-0">
              {tracking.driver.name?.[0]?.toUpperCase() || 'D'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{tracking.driver.name}</p>
              <p className="text-xs text-gray-400">Delivery Partner</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400">
          {tracking?.location ? (
            <span>
              Updated {lastUpdated
                ? lastUpdated.toLocaleTimeString()
                : tracking.location.lastUpdated
                  ? new Date(tracking.location.lastUpdated).toLocaleTimeString()
                  : 'just now'}
            </span>
          ) : (
            <span>No location yet</span>
          )}
          {!tracking?.destination && (
            <span className="text-amber-500">Destination coordinates not set</span>
          )}
        </div>
      </div>
    </div>
  );
}
