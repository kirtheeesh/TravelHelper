import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertExpense, type Expense } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useExpenses(tripId: string) {
  return useQuery<Expense[]>({
    queryKey: [api.expenses.list.path, tripId],
    queryFn: async () => {
      const url = buildUrl(api.expenses.list.path, { id: tripId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch expenses");
      return await res.json();
    },
    enabled: !!tripId,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tripId, ...data }: InsertExpense & { tripId: string }) => {
      const url = buildUrl(api.expenses.create.path, { id: tripId });
      const res = await fetch(url, {
        method: api.expenses.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add expense");
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.expenses.list.path, variables.tripId] });
      queryClient.invalidateQueries({ queryKey: [api.trips.get.path, variables.tripId] }); // Update trip budget stats
      toast({
        title: "Expense Added",
        description: "Budget updated successfully.",
      });
    },
  });
}
