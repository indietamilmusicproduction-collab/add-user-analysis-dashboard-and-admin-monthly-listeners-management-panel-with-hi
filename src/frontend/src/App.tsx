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
import Footer from "./components/Footer";
import Header from "./components/Header";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import AdminDashboard from "./pages/AdminDashboard";
import LandingPage from "./pages/LandingPage";
import SongPage from "./pages/SongPage";
import ThankYouPage from "./pages/ThankYouPage";
import UserDashboard from "./pages/UserDashboard";

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

const routeTree = rootRoute.addChildren([
  indexRoute,
  userDashboardRoute,
  adminDashboardRoute,
  thankYouRoute,
  songPageRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor: _actor, isFetching: actorFetching } = useActor();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing || (isAuthenticated && actorFetching)) {
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
      <RouterProvider router={router} />
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
