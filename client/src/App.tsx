import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SheetProvider } from "./contexts/SheetContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import FileChooser from "./pages/FileChooser";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import Analytics from "./pages/Analytics";
import SheetsEditor from "./pages/SheetsEditor";
import AIAssistant from "./pages/AIAssistant";
import { useAuth } from "./_core/hooks/useAuth";
import { useEffect, useState } from "react";

function Router() {
  const { isAuthenticated, loading } = useAuth();
  const [location, navigate] = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  // Redirect logic for authentication
  useEffect(() => {
    if (loading) return;

    setAuthChecked(true);

    // If not authenticated and not on landing page, redirect to landing
    if (!isAuthenticated && location !== "/landing") {
      navigate("/landing");
    }
  }, [isAuthenticated, loading, location, navigate]);

  // Show loading state while checking authentication
  if (loading && !authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-blue-400 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public Routes - accessible without authentication */}
      <Route path={"/landing"} component={Landing} />

      {/* Authenticated Routes */}
      {isAuthenticated && (
        <>
          <Route path={"/choose-file"} component={FileChooser} />

          {/* Protected Routes - require file selection */}
          <Route path={"/"}>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path={"/transactions"}>
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          </Route>
          <Route path={"/categories"}>
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          </Route>
          <Route path={"/analytics"}>
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          </Route>
          <Route path={"/sheets"}>
            <ProtectedRoute>
              <SheetsEditor />
            </ProtectedRoute>
          </Route>
          <Route path={"/ai-assistant"}>
            <ProtectedRoute>
              <AIAssistant />
            </ProtectedRoute>
          </Route>
        </>
      )}

      {/* 404 */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <SheetProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </SheetProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
