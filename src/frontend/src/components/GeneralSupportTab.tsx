// @ts-nocheck
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Headphones } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type GeneralSupportRequest,
  type GeneralSupportRequestInput,
  type GeneralSupportRequestType,
  type SongSubmission,
  useGetMySubmissions,
  useGetMySupportRequests,
  useSubmitSupportRequest,
} from "../hooks/useQueries";

type RequestTypeKey =
  | "trackTakedown"
  | "contentIdClaim"
  | "trackNotLiveInMeta"
  | "linkInstagramProfile";

const REQUEST_TYPE_LABELS: Record<RequestTypeKey, string> = {
  trackTakedown: "Track Takedown",
  contentIdClaim: "Content ID Claim",
  trackNotLiveInMeta: "Track Not Live in Meta",
  linkInstagramProfile: "Link Instagram Profile",
};

function getRequestTypeKey(type: GeneralSupportRequestType): RequestTypeKey {
  if ("trackTakedown" in type) return "trackTakedown";
  if ("contentIdClaim" in type) return "contentIdClaim";
  if ("trackNotLiveInMeta" in type) return "trackNotLiveInMeta";
  return "linkInstagramProfile";
}

function getStatusText(
  status: GeneralSupportRequest["status"],
): "pending" | "approved" | "rejected" {
  if ("pending" in status) return "pending";
  if ("approved" in status) return "approved";
  return "rejected";
}

