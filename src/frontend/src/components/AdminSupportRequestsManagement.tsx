// @ts-nocheck
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Headphones } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type GeneralSupportRequest,
  type GeneralSupportRequestType,
  useApproveSupportRequest,
  useGetAllSupportRequestsForAdmin,
  useRejectSupportRequest,
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

const ALL_TYPES = "all";

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

function formatDate(ts: bigint): string {
  try {
    return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function StatusBadge({
  status,
}: { status: "pending" | "approved" | "rejected" }) {
  if (status === "pending") {
    return (
      <Badge className="bg-amber-900/40 text-amber-400 border border-amber-700/40">
        Pending
      </Badge>
    );
  }
  if (status === "approved") {
    return (
      <Badge className="bg-green-900/40 text-green-400 border border-green-700/40">
        Approved
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-900/40 text-red-400 border border-red-700/40">
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

function RequestCard({ req }: { req: GeneralSupportRequest }) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const approveMutation = useApproveSupportRequest();
  const rejectMutation = useRejectSupportRequest();

  const typeKey = getRequestTypeKey(req.requestType);
  const statusText = getStatusText(req.status);
  const reason = req.reasonForTakedown?.[0];
  const ytLink = req.youtubeChannelLink?.[0];
  const igLink = req.instagramProfileLink?.[0];
  const rejReason = req.rejectionReason?.[0];
  const submitterId =
    typeof req.submitter === "object" && "toText" in req.submitter
      ? req.submitter.toText()
      : String(req.submitter);

  async function handleApprove() {
    try {
      await approveMutation.mutateAsync(req.id);
      toast.success("Request approved.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to approve.");
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      return toast.error("Please enter a rejection reason.");
    }
    try {
      await rejectMutation.mutateAsync({
        requestId: req.id,
        reason: rejectReason.trim(),
      });
      toast.success("Request rejected.");
      setShowRejectInput(false);
      setRejectReason("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to reject.");
    }
  }

  return (
    <div
      data-ocid="admin.support.request_item"
      className="rounded-xl border border-purple-800/35 bg-gradient-to-br from-[#0d0d1a] to-[#120d24] p-5 space-y-4"
    >
      {/* Top row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 items-center">
            <RequestTypeBadge typeKey={typeKey} />
            <StatusBadge status={statusText} />
          </div>
          <p className="text-white font-semibold">{req.songTitle}</p>
          <p className="text-gray-500 text-xs font-mono break-all">
            User: <span className="text-cyan-400">{submitterId}</span>
          </p>
        </div>
        <p className="text-gray-500 text-xs whitespace-nowrap">
          {formatDate(req.submittedAt)}
        </p>
      </div>

      {/* Field values */}
      {(reason || ytLink || igLink) && (
        <div className="rounded-lg bg-[#0a0a18] border border-purple-900/30 p-3 space-y-1.5">
          {reason && (
            <div>
              <span className="text-gray-500 text-xs uppercase tracking-wide block mb-0.5">
                Reason for Takedown
              </span>
              <p className="text-gray-300 text-sm">{reason}</p>
            </div>
          )}
          {ytLink && (
            <div>
              <span className="text-gray-500 text-xs uppercase tracking-wide block mb-0.5">
                YouTube Channel
              </span>
              <a
                href={ytLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 text-sm hover:underline break-all"
              >
                {ytLink}
              </a>
            </div>
          )}
          {igLink && (
            <div>
              <span className="text-gray-500 text-xs uppercase tracking-wide block mb-0.5">
                Instagram Profile
              </span>
              <a
                href={igLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 text-sm hover:underline break-all"
              >
                {igLink}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Rejection reason (if already rejected) */}
      {statusText === "rejected" && rejReason && (
        <div className="rounded-lg bg-red-900/15 border border-red-700/25 p-3">
          <p className="text-red-400 text-xs uppercase tracking-wide mb-1">
            Rejection Reason
          </p>
          <p className="text-red-300 text-sm">{rejReason}</p>
        </div>
      )}

      {/* Action buttons — pending only */}
      {statusText === "pending" && (
        <div className="pt-2 border-t border-purple-800/20 space-y-3">
          {!showRejectInput ? (
            <div className="flex gap-3">
              <Button
                data-ocid="admin.support.approve_button"
                size="sm"
                className="bg-green-700 hover:bg-green-600 text-white"
                onClick={handleApprove}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                {approveMutation.isPending ? "Approving…" : "✓ Approve"}
              </Button>
              <Button
                data-ocid="admin.support.reject_button"
                size="sm"
                variant="outline"
                className="border-red-700/50 text-red-400 hover:bg-red-900/20"
                onClick={() => setShowRejectInput(true)}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                ✕ Reject
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                data-ocid="admin.support.reject_reason_input"
                placeholder="Rejection reason (required)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="bg-[#0a0a1a] border-red-700/40 text-white placeholder-gray-600"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-purple-700/40 text-gray-400"
                  onClick={() => {
                    setShowRejectInput(false);
                    setRejectReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="admin.support.confirm_reject_button"
                  size="sm"
                  className="bg-red-700 hover:bg-red-600 text-white"
                  onClick={handleReject}
                  disabled={rejectMutation.isPending || !rejectReason.trim()}
                >
                  {rejectMutation.isPending ? "Rejecting…" : "Confirm Reject"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminSupportRequestsManagement() {
  const { data: requests = [], isLoading } = useGetAllSupportRequestsForAdmin();
  const [typeFilter, setTypeFilter] = useState<
    RequestTypeKey | typeof ALL_TYPES
  >(ALL_TYPES);

  const pending = requests.filter((r) => getStatusText(r.status) === "pending");
  const approved = requests.filter(
    (r) => getStatusText(r.status) === "approved",
  );
  const rejected = requests.filter(
    (r) => getStatusText(r.status) === "rejected",
  );

  function applyTypeFilter(list: GeneralSupportRequest[]) {
    if (typeFilter === ALL_TYPES) return list;
    return list.filter((r) => getRequestTypeKey(r.requestType) === typeFilter);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            className="h-40 w-full rounded-xl bg-purple-900/20"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-900/30 border border-purple-700/40">
            <Headphones className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Support Requests</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage user support requests across all types.
            </p>
          </div>
        </div>

        {/* Type Filter */}
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as any)}
        >
          <SelectTrigger
            data-ocid="admin.support.type_filter"
            className="w-56 bg-[#0d0d1a] border-purple-700/40 text-white"
          >
            <SelectValue placeholder="Filter by type…" />
          </SelectTrigger>
          <SelectContent className="bg-[#0d0d1a] border-purple-700/40 text-white">
            <SelectItem value={ALL_TYPES}>All Types</SelectItem>
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

      {/* Summary counts */}
      <div className="flex gap-3 flex-wrap">
        <div className="rounded-lg bg-amber-900/20 border border-amber-700/40 px-4 py-2">
          <span className="text-amber-400 font-bold text-lg">
            {pending.length}
          </span>
          <span className="text-gray-400 text-sm ml-2">Pending</span>
        </div>
        <div className="rounded-lg bg-green-900/20 border border-green-700/40 px-4 py-2">
          <span className="text-green-400 font-bold text-lg">
            {approved.length}
          </span>
          <span className="text-gray-400 text-sm ml-2">Approved</span>
        </div>
        <div className="rounded-lg bg-red-900/20 border border-red-700/40 px-4 py-2">
          <span className="text-red-400 font-bold text-lg">
            {rejected.length}
          </span>
          <span className="text-gray-400 text-sm ml-2">Rejected</span>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs defaultValue="pending" data-ocid="admin.support.status_tabs">
        <TabsList className="bg-[#0d0d1a] border border-purple-800/40">
          <TabsTrigger value="pending" data-ocid="admin.support.tab_pending">
            Pending ({applyTypeFilter(pending).length})
          </TabsTrigger>
          <TabsTrigger value="approved" data-ocid="admin.support.tab_approved">
            Approved ({applyTypeFilter(approved).length})
          </TabsTrigger>
          <TabsTrigger value="rejected" data-ocid="admin.support.tab_rejected">
            Rejected ({applyTypeFilter(rejected).length})
          </TabsTrigger>
          <TabsTrigger value="all" data-ocid="admin.support.tab_all">
            All ({applyTypeFilter(requests).length})
          </TabsTrigger>
        </TabsList>

        {(["pending", "approved", "rejected", "all"] as const).map((tab) => {
          let list: GeneralSupportRequest[];
          if (tab === "all") list = requests;
          else if (tab === "pending") list = pending;
          else if (tab === "approved") list = approved;
          else list = rejected;
          const filtered = applyTypeFilter(list);

          return (
            <TabsContent key={tab} value={tab} className="mt-4">
              {filtered.length === 0 ? (
                <div
                  data-ocid="admin.support.empty_state"
                  className="rounded-xl border border-purple-800/30 bg-[#0d0d1a] p-8 text-center"
                >
                  <p className="text-gray-500 text-sm">
                    No {tab === "all" ? "" : tab} support requests found.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map((req) => (
                    <RequestCard key={req.id} req={req} />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
