import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Plane, Map as MapIcon, Compass } from "lucide-react";

export default function Splash() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation("/login");
    }, 3500);
    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden relative">
      {/* Background World Map Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
        <MapIcon className="w-[80vw] h-[80vw] text-white" strokeWidth={0.5} />
      </div>

      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateX: 45 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          transition={{ duration: 1.2, type: "spring" }}
          className="mb-8 inline-block"
        >
          <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl shadow-2xl flex items-center justify-center transform -rotate-12 border border-white/20 backdrop-blur-md">
            <Plane className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-5xl md:text-7xl font-display font-bold text-white mb-6"
        >
          TravelHelper
        </motion.h1>

        <div className="flex justify-center gap-4 text-2xl md:text-3xl font-light text-white/80 font-display">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
          >
            Plan.
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.8 }}
          >
            Track.
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.4 }}
            className="text-accent font-semibold"
          >
            Travel.
          </motion.span>
        </div>
      </div>
    </div>
  );
}
