import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { Headphones, LogIn, Music, Users } from "lucide-react";
import { useEffect, useState } from "react";
import MostVibingArtistsCarousel from "../components/MostVibingArtistsCarousel";
import PricingSection from "../components/PricingSection";
import TopVibingSongsSection from "../components/TopVibingSongsSection";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsCurrentUserAdmin } from "../hooks/useQueries";

export default function LandingPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const {
    data: isAdmin,
    isLoading: isAdminLoading,
    isFetched: isAdminFetched,
  } = useIsCurrentUserAdmin();
  const [redirectIntent, setRedirectIntent] = useState(false);

  // Handle post-login navigation based on admin status
  useEffect(() => {
    if (
      redirectIntent &&
      isAuthenticated &&
      isAdminFetched &&
      !isAdminLoading
    ) {
      if (isAdmin) {
        navigate({ to: "/admin-dashboard" });
      } else {
        navigate({ to: "/user-dashboard" });
      }
      setRedirectIntent(false);
    }
  }, [
    redirectIntent,
    isAuthenticated,
    isAdmin,
    isAdminFetched,
    isAdminLoading,
    navigate,
  ]);

  const handleGetStarted = async () => {
    if (isAuthenticated) {
      if (isAdminFetched && !isAdminLoading) {
        if (isAdmin) {
          navigate({ to: "/admin-dashboard" });
        } else {
          navigate({ to: "/user-dashboard" });
        }
      } else {
        setRedirectIntent(true);
      }
    } else {
      try {
        await login();
        setRedirectIntent(true);
      } catch (error: any) {
        console.error("Login error:", error);
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600">
        <div className="container mx-auto text-center text-white">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            INDIE TAMIL MUSIC PRODUCTION
          </h1>
          <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto">
            Manage your artist profiles and grow your music career
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            disabled={isLoggingIn || (redirectIntent && isAdminLoading)}
            className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6"
          >
            {isLoggingIn || (redirectIntent && isAdminLoading) ? (
              "Loading..."
            ) : isAuthenticated ? (
              "Go to Dashboard"
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Get Started
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Most Vibing Artists Carousel */}
      <MostVibingArtistsCarousel />

      {/* Top Vibing Songs Section */}
      <TopVibingSongsSection />

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Music className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Multiple Artist Profiles</CardTitle>
                <CardDescription>
                  Create and manage multiple artist identities from a single
                  account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Perfect for artists with different musical personas or
                  collaborative projects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-12 h-12 text-pink-600 mb-4" />
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>
                  Complete control over your artist information and social links
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Update your profile photo, contact details, and streaming
                  platform links
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Headphones className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>
                  Comprehensive admin tools for managing all artist profiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Search, view, and edit artist profiles across the platform
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join INDIE TAMIL MUSIC PRODUCTION today and take control of your
            artist profiles
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            disabled={isLoggingIn || (redirectIntent && isAdminLoading)}
            className="text-lg px-8 py-6"
          >
            {isLoggingIn || (redirectIntent && isAdminLoading) ? (
              "Loading..."
            ) : isAuthenticated ? (
              "Go to Dashboard"
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Get Started Now
              </>
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}
