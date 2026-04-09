import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import React, { useEffect, useState } from "react";
import CustomCursor from "./components/CustomCursor";
import Footer from "./components/Footer";
import Header from "./components/Header";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import AdminDashboard from "./pages/AdminDashboard";
import LabelPage from "./pages/LabelPage";
import LandingPage from "./pages/LandingPage";
import SongPage from "./pages/SongPage";
import ThankYouPage from "./pages/ThankYouPage";
import UserDashboard from "./pages/UserDashboard";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-8">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-gray-400 mb-6">
              The app encountered an error. Please refresh the page to try
              again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              Refresh Page
            </button>
            {this.state.error && (
              <details className="mt-4 text-left text-xs text-gray-500">
                <summary>Error details</summary>
                <pre className="mt-2 overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient();

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const userDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/user-dashboard",
  component: UserDashboard,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-dashboard",
  component: AdminDashboard,
});

const thankYouRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/thank-you",
  component: ThankYouPage,
});

const songPageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/song/$songId",
  component: SongPage,
});

const labelPageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/label/$labelName",
  component: LabelPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  userDashboardRoute,
  adminDashboardRoute,
  thankYouRoute,
  songPageRoute,
  labelPageRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Maximum time (ms) to show the loading screen before rendering the app anyway.
// This ensures a broken backend call never permanently blocks the UI.
const MAX_LOADING_MS = 8000;

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor: _actor, isFetching: actorFetching } = useActor();
  const actorError = false;
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  // Safety timeout: if loading takes longer than MAX_LOADING_MS, force-render
  // the app so a hung backend call never results in a permanent loading screen.
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setLoadingTimedOut(true), MAX_LOADING_MS);
    return () => clearTimeout(timer);
  }, []);

  const isAuthenticated = !!identity;
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Show loading screen only while initializing auth AND actor (for logged-in users).
  // Escape immediately if: actor errored, or the safety timeout fired.
  const shouldShowLoading =
    !loadingTimedOut &&
    !actorError &&
    (isInitializing || (isAuthenticated && actorFetching));

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <CustomCursor />
      <RouterProvider router={router} />
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
