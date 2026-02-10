import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Place } from '@/hooks/use-trips';
import { GlassCard } from './ui/glass-card';

// Fix Leaflet icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore - Leaflet type hack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { duration: 2 });
  }, [center, map]);
  return null;
}

function LocationMarker() {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMapEvents({
    click() {
      map.locate();
    },
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

interface MapViewProps {
  places: Place[];
  onPlaceClick?: (place: Place) => void;
  interactive?: boolean;
}

export default function MapView({ places, onPlaceClick, interactive = true }: MapViewProps) {
  // Default center if no places
  const defaultCenter: [number, number] = [48.8566, 2.3522]; // Paris
  const center = places.length > 0 
    ? [places[0].lat, places[0].lng] as [number, number] 
    : defaultCenter;

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={interactive}
        className="h-full w-full bg-slate-900"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles-dark" // CSS filter needed for dark mode tiles if desired
        />
        
        <MapController center={center} />

        {places.map((place, idx) => (
          <Marker 
            key={place.id} 
            position={[place.lat, place.lng]}
            eventHandlers={{
              click: () => onPlaceClick?.(place)
            }}
          >
            <Popup className="glass-popup">
              <div className="p-2">
                <h3 className="font-bold text-slate-900">{idx + 1}. {place.name}</h3>
                <p className="text-sm text-slate-600">{place.type}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
