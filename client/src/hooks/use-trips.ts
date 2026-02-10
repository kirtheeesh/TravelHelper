import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertTrip, type Trip, type TripWithDetails } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function useTrips() {
  return useQuery<Trip[]>({
    queryKey: [api.trips.list.path],
    queryFn: async () => {
      const res = await fetch(api.trips.list.path);
      if (!res.ok) throw new Error("Failed to fetch trips");
      return await res.json();
    },
  });
}

export function useTrip(id: string) {
  return useQuery<TripWithDetails>({
    queryKey: [api.trips.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.trips.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch trip details");
      return await res.json();
    },
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (data: InsertTrip) => {
      const res = await fetch(api.trips.create.path, {
        method: api.trips.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create trip");
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.trips.list.path] });
      toast({
        title: "Trip Created!",
        description: `Start planning your adventure to ${data.destination}.`,
      });
      setLocation(`/trip/${data.id}/map`);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create trip. Please try again.",
      });
    },
  });
}

export function useCreatePlace() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tripId, ...placeData }: any) => {
      const url = buildUrl(api.places.create.path, { id: tripId });
      const res = await fetch(url, {
        method: api.places.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(placeData),
      });
      if (!res.ok) throw new Error("Failed to add place");
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.trips.get.path, variables.tripId] });
      toast({
        title: "Place Added",
        description: "New stop added to your itinerary.",
      });
    },
  });
}
