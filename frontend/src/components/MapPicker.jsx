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
      setLocationError('Geolocation is not supported by your browser');
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
      () => setLocationError('Could not get your location. Check browser permissions.'),
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
    <div>
      <div className="flex justify-between items-center mb-1">
        <p className="text-xs text-slate-500">Click on map to set location (or drag marker)</p>
        {onChange && (
          <button
            type="button"
            onClick={getCurrentLocation}
            className="text-xs bg-teal-100 hover:bg-teal-200 text-teal-800 px-2 py-1 rounded font-medium"
          >
            Use my location
          </button>
        )}
      </div>
      {locationError && <p className="text-xs text-red-600 mb-1">{locationError}</p>}
      <div ref={mapRef} style={{ height }} className="w-full rounded-lg border border-slate-200" />
    </div>
  );
}
