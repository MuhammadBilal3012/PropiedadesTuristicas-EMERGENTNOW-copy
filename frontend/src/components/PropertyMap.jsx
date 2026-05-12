import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const PropertyMap = ({ latitude, longitude, title, location }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Default coordinates for Dominican Republic if not provided
  const lat = latitude || 18.4861;
  const lng = longitude || -69.9312;
  const hasCoordinates = latitude && longitude;

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Create map
    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: hasCoordinates ? 13 : 9,
      scrollWheelZoom: false,
    });

    // Add OpenStreetMap tiles (free)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add marker + approximate-area circle if we have coordinates
    if (hasCoordinates) {
      // Approximate area circle (~600m radius) for privacy / general indication
      L.circle([lat, lng], {
        radius: 600,
        color: '#C5A059',
        fillColor: '#C5A059',
        fillOpacity: 0.18,
        weight: 2,
      }).addTo(map);

      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`
        <div style="text-align: center; padding: 5px; min-width: 160px;">
          <strong style="font-size: 14px; color: #1e293b;">${title || 'Propiedad'}</strong>
          <br/>
          <span style="color: #C5A059; font-size: 12px; font-weight: 600;">📍 ${location || 'Ubicación aproximada'}</span>
          <br/>
          <span style="color: #888; font-size: 11px;">Área aproximada</span>
        </div>
      `, { autoClose: false, closeOnClick: false }).openPopup();

      // Permanent label tooltip with the location/province name
      if (location) {
        L.tooltip({
          permanent: true,
          direction: 'top',
          offset: [0, -30],
          className: 'property-map-label',
        })
          .setLatLng([lat, lng])
          .setContent(`<strong>${location}</strong>`)
          .addTo(map);
      }
    } else if (location) {
      // No coordinates: show a centered label over DR with the province name
      L.popup({ autoClose: false, closeOnClick: false })
        .setLatLng([lat, lng])
        .setContent(`<div style="text-align:center;"><strong>${location}</strong><br/><span style="color:#888;font-size:11px;">Ubicación aproximada</span></div>`)
        .openOn(map);
    }

    mapInstanceRef.current = map;

    // Fix Leaflet sizing on mobile / dynamically rendered containers.
    // Without this, the map can render misaligned and the marker is not centered.
    const invalidateTimers = [];
    [60, 250, 600].forEach((delay) => {
      invalidateTimers.push(setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          mapInstanceRef.current.setView([lat, lng], hasCoordinates ? 13 : 9, { animate: false });
        }
      }, delay));
    });

    // Re-invalidate on viewport resize / orientation change
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.setView([lat, lng], hasCoordinates ? 13 : 9, { animate: false });
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Cleanup on unmount
    return () => {
      invalidateTimers.forEach((t) => clearTimeout(t));
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, hasCoordinates, title, location]);

  return (
    <>
      <style>{`
        .property-map-label {
          background: rgba(255,255,255,0.95) !important;
          border: 1px solid #C5A059 !important;
          color: #1e293b !important;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 4px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }
        .property-map-label:before { display: none !important; }
      `}</style>
      <div 
        ref={mapRef} 
        data-testid="property-map"
        className="h-64 w-full rounded-lg overflow-hidden border border-stone-200"
        style={{ minHeight: '250px' }}
      />
    </>
  );
};

export default PropertyMap;
