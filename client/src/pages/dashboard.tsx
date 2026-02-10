import { MainLayout } from "@/components/layout/main-layout";
import { TripCard } from "@/components/trip-card";
import { GlassCard } from "@/components/ui/glass-card";
import { useTrips } from "@/hooks/use-trips";
import { motion } from "framer-motion";
import { Loader2, Plus } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: trips, isLoading } = useTrips();
  const visibleTrips = trips?.filter(t => !t.isHidden);

  const stats = [
    { label: "Total Trips", value: visibleTrips?.length || 0, color: "text-indigo-400" },
    { label: "Active", value: visibleTrips?.filter(t => t.status === "active").length || 0, color: "text-green-400" },
    { label: "Planned", value: visibleTrips?.filter(t => t.status === "planned").length || 0, color: "text-amber-400" },
    { label: "Countries", value: 3, color: "text-pink-400" }, // Mock data for now
  ];

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Dashboard</h1>
            <p className="text-white/60">Overview of your adventures</p>
          </div>
          <Link href="/trip/new">
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl shadow-lg hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" /> New Trip
            </button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <GlassCard key={i} className="p-6 flex flex-col items-center justify-center text-center">
              <span className={`text-4xl font-bold ${stat.color} mb-1`}>{stat.value}</span>
              <span className="text-sm text-white/60 font-medium uppercase tracking-wider">{stat.label}</span>
            </GlassCard>
          ))}
        </div>

        {/* Trips Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-bold text-white">Your Trips</h2>
          
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : visibleTrips?.length === 0 ? (
            <GlassCard className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-white/50" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No trips yet</h3>
              <p className="text-white/60 mb-6 max-w-sm">
                Start planning your next adventure by creating a new trip.
              </p>
              <Link href="/trip/new">
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                  Create Trip
                </button>
              </Link>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleTrips?.map((trip, idx) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <TripCard trip={trip} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
