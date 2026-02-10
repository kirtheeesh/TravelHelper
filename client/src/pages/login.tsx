import { useUser } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (user) setLocation("/dashboard");
  }, [user, setLocation]);

  const handleGoogleLogin = () => {
    setIsSigningIn(true);
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-6xl h-[80vh] rounded-3xl overflow-hidden shadow-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10">
        
        {/* Left: Content */}
        <div className="flex flex-col justify-center p-8 md:p-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-display font-bold text-white mb-2">Welcome</h1>
            <p className="text-white/60 mb-12">Start your next adventure today with Google Sign-In.</p>

            <Button
              variant="outline"
              type="button"
              className="w-full h-16 text-xl glass-card border-white/10 text-white hover:bg-white/5 transition-all duration-300"
              onClick={handleGoogleLogin}
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <FcGoogle className="mr-3 h-8 w-8" />
                  Continue with Google
                </>
              )}
            </Button>

            <p className="mt-8 text-sm text-white/40 text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </div>

        {/* Right: Visual */}
        <div className="hidden lg:flex relative bg-gradient-to-br from-indigo-600 to-purple-700 items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay" />
          <div className="relative z-10 text-center p-12">
            <motion.h2 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-5xl font-display font-bold text-white mb-6 leading-tight"
            >
              Discover the <br/> Unseen World
            </motion.h2>
            <p className="text-indigo-100 text-lg max-w-md mx-auto">
              Track budgets, plan itineraries, and coordinate with friends in one beautiful workspace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
