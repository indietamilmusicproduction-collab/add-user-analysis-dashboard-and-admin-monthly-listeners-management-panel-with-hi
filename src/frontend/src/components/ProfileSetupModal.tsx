import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

// UserCategory values as constants (matches Motoko backend variant)
const UserCategory = {
  generalArtist: "generalArtist",
  proArtist: "proArtist",
  ultraArtist: "ultraArtist",
  generalLabel: "generalLabel",
  proLabel: "proLabel",
} as const;
type _UserCategory = (typeof UserCategory)[keyof typeof UserCategory];

export default function ProfileSetupModal() {
  const [name, setName] = useState("");
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      saveProfile.mutate({
        name: name.trim(),
        artistId: "",
        category: UserCategory.generalArtist,
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to ITMP!</CardTitle>
          <CardDescription>
            Please tell us your name to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={saveProfile.isPending || !name.trim()}
            >
              {saveProfile.isPending ? "Saving..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
