import { Link, useLocation, useRoute } from "wouter";
import { useTrip } from "@/hooks/use-trips";
import { MainLayout } from "./main-layout";
import { GlassCard } from "../ui/glass-card";
import { cn } from "@/lib/utils";
import { Map, Wallet, Users, ArrowLeft } from "lucide-react";

export function TripLayout({ children }: { children: React.ReactNode }) {
  const [match, params] = useRoute("/trip/:id/:section?");
  const tripId = params ? params.id : "";
  const { data: trip } = useTrip(tripId);
  const section = params?.section || "map";

  if (!trip) return <MainLayout>{children}</MainLayout>;

  return (
    <MainLayout>
      <div className="flex flex-col h-full gap-6">
        {/* Trip Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <div className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-white">
                <ArrowLeft className="w-5 h-5" />
              </div>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-display text-white">{trip.name}</h1>
              <p className="text-white/60 flex items-center gap-2 text-sm">
                <span className="uppercase tracking-wider font-semibold text-accent">{trip.destination}</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span>{new Date(trip.startDate || Date.now()).toLocaleDateString()}</span>
              </p>
            </div>
          </div>
          
          <GlassCard className="p-1 flex gap-1 bg-black/40 self-start md:self-auto">
            <Link href={`/trip/${tripId}/map`}>
              <div className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all flex items-center gap-2",
                section === "map" ? "bg-indigo-600 text-white shadow-lg" : "text-white/70 hover:text-white hover:bg-white/5"
              )}>
                <Map className="w-4 h-4" />
                Map
              </div>
            </Link>
            <Link href={`/trip/${tripId}/budget`}>
              <div className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all flex items-center gap-2",
                section === "budget" ? "bg-indigo-600 text-white shadow-lg" : "text-white/70 hover:text-white hover:bg-white/5"
              )}>
                <Wallet className="w-4 h-4" />
                Budget
              </div>
            </Link>
            <Link href={`/trip/${tripId}/members`}>
              <div className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all flex items-center gap-2",
                section === "members" ? "bg-indigo-600 text-white shadow-lg" : "text-white/70 hover:text-white hover:bg-white/5"
              )}>
                <Users className="w-4 h-4" />
                Members
              </div>
            </Link>
          </GlassCard>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[600px] relative">
          {children}
        </div>
      </div>
    </MainLayout>
  );
}
