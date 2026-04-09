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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { VideoSubmission, VideoSubmissionInput } from "../backend";
import { useUpdateVideoSubmission } from "../hooks/useQueries";
import { fileToExternalBlob } from "../utils/fileToExternalBlob";

interface AdminEditVideoDialogProps {
  video: VideoSubmission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminEditVideoDialog({
  video,
  open,
  onOpenChange,
}: AdminEditVideoDialogProps) {
  const updateVideo = useUpdateVideoSubmission();

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

  useEffect(() => {
    if (video) {
      setTitle(video.title);
      setDescription(video.description);
      setCategory(video.category);
      setTags(video.tags.join(", "));
    }
  }, [video]);

  const handleSave = async () => {
    if (!video) return;

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

    try {
      setIsUploading(true);

      // Use existing blobs or upload new ones
      let thumbnailBlob = video.thumbnail;
      if (thumbnailFile) {
        thumbnailBlob = await fileToExternalBlob(thumbnailFile, (progress) => {
          setThumbnailProgress(progress);
        });
      }

      let artworkBlob = video.artwork;
      if (artworkFile) {
        artworkBlob = await fileToExternalBlob(artworkFile, (progress) => {
          setArtworkProgress(progress);
        });
      }

      let videoBlob = video.videoFile;
      if (videoFile) {
        videoBlob = await fileToExternalBlob(videoFile, (progress) => {
          setVideoProgress(progress);
        });
      }

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

      await updateVideo.mutateAsync({ input, videoId: video.id });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update video");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Video Submission</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="admin-edit-video-title">Title *</Label>
            <Input
              id="admin-edit-video-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="admin-edit-video-description">Description *</Label>
            <Textarea
              id="admin-edit-video-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description"
              rows={4}
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="admin-edit-video-category">Category *</Label>
            <Input
              id="admin-edit-video-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Music Video, Documentary"
            />
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="admin-edit-video-tags">Tags</Label>
            <Input
              id="admin-edit-video-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags separated by commas"
            />
          </div>

          {/* Thumbnail Upload */}
          <div>
            <Label htmlFor="admin-edit-video-thumbnail">Thumbnail</Label>
            <Input
              id="admin-edit-video-thumbnail"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            />
            {thumbnailProgress > 0 && thumbnailProgress < 100 && (
              <div className="mt-2 text-sm text-muted-foreground">
                Uploading thumbnail: {thumbnailProgress}%
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to keep existing thumbnail
            </p>
          </div>

          {/* Artwork Upload */}
          <div>
            <Label htmlFor="admin-edit-video-artwork">Artwork</Label>
            <Input
              id="admin-edit-video-artwork"
              type="file"
              accept="image/*"
              onChange={(e) => setArtworkFile(e.target.files?.[0] || null)}
            />
            {artworkProgress > 0 && artworkProgress < 100 && (
              <div className="mt-2 text-sm text-muted-foreground">
                Uploading artwork: {artworkProgress}%
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to keep existing artwork
            </p>
          </div>

          {/* Video File Upload */}
          <div>
            <Label htmlFor="admin-edit-video-file">Video File</Label>
            <Input
              id="admin-edit-video-file"
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            />
            {videoProgress > 0 && videoProgress < 100 && (
              <div className="mt-2 text-sm text-muted-foreground">
                Uploading video: {videoProgress}%
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to keep existing video file
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUploading || updateVideo.isPending}
          >
            {isUploading || updateVideo.isPending ? (
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
