import { useEffect, useRef, useState } from 'react';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER = { lat: 13.7563, lng: 100.5018 };

function loadGoogleMapsScript(key) {
  return new Promise((resolve) => {
    if (window.google?.maps) return resolve();
    const existing = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existing) {
      existing.addEventListener('load', resolve);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

export default function MapPicker({ lat, lng, onChange, height = '200px' }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [locationError, setLocationError] = useState('');

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported');
      return;
    }
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        onChange?.(newLat, newLng);
        if (!mapInstanceRef.current || !window.google?.maps) return;
        const center = { lat: newLat, lng: newLng };
        mapInstanceRef.current.panTo(center);
        mapInstanceRef.current.setZoom(14);
        if (markerRef.current) {
          markerRef.current.setPosition(center);
        } else {
          markerRef.current = new window.google.maps.Marker({
            position: center,
            map: mapInstanceRef.current,
            draggable: true,
          });
          markerRef.current.addListener('dragend', () => {
            const p = markerRef.current.getPosition();
            onChange?.(p.lat(), p.lng());
          });
        }
      },
      () => setLocationError('Could not get location. Check permissions.'),
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (!API_KEY || !mapRef.current) return;
    const initMap = async () => {
      await loadGoogleMapsScript(API_KEY);
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const isValid = !isNaN(latNum) && !isNaN(lngNum);
      const center = isValid ? { lat: latNum, lng: lngNum } : DEFAULT_CENTER;

      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: isValid ? 14 : 4,
      });

      if (isValid) {
        const marker = new window.google.maps.Marker({
          position: center,
          map,
          draggable: true,
        });
        marker.addListener('dragend', () => {
          const pos = marker.getPosition();
          onChange?.(pos.lat(), pos.lng());
        });
        markerRef.current = marker;
      }

      map.addListener('click', (e) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        onChange?.(newLat, newLng);
        if (markerRef.current) {
          markerRef.current.setPosition(e.latLng);
        } else {
          markerRef.current = new window.google.maps.Marker({
            position: e.latLng,
            map,
            draggable: true,
          });
          markerRef.current.addListener('dragend', () => {
            const pos = markerRef.current.getPosition();
            onChange?.(pos.lat(), pos.lng());
          });
        }
      });

      mapInstanceRef.current = map;
    };
    initMap();
  }, [API_KEY]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      const pos = { lat: latNum, lng: lngNum };
      markerRef.current.setPosition(pos);
      mapInstanceRef.current.panTo(pos);
    }
  }, [lat, lng]);

  if (!API_KEY) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-1.5 px-1">
        <p className="text-xs text-slate-500">Click map or drag marker to set location</p>
        {onChange && (
          <button
            type="button"
            onClick={getCurrentLocation}
            className="text-xs font-medium text-ocean-600 bg-ocean-50 hover:bg-ocean-100 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            Use my location
          </button>
        )}
      </div>
      {locationError && <p className="text-xs text-rose-600 mb-1 px-1">{locationError}</p>}
      <div ref={mapRef} style={{ height }} className="w-full rounded-xl border border-slate-200 overflow-hidden" />
    </div>
  );
}
