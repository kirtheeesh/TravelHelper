import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { 
  LogOut, 
  Map, 
  LayoutDashboard, 
  Plus, 
  Settings,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlassCard } from "../ui/glass-card";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { mutate: logout } = useLogout();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden p-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <Link href="/dashboard" className="font-display text-xl font-bold text-gradient">TravelHelper</Link>
        <Avatar>
          <AvatarImage src={user?.avatar || undefined} />
          <AvatarFallback className="bg-indigo-600">{user?.name?.[0]}</AvatarFallback>
        </Avatar>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 fixed h-screen p-4 z-40">
        <GlassCard className="h-full flex flex-col p-4 bg-slate-900/80">
          <div className="mb-8 px-2">
            <Link href="/dashboard" className="font-display text-2xl font-bold text-gradient">
              TravelHelper
            </Link>
          </div>

          <nav className="flex-1 space-y-2">
            <Link href="/dashboard">
              <Button 
                variant="ghost" 
                className={cn("w-full justify-start gap-3 text-white/70 hover:text-white hover:bg-white/10", location === "/dashboard" && "bg-white/10 text-white font-medium")}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Button>
            </Link>
            <Link href="/trip/new">
              <Button 
                variant="ghost" 
                className={cn("w-full justify-start gap-3 text-white/70 hover:text-white hover:bg-white/10", location === "/trip/new" && "bg-white/10 text-white font-medium")}
              >
                <Plus className="w-5 h-5" />
                New Trip
              </Button>
            </Link>
          </nav>

          <div className="mt-auto pt-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-2 mb-4">
              <Avatar className="h-9 w-9 border border-white/20">
                <AvatarImage src={user?.avatar || undefined} />
                <AvatarFallback className="bg-indigo-600 text-white">{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-white/50 truncate">@{user?.username}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={() => logout()}
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Button>
          </div>
        </GlassCard>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-64 min-h-screen relative z-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
