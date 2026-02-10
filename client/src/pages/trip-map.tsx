import { TripLayout } from "@/components/layout/trip-layout";
import MapView from "@/components/map-view";
import { GlassCard } from "@/components/ui/glass-card";
import { useTrip, useCreatePlace } from "@/hooks/use-trips";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Plus, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function TripMap() {
  const [match, params] = useRoute("/trip/:id/map");
  const tripId = params ? params.id : "";
  const { data: trip, isLoading } = useTrip(tripId);
  const { mutate: addPlace, isPending } = useCreatePlace();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState("attraction");

  if (isLoading || !trip) return null;

  const handleAddPlace = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate random location near trip center (Paris default in MapView)
    // In a real app, you'd pick this from the map click or search
    const baseLat = 48.8566;
    const baseLng = 2.3522;
    const randomOffset = () => (Math.random() - 0.5) * 0.05;

    addPlace({
      tripId,
      name,
      type,
      lat: baseLat + randomOffset(),
      lng: baseLng + randomOffset(),
      order: trip.places.length,
      description: "Added from map view",
      eta: "TBD",
    }, {
      onSuccess: () => setIsDialogOpen(false)
    });
  };

  return (
    <TripLayout>
      <div className="h-full min-h-[600px] flex flex-col lg:flex-row gap-6">
        {/* Left: Map */}
        <div className="flex-1 rounded-2xl overflow-hidden relative min-h-[400px]">
          <MapView places={trip.places} />
          
          <div className="absolute bottom-6 right-6 z-[400]">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/40">
                  <Plus className="w-6 h-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel text-white border-white/10">
                <DialogHeader>
                  <DialogTitle>Add New Place</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddPlace} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Place Name</Label>
                    <Input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Eiffel Tower" 
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select 
                      value={type} 
                      onChange={(e) => setType(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 glass-input"
                    >
                      <option value="attraction" className="text-black">Attraction</option>
                      <option value="hotel" className="text-black">Hotel</option>
                      <option value="food" className="text-black">Food</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600" disabled={isPending}>
                    {isPending ? "Adding..." : "Add to Itinerary"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Right: Itinerary List */}
        <GlassCard className="w-full lg:w-80 flex flex-col h-[600px]">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-bold text-lg text-white">Itinerary</h3>
            <p className="text-sm text-white/50">{trip.places.length} stops planned</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {trip.places.length === 0 ? (
              <div className="text-center text-white/40 py-8">
                No places added yet. Use the + button to add one!
              </div>
            ) : (
              trip.places.map((place, idx) => (
                <div key={place.id} className="flex gap-3 items-start p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm">{place.name}</h4>
                    <span className="text-xs text-white/50 uppercase tracking-wide px-1.5 py-0.5 rounded bg-white/5 inline-block mt-1">
                      {place.type}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </TripLayout>
  );
}
