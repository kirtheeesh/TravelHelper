import { Link } from "wouter";
import { GlassCard } from "./ui/glass-card";
import { Calendar, Users, Wallet, MapPin } from "lucide-react";
import { Progress } from "./ui/progress";
import type { Trip } from "@/hooks/use-trips";
import { format } from "date-fns";

export function TripCard({ trip }: { trip: Trip }) {
  // Safe calculation for budget progress
  const budgetSpent = trip.budgetSpent || 0;
  const budgetTotal = trip.budgetTotal || 1; // Prevent division by zero
  const progress = Math.min((budgetSpent / budgetTotal) * 100, 100);

  return (
    <Link href={`/trip/${trip.id}/map`} className="block group">
      <GlassCard 
        className="h-full overflow-hidden flex flex-col relative"
        hoverEffect
      >
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
          {/* Unsplash image with fallback */}
          <img 
            src={trip.image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80"} 
            alt={trip.destination}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute bottom-4 left-4 z-20">
            <h3 className="text-2xl font-bold font-display text-white">{trip.name}</h3>
            <div className="flex items-center text-white/80 text-sm mt-1">
              <MapPin className="w-4 h-4 mr-1 text-accent" />
              {trip.destination}
            </div>
          </div>
          
          <div className="absolute top-4 right-4 z-20">
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md
              ${trip.status === 'active' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 
                trip.status === 'completed' ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30' : 
                'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
              {trip.status}
            </div>
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col gap-4 text-white">
          <div className="flex items-center justify-between text-sm text-white/60">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {trip.startDate ? format(new Date(trip.startDate), "MMM d") : "TBD"} 
              - 
              {trip.endDate ? format(new Date(trip.endDate), "MMM d, yyyy") : "TBD"}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{trip.memberCount} members</span>
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-medium text-white/50 flex items-center gap-1">
                <Wallet className="w-3 h-3" /> Budget
              </span>
              <span className="text-sm font-semibold">
                ₹{budgetSpent.toLocaleString('en-IN')} <span className="text-white/40">/ ₹{budgetTotal.toLocaleString('en-IN')}</span>
              </span>
            </div>
            <Progress value={progress} className="h-1.5 bg-white/10" indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-500" />
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
