// @ts-nocheck
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
  AlertCircle,
  Crown,
  Download,
  Edit,
  ExternalLink,
  Link as LinkIcon,
  Loader2,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  SongStatus,
  SongSubmission,
  SongSubmissionAdmin,
} from "../backend";
import {
  useAdminDeleteSubmission,
  useAdminSetSubmissionLive,
  useAdminUpdateSongStats,
  useAdminUpdateSubmission,
  useGetAllSubmissionsWithStatsForAdmin,
} from "../hooks/useQueries";
import { downloadAudioInChunks } from "../utils/downloadAudioInChunks";
import { downloadExternalBlob } from "../utils/downloadExternalBlob";
import AdminEditSubmissionDialog from "./AdminEditSubmissionDialog";
import AdminManageLinksDialog from "./AdminManageLinksDialog";

// Extended type that includes premium fields not yet in backend.ts SongSubmissionAdmin
interface PremiumSongSubmissionAdmin extends SongSubmissionAdmin {
  customCLine?: string;
  customPLine?: string;
  premiumLabel?: string;
  contentType?: string;
  sunoTrackLink?: string;
  sunoAgreementFile?: import("../backend").ExternalBlob;
  sunoAgreementFilename?: string;
  licenceFile?: import("../backend").ExternalBlob;
  licenceFilename?: string;
  contentId?: boolean;
  callerTuneStartSecond?: number;
}

