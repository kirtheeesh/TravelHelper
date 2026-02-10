import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "dark";
  hoverEffect?: boolean;
}

export function GlassCard({ 
  className, 
  variant = "default", 
  hoverEffect = false,
  children,
  ...props 
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "rounded-2xl border backdrop-blur-md shadow-xl transition-all duration-300",
        variant === "default" && "bg-white/5 border-white/20",
        variant === "dark" && "bg-slate-900/60 border-white/10",
        className
      )}
      whileHover={hoverEffect ? { y: -4, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)" } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}
