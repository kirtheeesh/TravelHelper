import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Place } from '@/hooks/use-trips';
import { GlassCard } from './ui/glass-card';
import { Search, MapPin, Crosshair, Navigation2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from '@/hooks/use-toast';

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

function LocationPicker({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();
  
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        setPosition(e.latlng);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
        map.flyTo(e.latlng, map.getZoom());
      }
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup className="glass-popup">
        <div className="p-1">
          <p className="font-bold text-slate-900 text-xs">Selected Location</p>
          <p className="text-[10px] text-slate-500">{position.lat.toFixed(4)}, {position.lng.toFixed(4)}</p>
        </div>
      </Popup>
    </Marker>
  );
}

interface MapViewProps {
  places: Place[];
  onPlaceClick?: (place: Place) => void;
  onLocationSelect?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

export default function MapView({ places, onPlaceClick, onLocationSelect, interactive = true }: MapViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>([9.6891, 76.9034]);

  // Default center: Vagamon, Kerala
  const defaultCenter: [number, number] = [9.6891, 76.9034]; 
  const center = places.length > 0 
    ? [places[0].lat, places[0].lng] as [number, number] 
    : mapCenter;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        setMapCenter([newLat, newLng]);
        if (onLocationSelect) {
          onLocationSelect(newLat, newLng);
        }
        toast({
          title: "Location found",
          description: `Zoomed to ${searchQuery}`,
        });
      } else {
        toast({
          title: "Location not found",
          description: "Try searching for a different place.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search for location.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative z-0 group">
      {/* Visual Crosshair for accuracy */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400] opacity-0 group-hover:opacity-20 transition-opacity">
        <Crosshair className="w-8 h-8 text-white" />
      </div>

      <div className="absolute top-4 left-4 right-4 z-[400] flex gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input 
              placeholder="Search accurately (e.g. Pine Forest, Vagamon)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input pl-10 h-11 shadow-lg backdrop-blur-md"
            />
          </div>
          <Button type="submit" className="bg-primary hover:bg-primary/80 h-11 px-6 shadow-lg">
            Search
          </Button>
        </form>
      </div>

      <div className="absolute bottom-6 left-6 z-[400]">
        <Button 
          variant="secondary" 
          size="icon" 
          className="rounded-full h-12 w-12 bg-slate-900/80 backdrop-blur-md border-white/10 text-white hover:bg-white/20"
          onClick={() => setMapCenter(defaultCenter)}
        >
          <Navigation2 className="w-6 h-6" />
        </Button>
      </div>

      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={interactive}
        className="h-full w-full bg-slate-900"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={center} />
        <LocationPicker onLocationSelect={onLocationSelect} />

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
                <p className="text-sm text-slate-600 capitalize">{place.type}</p>
                {place.description && <p className="text-xs text-slate-400 mt-1">{place.description}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
