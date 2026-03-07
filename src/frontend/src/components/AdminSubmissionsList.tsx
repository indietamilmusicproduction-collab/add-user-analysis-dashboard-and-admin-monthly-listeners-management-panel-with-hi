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
import { Textarea } from "@/components/ui/textarea";
import {
  Download,
  Edit,
  ExternalLink,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { SongStatus, SongSubmission } from "../backend";
import {
  useAdminDeleteSubmission,
  useAdminSetSubmissionLive,
  useAdminUpdateSubmission,
  useGetAllSubmissionsForAdmin,
} from "../hooks/useQueries";
import { downloadExternalBlob } from "../utils/downloadExternalBlob";
import AdminEditSubmissionDialog from "./AdminEditSubmissionDialog";
import AdminManageLinksDialog from "./AdminManageLinksDialog";

export default function AdminSubmissionsList() {
  const { data: submissions, isLoading } = useGetAllSubmissionsForAdmin();
  const updateSubmission = useAdminUpdateSubmission();
  const setSubmissionLive = useAdminSetSubmissionLive();
  const deleteSubmission = useAdminDeleteSubmission();

  const [editingSubmission, setEditingSubmission] =
    useState<SongSubmission | null>(null);
  const [managingLinksSubmission, setManagingLinksSubmission] =
    useState<SongSubmission | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(
    null,
  );
  const [liveUrls, setLiveUrls] = useState<Record<string, string>>({});
  const [adminRemarks, setAdminRemarks] = useState<Record<string, string>>({});
  const [adminComments, setAdminComments] = useState<Record<string, string>>(
    {},
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading submissions...</p>
        </div>
      </div>
    );
  }

  const sortedSubmissions = [...(submissions || [])].sort((a, b) => {
    const statusOrder = {
      pending: 0,
      approved: 1,
      live: 2,
      rejected: 3,
      draft: 4,
    };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return Number(b.timestamp - a.timestamp);
  });

  const handleStatusChange = async (id: string, newStatus: SongStatus) => {
    const submission = submissions?.find((s) => s.id === id);
    if (!submission) return;

    if (newStatus === "live") {
      const liveUrl = liveUrls[id] || "";
      if (!liveUrl) {
        toast.error("Please enter a live URL before marking as live");
        return;
      }
      try {
        await setSubmissionLive.mutateAsync({
          id,
          liveUrl,
          adminRemarks: adminRemarks[id] || "",
          adminComment: adminComments[id] || "",
        });
        toast.success("Submission marked as live");
        setLiveUrls((prev) => ({ ...prev, [id]: "" }));
      } catch (error: any) {
        toast.error(error.message || "Failed to update submission");
      }
    } else {
      try {
        await updateSubmission.mutateAsync({
          id,
          status: newStatus,
          adminRemarks: adminRemarks[id] || "",
          adminComment: adminComments[id] || "",
        });
        toast.success("Submission status updated");
      } catch (error: any) {
        toast.error(error.message || "Failed to update submission");
      }
    }
  };

  const handleDelete = async () => {
    if (!submissionToDelete) return;
    try {
      await deleteSubmission.mutateAsync(submissionToDelete);
      toast.success("Submission deleted successfully");
      setDeleteDialogOpen(false);
      setSubmissionToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete submission");
    }
  };

  const handleDownloadArtwork = async (submission: SongSubmission) => {
    try {
      await downloadExternalBlob(
        submission.artwork,
        submission.artworkFilename,
      );
      toast.success("Artwork downloaded");
    } catch (_error) {
      toast.error("Failed to download artwork");
    }
  };

  const handleDownloadAudio = async (submission: SongSubmission) => {
    try {
      await downloadExternalBlob(
        submission.audioFile,
        submission.audioFilename,
      );
      toast.success("Audio file downloaded");
    } catch (_error) {
      toast.error("Failed to download audio file");
    }
  };

  const getStatusBadgeVariant = (status: SongStatus) => {
    switch (status) {
      case "pending":
        return "default";
      case "approved":
        return "secondary";
      case "live":
        return "default";
      case "rejected":
        return "destructive";
      case "draft":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-4">
      {sortedSubmissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No submissions yet</p>
          </CardContent>
        </Card>
      ) : (
        sortedSubmissions.map((submission) => (
          <Card key={submission.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{submission.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {submission.artist} • {submission.genre} •{" "}
                    {submission.language}
                  </p>
                </div>
                <Badge variant={getStatusBadgeVariant(submission.status)}>
                  {submission.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Release Type:</span>{" "}
                  {submission.releaseType}
                </div>
                <div>
                  <span className="font-medium">Release Date:</span>{" "}
                  {new Date(
                    Number(submission.releaseDate / BigInt(1000000)),
                  ).toLocaleDateString()}
                </div>
                {submission.featuredArtist && (
                  <div>
                    <span className="font-medium">Featured Artist:</span>{" "}
                    {submission.featuredArtist}
                  </div>
                )}
                {submission.composer && (
                  <div>
                    <span className="font-medium">Composer:</span>{" "}
                    {submission.composer}
                  </div>
                )}
                {submission.producer && (
                  <div>
                    <span className="font-medium">Producer:</span>{" "}
                    {submission.producer}
                  </div>
                )}
                {submission.lyricist && (
                  <div>
                    <span className="font-medium">Lyricist:</span>{" "}
                    {submission.lyricist}
                  </div>
                )}
                {submission.musicVideoLink && (
                  <div className="col-span-2">
                    <span className="font-medium">Music Video:</span>{" "}
                    <a
                      href={submission.musicVideoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      View Video <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {submission.additionalDetails && (
                <div className="text-sm">
                  <span className="font-medium">Additional Details:</span>
                  <p className="text-muted-foreground mt-1">
                    {submission.additionalDetails}
                  </p>
                </div>
              )}

              {submission.adminRemarks && (
                <div className="text-sm">
                  <span className="font-medium">Admin Remarks:</span>
                  <p className="text-muted-foreground mt-1">
                    {submission.adminRemarks}
                  </p>
                </div>
              )}

              {submission.adminComment && (
                <div className="text-sm">
                  <span className="font-medium">Admin Comment:</span>
                  <p className="text-muted-foreground mt-1">
                    {submission.adminComment}
                  </p>
                </div>
              )}

              {submission.status === "live" && submission.adminLiveLink && (
                <div className="text-sm">
                  <span className="font-medium">Live URL:</span>{" "}
                  <a
                    href={submission.adminLiveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {submission.adminLiveLink}{" "}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="space-y-3 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor={`status-${submission.id}`}>Status</Label>
                    <Select
                      value={submission.status}
                      onValueChange={(value) =>
                        handleStatusChange(submission.id, value as SongStatus)
                      }
                    >
                      <SelectTrigger id={`status-${submission.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {submission.status !== "live" && (
                    <div className="space-y-2">
                      <Label htmlFor={`liveUrl-${submission.id}`}>
                        Live URL (for Live status)
                      </Label>
                      <Input
                        id={`liveUrl-${submission.id}`}
                        placeholder="https://..."
                        value={liveUrls[submission.id] || ""}
                        onChange={(e) =>
                          setLiveUrls((prev) => ({
                            ...prev,
                            [submission.id]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`remarks-${submission.id}`}>
                    Admin Remarks
                  </Label>
                  <Textarea
                    id={`remarks-${submission.id}`}
                    placeholder="Internal notes..."
                    value={
                      adminRemarks[submission.id] || submission.adminRemarks
                    }
                    onChange={(e) =>
                      setAdminRemarks((prev) => ({
                        ...prev,
                        [submission.id]: e.target.value,
                      }))
                    }
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`comment-${submission.id}`}>
                    Admin Comment (visible to user)
                  </Label>
                  <Textarea
                    id={`comment-${submission.id}`}
                    placeholder="Feedback for the user..."
                    value={
                      adminComments[submission.id] || submission.adminComment
                    }
                    onChange={(e) =>
                      setAdminComments((prev) => ({
                        ...prev,
                        [submission.id]: e.target.value,
                      }))
                    }
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setManagingLinksSubmission(submission)}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Manage Links
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSubmission(submission)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadArtwork(submission)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Artwork
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadAudio(submission)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Audio
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSubmissionToDelete(submission.id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <AdminEditSubmissionDialog
        submission={editingSubmission}
        open={!!editingSubmission}
        onOpenChange={(open) => !open && setEditingSubmission(null)}
      />

      <AdminManageLinksDialog
        song={managingLinksSubmission}
        open={!!managingLinksSubmission}
        onOpenChange={(open) => !open && setManagingLinksSubmission(null)}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this submission? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
