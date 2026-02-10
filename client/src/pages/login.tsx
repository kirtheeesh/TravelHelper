import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin, useUser } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const { mutate: login, isPending } = useLogin();
  const { user } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) setLocation("/dashboard");
  }, [user, setLocation]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    login(values);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 w-full max-w-6xl h-[80vh] rounded-3xl overflow-hidden shadow-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10">
        
        {/* Left: Form */}
        <div className="flex flex-col justify-center p-8 md:p-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-display font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/60 mb-8">Start your next adventure today.</p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="admin" 
                          {...field} 
                          className="glass-input h-12 text-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          className="glass-input h-12 text-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25"
                  disabled={isPending}
                >
                  {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Sign In"}
                  {!isPending && <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>
              </form>
            </Form>

            <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-200 text-center">
                <span className="font-bold">Demo Access:</span> username: <code>admin</code> / password: <code>admin123</code>
              </p>
            </div>
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
