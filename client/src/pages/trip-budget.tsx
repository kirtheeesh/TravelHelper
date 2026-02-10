import { TripLayout } from "@/components/layout/trip-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { useExpenses, useCreateExpense } from "@/hooks/use-expenses";
import { useRoute } from "wouter";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTrip } from "@/hooks/use-trips";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const COLORS = ['#6366F1', '#8B5CF6', '#F59E0B', '#EC4899'];

export default function TripBudget() {
  const [match, params] = useRoute("/trip/:id/budget");
  const tripId = params ? params.id : "";
  const { data: trip } = useTrip(tripId);
  const { data: expenses, isLoading } = useExpenses(tripId);
  const { mutate: addExpense, isPending } = useCreateExpense();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [description, setDescription] = useState("");

  if (isLoading || !trip) return null;

  // Process data for chart
  const data = expenses?.reduce((acc: any[], curr) => {
    const existing = acc.find(x => x.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, []) || [];

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      tripId,
      amount: parseFloat(amount),
      category,
      description,
      date: new Date().toISOString()
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setAmount("");
        setDescription("");
      }
    });
  };

  return (
    <TripLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        {/* Left: Chart & Summary */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-6 flex flex-col items-center justify-center min-h-[300px]">
            <h3 className="text-lg font-bold text-white mb-4 self-start">Spending Breakdown</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full mt-4 flex justify-between items-center p-4 rounded-xl bg-white/5">
              <div>
                <p className="text-sm text-white/60">Total Budget</p>
                <p className="text-xl font-bold text-white">${trip.budgetTotal?.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/60">Spent</p>
                <p className="text-xl font-bold text-amber-400">${trip.budgetSpent?.toLocaleString()}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right: Transactions List */}
        <GlassCard className="flex flex-col h-full max-h-[600px]">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-bold text-lg text-white">Recent Expenses</h3>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel text-white border-white/10">
                <DialogHeader>
                  <DialogTitle>Add Expense</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddExpense} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Amount ($)</Label>
                    <Input 
                      type="number"
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00" 
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 glass-input"
                    >
                      <option value="food" className="text-black">Food</option>
                      <option value="transport" className="text-black">Transport</option>
                      <option value="stay" className="text-black">Accommodation</option>
                      <option value="activity" className="text-black">Activity</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Lunch, Taxi, Museum..." 
                      className="glass-input"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600" disabled={isPending}>
                    {isPending ? "Adding..." : "Add Expense"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {expenses?.length === 0 ? (
              <div className="text-center text-white/40 py-8">No expenses recorded.</div>
            ) : (
              expenses?.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-white/10 text-white">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{expense.description || expense.category}</p>
                      <p className="text-xs text-white/50 capitalize">{expense.category}</p>
                    </div>
                  </div>
                  <span className="font-bold text-white">-${expense.amount}</span>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </TripLayout>
  );
}
