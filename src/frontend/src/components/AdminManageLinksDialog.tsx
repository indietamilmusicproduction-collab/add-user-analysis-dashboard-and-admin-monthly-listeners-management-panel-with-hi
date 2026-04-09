// @ts-nocheck
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SongSubmission } from "../backend";
import { useUpdateSongLinks } from "../hooks/useQueries";

interface AdminManageLinksDialogProps {
  song: SongSubmission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminManageLinksDialog({
  song,
  open,
  onOpenChange,
}: AdminManageLinksDialogProps) {
  const [spotifyLink, setSpotifyLink] = useState("");
  const [appleMusicLink, setAppleMusicLink] = useState("");
  const updateLinks = useUpdateSongLinks();

  useEffect(() => {
    if (song) {
      setSpotifyLink(song.spotifyLink || "");
      setAppleMusicLink(song.appleMusicLink || "");
    }
  }, [song]);

  const isValidUrl = (url: string): boolean => {
    if (!url) return true; // Empty is valid (optional field)
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const handleSave = async () => {
    if (!song) return;

    // Validate URLs
    if (spotifyLink && !isValidUrl(spotifyLink)) {
      toast.error("Spotify link must start with http:// or https://");
      return;
    }
    if (appleMusicLink && !isValidUrl(appleMusicLink)) {
      toast.error("Apple Music link must start with http:// or https://");
      return;
    }

    try {
      await updateLinks.mutateAsync({
        songId: song.id,
        spotifyLink: spotifyLink || null,
        appleMusicLink: appleMusicLink || null,
      });
      toast.success("Streaming links updated successfully");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update streaming links");
    }
  };

  if (!song) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Streaming Links</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {song.title} - {song.artist}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="spotifyLink">Spotify Link</Label>
            <Input
              id="spotifyLink"
              type="url"
              placeholder="https://open.spotify.com/track/..."
              value={spotifyLink}
              onChange={(e) => setSpotifyLink(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter the full Spotify track URL (optional)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="appleMusicLink">Apple Music Link</Label>
            <Input
              id="appleMusicLink"
              type="url"
              placeholder="https://music.apple.com/..."
              value={appleMusicLink}
              onChange={(e) => setAppleMusicLink(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter the full Apple Music track URL (optional)
            </p>
          </div>

          {song.status === "live" && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Public Link:</strong> This song is live and accessible
                at:
              </p>
              <code className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded mt-2 block break-all">
                {window.location.origin}/song/{song.id}
              </code>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateLinks.isPending}>
            {updateLinks.isPending ? "Saving..." : "Save Links"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
