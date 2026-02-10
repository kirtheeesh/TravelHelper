import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  X, 
  Send, 
  Map as MapIcon, 
  LayoutDashboard, 
  Plus, 
  Users, 
  Wallet, 
  Maximize2, 
  Minimize2,
  GripHorizontal,
  Sparkles,
  Mountain,
  Palmtree,
  Users2
} from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GlassCard } from "./glass-card";
import { ScrollArea } from "./scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { useTrips } from "@/hooks/use-trips";

interface Message {
  id: string;
  type: "bot" | "user";
  content: string;
  buttons?: { label: string; action: string; icon?: React.ReactNode }[];
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const { data: trips } = useTrips();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: "👋 Hi! I'm your Travel Helper AI. How can I help you today?",
      buttons: [
        { label: "📍 Active Trip", action: "map", icon: <MapIcon className="w-4 h-4" /> },
        { label: "📊 Dashboard", action: "dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: "➕ New Trip", action: "new trip", icon: <Plus className="w-4 h-4" /> }
      ]
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [location, setLocation] = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const triggerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const triggerError = () => {
    setShowError(true);
    setTimeout(() => setShowError(false), 500);
  };

  const handleAction = (action: string) => {
    const cmd = action.toLowerCase();
    const firstTripId = trips?.[0]?.id;
    
    if (cmd.includes("dashboard") || cmd.includes("home")) {
      setLocation("/dashboard");
      triggerSuccess();
      addBotMessage("🚀 Your trips at a glance!", [
        { label: "📍 Active Trip", action: "map", icon: <MapIcon className="w-4 h-4" /> },
        { label: "💰 Trip Budget", action: "budget", icon: <Wallet className="w-4 h-4" /> },
        { label: "➕ Plan New Adventure", action: "new trip", icon: <Plus className="w-4 h-4" /> },
        { label: "👥 Manage Members", action: "members", icon: <Users className="w-4 h-4" /> }
      ]);
    } else if (cmd.includes("map") || cmd.includes("where")) {
      if (firstTripId) {
        setLocation(`/trip/${firstTripId}/map`);
        addBotMessage("📍 2.3km from Waterfalls! ETA Pine Forest: 15 mins", [
          { label: "Open Full Map", action: "map" }
        ]);
      } else {
        addBotMessage("You don't have any trips yet! Want to create one?", [
          { label: "➕ Create Trip", action: "new trip" }
        ]);
      }
    } else if (cmd.includes("new trip") || cmd.includes("plan munnar")) {
      setLocation("/trip/new");
      addBotMessage("✨ Trip creator activated! What's the vibe? Adventure / Relax / Family?", [
        { label: "🏔️ Adventure", action: "adventure", icon: <Mountain className="w-4 h-4" /> },
        { label: "🏖️ Relax", action: "relax", icon: <Palmtree className="w-4 h-4" /> },
        { label: "👨‍👩‍👧 Family", action: "family", icon: <Users2 className="w-4 h-4" /> }
      ]);
    } else if (cmd.includes("budget") || cmd.includes("spent")) {
      if (firstTripId) {
        setLocation(`/trip/${firstTripId}/budget`);
        addBotMessage("💸 Trip Budget: View your spending and split costs here.", [
          { label: "📊 Pie Chart", action: "budget" },
          { label: "➕ Add Spending", action: "budget" },
          { label: "✂️ Split", action: "budget" }
        ]);
      } else {
        addBotMessage("No trips found. Plan one to track your budget!");
      }
    } else if (cmd.includes("members") || cmd.includes("team")) {
      if (firstTripId) {
        setLocation(`/trip/${firstTripId}/members`);
        addBotMessage("👥 Managing your travel squad.", [
          { label: "Invite Friend", action: "members" },
          { label: "Permissions", action: "members" }
        ]);
      } else {
        addBotMessage("Create a trip first to manage members!");
      }
    } else if (cmd.includes("vagamon")) {
      addBotMessage("🎒 Found 3 PERFECT Vagamon adventures!", [
        { label: "✨ Hill Station (4 friends, ₹15k)", action: "hill station" },
        { label: "✨ Adventure Camp (6 members)", action: "adventure" },
        { label: "✨ Family Escape (2 people)", action: "family" },
        { label: "✨ Create My Own", action: "new trip" }
      ]);
    } else if (cmd.includes("adventure") || cmd.includes("relax") || cmd.includes("family")) {
      addBotMessage(`Awesome! ${cmd.charAt(0).toUpperCase() + cmd.slice(1)} trip vibes selected. Let's start planning!`);
      setLocation("/trip/new");
    } else {
      addBotMessage("I'm your Navigation Heart! Try commands like 'dashboard', 'plan munnar trip', 'where are we?', or 'budget update'.");
    }
  };

  const addBotMessage = (content: string, buttons?: Message["buttons"]) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: "bot",
        content,
        buttons
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: "user",
      content: userMsg
    }]);
    setInput("");
    handleAction(userMsg);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 shadow-lg z-[100] flex items-center justify-center text-white"
        whileHover={{ scale: 1.1, rotate: 5, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          y: [0, -8, 0],
          boxShadow: ["0 4px 6px rgba(0,0,0,0.1)", "0 10px 20px rgba(59, 130, 246, 0.3)", "0 4px 6px rgba(0,0,0,0.1)"]
        }}
        transition={{ 
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
            >
              <X className="w-8 h-8" />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <Bot className="w-8 h-8" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Sparkles effect */}
        {!isOpen && (
          <motion.div 
            className="absolute -top-1 -right-1"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300" />
          </motion.div>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8, x: 20 }}
            animate={isMinimized ? { 
              opacity: 1, 
              y: 0, 
              scale: 0.4, 
              x: 100,
              originX: 1,
              originY: 1
            } : { 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              x: showError ? [0, -10, 10, -10, 10, 0] : 0
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className={cn(
              "fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[70vh] z-[90] flex flex-col",
              isMinimized && "pointer-events-none opacity-0"
            )}
          >
            <GlassCard variant="dark" className="flex-1 flex flex-col overflow-hidden border-white/20 shadow-2xl rounded-3xl relative">
              {/* Success Overlay */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[110] pointer-events-none flex items-center justify-center bg-indigo-500/10 backdrop-blur-[2px]"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="bg-emerald-500 text-white p-4 rounded-full shadow-lg"
                    >
                      <Sparkles className="w-12 h-12" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                  </div>
                  <div>
                    <h3 className="text-white font-display font-semibold text-sm">Travel Assistant</h3>
                    <p className="text-[10px] text-white/50 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online | AI Powered
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-8 h-8 text-white/50 hover:text-white hover:bg-white/10"
                    onClick={() => setIsMinimized(true)}
                  >
                    <Minimize2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-8 h-8 text-white/50 hover:text-white hover:bg-white/10"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Drag handle decoration */}
              <div className="h-2 w-full flex items-center justify-center border-b border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                <GripHorizontal className="w-8 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={cn(
                        "flex flex-col max-w-[85%]",
                        msg.type === "user" ? "ml-auto items-end" : "items-start"
                      )}
                    >
                      <div className={cn(
                        "px-4 py-3 rounded-2xl text-sm whitespace-pre-line",
                        msg.type === "user" 
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/20" 
                          : "bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-tl-none shadow-inner"
                      )}>
                        {msg.content}
                      </div>
                      
                      {msg.buttons && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {msg.buttons.map((btn, idx) => (
                            <motion.button
                              key={idx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 * idx }}
                              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAction(btn.action)}
                              className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] text-white flex items-center gap-1.5 backdrop-blur-sm transition-colors"
                            >
                              {btn.icon}
                              {btn.label}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex items-center gap-2 text-white/50 text-xs ml-2">
                      <div className="flex gap-1">
                        <motion.span 
                          animate={{ opacity: [0.3, 1, 0.3] }} 
                          transition={{ repeat: Infinity, duration: 1, times: [0, 0.5, 1] }}
                          className="w-1.5 h-1.5 rounded-full bg-current" 
                        />
                        <motion.span 
                          animate={{ opacity: [0.3, 1, 0.3] }} 
                          transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                          className="w-1.5 h-1.5 rounded-full bg-current" 
                        />
                        <motion.span 
                          animate={{ opacity: [0.3, 1, 0.3] }} 
                          transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                          className="w-1.5 h-1.5 rounded-full bg-current" 
                        />
                      </div>
                      AI is thinking...
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t border-white/10">
                <form 
                  onSubmit={handleSend}
                  className="relative flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                  <Button 
                    type="submit"
                    size="icon"
                    className="rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shrink-0"
                    disabled={!input.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
                <p className="text-[9px] text-white/20 text-center mt-2">
                  Powered by TravelHelper AI • Commands: dashboard, map, new trip
                </p>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
