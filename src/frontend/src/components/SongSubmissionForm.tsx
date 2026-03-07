import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Loader2, Music, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SongSubmissionInput, TrackMetadata } from "../backend";
import {
  useGetMyArtistProfiles,
  useIsCurrentUserBlockedSongSubmission,
  useSubmitSong,
} from "../hooks/useQueries";
import { fileToExternalBlob } from "../utils/fileToExternalBlob";
import AlbumTracksEditor from "./AlbumTracksEditor";
import ArtistProfilesCheckboxSelector from "./ArtistProfilesCheckboxSelector";

export default function SongSubmissionForm() {
  const submitSong = useSubmitSong();
  const navigate = useNavigate();
  const { data: artistProfiles, isLoading: profilesLoading } =
    useGetMyArtistProfiles();
  const { data: isBlocked, isLoading: blockCheckLoading } =
    useIsCurrentUserBlockedSongSubmission();

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
  const [legalAgreementsAccepted, setLegalAgreementsAccepted] = useState(false);

  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [albumTracks, setAlbumTracks] = useState<TrackMetadata[]>([]);

  const [artworkProgress, setArtworkProgress] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [artworkError, setArtworkError] = useState("");

  const isAlbum = releaseType === "Album";

  // Validate artwork dimensions and format
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBlocked) {
      toast.error("Your access blocked due to submission limit is full");
      return;
    }

    if (!artistProfiles || artistProfiles.length === 0) {
      toast.error("Please create an artist profile before submitting a song");
      return;
    }

    // Validation
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!language) {
      toast.error("Language is required");
      return;
    }
    if (!releaseDate) {
      toast.error("Release date is required");
      return;
    }
    if (!releaseType) {
      toast.error("Release type is required");
      return;
    }
    if (!genre) {
      toast.error("Genre is required");
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
    if (!artworkFile) {
      toast.error("Artwork is required");
      return;
    }
    if (artworkError) {
      toast.error(artworkError);
      return;
    }

    // For albums, validate tracks
    if (isAlbum) {
      if (albumTracks.length === 0) {
        toast.error("At least one album track is required");
        return;
      }
      for (const track of albumTracks) {
        if (!track.title.trim()) {
          toast.error("All album tracks must have a title");
          return;
        }
        if (!track.artist.trim()) {
          toast.error("All album tracks must have an artist");
          return;
        }
      }
    } else {
      // For non-albums, audio file is required
      if (!audioFile) {
        toast.error("Audio file is required");
        return;
      }
    }

    // Validate legal agreements checkbox
    if (!legalAgreementsAccepted) {
      toast.error("You must accept the Legal Agreements & Terms to proceed");
      return;
    }

    try {
      setIsUploading(true);

      // Convert artwork
      const artworkBlob = await fileToExternalBlob(artworkFile, (progress) => {
        setArtworkProgress(progress);
      });

      // Convert audio file (only for non-albums)
      let audioBlob: Awaited<ReturnType<typeof fileToExternalBlob>>;
      if (!isAlbum && audioFile) {
        audioBlob = await fileToExternalBlob(audioFile, (progress) => {
          setAudioProgress(progress);
        });
      } else {
        // For albums, create a dummy audio blob (backend expects it)
        audioBlob = await fileToExternalBlob(new Blob(["dummy"]), () => {});
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

      const input: SongSubmissionInput = {
        title,
        language,
        releaseDate: BigInt(new Date(releaseDate).getTime()) * BigInt(1000000),
        releaseType,
        genre,
        artworkBlob,
        artworkFilename: artworkFile.name,
        artist: artistNames,
        featuredArtist: featuredNames,
        composer: composerNames,
        producer,
        lyricist: lyricistNames,
        audioBlob,
        audioFilename: audioFile?.name || "album.mp3",
        additionalDetails,
        discountCode: discountCode.trim() ? discountCode : undefined,
        albumTracks:
          isAlbum && albumTracks.length > 0 ? albumTracks : undefined,
        musicVideoLink: musicVideoLink.trim() ? musicVideoLink : undefined,
      };

      await submitSong.mutateAsync(input);

      // Reset form
      setTitle("");
      setLanguage("");
      setReleaseDate("");
      setReleaseType("");
      setGenre("");
      setSelectedArtists([]);
      setSelectedFeaturedArtists([]);
      setSelectedComposers([]);
      setSelectedLyricists([]);
      setProducer("");
      setAdditionalDetails("");
      setDiscountCode("");
      setMusicVideoLink("");
      setArtworkFile(null);
      setAudioFile(null);
      setAlbumTracks([]);
      setArtworkProgress(0);
      setAudioProgress(0);
      setArtworkError("");
      setLegalAgreementsAccepted(false);

      // Navigate to thank you page
      navigate({ to: "/thank-you" });
    } catch (error: any) {
      console.error("Submission error:", error);
      if (
        error.message?.includes("blocked") ||
        error.message?.includes("submission limit")
      ) {
        toast.error("Your access blocked due to submission limit is full");
      }
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

  if (blockCheckLoading || profilesLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isBlocked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            Submission Access Blocked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Your access blocked due to submission limit is full
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!artistProfiles || artistProfiles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Submit New Song
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              You must create at least one artist profile before submitting a
              song. Please go to the "Artist Profiles" tab to create your
              profile.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-5 h-5" />
          Submit New Song
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Song title"
              required
            />
          </div>

          {/* Language */}
          <div>
            <Label htmlFor="language">Language *</Label>
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
            <Label htmlFor="releaseDate">Release Date *</Label>
            <Input
              id="releaseDate"
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              required
            />
          </div>

          {/* Release Type */}
          <div>
            <Label htmlFor="releaseType">Release Type *</Label>
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
            <Label htmlFor="genre">Genre *</Label>
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
            <Label htmlFor="producer">Producer *</Label>
            <Input
              id="producer"
              value={producer}
              onChange={(e) => setProducer(e.target.value)}
              placeholder="Producer name"
              required
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
            <Label htmlFor="artwork">
              Artwork * (JPG/PNG, 3000×3000 pixels)
            </Label>
            <Input
              id="artwork"
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleArtworkChange}
              required
            />
            {artworkError && (
              <p className="text-sm text-destructive mt-1">{artworkError}</p>
            )}
            {artworkProgress > 0 && artworkProgress < 100 && (
              <div className="mt-2 text-sm text-muted-foreground">
                Uploading artwork: {artworkProgress}%
              </div>
            )}
          </div>

          {/* Audio Upload (only for non-albums) */}
          {!isAlbum && (
            <div>
              <Label htmlFor="audio">Audio File *</Label>
              <Input
                id="audio"
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                required
              />
              {audioProgress > 0 && audioProgress < 100 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Uploading audio: {audioProgress}%
                </div>
              )}
            </div>
          )}

          {/* Album Tracks Editor (only for albums) */}
          {isAlbum && (
            <div>
              <Label>Album Tracks *</Label>
              <AlbumTracksEditor
                tracks={albumTracks}
                onChange={setAlbumTracks}
              />
            </div>
          )}

          {/* Music Video Link */}
          <div>
            <Label htmlFor="musicVideoLink">Music Video Link (Optional)</Label>
            <Input
              id="musicVideoLink"
              type="url"
              value={musicVideoLink}
              onChange={(e) => setMusicVideoLink(e.target.value)}
              placeholder="https://youtube.com/..."
            />
          </div>

          {/* Additional Details */}
          <div>
            <Label htmlFor="additionalDetails">
              Additional Details (Optional)
            </Label>
            <Textarea
              id="additionalDetails"
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="Any additional information"
              rows={3}
            />
          </div>

          {/* Discount Code */}
          <div>
            <Label htmlFor="discountCode">Discount Code (Optional)</Label>
            <Input
              id="discountCode"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Enter discount code if available"
            />
          </div>

          {/* Legal Agreements Checkbox */}
          <div className="flex items-start space-x-2 p-4 border rounded-lg bg-muted/50">
            <Checkbox
              id="legalAgreements"
              checked={legalAgreementsAccepted}
              onCheckedChange={(checked) =>
                setLegalAgreementsAccepted(checked as boolean)
              }
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="legalAgreements"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I accept the Legal Agreements & Terms *
              </Label>
              <p className="text-sm text-muted-foreground">
                By checking this box, you confirm that you have read and agree
                to our terms and conditions.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isUploading || submitSong.isPending}
            className="w-full"
          >
            {isUploading || submitSong.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Submit Song
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
