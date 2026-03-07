import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { LogIn, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetMyArtistProfiles } from "../hooks/useQueries";
import ArtistNameWithVerified from "./ArtistNameWithVerified";

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: artistProfiles } = useGetMyArtistProfiles();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const firstProfile =
    artistProfiles && artistProfiles.length > 0 ? artistProfiles[0] : null;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: "/" });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error("Login error:", error);
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            INDIE TAMIL MUSIC PRODUCTION
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated && firstProfile && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
              <img
                src={firstProfile.profilePhoto.getDirectURL()}
                alt={firstProfile.stageName}
                className="w-6 h-6 rounded-full object-cover"
              />
              <ArtistNameWithVerified
                artistName={firstProfile.stageName}
                ownerPrincipal={firstProfile.owner}
                badgeSize="small"
                className="text-sm font-medium"
              />
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button
            onClick={handleAuth}
            disabled={isLoggingIn}
            variant={isAuthenticated ? "outline" : "default"}
            size="sm"
            className="rounded-full"
          >
            {isLoggingIn ? (
              "Logging in..."
            ) : isAuthenticated ? (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
