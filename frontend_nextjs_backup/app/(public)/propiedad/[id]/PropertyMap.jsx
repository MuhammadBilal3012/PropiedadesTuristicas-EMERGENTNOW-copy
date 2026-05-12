'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Dominican Republic locations coordinates
const locationCoordinates = {
  'Punta Cana': { lat: 18.5601, lng: -68.3725 },
  'Santo Domingo': { lat: 18.4861, lng: -69.9312 },
  'Samaná': { lat: 19.2054, lng: -69.3366 },
  'La Romana': { lat: 18.4273, lng: -68.9728 },
  'Puerto Plata': { lat: 19.7934, lng: -70.6884 },
  'Jarabacoa': { lat: 19.1201, lng: -70.6402 },
  'Santiago': { lat: 19.4517, lng: -70.6970 },
  'Bávaro': { lat: 18.6832, lng: -68.4493 },
  'Las Terrenas': { lat: 19.3102, lng: -69.5427 },
  'Cap Cana': { lat: 18.4526, lng: -68.4093 },
  'Casa de Campo': { lat: 18.4168, lng: -68.9120 },
  'Sosúa': { lat: 19.7545, lng: -70.5170 },
};

export default function PropertyMap({ location, latitude, longitude, title }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full bg-stone-200 flex items-center justify-center">
        <div className="text-center text-stone-500">
          <MapPin className="h-12 w-12 mx-auto mb-2" />
          <p>Cargando mapa...</p>
        </div>
      </div>
    );
  }

  // Use provided coordinates or try to find from location name
  let lat = latitude;
  let lng = longitude;

  if (!lat || !lng) {
    // Try to match location name with known coordinates
    const matchedLocation = Object.keys(locationCoordinates).find(
      loc => location?.toLowerCase().includes(loc.toLowerCase())
    );
    
    if (matchedLocation) {
      lat = locationCoordinates[matchedLocation].lat;
      lng = locationCoordinates[matchedLocation].lng;
    } else {
      // Default to Dominican Republic center
      lat = 18.7357;
      lng = -70.1627;
    }
  }

  return (
    <MapContainer 
      center={[lat, lng]} 
      zoom={13} 
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]}>
        <Popup>
          <div className="text-center">
            <strong>{title}</strong>
            <br />
            <span className="text-stone-500">{location}</span>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
