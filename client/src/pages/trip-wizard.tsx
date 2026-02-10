import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTrip } from "@/hooks/use-trips";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const tripSchema = z.object({
  name: z.string().min(3, "Trip name is required"),
  destination: z.string().min(2, "Destination is required"),
  image: z.string().url("Must be a valid URL"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budgetTotal: z.coerce.number().min(1, "Budget must be positive"),
});

export default function TripWizard() {
  const [step, setStep] = useState(1);
  const { mutate: createTrip, isPending } = useCreateTrip();

  const form = useForm<z.infer<typeof tripSchema>>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      name: "",
      destination: "",
      image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
      budgetTotal: 1000,
    },
  });

  function onSubmit(values: z.infer<typeof tripSchema>) {
    createTrip({
      ...values,
      startDate: values.startDate ? new Date(values.startDate) : undefined,
      endDate: values.endDate ? new Date(values.endDate) : undefined,
      status: "planned",
    });
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-display font-bold text-white mb-2">Plan a New Trip</h1>
          <div className="flex items-center justify-center gap-2">
            {[1, 2].map((i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full transition-colors ${step >= i ? 'bg-indigo-500' : 'bg-white/20'}`} 
              />
            ))}
          </div>
        </motion.div>

        <GlassCard className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-bold text-white">Step 1: The Basics</h2>
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Trip Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Summer Vacation 2024" {...field} className="glass-input" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Destination</FormLabel>
                          <FormControl>
                            <Input placeholder="Tokyo, Japan" {...field} className="glass-input" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Start Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="glass-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">End Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="glass-input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button 
                        type="button" 
                        onClick={() => setStep(2)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
                      >
                        Next <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-bold text-white">Step 2: Budget & Cover</h2>

                    <FormField
                      control={form.control}
                      name="budgetTotal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Total Budget ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="5000" {...field} className="glass-input" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Cover Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} className="glass-input" />
                          </FormControl>
                          <p className="text-xs text-white/50">Using default Unsplash image if left unchanged.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between pt-4">
                      <Button 
                        type="button" 
                        variant="ghost"
                        onClick={() => setStep(1)}
                        className="text-white hover:bg-white/10"
                      >
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-green-600 hover:bg-green-700 text-white px-8"
                        disabled={isPending}
                      >
                        {isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : "Create Trip"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Form>
        </GlassCard>
      </div>
    </MainLayout>
  );
}
