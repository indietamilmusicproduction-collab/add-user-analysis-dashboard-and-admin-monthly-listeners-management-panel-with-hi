import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EpisodeType } from "../backend";
import {
  useCreatePodcastEpisode,
  useGetMyPodcastShows,
  useIsCurrentUserBlockedPodcastSubmission,
} from "../hooks/useQueries";
import { fileToExternalBlob } from "../utils/fileToExternalBlob";

interface PodcastEpisodeFormProps {
  showId?: string;
}

export default function PodcastEpisodeForm({
  showId,
}: PodcastEpisodeFormProps) {
  const [selectedShowId, setSelectedShowId] = useState(showId || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [seasonNumber, setSeasonNumber] = useState("1");
  const [episodeNumber, setEpisodeNumber] = useState("1");
  const [episodeType, setEpisodeType] = useState<string>("full");
  const [isEighteenPlus, setIsEighteenPlus] = useState(false);
  const [isExplicit, setIsExplicit] = useState(false);
  const [isPromotional, setIsPromotional] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [uploadProgress, setUploadProgress] = useState({
    thumbnail: 0,
    artwork: 0,
    media: 0,
  });

  const { data: shows = [] } = useGetMyPodcastShows();
  const createEpisode = useCreatePodcastEpisode();
  const { data: isBlocked, isLoading: blockCheckLoading } =
    useIsCurrentUserBlockedPodcastSubmission();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBlocked) {
      toast.error("Your access blocked due to submission limit is full");
      return;
    }

    if (
      !selectedShowId ||
      !title ||
      !description ||
      !thumbnailFile ||
      !artworkFile ||
      !mediaFile
    ) {
      return;
    }

    try {
      const thumbnailBlob = await fileToExternalBlob(
        thumbnailFile,
        (progress) => {
          setUploadProgress((prev) => ({ ...prev, thumbnail: progress }));
        },
      );

      const artworkBlob = await fileToExternalBlob(artworkFile, (progress) => {
        setUploadProgress((prev) => ({ ...prev, artwork: progress }));
      });

      const mediaBlob = await fileToExternalBlob(mediaFile, (progress) => {
        setUploadProgress((prev) => ({ ...prev, media: progress }));
      });

      await createEpisode.mutateAsync({
        showId: selectedShowId,
        title,
        description,
        seasonNumber: BigInt(Number.parseInt(seasonNumber) || 1),
        episodeNumber: BigInt(Number.parseInt(episodeNumber) || 1),
        episodeType: EpisodeType[episodeType as keyof typeof EpisodeType],
        isEighteenPlus,
        isExplicit,
        isPromotional,
        thumbnail: thumbnailBlob,
        artwork: artworkBlob,
        mediaFile: mediaBlob,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setSeasonNumber("1");
      setEpisodeNumber("1");
      setEpisodeType("full");
      setIsEighteenPlus(false);
      setIsExplicit(false);
      setIsPromotional(false);
      setThumbnailFile(null);
      setArtworkFile(null);
      setMediaFile(null);
      setAdditionalDetails("");
      setUploadProgress({ thumbnail: 0, artwork: 0, media: 0 });
    } catch (error: any) {
      console.error("Failed to create episode:", error);
      if (
        error.message?.includes("blocked") ||
        error.message?.includes("submission limit")
      ) {
        toast.error("Your access blocked due to submission limit is full");
      }
    }
  };

  const isSubmitting = createEpisode.isPending;

  if (blockCheckLoading) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Episode</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!showId && (
            <div>
              <Label htmlFor="show">Select Show *</Label>
              <Select value={selectedShowId} onValueChange={setSelectedShowId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a show" />
                </SelectTrigger>
                <SelectContent>
                  {shows.map((show) => (
                    <SelectItem key={show.id} value={show.id}>
                      {show.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="title">Episode Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter episode title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter episode description"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="seasonNumber">Season Number *</Label>
              <Input
                id="seasonNumber"
                type="number"
                min="1"
                value={seasonNumber}
                onChange={(e) => setSeasonNumber(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="episodeNumber">Episode Number *</Label>
              <Input
                id="episodeNumber"
                type="number"
                min="1"
                value={episodeNumber}
                onChange={(e) => setEpisodeNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="episodeType">Episode Type *</Label>
            <Select value={episodeType} onValueChange={setEpisodeType}>
              <SelectTrigger>
                <SelectValue placeholder="Select episode type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="trailer">Trailer</SelectItem>
                <SelectItem value="bonus">Bonus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="eighteenPlus">18+ Only</Label>
              <Switch
                id="eighteenPlus"
                checked={isEighteenPlus}
                onCheckedChange={setIsEighteenPlus}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="explicit">Explicit Content</Label>
              <Switch
                id="explicit"
                checked={isExplicit}
                onCheckedChange={setIsExplicit}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="promotional">Promotional Content</Label>
              <Switch
                id="promotional"
                checked={isPromotional}
                onCheckedChange={setIsPromotional}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="thumbnail">Thumbnail *</Label>
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              required
            />
            {uploadProgress.thumbnail > 0 && uploadProgress.thumbnail < 100 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress.thumbnail}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {uploadProgress.thumbnail}% uploaded
                </p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="artwork">Episode Artwork *</Label>
            <Input
              id="artwork"
              type="file"
              accept="image/*"
              onChange={(e) => setArtworkFile(e.target.files?.[0] || null)}
              required
            />
            {uploadProgress.artwork > 0 && uploadProgress.artwork < 100 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress.artwork}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {uploadProgress.artwork}% uploaded
                </p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="mediaFile">Content File (Audio/Video) *</Label>
            <Input
              id="mediaFile"
              type="file"
              accept="audio/*,video/*"
              onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
              required
            />
            {uploadProgress.media > 0 && uploadProgress.media < 100 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress.media}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {uploadProgress.media}% uploaded
                </p>
              </div>
            )}
          </div>

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

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Episode...
              </>
            ) : (
              "Create Episode"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
