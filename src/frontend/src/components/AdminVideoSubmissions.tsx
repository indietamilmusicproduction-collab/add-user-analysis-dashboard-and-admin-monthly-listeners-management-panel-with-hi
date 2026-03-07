import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import { Download, Edit, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { VideoSubmission, VideoSubmissionStatus } from "../backend";
import {
  useDeleteVideoSubmission,
  useDownloadVideoFile,
  useGetAllArtistProfiles,
  useGetAllVideoSubmissions,
  useUpdateVideoStatus,
} from "../hooks/useQueries";
import { downloadExternalBlob } from "../utils/downloadExternalBlob";
import AdminEditVideoDialog from "./AdminEditVideoDialog";

export default function AdminVideoSubmissions() {
  const { data: videos, isLoading } = useGetAllVideoSubmissions();
  const { data: artistProfiles } = useGetAllArtistProfiles();
  const updateStatus = useUpdateVideoStatus();
  const deleteVideo = useDeleteVideoSubmission();
  const downloadVideo = useDownloadVideoFile();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [liveUrls, setLiveUrls] = useState<Record<string, string>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoSubmission | null>(
    null,
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const getUserFullName = (userId: string): string => {
    if (!artistProfiles) return "Unknown User";
    const profile = artistProfiles.find((p) => p.owner.toString() === userId);
    return profile ? profile.fullName : "Unknown User";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge className="bg-blue-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "waiting":
        return <Badge className="bg-yellow-500">Waiting</Badge>;
      case "live":
        return <Badge className="bg-green-500">Live</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleStatusChange = async (
    videoId: string,
    newStatus: VideoSubmissionStatus,
  ) => {
    if (newStatus === "live") {
      const liveUrl = liveUrls[videoId];
      if (!liveUrl || !liveUrl.trim()) {
        toast.error("Please enter a live URL before setting status to live");
        return;
      }
      await updateStatus.mutateAsync({ videoId, newStatus, liveUrl });
    } else {
      await updateStatus.mutateAsync({ videoId, newStatus, liveUrl: null });
    }
  };

  const handleDownload = async (videoId: string, title: string) => {
    try {
      const blob = await downloadVideo.mutateAsync(videoId);
      await downloadExternalBlob(blob, `${title}.mp4`);
      toast.success("Video download started");
    } catch (error: any) {
      console.error("Download error:", error);
      toast.error(error.message || "Failed to download video");
    }
  };

  const handleDeleteClick = (videoId: string) => {
    setVideoToDelete(videoId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (videoToDelete) {
      await deleteVideo.mutateAsync(videoToDelete);
      setDeleteDialogOpen(false);
      setVideoToDelete(null);
    }
  };

  const handleEdit = (video: VideoSubmission) => {
    setEditingVideo(video);
    setEditDialogOpen(true);
  };

  const filteredVideos = videos?.filter((video) => {
    if (statusFilter === "all") return true;
    return video.status === statusFilter;
  });

  // Sort by submission date (newest first)
  const sortedVideos = filteredVideos?.sort((a, b) => {
    return Number(b.submittedAt - a.submittedAt);
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="live">Live</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Video List */}
        {!sortedVideos || sortedVideos.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">
                No video submissions found.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedVideos.map((video) => (
              <Card key={video.id}>
                <CardHeader>
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {video.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Submitted by: {getUserFullName(video.userId.toString())}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(
                          Number(video.submittedAt / BigInt(1_000_000)),
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusBadge(video.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Thumbnail */}
                  {video.thumbnail && (
                    <div className="w-full max-w-xs">
                      <img
                        src={video.thumbnail.getDirectURL()}
                        alt={video.title}
                        className="w-full h-40 object-cover rounded-lg border border-border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Details */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Category:</span>{" "}
                      <span className="font-medium">{video.category}</span>
                    </div>
                    {video.tags && video.tags.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Tags:</span>{" "}
                        <span className="font-medium">
                          {video.tags.join(", ")}
                        </span>
                      </div>
                    )}
                    {video.liveUrl && (
                      <div className="col-span-2 md:col-span-3">
                        <span className="text-muted-foreground">Live URL:</span>{" "}
                        <a
                          href={video.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline break-all"
                        >
                          {video.liveUrl}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {video.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {video.description}
                    </p>
                  )}

                  {/* Live URL input (shown when setting to live) */}
                  <div className="space-y-2">
                    <Label className="text-xs">
                      Live URL (required when setting to Live)
                    </Label>
                    <Input
                      placeholder="https://..."
                      value={liveUrls[video.id] || ""}
                      onChange={(e) =>
                        setLiveUrls((prev) => ({
                          ...prev,
                          [video.id]: e.target.value,
                        }))
                      }
                      className="text-sm"
                    />
                  </div>

                  {/* Status Change */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <Select
                      value={video.status}
                      onValueChange={(value) =>
                        handleStatusChange(
                          video.id,
                          value as VideoSubmissionStatus,
                        )
                      }
                      disabled={updateStatus.isPending}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="waiting">Waiting</SelectItem>
                        <SelectItem value="live">Live</SelectItem>
                      </SelectContent>
                    </Select>

                    {updateStatus.isPending && (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    )}

                    <div className="flex gap-2 ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(video)}
                        className="gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(video.id, video.title)}
                        disabled={downloadVideo.isPending}
                        className="gap-1"
                      >
                        {downloadVideo.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        Download
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(video.id)}
                        className="gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this video submission? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteVideo.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {editingVideo && (
        <AdminEditVideoDialog
          video={editingVideo}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </>
  );
}
