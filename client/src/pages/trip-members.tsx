import { TripLayout } from "@/components/layout/trip-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { useTrip } from "@/hooks/use-trips";
import { useRoute } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function TripMembers() {
  const [match, params] = useRoute("/trip/:id/members");
  const tripId = params ? params.id : "";
  const { data: trip, isLoading } = useTrip(tripId);

  if (isLoading || !trip) return null;

  return (
    <TripLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trip.members.map((member) => (
          <GlassCard key={member.id} className="p-6 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative">
              <Avatar className="w-20 h-20 mb-4 border-2 border-white/20">
                <AvatarImage src={member.user.avatar || undefined} />
                <AvatarFallback className="text-xl bg-slate-800 text-white">
                  {member.user.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute bottom-4 right-0 w-4 h-4 rounded-full border-2 border-slate-900 ${member.user.isOnline ? 'bg-green-500' : 'bg-slate-500'}`} />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">{member.user.name}</h3>
            <p className="text-sm text-white/50 mb-4">@{member.user.username}</p>

            <Badge variant={member.role === 'admin' ? "default" : "secondary"} className="uppercase tracking-wider">
              {member.role}
            </Badge>
          </GlassCard>
        ))}

        {/* Invite Card Placeholder */}
        <GlassCard className="p-6 flex flex-col items-center justify-center text-center border-dashed border-white/20 cursor-pointer hover:bg-white/5 transition-colors">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/50">
            <span className="text-3xl">+</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Invite Friend</h3>
          <p className="text-sm text-white/50">Add more people to this trip</p>
        </GlassCard>
      </div>
    </TripLayout>
  );
}
