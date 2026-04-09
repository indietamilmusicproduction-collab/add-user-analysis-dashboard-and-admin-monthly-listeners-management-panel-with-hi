// @ts-nocheck
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { VideoSubmissionInput } from "../backend";
import { useSubmitVideo } from "../hooks/useQueries";
import { fileToExternalBlob } from "../utils/fileToExternalBlob";

export default function VideoSubmissionForm() {
  const submitVideo = useSubmitVideo();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [thumbnailProgress, setThumbnailProgress] = useState(0);
  const [artworkProgress, setArtworkProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!category.trim()) {
      toast.error("Category is required");
      return;
    }
    if (!thumbnailFile) {
      toast.error("Thumbnail is required");
      return;
    }
    if (!artworkFile) {
      toast.error("Artwork is required");
      return;
    }
    if (!videoFile) {
      toast.error("Video file is required");
      return;
    }

    try {
      setIsUploading(true);

      // Convert files to ExternalBlob with progress tracking
      const thumbnailBlob = await fileToExternalBlob(
        thumbnailFile,
        (progress) => {
          setThumbnailProgress(progress);
        },
      );

      const artworkBlob = await fileToExternalBlob(artworkFile, (progress) => {
        setArtworkProgress(progress);
      });

      const videoBlob = await fileToExternalBlob(videoFile, (progress) => {
        setVideoProgress(progress);
      });

      // Parse tags
      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const input: VideoSubmissionInput = {
        title,
        description,
        category,
        tags: tagArray,
        thumbnail: thumbnailBlob,
        artwork: artworkBlob,
        videoFile: videoBlob,
      };

      await submitVideo.mutateAsync(input);

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setTags("");
      setThumbnailFile(null);
      setArtworkFile(null);
      setVideoFile(null);
      setThumbnailProgress(0);
      setArtworkProgress(0);
      setVideoProgress(0);

      // Navigate to thank you page
      navigate({ to: "/thank-you" });
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit video");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Video Content</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="video-title">Title *</Label>
            <Input
              id="video-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="video-description">Description *</Label>
            <Textarea
              id="video-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description"
              rows={4}
              required
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="video-category">Category *</Label>
            <Input
              id="video-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Music Video, Documentary, Tutorial"
              required
            />
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="video-tags">Tags</Label>
            <Input
              id="video-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags separated by commas"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Example: music, indie, tamil, rock
            </p>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <Label htmlFor="video-thumbnail">Thumbnail *</Label>
            <Input
              id="video-thumbnail"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              required
            />
            {thumbnailProgress > 0 && thumbnailProgress < 100 && (
              <div className="mt-2">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Uploading thumbnail...</span>
                  <span>{thumbnailProgress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${thumbnailProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Artwork Upload */}
          <div>
            <Label htmlFor="video-artwork">Artwork *</Label>
            <Input
              id="video-artwork"
              type="file"
              accept="image/*"
              onChange={(e) => setArtworkFile(e.target.files?.[0] || null)}
              required
            />
            {artworkProgress > 0 && artworkProgress < 100 && (
              <div className="mt-2">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Uploading artwork...</span>
                  <span>{artworkProgress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${artworkProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Video File Upload */}
          <div>
            <Label htmlFor="video-file">Video File *</Label>
            <Input
              id="video-file"
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              required
            />
            {videoProgress > 0 && videoProgress < 100 && (
              <div className="mt-2">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Uploading video...</span>
                  <span>{videoProgress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${videoProgress}%` }}
                  />
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              No size limit. Supported formats: MP4, MOV, AVI, etc.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isUploading || submitVideo.isPending}
            className="w-full"
          >
            {isUploading || submitVideo.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Submit Video
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