function StatusBadge({
  status,
}: { status: "pending" | "approved" | "rejected" }) {
  if (status === "pending") {
    return (
      <Badge className="bg-amber-900/40 text-amber-400 border border-amber-700/40 capitalize">
        Pending
      </Badge>
    );
  }
  if (status === "approved") {
    return (
      <Badge className="bg-green-900/40 text-green-400 border border-green-700/40 capitalize">
        Approved
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-900/40 text-red-400 border border-red-700/40 capitalize">
      Rejected
    </Badge>
  );
}

function RequestTypeBadge({ typeKey }: { typeKey: RequestTypeKey }) {
  const colors: Record<RequestTypeKey, string> = {
    trackTakedown: "bg-purple-900/40 text-purple-300 border-purple-700/40",
    contentIdClaim: "bg-cyan-900/40 text-cyan-300 border-cyan-700/40",
    trackNotLiveInMeta: "bg-orange-900/40 text-orange-300 border-orange-700/40",
    linkInstagramProfile: "bg-pink-900/40 text-pink-300 border-pink-700/40",
  };
  return (
    <Badge className={`border text-xs ${colors[typeKey]}`}>
      {REQUEST_TYPE_LABELS[typeKey]}
    </Badge>
  );
}

function formatDate(ts: bigint): string {
  try {
    return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function isApprovedOrLive(song: SongSubmission): boolean {
  const s = song.status as any;
  return !!(s && ("approved" in s || "live" in s));
}

export default function GeneralSupportTab() {
  const { data: submissions = [], isLoading: songsLoading } =
    useGetMySubmissions();
  const { data: myRequests = [], isLoading: requestsLoading } =
    useGetMySupportRequests();
  const submitMutation = useSubmitSupportRequest();

  const eligibleSongs = submissions.filter(isApprovedOrLive);

  const [requestType, setRequestType] = useState<RequestTypeKey | "">("");
  const [selectedSongId, setSelectedSongId] = useState("");
  const [reasonForTakedown, setReasonForTakedown] = useState("");
  const [youtubeChannelLink, setYoutubeChannelLink] = useState("");
  const [instagramProfileLink, setInstagramProfileLink] = useState("");

  const selectedSong = eligibleSongs.find((s) => s.id === selectedSongId);

  function resetForm() {
    setRequestType("");
    setSelectedSongId("");
    setReasonForTakedown("");
    setYoutubeChannelLink("");
    setInstagramProfileLink("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!requestType) return toast.error("Please select a request type.");
    if (!selectedSongId || !selectedSong)
      return toast.error("Please select a song.");
    if (requestType === "trackTakedown" && !reasonForTakedown.trim()) {
      return toast.error("Please enter a reason for takedown.");
    }
    if (requestType === "contentIdClaim" && !youtubeChannelLink.trim()) {
      return toast.error("Please enter your YouTube channel link.");
    }
    if (
      requestType === "linkInstagramProfile" &&
      !instagramProfileLink.trim()
    ) {
      return toast.error("Please enter your Instagram profile link.");
    }

    const typeVariant: GeneralSupportRequestType = {
      [requestType]: null,
    } as any;

    const input: GeneralSupportRequestInput = {
      requestType: typeVariant,
      songId: selectedSong.id,
      songTitle: selectedSong.title,
      reasonForTakedown: reasonForTakedown.trim()
        ? [reasonForTakedown.trim()]
        : [],
      youtubeChannelLink: youtubeChannelLink.trim()
        ? [youtubeChannelLink.trim()]
        : [],
      instagramProfileLink: instagramProfileLink.trim()
        ? [instagramProfileLink.trim()]
        : [],
    };

    try {
      await submitMutation.mutateAsync(input);
      toast.success("Support request submitted successfully.");
      resetForm();
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit request.");
    }
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-2">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-900/30 border border-purple-700/40">
          <Headphones className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">General Support</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Submit a support request for your music releases.
          </p>
        </div>
      </div>

      {/* Submit Form */}
      <div
        className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-[#0d0d1a] to-[#130d24] p-6 shadow-[0_0_30px_rgba(124,58,237,0.08)]"
        style={{
          boxShadow:
            "0 0 0 1px rgba(139,92,246,0.15), 0 4px 40px rgba(124,58,237,0.10)",
        }}
      >
        <h3 className="text-lg font-semibold text-white mb-5">
          New Support Request
        </h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Request Type */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm font-medium">
              Request Type <span className="text-red-400">*</span>
            </Label>
            <Select
              value={requestType}
              onValueChange={(v) => {
                setRequestType(v as RequestTypeKey);
              }}
            >
              <SelectTrigger
                data-ocid="support.request_type_select"
                className="bg-[#0a0a1a] border-purple-700/40 text-white focus:ring-purple-500"
              >
                <SelectValue placeholder="Select request type…" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d0d1a] border-purple-700/40 text-white">
                <SelectItem value="trackTakedown">Track Takedown</SelectItem>
                <SelectItem value="contentIdClaim">Content ID Claim</SelectItem>
                <SelectItem value="trackNotLiveInMeta">
                  Track Not Live in Meta
                </SelectItem>
                <SelectItem value="linkInstagramProfile">
                  Link Instagram Profile
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Song Selection */}
          <div className="space-y-2">
            <Label className="text-gray-300 text-sm font-medium">
              Song <span className="text-red-400">*</span>
            </Label>
            {songsLoading ? (
              <Skeleton className="h-10 w-full rounded-md bg-purple-900/20" />
            ) : eligibleSongs.length === 0 ? (
              <p className="text-amber-400 text-sm py-2 px-3 rounded-lg bg-amber-900/10 border border-amber-700/30">
                No approved or live songs found. Songs must be approved or live
                to submit a support request.
              </p>
            ) : (
              <Select value={selectedSongId} onValueChange={setSelectedSongId}>
                <SelectTrigger
                  data-ocid="support.song_select"
                  className="bg-[#0a0a1a] border-purple-700/40 text-white focus:ring-purple-500"
                >
                  <SelectValue placeholder="Select a song…" />
                </SelectTrigger>
                <SelectContent className="bg-[#0d0d1a] border-purple-700/40 text-white max-h-60 overflow-y-auto">
                  {eligibleSongs.map((song) => (
                    <SelectItem key={song.id} value={song.id}>
                      {song.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Dynamic fields */}
          {requestType === "trackTakedown" && (
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm font-medium">
                Reason for Takedown <span className="text-red-400">*</span>
              </Label>
              <Textarea
                data-ocid="support.reason_input"
                value={reasonForTakedown}
                onChange={(e) => setReasonForTakedown(e.target.value)}
                placeholder="Describe the reason for the takedown request…"
                className="bg-[#0a0a1a] border-purple-700/40 text-white placeholder-gray-600 resize-none min-h-[90px]"
              />
            </div>
          )}

          {requestType === "contentIdClaim" && (
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm font-medium">
                YouTube Channel Link <span className="text-red-400">*</span>
              </Label>
              <Input
                data-ocid="support.youtube_input"
                type="url"
                value={youtubeChannelLink}
                onChange={(e) => setYoutubeChannelLink(e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
                className="bg-[#0a0a1a] border-purple-700/40 text-white placeholder-gray-600"
              />
            </div>
          )}

          {requestType === "linkInstagramProfile" && (
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm font-medium">
                Instagram Profile Link <span className="text-red-400">*</span>
              </Label>
              <Input
                data-ocid="support.instagram_input"
                type="url"
                value={instagramProfileLink}
                onChange={(e) => setInstagramProfileLink(e.target.value)}
                placeholder="https://instagram.com/yourprofile"
                className="bg-[#0a0a1a] border-purple-700/40 text-white placeholder-gray-600"
              />
            </div>
          )}

          <Button
            data-ocid="support.submit_button"
            type="submit"
            disabled={
              submitMutation.isPending ||
              !requestType ||
              !selectedSongId ||
              eligibleSongs.length === 0
            }
            className="w-full bg-purple-700 hover:bg-purple-600 text-white font-semibold transition-all"
          >
            {submitMutation.isPending ? "Submitting…" : "Submit Request"}
          </Button>
        </form>
      </div>

      {/* My Requests */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">My Requests</h3>

        {requestsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton
                key={i}
                className="h-28 w-full rounded-xl bg-purple-900/20"
              />
            ))}
          </div>
        ) : myRequests.length === 0 ? (
          <div
            data-ocid="support.empty_state"
            className="rounded-xl border border-purple-800/30 bg-[#0d0d1a] p-8 text-center"
          >
            <p className="text-gray-500 text-sm">
              No support requests submitted yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...myRequests].reverse().map((req) => {
              const typeKey = getRequestTypeKey(req.requestType);
              const statusText = getStatusText(req.status);
              const reason = req.reasonForTakedown?.[0];
              const ytLink = req.youtubeChannelLink?.[0];
              const igLink = req.instagramProfileLink?.[0];
              const rejReason = req.rejectionReason?.[0];

              return (
                <div
                  key={req.id}
                  data-ocid="support.request_item"
                  className="rounded-xl border border-purple-800/30 bg-gradient-to-br from-[#0d0d1a] to-[#110d20] p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1.5">
                      <RequestTypeBadge typeKey={typeKey} />
                      <p className="text-white font-medium">{req.songTitle}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={statusText} />
                      <span className="text-gray-500 text-xs">
                        {formatDate(req.submittedAt)}
                      </span>
                    </div>
                  </div>

                  {(reason || ytLink || igLink) && (
                    <div className="rounded-lg bg-purple-900/15 border border-purple-800/20 p-3 space-y-1">
                      {reason && (
                        <p className="text-gray-400 text-sm">
                          <span className="text-gray-500 text-xs uppercase mr-1">
                            Reason:
                          </span>
                          {reason}
                        </p>
                      )}
                      {ytLink && (
                        <p className="text-gray-400 text-sm">
                          <span className="text-gray-500 text-xs uppercase mr-1">
                            YouTube:
                          </span>
                          <a
                            href={ytLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:underline break-all"
                          >
                            {ytLink}
                          </a>
                        </p>
                      )}
                      {igLink && (
                        <p className="text-gray-400 text-sm">
                          <span className="text-gray-500 text-xs uppercase mr-1">
                            Instagram:
                          </span>
                          <a
                            href={igLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-400 hover:underline break-all"
                          >
                            {igLink}
                          </a>
                        </p>
                      )}
                    </div>
                  )}

                  {statusText === "rejected" && rejReason && (
                    <div className="rounded-lg bg-red-900/15 border border-red-700/25 p-3">
                      <p className="text-red-400 text-xs uppercase tracking-wide mb-1">
                        Rejection Reason
                      </p>
                      <p className="text-red-300 text-sm">{rejReason}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
