import { TripLayout } from "@/components/layout/trip-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { useExpenses, useCreateExpense } from "@/hooks/use-expenses";
import { useRoute } from "wouter";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTrip } from "@/hooks/use-trips";
import { Button } from "@/components/ui/button";
import { Plus, IndianRupee, TrendingUp, Wallet, ArrowUpRight, Clock } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

const COLORS = ['#6366F1', '#8B5CF6', '#F59E0B', '#EC4899', '#10B981', '#F43F5E'];

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

  const totalSpent = trip.budgetSpent || 0;
  const budgetTotal = trip.budgetTotal || 0;
  const remaining = Math.max(0, budgetTotal - totalSpent);
  const percentSpent = budgetTotal > 0 ? (totalSpent / budgetTotal) * 100 : 0;

  // Process data for chart
  const chartData = expenses?.reduce((acc: any[], curr) => {
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
      date: new Date()
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
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Wallet className="w-16 h-16 text-indigo-400" />
            </div>
            <p className="text-sm font-medium text-white/60 mb-1">Total Budget</p>
            <h3 className="text-3xl font-bold text-white flex items-center">
              <IndianRupee className="w-6 h-6 mr-1" />
              {budgetTotal.toLocaleString('en-IN')}
            </h3>
            <div className="mt-4 flex items-center text-xs text-white/40">
              <TrendingUp className="w-3 h-3 mr-1 text-green-400" />
              <span>Planning phase budget</span>
            </div>
          </GlassCard>

          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-16 h-16 text-amber-400" />
            </div>
            <p className="text-sm font-medium text-white/60 mb-1">Total Spent</p>
            <h3 className="text-3xl font-bold text-amber-400 flex items-center">
              <IndianRupee className="w-6 h-6 mr-1" />
              {totalSpent.toLocaleString('en-IN')}
            </h3>
            <div className="mt-4">
              <Progress value={percentSpent} className="h-2 bg-white/10" />
              <p className="text-[10px] text-white/40 mt-1">{percentSpent.toFixed(1)}% of total budget used</p>
            </div>
          </GlassCard>

          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Clock className="w-16 h-16 text-green-400" />
            </div>
            <p className="text-sm font-medium text-white/60 mb-1">Remaining</p>
            <h3 className="text-3xl font-bold text-green-400 flex items-center">
              <IndianRupee className="w-6 h-6 mr-1" />
              {remaining.toLocaleString('en-IN')}
            </h3>
            <div className="mt-4 flex items-center text-xs text-white/40">
              <span>Estimated for next 5 days</span>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-8">
            <h3 className="text-xl font-bold text-white mb-8">Expense Distribution</h3>
            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '12px', 
                      color: '#fff',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                    }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    wrapperStyle={{ paddingTop: '20px', color: 'rgba(255,255,255,0.6)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col h-[500px]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl text-white">Recent Transactions</h3>
                <p className="text-xs text-white/40">Real-time spending tracking</p>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary hover:bg-primary/80 px-4">
                    <Plus className="w-4 h-4 mr-2" /> Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-panel text-white border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-display">New Expense</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddExpense} className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <Label className="text-white/70">Amount (₹)</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <Input 
                          type="number"
                          value={amount} 
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0" 
                          className="glass-input pl-10 h-12 text-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70">Category</Label>
                      <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all glass-input"
                      >
                        <option value="food" className="bg-slate-900">Food & Dining</option>
                        <option value="transport" className="bg-slate-900">Transportation</option>
                        <option value="stay" className="bg-slate-900">Accommodation</option>
                        <option value="activity" className="bg-slate-900">Activities</option>
                        <option value="shopping" className="bg-slate-900">Shopping</option>
                        <option value="other" className="bg-slate-900">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/70">What was this for?</Label>
                      <Input 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Dinner at Beach Road" 
                        className="glass-input h-12"
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/80 transition-all" disabled={isPending}>
                      {isPending ? "Processing..." : "Confirm Expense"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {expenses?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-30">
                  <Wallet className="w-12 h-12 mb-2" />
                  <p className="text-sm">No expenses yet</p>
                </div>
              ) : (
                expenses?.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-white/10 text-white group-hover:scale-110 transition-transform">
                        <IndianRupee className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{expense.description || expense.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-white/30 uppercase tracking-widest">{expense.category}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-[10px] text-white/30">{format(new Date(expense.date), "MMM d, h:mm a")}</span>
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-lg text-white">₹{expense.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </TripLayout>
  );
}
