// @ts-nocheck
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Crown,
  Loader2,
  Music,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { SongSubmissionInput, TrackMetadata } from "../backend";
import {
  useGetMyArtistProfiles,
  useIsCallerPremium,
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
  const { data: isPremium } = useIsCallerPremium();

  // Form state
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

  // File state
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [albumTracks, setAlbumTracks] = useState<TrackMetadata[]>([]);

  // Upload progress & error state
  const [artworkProgress, setArtworkProgress] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [artworkDimensionError, setArtworkDimensionError] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Premium fields state
  const [customCLine, setCustomCLine] = useState("");
  const [customPLine, setCustomPLine] = useState("");
  const [premiumLabel, setPremiumLabel] = useState("");
  const [contentType, setContentType] = useState("Original Content");
  const [sunoTrackLink, setSunoTrackLink] = useState("");
  const [sunoAgreementFile, setSunoAgreementFile] = useState<File | null>(null);
  const [licenceFile, setLicenceFile] = useState<File | null>(null);
  const [contentId, setContentId] = useState(false);
  const [callerTuneStartSecond, setCallerTuneStartSecond] = useState("");
  const [sunoAgreementProgress, setSunoAgreementProgress] = useState(0);
  const [licenceProgress, setLicenceProgress] = useState(0);

  const isAlbum = releaseType === "Album";

  // --- Helpers ---
  const resolveNames = (ids: string[]) =>
    ids
      .map((id) => artistProfiles?.find((p) => p.id === id)?.stageName ?? id)
      .join(", ");

  const validateArtworkDimensions = (file: File): Promise<boolean> =>
    new Promise((resolve) => {
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setArtworkDimensionError("Artwork must be JPG or PNG format.");
        resolve(false);
        return;
      }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        if (img.width === 3000 && img.height === 3000) {
          setArtworkDimensionError("");
          resolve(true);
        } else {
          setArtworkDimensionError(
            `Artwork must be exactly 3000×3000 pixels. Yours is ${img.width}×${img.height}px.`,
          );
          resolve(false);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setArtworkDimensionError("Could not read the image file.");
        resolve(false);
      };
      img.src = url;
    });

  const handleArtworkChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArtworkDimensionError("");
    const valid = await validateArtworkDimensions(file);
    if (valid) {
      setArtworkFile(file);
    } else {
      setArtworkFile(null);
      e.target.value = "";
    }
  };

  const resetForm = () => {
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
    setArtworkDimensionError("");
    setUploadError(null);
    setLegalAgreementsAccepted(false);
    // Reset premium fields
    setCustomCLine("");
    setCustomPLine("");
    setPremiumLabel("");
    setContentType("Original Content");
    setSunoTrackLink("");
    setSunoAgreementFile(null);
    setLicenceFile(null);
    setContentId(false);
    setCallerTuneStartSecond("");
    setSunoAgreementProgress(0);
    setLicenceProgress(0);
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    // Field validation
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
      toast.error("Select at least one artist");
      return;
    }
    if (selectedComposers.length === 0) {
      toast.error("Select at least one composer");
      return;
    }
    if (!producer.trim()) {
      toast.error("Producer is required");
      return;
    }
    if (selectedLyricists.length === 0) {
      toast.error("Select at least one lyricist");
      return;
    }
    if (!artworkFile) {
      toast.error("Artwork file is required");
      return;
    }
    if (artworkDimensionError) {
      toast.error(artworkDimensionError);
      return;
    }
    if (!isAlbum && !audioFile) {
      toast.error("Audio file is required");
      return;
    }
    if (isAlbum && albumTracks.length === 0) {
      toast.error("Add at least one album track");
      return;
    }
    if (!legalAgreementsAccepted) {
      toast.error("You must accept the Legal Agreements & Terms");
      return;
    }

    // --- File uploads with explicit error handling ---
    let artworkBlob: Awaited<ReturnType<typeof fileToExternalBlob>>;
    let audioBlob: Awaited<ReturnType<typeof fileToExternalBlob>>;
    let sunoAgreementBlob:
      | Awaited<ReturnType<typeof fileToExternalBlob>>
      | undefined;
    let licenceBlob: Awaited<ReturnType<typeof fileToExternalBlob>> | undefined;

    try {
      setIsUploading(true);
      setArtworkProgress(0);
      setAudioProgress(0);

      artworkBlob = await fileToExternalBlob(artworkFile, (p) =>
        setArtworkProgress(p),
      );

      if (!isAlbum && audioFile) {
        audioBlob = await fileToExternalBlob(audioFile, (p) =>
          setAudioProgress(p),
        );
      } else {
        audioBlob = await fileToExternalBlob(new Blob(["dummy"]), () => {});
      }

      // Premium file uploads
      if (isPremium) {
        if (sunoAgreementFile && contentType === "AI Generated") {
          setSunoAgreementProgress(0);
          sunoAgreementBlob = await fileToExternalBlob(sunoAgreementFile, (p) =>
            setSunoAgreementProgress(p),
          );
        }
        if (licenceFile && contentType === "Licensed Content") {
          setLicenceProgress(0);
          licenceBlob = await fileToExternalBlob(licenceFile, (p) =>
            setLicenceProgress(p),
          );
        }
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "File upload failed. Please try again.";
      setUploadError(msg);
      setIsUploading(false);
      return;
    }

    // --- Backend submission ---
    try {
      const input: SongSubmissionInput = {
        title,
        language,
        releaseDate: BigInt(new Date(releaseDate).getTime() * 1_000_000),
        releaseType,
        genre,
        artworkBlob,
        artworkFilename: artworkFile.name,
        artist: resolveNames(selectedArtists),
        featuredArtist: resolveNames(selectedFeaturedArtists),
        composer: resolveNames(selectedComposers),
        producer,
        lyricist: resolveNames(selectedLyricists),
        audioBlob,
        audioFilename: audioFile?.name ?? "album.mp3",
        additionalDetails,
        discountCode: discountCode.trim() ? discountCode : undefined,
        albumTracks: isAlbum ? albumTracks : undefined,
        musicVideoLink: musicVideoLink.trim() ? musicVideoLink : undefined,
        spotifyLink: undefined,
        appleMusicLink: undefined,
        // Premium fields — always include ALL keys explicitly so the backend.ts conversion function maps them to Candid [] | [T]
        customCLine: isPremium && customCLine.trim() ? customCLine : undefined,
        customPLine: isPremium && customPLine.trim() ? customPLine : undefined,
        premiumLabel:
          isPremium && premiumLabel.trim() ? premiumLabel : undefined,
        contentType: isPremium && contentType ? contentType : undefined,
        sunoTrackLink:
          isPremium && sunoTrackLink.trim() ? sunoTrackLink : undefined,
        sunoAgreementFile:
          isPremium && sunoAgreementBlob ? sunoAgreementBlob : undefined,
        sunoAgreementFilename:
          isPremium && sunoAgreementFile?.name
            ? sunoAgreementFile.name
            : undefined,
        licenceFile: isPremium && licenceBlob ? licenceBlob : undefined,
        licenceFilename:
          isPremium && licenceFile?.name ? licenceFile.name : undefined,
        contentId: isPremium ? contentId : undefined,
        callerTuneStartSecond:
          isPremium && callerTuneStartSecond !== ""
            ? Number(callerTuneStartSecond)
            : undefined,
      };

      await submitSong.mutateAsync(input);
      toast.success("Song submitted successfully!");
      resetForm();
      navigate({ to: "/thank-you" });
    } catch (err: any) {
      const msg = err?.message ?? "Submission failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  // Toggle helpers
  const toggle =
    (setter: React.Dispatch<React.SetStateAction<string[]>>) => (id: string) =>
      setter((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );

  // --- Pre-form states ---
  if (blockCheckLoading || profilesLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        <p className="text-purple-300 text-sm">Loading submission form…</p>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <Card className="border border-red-500/40 bg-[#0d0d1a]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            Submission Access Blocked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Your song submission access has been blocked by an admin. Please
              contact support if you believe this is an error.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!artistProfiles || artistProfiles.length === 0) {
    return (
      <Card className="border border-purple-500/30 bg-[#0d0d1a]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-300">
            <Music className="w-5 h-5" />
            Submit New Song
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-cyan-500/40 bg-cyan-900/10">
            <AlertCircle className="w-4 h-4 text-cyan-400" />
            <AlertDescription className="text-cyan-300">
              You must create at least one artist profile before submitting a
              song. Go to the
              <strong> Artist Profiles</strong> tab to create your profile
              first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const isBusy = isUploading || submitSong.isPending;

  return (
    <Card
      className="border border-purple-500/40 bg-[#0d0d1a] shadow-[0_0_24px_rgba(168,85,247,0.12)]"
      data-ocid="song_submission.card"
    >
      <CardHeader className="border-b border-purple-500/20 pb-4">
        <CardTitle className="flex items-center gap-2 text-purple-200 text-lg">
          <Music className="w-5 h-5 text-purple-400" />
          Submit New Song
          {isPremium && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
              <Crown className="w-3 h-3" />
              Premium
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Upload error banner */}
        {uploadError && (
          <Alert
            variant="destructive"
            className="mb-5 border-red-500/50 bg-red-900/20"
            data-ocid="song_submission.error_state"
          >
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Title ── */}
          <FormField label="Title" required>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Song title"
              className="neon-input"
              data-ocid="song_submission.input"
            />
          </FormField>

          {/* ── Language ── */}
          <FormField label="Language" required>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger
                className="neon-input"
                data-ocid="song_submission.select"
              >
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d0d1a] border-purple-500/40">
                {[
                  "Tamil",
                  "English",
                  "Hindi",
                  "Telugu",
                  "Malayalam",
                  "Kannada",
                ].map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {/* ── Release Date ── */}
          <FormField label="Release Date" required>
            <Input
              id="releaseDate"
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              className="neon-input"
              data-ocid="song_submission.input"
            />
          </FormField>

          {/* ── Release Type ── */}
          <FormField label="Release Type" required>
            <Select value={releaseType} onValueChange={setReleaseType}>
              <SelectTrigger
                className="neon-input"
                data-ocid="song_submission.select"
              >
                <SelectValue placeholder="Select release type" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d0d1a] border-purple-500/40">
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Album">Album</SelectItem>
                <SelectItem value="EP">EP</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          {/* ── Genre ── */}
          <FormField label="Genre" required>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger
                className="neon-input"
                data-ocid="song_submission.select"
              >
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d0d1a] border-purple-500/40">
                {[
                  "Pop",
                  "Rock",
                  "Hip Hop",
                  "Classical",
                  "Folk",
                  "Electronic",
                  "Jazz",
                  "Other",
                ].map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {/* ── Artist(s) ── */}
          <ArtistProfilesCheckboxSelector
            label="Artist(s)"
            profiles={artistProfiles}
            selectedProfileIds={selectedArtists}
            onToggle={toggle(setSelectedArtists)}
            required
            helperText="Select at least one artist"
          />

          {/* ── Featured Artist(s) ── */}
          <ArtistProfilesCheckboxSelector
            label="Featured Artist(s) (Optional)"
            profiles={artistProfiles}
            selectedProfileIds={selectedFeaturedArtists}
            onToggle={toggle(setSelectedFeaturedArtists)}
          />

          {/* ── Composer ── */}
          <ArtistProfilesCheckboxSelector
            label="Composer"
            profiles={artistProfiles}
            selectedProfileIds={selectedComposers}
            onToggle={toggle(setSelectedComposers)}
            required
            helperText="Select at least one composer"
          />

          {/* ── Producer ── */}
          <FormField label="Producer" required>
            <Input
              id="producer"
              value={producer}
              onChange={(e) => setProducer(e.target.value)}
              placeholder="Producer name"
              className="neon-input"
              data-ocid="song_submission.input"
            />
          </FormField>

          {/* ── Lyricist ── */}
          <ArtistProfilesCheckboxSelector
            label="Lyricist"
            profiles={artistProfiles}
            selectedProfileIds={selectedLyricists}
            onToggle={toggle(setSelectedLyricists)}
            required
            helperText="Select at least one lyricist"
          />

          {/* ── Artwork Upload ── */}
          <div className="space-y-2">
            <Label className="text-purple-200 text-sm font-medium">
              Artwork <span className="text-red-400">*</span>
              <span className="text-purple-400/70 font-normal ml-1">
                (JPG/PNG, exactly 3000×3000px)
              </span>
            </Label>
            <div
              className="border border-purple-500/40 rounded-lg p-4 bg-purple-950/10
                         hover:border-purple-400/70 transition-colors"
            >
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleArtworkChange}
                className="block w-full text-sm text-purple-300
                           file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0
                           file:text-sm file:font-medium file:bg-purple-600 file:text-white
                           hover:file:bg-purple-500 cursor-pointer"
                data-ocid="song_submission.upload_button"
              />
              {artworkDimensionError && (
                <p
                  className="mt-2 text-sm text-red-400 flex items-center gap-1"
                  data-ocid="song_submission.error_state"
                >
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {artworkDimensionError}
                </p>
              )}
              {artworkFile && !artworkDimensionError && (
                <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {artworkFile.name}
                </p>
              )}
              {isUploading && artworkProgress > 0 && artworkProgress < 100 && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs text-purple-400">
                    <span>Uploading artwork…</span>
                    <span>{artworkProgress}%</span>
                  </div>
                  <Progress value={artworkProgress} className="h-1.5" />
                </div>
              )}
            </div>
          </div>

          {/* ── Audio Upload (non-album only) ── */}
          {!isAlbum && (
            <div className="space-y-2">
              <Label className="text-purple-200 text-sm font-medium">
                Audio File <span className="text-red-400">*</span>
              </Label>
              <div
                className="border border-cyan-500/40 rounded-lg p-4 bg-cyan-950/10
                           hover:border-cyan-400/70 transition-colors"
              >
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-cyan-300
                             file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0
                             file:text-sm file:font-medium file:bg-cyan-700 file:text-white
                             hover:file:bg-cyan-600 cursor-pointer"
                  data-ocid="song_submission.upload_button"
                />
                {audioFile && (
                  <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {audioFile.name}
                  </p>
                )}
                {isUploading && audioProgress > 0 && audioProgress < 100 && (
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs text-cyan-400">
                      <span>Uploading audio…</span>
                      <span>{audioProgress}%</span>
                    </div>
                    <Progress value={audioProgress} className="h-1.5" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Album Tracks Editor ── */}
          {isAlbum && (
            <div className="space-y-2">
              <Label className="text-purple-200 text-sm font-medium">
                Album Tracks <span className="text-red-400">*</span>
              </Label>
              <AlbumTracksEditor
                tracks={albumTracks}
                onChange={setAlbumTracks}
              />
            </div>
          )}

          {/* ── Music Video Link ── */}
          <FormField label="Music Video Link" hint="Optional">
            <Input
              id="musicVideoLink"
              type="url"
              value={musicVideoLink}
              onChange={(e) => setMusicVideoLink(e.target.value)}
              placeholder="https://youtube.com/…"
              className="neon-input"
            />
          </FormField>

          {/* ── Additional Details ── */}
          <FormField label="Additional Details" hint="Optional">
            <Textarea
              id="additionalDetails"
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="Any extra information for the release"
              rows={3}
              className="neon-input"
              data-ocid="song_submission.textarea"
            />
          </FormField>

          {/* ── Discount Code ── */}
          <FormField label="Discount Code" hint="Optional">
            <Input
              id="discountCode"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Enter discount code if you have one"
              className="neon-input"
            />
          </FormField>

          {/* ── Premium Fields Section (visible only to premium users) ── */}
          {isPremium && (
            <div
              className="space-y-5 rounded-xl border border-yellow-500/40 bg-yellow-950/10 p-5
                         shadow-[0_0_20px_rgba(234,179,8,0.08)]"
              data-ocid="song_submission.panel"
            >
              {/* Section heading */}
              <div className="flex items-center gap-2 pb-1 border-b border-yellow-500/20">
                <Crown className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-semibold text-yellow-300 tracking-wide uppercase">
                  Premium Fields
                </h3>
                <span className="text-xs text-yellow-500/70">
                  (All optional)
                </span>
              </div>

              {/* Custom C Line */}
              <FormField label="Custom C Line">
                <Input
                  value={customCLine}
                  onChange={(e) => setCustomCLine(e.target.value)}
                  placeholder="© Year Artist Name"
                  className="neon-input border-yellow-500/30 focus:border-yellow-400"
                  data-ocid="song_submission.input"
                />
              </FormField>

              {/* Custom P Line */}
              <FormField label="Custom P Line">
                <Input
                  value={customPLine}
                  onChange={(e) => setCustomPLine(e.target.value)}
                  placeholder="℗ Year Label Name"
                  className="neon-input border-yellow-500/30 focus:border-yellow-400"
                  data-ocid="song_submission.input"
                />
              </FormField>

              {/* Label */}
              <FormField label="Label">
                <Input
                  value={premiumLabel}
                  onChange={(e) => setPremiumLabel(e.target.value)}
                  placeholder="Your label name"
                  className="neon-input border-yellow-500/30 focus:border-yellow-400"
                  data-ocid="song_submission.input"
                />
              </FormField>

              {/* Content Type */}
              <FormField label="Content Type">
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger
                    className="neon-input border-yellow-500/30 focus:border-yellow-400"
                    data-ocid="song_submission.select"
                  >
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d0d1a] border-yellow-500/40">
                    <SelectItem value="Original Content">
                      Original Content
                    </SelectItem>
                    <SelectItem value="AI Generated">AI Generated</SelectItem>
                    <SelectItem value="Licensed Content">
                      Licensed Content
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              {/* AI Generated sub-fields */}
              {contentType === "AI Generated" && (
                <div className="ml-4 space-y-4 border-l-2 border-yellow-500/30 pl-4">
                  <FormField label="Suno Track Link">
                    <Input
                      type="url"
                      value={sunoTrackLink}
                      onChange={(e) => setSunoTrackLink(e.target.value)}
                      placeholder="https://suno.ai/song/..."
                      className="neon-input border-yellow-500/30"
                      data-ocid="song_submission.input"
                    />
                  </FormField>

                  <div className="space-y-2">
                    <Label className="text-yellow-200 text-sm font-medium">
                      Commercial Use Suno Agreement
                      <span className="text-yellow-400/70 font-normal ml-1">
                        (PDF/DOC)
                      </span>
                    </Label>
                    <div className="border border-yellow-500/30 rounded-lg p-4 bg-yellow-950/10 hover:border-yellow-400/50 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) =>
                          setSunoAgreementFile(e.target.files?.[0] ?? null)
                        }
                        className="block w-full text-sm text-yellow-300
                                   file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0
                                   file:text-sm file:font-medium file:bg-yellow-600/80 file:text-white
                                   hover:file:bg-yellow-500/80 cursor-pointer"
                        data-ocid="song_submission.upload_button"
                      />
                      {sunoAgreementFile && (
                        <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {sunoAgreementFile.name}
                        </p>
                      )}
                      {isUploading &&
                        sunoAgreementProgress > 0 &&
                        sunoAgreementProgress < 100 && (
                          <div className="mt-3 space-y-1">
                            <div className="flex justify-between text-xs text-yellow-400">
                              <span>Uploading agreement…</span>
                              <span>{sunoAgreementProgress}%</span>
                            </div>
                            <Progress
                              value={sunoAgreementProgress}
                              className="h-1.5"
                            />
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}

              {/* Licensed Content sub-fields */}
              {contentType === "Licensed Content" && (
                <div className="ml-4 space-y-4 border-l-2 border-yellow-500/30 pl-4">
                  <div className="space-y-2">
                    <Label className="text-yellow-200 text-sm font-medium">
                      Licence
                      <span className="text-yellow-400/70 font-normal ml-1">
                        (PDF/DOC)
                      </span>
                    </Label>
                    <div className="border border-yellow-500/30 rounded-lg p-4 bg-yellow-950/10 hover:border-yellow-400/50 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) =>
                          setLicenceFile(e.target.files?.[0] ?? null)
                        }
                        className="block w-full text-sm text-yellow-300
                                   file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0
                                   file:text-sm file:font-medium file:bg-yellow-600/80 file:text-white
                                   hover:file:bg-yellow-500/80 cursor-pointer"
                        data-ocid="song_submission.upload_button"
                      />
                      {licenceFile && (
                        <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {licenceFile.name}
                        </p>
                      )}
                      {isUploading &&
                        licenceProgress > 0 &&
                        licenceProgress < 100 && (
                          <div className="mt-3 space-y-1">
                            <div className="flex justify-between text-xs text-yellow-400">
                              <span>Uploading licence…</span>
                              <span>{licenceProgress}%</span>
                            </div>
                            <Progress
                              value={licenceProgress}
                              className="h-1.5"
                            />
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}

              {/* Content ID toggle */}
              <div className="flex items-center justify-between rounded-lg border border-yellow-500/20 bg-yellow-950/10 px-4 py-3">
                <div className="space-y-0.5">
                  <Label className="text-yellow-200 text-sm font-medium cursor-pointer">
                    Content ID
                  </Label>
                  <p className="text-xs text-yellow-500/70">
                    Enable Content ID protection for this release
                  </p>
                </div>
                <Switch
                  checked={contentId}
                  onCheckedChange={setContentId}
                  className="data-[state=checked]:bg-yellow-500"
                  data-ocid="song_submission.switch"
                />
              </div>

              {/* Caller Tune Start Second */}
              <FormField label="Caller Tune Start Second">
                <Input
                  type="number"
                  min="0"
                  value={callerTuneStartSecond}
                  onChange={(e) => setCallerTuneStartSecond(e.target.value)}
                  placeholder="e.g. 30"
                  className="neon-input border-yellow-500/30 focus:border-yellow-400"
                  data-ocid="song_submission.input"
                />
              </FormField>
            </div>
          )}

          {/* ── Legal Agreements ── */}
          <div
            className="flex items-start gap-3 rounded-lg border border-purple-500/30 bg-purple-950/10 p-4"
            data-ocid="song_submission.modal"
          >
            <Checkbox
              id="legalAgreements"
              checked={legalAgreementsAccepted}
              onCheckedChange={(v) => setLegalAgreementsAccepted(v as boolean)}
              className="mt-0.5 border-purple-400 data-[state=checked]:bg-purple-600"
              data-ocid="song_submission.checkbox"
            />
            <div className="space-y-1">
              <Label
                htmlFor="legalAgreements"
                className="text-sm font-medium text-purple-200 cursor-pointer"
              >
                I accept the Legal Agreements &amp; Terms{" "}
                <span className="text-red-400">*</span>
              </Label>
              <p className="text-xs text-purple-400/80">
                By checking this box, you confirm that you own or have the
                rights to distribute this content and agree to our terms and
                conditions.
              </p>
            </div>
          </div>

          {/* ── Uploading status ── */}
          {isUploading && (
            <div
              className="flex items-center gap-2 text-sm text-purple-300"
              data-ocid="song_submission.loading_state"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading files… please keep this page open.
            </div>
          )}

          {/* ── Submit Button ── */}
          <Button
            type="submit"
            disabled={isBusy}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-600
                       hover:from-purple-500 hover:to-cyan-500
                       text-white font-semibold py-5 shadow-[0_0_16px_rgba(168,85,247,0.4)]
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            data-ocid="song_submission.submit_button"
          >
            {isBusy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? "Uploading…" : "Submitting…"}
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

// ── Small helper component to reduce boilerplate ──
function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-purple-200 text-sm font-medium">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
        {hint && (
          <span className="text-purple-400/70 font-normal ml-1">({hint})</span>
        )}
      </Label>
      {children}
    </div>
  );
}
