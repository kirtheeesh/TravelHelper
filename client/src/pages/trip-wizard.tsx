import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTrip, useCreatePlace } from "@/hooks/use-trips";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTED_TRIPS = [
  {
    name: "Vagamon Nature Escape",
    destination: "Vagamon, Kerala",
    image: "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?w=800&q=80",
    budgetTotal: 12000,
    places: [
      { name: "Vagamon Pine Forest", lat: 9.6891, lng: 76.9034, type: "nature", description: "Beautiful pine trees" },
      { name: "Kurisumala", lat: 9.6785, lng: 76.8912, type: "spiritual", description: "Hilltop pilgrimage" },
      { name: "Vagamon Meadows", lat: 9.6954, lng: 76.9123, type: "nature", description: "Lush green meadows" }
    ]
  },
  {
    name: "Vagamon Adventure Trip",
    destination: "Vagamon, Kerala",
    image: "https://images.unsplash.com/photo-1548625361-1250267d3372?w=800&q=80",
    budgetTotal: 15000,
    places: [
      { name: "Vagamon Paragliding Point", lat: 9.6743, lng: 76.8856, type: "adventure", description: "Paragliding and viewpoint" },
      { name: "Thangal Para", lat: 9.6821, lng: 76.8987, type: "landmark", description: "Spherical rock formation" },
      { name: "Maramala Waterfalls", lat: 9.6543, lng: 76.9234, type: "nature", description: "Hidden waterfall" }
    ]
  }
];

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
  const { mutate: createPlace } = useCreatePlace();

  const form = useForm<z.infer<typeof tripSchema>>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      name: "",
      destination: "",
      image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
      budgetTotal: 1000,
    },
  });

  const handleSuggestSelect = (suggested: typeof SUGGESTED_TRIPS[0]) => {
    createTrip({
      name: suggested.name,
      destination: suggested.destination,
      image: suggested.image,
      budgetTotal: suggested.budgetTotal,
      status: "planned",
      isHidden: false,
    }, {
      onSuccess: (trip) => {
        // Add all places for this trip
        suggested.places.forEach((place, index) => {
          createPlace({
            tripId: trip.id,
            ...place,
            order: index,
          });
        });
      }
    });
  };

  function onSubmit(values: z.infer<typeof tripSchema>) {
    createTrip({
      ...values,
      startDate: values.startDate ? new Date(values.startDate) : undefined,
      endDate: values.endDate ? new Date(values.endDate) : undefined,
      status: "planned",
      isHidden: false,
    });
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
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
                              <FormLabel className="text-white">Total Budget (₹)</FormLabel>
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

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Suggested Trips
            </h2>
            <div className="space-y-4">
              {SUGGESTED_TRIPS.map((trip) => (
                <motion.div
                  key={trip.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GlassCard 
                    className="p-4 cursor-pointer hover:bg-white/10 transition-colors border-white/10"
                    onClick={() => handleSuggestSelect(trip)}
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={trip.image} alt={trip.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold truncate">{trip.name}</h3>
                        <p className="text-white/60 text-sm truncate">{trip.destination}</p>
                        <p className="text-indigo-400 text-sm font-semibold mt-1">₹{trip.budgetTotal}</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
