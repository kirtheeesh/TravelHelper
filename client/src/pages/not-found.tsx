import { Link } from "wouter";
import { GlassCard } from "@/components/ui/glass-card";
import { MapPinOff } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 p-4">
      <GlassCard className="max-w-md w-full p-8 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <MapPinOff className="w-10 h-10 text-white/50" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-2 font-display">404</h1>
        <p className="text-xl text-white/80 mb-6">Oops! We lost the map.</p>
        <p className="text-white/50 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <Link href="/dashboard">
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
            Return to Dashboard
          </button>
        </Link>
      </GlassCard>
    </div>
  );
}
