import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import PassManagement from "@/pages/pass-management";
import PassDisplay from "@/pages/pass-display";
import QRTest from "@/pages/qr-test";
import Login from "@/pages/login";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";
import { LogOut, Shield, QrCode, Home } from "lucide-react";

function AuthenticatedApp() {
  const { user, logout, isLoggingOut, isAdmin } = useAuth();

  if (!user) {
    return <Login onLoginSuccess={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  Port Authority
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a
                  href="/"
                  className="border-blue-500 text-gray-900 dark:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Pass Management
                </a>
                <a
                  href="/qr-test"
                  className="border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Test
                </a>
                {isAdmin && (
                  <a
                    href="/admin"
                    className="border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Administration
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, <span className="font-medium">{user.fullName}</span>
                <div className="text-xs text-gray-500">{user.designation}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                disabled={isLoggingOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <Switch>
        <Route path="/" component={PassManagement} />
        <Route path="/pass/:transactionId" component={PassDisplay} />
        <Route path="/qr-test" component={QRTest} />
        {isAdmin && <Route path="/admin" component={AdminDashboard} />}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function Router() {
  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
