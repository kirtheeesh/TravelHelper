import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Chatbot } from "@/components/ui/chatbot";

import Splash from "@/pages/splash";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import TripWizard from "@/pages/trip-wizard";
import TripMap from "@/pages/trip-map";
import TripBudget from "@/pages/trip-budget";
import TripMembers from "@/pages/trip-members";
import NotFound from "@/pages/not-found";
import { useUser } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // In a real app, useLocation to redirect. 
    // Here we render Login as a fallback for protection
    return <Login />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Splash} />
      <Route path="/login" component={Login} />
      
      {/* Protected Routes */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      
      <Route path="/trip/new">
        {() => <ProtectedRoute component={TripWizard} />}
      </Route>

      <Route path="/trip/:id/map">
        {() => <ProtectedRoute component={TripMap} />}
      </Route>
      
      <Route path="/trip/:id/budget">
        {() => <ProtectedRoute component={TripBudget} />}
      </Route>
      
      <Route path="/trip/:id/members">
        {() => <ProtectedRoute component={TripMembers} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
        <Chatbot />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