export default function AdminSubmissionsList() {
  const {
    data: submissions,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAllSubmissionsWithStatsForAdmin();
  const updateSubmission = useAdminUpdateSubmission();
  const setSubmissionLive = useAdminSetSubmissionLive();
  const deleteSubmission = useAdminDeleteSubmission();
  const updateSongStats = useAdminUpdateSongStats();

  const [editingSubmission, setEditingSubmission] =
    useState<SongSubmissionAdmin | null>(null);
  const [managingLinksSubmission, setManagingLinksSubmission] =
    useState<SongSubmissionAdmin | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(
    null,
  );
  const [liveUrls, setLiveUrls] = useState<Record<string, string>>({});
  const [adminRemarks, setAdminRemarks] = useState<Record<string, string>>({});
  const [adminComments, setAdminComments] = useState<Record<string, string>>(
    {},
  );
  // Stats editing state: songId -> {monthlyListeners, revenue}
  const [statsEdits, setStatsEdits] = useState<
    Record<string, { monthlyListeners: string; revenue: string }>
  >({});
  const [savingStats, setSavingStats] = useState<Record<string, boolean>>({});

  // Audio download progress state: songId -> {received, total}
  const [downloadingAudio, setDownloadingAudio] = useState<
    Record<string, { received: number; total: number }>
  >({});

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

  if (isError) {
    return (
      <Card className="border-destructive/40">
        <CardContent className="py-12 text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
          <div>
            <p className="font-semibold text-destructive">
              Failed to load submissions
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error
                ? error.message
                : "Unable to fetch submissions. Make sure you are logged in as admin."}
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
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

  const handleSaveStats = async (songId: string) => {
    const edit = statsEdits[songId];
    const mlStr = edit?.monthlyListeners ?? "";
    const revStr = edit?.revenue ?? "";

    const monthlyListeners =
      mlStr !== "" && !Number.isNaN(Number(mlStr)) ? Number(mlStr) : undefined;
    const revenue =
      revStr !== "" && !Number.isNaN(Number(revStr))
        ? Number(revStr)
        : undefined;

    if (monthlyListeners === undefined && revenue === undefined) {
      toast.error("Enter at least one value to save");
      return;
    }

    setSavingStats((prev) => ({ ...prev, [songId]: true }));
    try {
      await updateSongStats.mutateAsync({ songId, monthlyListeners, revenue });
      toast.success("Stats updated successfully");
      // Clear the edit inputs for this song
      setStatsEdits((prev) => {
        const next = { ...prev };
        delete next[songId];
        return next;
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to update stats");
    } finally {
      setSavingStats((prev) => ({ ...prev, [songId]: false }));
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
    const id = submission.id;
    const directURL = (submission.audioFile as any)?.directURL as
      | string
      | undefined;
    if (!directURL) {
      toast.error("Audio file URL not available");
      return;
    }

    setDownloadingAudio((prev) => ({
      ...prev,
      [id]: { received: 0, total: 0 },
    }));
    try {
      await downloadAudioInChunks(
        directURL,
        submission.audioFilename,
        (received, total) => {
          setDownloadingAudio((prev) => ({
            ...prev,
            [id]: { received, total },
          }));
        },
      );
      toast.success("Audio file downloaded");
    } catch (_error) {
      toast.error("Failed to download audio file");
    } finally {
      setDownloadingAudio((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleDownloadPremiumFile = async (
    blob: import("../backend").ExternalBlob | undefined,
    filename: string | undefined,
    label: string,
  ) => {
    if (!blob) return;
    try {
      await downloadExternalBlob(blob, filename ?? label);
      toast.success(`${label} downloaded`);
    } catch (_error) {
      toast.error(`Failed to download ${label}`);
    }
  };

  const getStatusBadge = (status: SongStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/40">
            PENDING
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-500/20 text-green-400 border border-green-500/40">
            APPROVED
          </Badge>
        );
      case "live":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/40">
            LIVE
          </Badge>
        );
      case "rejected":
        return <Badge variant="destructive">REJECTED</Badge>;
      case "draft":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            DRAFT
          </Badge>
        );
      default:
        return <Badge variant="outline">{String(status).toUpperCase()}</Badge>;
    }
  };

  // Check if submission has any premium fields
  const hasPremiumFields = (
    submission: PremiumSongSubmissionAdmin,
  ): boolean => {
    return !!(
      submission.customCLine ||
      submission.customPLine ||
      submission.premiumLabel ||
      submission.contentType ||
      submission.contentId !== undefined ||
      submission.sunoTrackLink ||
      submission.sunoAgreementFile ||
      submission.licenceFile ||
      submission.callerTuneStartSecond !== undefined
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {sortedSubmissions.length} submission
          {sortedSubmissions.length !== 1 ? "s" : ""} total
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {sortedSubmissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No submissions yet</p>
          </CardContent>
        </Card>
      ) : (
        sortedSubmissions.map((submission) => {
          const ps = submission as PremiumSongSubmissionAdmin;
          const currentML = submission.monthlyListeners ?? null;
          const currentRev = submission.revenue ?? null;
          const edit = statsEdits[submission.id];
          const mlValue = edit?.monthlyListeners ?? "";
          const revValue = edit?.revenue ?? "";
          const showPremiumFields = hasPremiumFields(
            submission as PremiumSongSubmissionAdmin,
          );

          return (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      {submission.title}
                      {showPremiumFields && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
                          <Crown className="w-3 h-3" />
                          Premium
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {submission.artist} • {submission.genre} •{" "}
                      {submission.language}
                    </p>
                  </div>
                  {getStatusBadge(submission.status)}
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

                {/* ── Premium Fields Section ── */}
                {showPremiumFields && (
                  <div className="space-y-3 pt-4 border-t border-yellow-500/30">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-400" />
                      <p className="text-sm font-semibold text-yellow-300">
                        Premium Fields
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-lg bg-yellow-950/10 border border-yellow-500/20 text-sm">
                      <PremiumFieldDisplay
                        label="Custom C Line"
                        value={ps.customCLine}
                      />
                      <PremiumFieldDisplay
                        label="Custom P Line"
                        value={ps.customPLine}
                      />
                      <PremiumFieldDisplay
                        label="Label"
                        value={ps.premiumLabel}
                      />
                      <PremiumFieldDisplay
                        label="Content Type"
                        value={ps.contentType}
                      />
                      {/* Suno Track Link (show only if AI Generated) */}
                      {ps.contentType === "AI Generated" && (
                        <div className="col-span-2">
                          {ps.sunoTrackLink ? (
                            <div>
                              <span className="font-medium text-yellow-200">
                                Suno Track Link:
                              </span>{" "}
                              <a
                                href={ps.sunoTrackLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-yellow-400 hover:underline inline-flex items-center gap-1"
                              >
                                {ps.sunoTrackLink}{" "}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ) : (
                            <PremiumFieldDisplay
                              label="Suno Track Link"
                              value={undefined}
                            />
                          )}
                        </div>
                      )}
                      {/* Suno Agreement file */}
                      {ps.contentType === "AI Generated" && (
                        <div className="col-span-2">
                          {ps.sunoAgreementFile ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-yellow-200">
                                Commercial Use Suno Agreement:
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs border-yellow-500/40 text-yellow-300 hover:bg-yellow-950/30"
                                onClick={() =>
                                  handleDownloadPremiumFile(
                                    ps.sunoAgreementFile,
                                    ps.sunoAgreementFilename,
                                    "Suno Agreement",
                                  )
                                }
                              >
                                <Download className="w-3 h-3 mr-1" />
                                {ps.sunoAgreementFilename ?? "Download"}
                              </Button>
                            </div>
                          ) : (
                            <PremiumFieldDisplay
                              label="Commercial Use Suno Agreement"
                              value={undefined}
                            />
                          )}
                        </div>
                      )}
                      {/* Licence file */}
                      {ps.contentType === "Licensed Content" && (
                        <div className="col-span-2">
                          {ps.licenceFile ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-yellow-200">
                                Licence:
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs border-yellow-500/40 text-yellow-300 hover:bg-yellow-950/30"
                                onClick={() =>
                                  handleDownloadPremiumFile(
                                    ps.licenceFile,
                                    ps.licenceFilename,
                                    "Licence",
                                  )
                                }
                              >
                                <Download className="w-3 h-3 mr-1" />
                                {ps.licenceFilename ?? "Download"}
                              </Button>
                            </div>
                          ) : (
                            <PremiumFieldDisplay
                              label="Licence"
                              value={undefined}
                            />
                          )}
                        </div>
                      )}
                      <PremiumFieldDisplay
                        label="Content ID"
                        value={
                          ps.contentId !== undefined
                            ? ps.contentId
                              ? "Yes"
                              : "No"
                            : undefined
                        }
                      />
                      <PremiumFieldDisplay
                        label="Caller Tune Start Second"
                        value={
                          ps.callerTuneStartSecond !== undefined
                            ? String(ps.callerTuneStartSecond)
                            : undefined
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Monthly Listeners & Revenue Stats */}
                <div className="space-y-3 pt-4 border-t border-primary/20">
                  <p className="text-sm font-semibold text-primary">
                    📊 Song Stats
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Monthly Listeners
                        {currentML !== null && (
                          <span className="ml-2 text-primary font-semibold">
                            (current: {currentML.toLocaleString()})
                          </span>
                        )}
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder={
                          currentML !== null ? String(currentML) : "Not set"
                        }
                        value={mlValue}
                        onChange={(e) =>
                          setStatsEdits((prev) => ({
                            ...prev,
                            [submission.id]: {
                              monthlyListeners: e.target.value,
                              revenue: prev[submission.id]?.revenue ?? "",
                            },
                          }))
                        }
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Revenue (₹)
                        {currentRev !== null && (
                          <span className="ml-2 text-cyan-400 font-semibold">
                            (current: ₹
                            {currentRev.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                            )
                          </span>
                        )}
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={
                          currentRev !== null ? String(currentRev) : "Not set"
                        }
                        value={revValue}
                        onChange={(e) =>
                          setStatsEdits((prev) => ({
                            ...prev,
                            [submission.id]: {
                              monthlyListeners:
                                prev[submission.id]?.monthlyListeners ?? "",
                              revenue: e.target.value,
                            },
                          }))
                        }
                        className="bg-background"
                      />
                    </div>
                  </div>
                  {(mlValue !== "" || revValue !== "") && (
                    <Button
                      size="sm"
                      onClick={() => handleSaveStats(submission.id)}
                      disabled={savingStats[submission.id]}
                      className="w-full"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {savingStats[submission.id] ? "Saving..." : "Save Stats"}
                    </Button>
                  )}
                </div>

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
                  {downloadingAudio[submission.id] ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="min-w-[140px]"
                    >
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {downloadingAudio[submission.id].total > 0
                        ? `${Math.round((downloadingAudio[submission.id].received / downloadingAudio[submission.id].total) * 100)}%`
                        : "Fetching..."}{" "}
                      {downloadingAudio[submission.id].total > 0 && (
                        <span className="ml-1 text-xs opacity-70">
                          (
                          {(
                            downloadingAudio[submission.id].received / 1048576
                          ).toFixed(1)}{" "}
                          /{" "}
                          {(
                            downloadingAudio[submission.id].total / 1048576
                          ).toFixed(1)}{" "}
                          MB)
                        </span>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadAudio(submission)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Audio
                    </Button>
                  )}
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
          );
        })
      )}

      <AdminEditSubmissionDialog
        submission={editingSubmission as any}
        open={!!editingSubmission}
        onOpenChange={(open) => !open && setEditingSubmission(null)}
      />

      <AdminManageLinksDialog
        song={managingLinksSubmission as any}
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

// ── Small helper to display a premium field label + value ──
function PremiumFieldDisplay({
  label,
  value,
}: {
  label: string;
  value: string | undefined | null;
}) {
  return (
    <div>
      <span className="font-medium text-yellow-200">{label}:</span>{" "}
      {value ? (
        <span className="text-foreground">{value}</span>
      ) : (
        <span className="text-muted-foreground italic">Not provided</span>
      )}
    </div>
  );
}
