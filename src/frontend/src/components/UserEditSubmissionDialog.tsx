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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  SongSubmission,
  SongSubmissionEditInput,
  TrackMetadata,
} from "../backend";
import {
  useEditSongSubmission,
  useGetMyArtistProfiles,
} from "../hooks/useQueries";
import { fileToExternalBlob } from "../utils/fileToExternalBlob";
import AlbumTracksEditor from "./AlbumTracksEditor";
import ArtistProfilesCheckboxSelector from "./ArtistProfilesCheckboxSelector";

interface UserEditSubmissionDialogProps {
  submission: SongSubmission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserEditSubmissionDialog({
  submission,
  open,
  onOpenChange,
}: UserEditSubmissionDialogProps) {
  const editSubmission = useEditSongSubmission();
  const { data: artistProfiles } = useGetMyArtistProfiles();

  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [releaseType, setReleaseType] = useState("");
  const [genre, setGenre] = useState("");
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [selectedFeaturedArtists, setSelectedFeaturedArtists] = useState<
    string[]
  >([]);
  const [selectedComposers, setSelectedComposers] = useState<string[]>([]);
  const [selectedLyricists, setSelectedLyricists] = useState<string[]>([]);
  const [producer, setProducer] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [musicVideoLink, setMusicVideoLink] = useState("");

  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [albumTracks, setAlbumTracks] = useState<TrackMetadata[]>([]);

  const [artworkProgress, setArtworkProgress] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [artworkError, setArtworkError] = useState("");

  const isAlbum = releaseType === "Album";

  // Helper function to match artist names to profile IDs
  const matchArtistNamesToIds = (namesString: string): string[] => {
    if (!namesString || !artistProfiles) return [];
    const names = namesString.split(",").map((n) => n.trim());
    const matchedIds: string[] = [];

    for (const name of names) {
      const profile = artistProfiles.find(
        (p) => p.stageName === name || p.fullName === name,
      );
      if (profile) {
        matchedIds.push(profile.id);
      }
    }

    return matchedIds;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: matchArtistNamesToIds is stable within scope
  useEffect(() => {
    if (submission && artistProfiles) {
      setTitle(submission.title);
      setLanguage(submission.language);
      setReleaseDate(
        new Date(Number(submission.releaseDate / BigInt(1000000)))
          .toISOString()
          .split("T")[0],
      );
      setReleaseType(submission.releaseType);
      setGenre(submission.genre);
      setProducer(submission.producer);
      setAdditionalDetails(submission.additionalDetails);
      setDiscountCode(submission.discountCode || "");
      setMusicVideoLink(submission.musicVideoLink || "");
      setAlbumTracks(submission.albumTracks || []);

      // Pre-select artists
      setSelectedArtists(matchArtistNamesToIds(submission.artist));
      setSelectedFeaturedArtists(
        matchArtistNamesToIds(submission.featuredArtist),
      );
      setSelectedComposers(matchArtistNamesToIds(submission.composer));
      setSelectedLyricists(matchArtistNamesToIds(submission.lyricist));
    }
  }, [submission, artistProfiles]);

  const validateArtwork = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];

      if (!validTypes.includes(file.type)) {
        setArtworkError("Artwork must be JPG or PNG format");
        resolve(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (img.width === 3000 && img.height === 3000) {
          setArtworkError("");
          resolve(true);
        } else {
          setArtworkError(
            `Artwork must be exactly 3000×3000 pixels. Current: ${img.width}×${img.height}`,
          );
          resolve(false);
        }
      };
      img.onerror = () => {
        setArtworkError("Failed to load image");
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleArtworkChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const isValid = await validateArtwork(file);
      if (isValid) {
        setArtworkFile(file);
      } else {
        setArtworkFile(null);
        e.target.value = "";
      }
    }
  };

  const handleSave = async () => {
    if (!submission || !artistProfiles) return;

    // Validation
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (selectedArtists.length === 0) {
      toast.error("At least one artist must be selected");
      return;
    }
    if (selectedComposers.length === 0) {
      toast.error("Composer is required");
      return;
    }
    if (!producer.trim()) {
      toast.error("Producer is required");
      return;
    }
    if (selectedLyricists.length === 0) {
      toast.error("Lyricist is required");
      return;
    }
    if (artworkError) {
      toast.error(artworkError);
      return;
    }

    try {
      setIsUploading(true);

      // Convert artwork if new file selected
      let artworkBlob = submission.artwork;
      let artworkFilename = submission.artworkFilename;
      if (artworkFile) {
        artworkBlob = await fileToExternalBlob(artworkFile, (progress) => {
          setArtworkProgress(progress);
        });
        artworkFilename = artworkFile.name;
      }

      // Convert audio file if new file selected
      let audioBlob = submission.audioFile;
      let audioFilename = submission.audioFilename;
      if (audioFile) {
        audioBlob = await fileToExternalBlob(audioFile, (progress) => {
          setAudioProgress(progress);
        });
        audioFilename = audioFile.name;
      }

      const artistNames = selectedArtists
        .map((id) => artistProfiles?.find((p) => p.id === id)?.stageName)
        .filter(Boolean)
        .join(", ");

      const featuredNames = selectedFeaturedArtists
        .map((id) => artistProfiles?.find((p) => p.id === id)?.stageName)
        .filter(Boolean)
        .join(", ");

      const composerNames = selectedComposers
        .map((id) => artistProfiles?.find((p) => p.id === id)?.stageName)
        .filter(Boolean)
        .join(", ");

      const lyricistNames = selectedLyricists
        .map((id) => artistProfiles?.find((p) => p.id === id)?.stageName)
        .filter(Boolean)
        .join(", ");

      const input: SongSubmissionEditInput = {
        songSubmissionId: submission.id,
        title,
        language,
        releaseDate: BigInt(new Date(releaseDate).getTime()) * BigInt(1000000),
        releaseType,
        genre,
        artworkBlob,
        artworkFilename,
        artist: artistNames,
        featuredArtist: featuredNames,
        composer: composerNames,
        producer,
        lyricist: lyricistNames,
        audioFile: audioBlob,
        audioFilename,
        additionalDetails,
        discountCode: discountCode.trim() ? discountCode : undefined,
        albumTracks:
          isAlbum && albumTracks.length > 0 ? albumTracks : undefined,
        musicVideoLink: musicVideoLink.trim() ? musicVideoLink : undefined,
      };

      await editSubmission.mutateAsync(input);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Edit error:", error);
      toast.error(error.message || "Failed to update submission");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleArtistSelection = (profileId: string) => {
    setSelectedArtists((prev) =>
      prev.includes(profileId)
        ? prev.filter((id) => id !== profileId)
        : [...prev, profileId],
    );
  };

  const toggleFeaturedArtistSelection = (profileId: string) => {
    setSelectedFeaturedArtists((prev) =>
      prev.includes(profileId)
        ? prev.filter((id) => id !== profileId)
        : [...prev, profileId],
    );
  };

  const toggleComposerSelection = (profileId: string) => {
    setSelectedComposers((prev) =>
      prev.includes(profileId)
        ? prev.filter((id) => id !== profileId)
        : [...prev, profileId],
    );
  };

  const toggleLyricistSelection = (profileId: string) => {
    setSelectedLyricists((prev) =>
      prev.includes(profileId)
        ? prev.filter((id) => id !== profileId)
        : [...prev, profileId],
    );
  };

  if (!artistProfiles) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Submission</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Song title"
            />
          </div>

          {/* Language */}
          <div>
            <Label htmlFor="edit-language">Language *</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tamil">Tamil</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Hindi">Hindi</SelectItem>
                <SelectItem value="Telugu">Telugu</SelectItem>
                <SelectItem value="Malayalam">Malayalam</SelectItem>
                <SelectItem value="Kannada">Kannada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Release Date */}
          <div>
            <Label htmlFor="edit-releaseDate">Release Date *</Label>
            <Input
              id="edit-releaseDate"
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
            />
          </div>

          {/* Release Type */}
          <div>
            <Label htmlFor="edit-releaseType">Release Type *</Label>
            <Select value={releaseType} onValueChange={setReleaseType}>
              <SelectTrigger>
                <SelectValue placeholder="Select release type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Album">Album</SelectItem>
                <SelectItem value="EP">EP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Genre */}
          <div>
            <Label htmlFor="edit-genre">Genre *</Label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger>
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pop">Pop</SelectItem>
                <SelectItem value="Rock">Rock</SelectItem>
                <SelectItem value="Hip Hop">Hip Hop</SelectItem>
                <SelectItem value="Classical">Classical</SelectItem>
                <SelectItem value="Folk">Folk</SelectItem>
                <SelectItem value="Electronic">Electronic</SelectItem>
                <SelectItem value="Jazz">Jazz</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Artist Selection */}
          <ArtistProfilesCheckboxSelector
            label="Artist(s)"
            profiles={artistProfiles}
            selectedProfileIds={selectedArtists}
            onToggle={toggleArtistSelection}
            required
            helperText="Select at least one artist"
          />

