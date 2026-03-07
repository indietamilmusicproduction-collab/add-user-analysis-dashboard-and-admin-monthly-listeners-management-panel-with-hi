import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Image,
  Loader2,
  Music,
  Plus,
  Save,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { FeaturedArtist, FeaturedArtistSong } from "../backend";
import {
  useGetFeaturedArtists,
  useSetFeaturedArtist,
  useToggleFeaturedArtistSlot,
} from "../hooks/useQueries";

interface SongEntry {
  title: string;
  link: string;
}

interface SlotFormState {
  artistName: string;
  photoUrl: string;
  aboutBlurb: string;
  songs: SongEntry[];
  isActive: boolean;
}

const defaultSlotState = (): SlotFormState => ({
  artistName: "",
  photoUrl: "",
  aboutBlurb: "",
  songs: [{ title: "", link: "" }],
  isActive: false,
});

function SlotCard({
  slotIndex,
  initialData,
}: {
  slotIndex: number;
  initialData: FeaturedArtist | null;
}) {
  const [form, setForm] = useState<SlotFormState>(defaultSlotState());
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const setFeaturedArtist = useSetFeaturedArtist();
  const toggleSlot = useToggleFeaturedArtistSlot();

  // Populate form from backend data
  useEffect(() => {
    if (initialData) {
      setForm({
        artistName: initialData.artistName,
        photoUrl: initialData.photoUrl,
        aboutBlurb: initialData.aboutBlurb,
        songs:
          initialData.songs.length > 0
            ? initialData.songs.map((s) => ({ title: s.title, link: s.link }))
            : [{ title: "", link: "" }],
        isActive: initialData.isActive,
      });
    }
  }, [initialData]);

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);

    if (!form.artistName.trim()) {
      setSaveError("Artist name is required.");
      return;
    }

    const validSongs: FeaturedArtistSong[] = form.songs
      .filter((s) => s.title.trim() !== "")
      .map((s) => ({ title: s.title.trim(), link: s.link.trim() }));

    try {
      await setFeaturedArtist.mutateAsync({
        slot: BigInt(slotIndex),
        data: {
          artistName: form.artistName.trim(),
          photoUrl: form.photoUrl.trim(),
          aboutBlurb: form.aboutBlurb.trim(),
          songs: validSongs,
          isActive: form.isActive,
        },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message || "Failed to save. Please try again.");
    }
  };

  const handleToggle = async (active: boolean) => {
    setForm((prev) => ({ ...prev, isActive: active }));
    try {
      await toggleSlot.mutateAsync({ slot: BigInt(slotIndex), active });
    } catch (_err: any) {
      // Revert on error
      setForm((prev) => ({ ...prev, isActive: !active }));
    }
  };

  const addSong = () => {
    if (form.songs.length < 3) {
      setForm((prev) => ({
        ...prev,
        songs: [...prev.songs, { title: "", link: "" }],
      }));
    }
  };

  const removeSong = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      songs: prev.songs.filter((_, i) => i !== idx),
    }));
  };

  const updateSong = (idx: number, field: "title" | "link", value: string) => {
    setForm((prev) => ({
      ...prev,
      songs: prev.songs.map((s, i) =>
        i === idx ? { ...s, [field]: value } : s,
      ),
    }));
  };

  const isSaving = setFeaturedArtist.isPending;
  const isToggling = toggleSlot.isPending;

  return (
    <Card className="border border-amber-500/30 bg-card/80 backdrop-blur-sm shadow-lg shadow-amber-900/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-sm font-bold">
              {slotIndex}
            </span>
            <span className="text-foreground">Slot {slotIndex}</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            {isToggling && (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            )}
            <Badge
              variant={form.isActive ? "default" : "outline"}
              className={
                form.isActive
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : "text-muted-foreground border-muted"
              }
            >
              {form.isActive ? "ON" : "OFF"}
            </Badge>
            <Switch
              checked={form.isActive}
              onCheckedChange={handleToggle}
              disabled={isToggling}
              className="data-[state=checked]:bg-amber-500"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Artist Name */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-sm font-medium">
            <User className="w-3.5 h-3.5 text-amber-400" />
            Artist Name <span className="text-destructive">*</span>
          </Label>
          <Input
            value={form.artistName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, artistName: e.target.value }))
            }
            placeholder="Enter artist name"
            className="border-border/60 focus:border-amber-500/60"
          />
        </div>

        {/* Photo URL */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-sm font-medium">
            <Image className="w-3.5 h-3.5 text-amber-400" />
            Photo URL
          </Label>
          <Input
            value={form.photoUrl}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, photoUrl: e.target.value }))
            }
            placeholder="https://example.com/artist-photo.jpg"
            className="border-border/60 focus:border-amber-500/60"
          />
          {form.photoUrl && (
            <div className="mt-2 flex items-center gap-3">
              <img
                src={form.photoUrl}
                alt="Preview"
                className="w-16 h-16 rounded-lg object-cover border border-amber-500/30"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="text-xs text-muted-foreground">
                Photo preview
              </span>
            </div>
          )}
        </div>

        {/* About Blurb */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">About Blurb</Label>
          <Textarea
            value={form.aboutBlurb}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, aboutBlurb: e.target.value }))
            }
            placeholder="Write a short description about this artist..."
            rows={3}
            className="border-border/60 focus:border-amber-500/60 resize-none"
          />
        </div>

        {/* Songs */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5 text-sm font-medium">
            <Music className="w-3.5 h-3.5 text-amber-400" />
            Pinned Songs ({form.songs.length}/3)
          </Label>
          <div className="space-y-2">
            {form.songs.map((song, idx) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: songs list has no stable unique id
              <div key={idx} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1.5">
                  <Input
                    value={song.title}
                    onChange={(e) => updateSong(idx, "title", e.target.value)}
                    placeholder={`Song ${idx + 1} title`}
                    className="border-border/60 focus:border-amber-500/60 text-sm"
                  />
                  <Input
                    value={song.link}
                    onChange={(e) => updateSong(idx, "link", e.target.value)}
                    placeholder="https://open.spotify.com/..."
                    className="border-border/60 focus:border-amber-500/60 text-sm"
                  />
                </div>
                {form.songs.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSong(idx)}
                    className="mt-0.5 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {form.songs.length < 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={addSong}
              className="w-full border-dashed border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/60"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Song
            </Button>
          )}
        </div>

        {/* Error / Success */}
        {saveError && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="text-sm text-amber-400 bg-amber-500/10 rounded-md px-3 py-2">
            ✓ Slot {slotIndex} saved successfully!
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Slot {slotIndex}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminFeaturedArtistsManagement() {
  const { data: featuredArtists, isLoading } = useGetFeaturedArtists();

  const getSlotData = (slotIndex: number): FeaturedArtist | null => {
    if (!featuredArtists) return null;
    return (
      featuredArtists.find((a) => Number(a.slotIndex) === slotIndex) ?? null
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">
          Most Vibing Artists
        </h2>
        <p className="text-muted-foreground text-sm">
          Manage up to 3 featured artist slots displayed on the public landing
          page carousel. Toggle each slot ON to make it visible to visitors.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <span className="ml-3 text-muted-foreground">
            Loading featured artists...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((slotIndex) => (
            <SlotCard
              key={slotIndex}
              slotIndex={slotIndex}
              initialData={getSlotData(slotIndex)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