          {/* Featured Artist Selection */}
          <ArtistProfilesCheckboxSelector
            label="Featured Artist(s) (Optional)"
            profiles={artistProfiles}
            selectedProfileIds={selectedFeaturedArtists}
            onToggle={toggleFeaturedArtistSelection}
          />

          {/* Composer Selection */}
          <ArtistProfilesCheckboxSelector
            label="Composer"
            profiles={artistProfiles}
            selectedProfileIds={selectedComposers}
            onToggle={toggleComposerSelection}
            required
            helperText="Select at least one composer"
          />

          {/* Producer */}
          <div>
            <Label htmlFor="edit-producer">Producer *</Label>
            <Input
              id="edit-producer"
              value={producer}
              onChange={(e) => setProducer(e.target.value)}
              placeholder="Producer name"
            />
          </div>

          {/* Lyricist Selection */}
          <ArtistProfilesCheckboxSelector
            label="Lyricist"
            profiles={artistProfiles}
            selectedProfileIds={selectedLyricists}
            onToggle={toggleLyricistSelection}
            required
            helperText="Select at least one lyricist"
          />

          {/* Artwork Upload */}
          <div>
            <Label htmlFor="edit-artwork">
              Artwork (JPG/PNG, 3000×3000 pixels)
            </Label>
            <Input
              id="edit-artwork"
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleArtworkChange}
            />
            {artworkError && (
              <p className="text-sm text-destructive mt-1">{artworkError}</p>
            )}
            {artworkProgress > 0 && artworkProgress < 100 && (
              <div className="mt-2 text-sm text-muted-foreground">
                Uploading artwork: {artworkProgress}%
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to keep existing artwork
            </p>
          </div>

          {/* Audio Upload (only for non-albums) */}
          {!isAlbum && (
            <div>
              <Label htmlFor="edit-audio">Audio File</Label>
              <Input
                id="edit-audio"
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              />
              {audioProgress > 0 && audioProgress < 100 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Uploading audio: {audioProgress}%
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to keep existing audio file
              </p>
            </div>
          )}

          {/* Album Tracks Editor (only for albums) */}
          {isAlbum && (
            <div>
              <Label>Album Tracks</Label>
              <AlbumTracksEditor
                tracks={albumTracks}
                onChange={setAlbumTracks}
              />
            </div>
          )}

          {/* Music Video Link */}
          <div>
            <Label htmlFor="edit-musicVideoLink">
              Music Video Link (Optional)
            </Label>
            <Input
              id="edit-musicVideoLink"
              value={musicVideoLink}
              onChange={(e) => setMusicVideoLink(e.target.value)}
              placeholder="https://youtube.com/..."
              type="url"
            />
          </div>

          {/* Additional Details */}
          <div>
            <Label htmlFor="edit-additionalDetails">
              Additional Details (Optional)
            </Label>
            <Textarea
              id="edit-additionalDetails"
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="Any additional information..."
              rows={3}
            />
          </div>

          {/* Discount Code */}
          <div>
            <Label htmlFor="edit-discountCode">Discount Code (Optional)</Label>
            <Input
              id="edit-discountCode"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Enter discount code if available"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUploading || editSubmission.isPending}
          >
            {isUploading || editSubmission.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
