// @ts-nocheck
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import type { WithdrawRequest } from "../backend";
import { useActor } from "../hooks/useActor";

function formatINR(amount: number) {
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getStatusFromRequest(
  req: WithdrawRequest,
): "pending" | "approved" | "rejected" {
  if ("pending" in req.status) return "pending";
  if ("approved" in req.status) return "approved";
  return "rejected";
}

function QRCodeImage({ blob }: { blob: Uint8Array }) {
  const url = URL.createObjectURL(
    new Blob([new Uint8Array(blob)], { type: "image/png" }),
  );
  return (
    <img
      src={url}
      alt="Google Pay QR Code"
      className="w-24 h-24 object-contain rounded-lg border border-purple-700/50 bg-[#0a0a1a]"
      onLoad={() => URL.revokeObjectURL(url)}
    />
  );
}

function RequestCard({
  req,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: {
  req: WithdrawRequest;
  onApprove?: () => void;
  onReject?: (reason: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const status = getStatusFromRequest(req);
  const date = new Date(Number(req.timestamp / 1_000_000n));

  return (
    <div
      data-ocid="withdrawal.item.1"
      className="rounded-xl border border-purple-800/40 bg-gradient-to-br from-[#0d0d1a] to-[#120d24] p-5 space-y-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-white font-semibold text-lg">{req.fullName}</p>
          <p className="text-gray-400 text-sm">{req.googlePayAccountName}</p>
          <p className="text-cyan-400 text-sm font-mono">{req.upiId}</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-2xl font-bold text-cyan-400">
            ₹{formatINR(req.amount)}
          </p>
          <p className="text-gray-500 text-xs">
            {date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
          {status === "rejected" && (
            <Badge className="bg-red-900/40 text-red-400 border-red-700/40 border">
              Rejected
            </Badge>
          )}
          {status === "approved" && (
            <Badge className="bg-green-900/40 text-green-400 border-green-700/40 border">
              Approved
            </Badge>
          )}
          {status === "pending" && (
            <Badge className="bg-amber-900/40 text-amber-400 border-amber-700/40 border">
              Pending
            </Badge>
          )}
        </div>
      </div>

      <div className="flex gap-4 items-start">
        <QRCodeImage blob={req.qrCodeBlob} />
        <div className="flex-1 space-y-2">
          {req.message && (
            <div className="rounded-lg bg-purple-900/20 border border-purple-800/30 p-3">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                Message
              </p>
              <p className="text-gray-300 text-sm">{req.message}</p>
            </div>
          )}
          {status === "rejected" && req.rejectionReason && (
            <div className="rounded-lg bg-red-900/20 border border-red-700/30 p-3">
              <p className="text-red-400 text-xs uppercase tracking-wide mb-1">
                Rejection Reason
              </p>
              <p className="text-red-300 text-sm">{req.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>

      {status === "pending" && onApprove && onReject && (
        <div className="space-y-3 pt-2 border-t border-purple-800/20">
          {!showRejectInput ? (
            <div className="flex gap-3">
              <Button
                data-ocid="withdrawal.confirm_button"
                size="sm"
                className="bg-green-600 hover:bg-green-500 text-white"
                onClick={onApprove}
                disabled={isApproving || isRejecting}
              >
                {isApproving ? "Approving..." : "✓ Approve"}
              </Button>
              <Button
                data-ocid="withdrawal.delete_button"
                size="sm"
                variant="outline"
                className="border-red-700/50 text-red-400 hover:bg-red-900/20"
                onClick={() => setShowRejectInput(true)}
                disabled={isApproving || isRejecting}
              >
                ✕ Reject
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                data-ocid="withdrawal.input"
                placeholder="Rejection reason (optional)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="bg-[#0a0a1a] border-red-700/40 text-white placeholder-gray-600"
              />
              <div className="flex gap-2">
                <Button
                  data-ocid="withdrawal.cancel_button"
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
                  data-ocid="withdrawal.submit_button"
                  size="sm"
                  className="bg-red-700 hover:bg-red-600 text-white"
                  onClick={() => onReject(rejectReason)}
                  disabled={isRejecting}
                >
                  {isRejecting ? "Rejecting..." : "Confirm Reject"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminWithdrawalRequestsManagement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["getAllWithdrawRequestsForAdmin"],
    queryFn: () => actor!.getAllWithdrawRequestsForAdmin(),
    enabled: !!actor,
  });

  const approveMutation = useMutation({
    mutationFn: (requestId: string) => actor!.approveWithdrawRequest(requestId),
    onSuccess: () => {
      toast.success("Withdrawal request approved");
      queryClient.invalidateQueries({
        queryKey: ["getAllWithdrawRequestsForAdmin"],
      });
    },
    onError: () => toast.error("Failed to approve request"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({
      requestId,
      reason,
    }: { requestId: string; reason: string }) =>
      actor!.rejectWithdrawRequest(requestId, reason),
    onSuccess: () => {
      toast.success("Withdrawal request rejected");
      queryClient.invalidateQueries({
        queryKey: ["getAllWithdrawRequestsForAdmin"],
      });
    },
    onError: () => toast.error("Failed to reject request"),
  });

  const pending = requests.filter((r) => "pending" in r.status);
  const approved = requests.filter((r) => "approved" in r.status);
  const rejected = requests.filter((r) => "rejected" in r.status);

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
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">
          Withdrawal Requests
        </h2>
        <p className="text-gray-400 text-sm">
          Review and process user revenue withdrawal requests.
        </p>
      </div>

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

      <Tabs defaultValue="pending" data-ocid="withdrawal.tab">
        <TabsList className="bg-[#0d0d1a] border border-purple-800/40">
          <TabsTrigger value="pending" data-ocid="withdrawal.tab">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved" data-ocid="withdrawal.tab">
            Approved ({approved.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" data-ocid="withdrawal.tab">
            Rejected ({rejected.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {pending.length === 0 ? (
            <div
              data-ocid="withdrawal.empty_state"
              className="rounded-xl border border-purple-800/40 bg-[#0d0d1a] p-8 text-center"
            >
              <p className="text-gray-400">No pending withdrawal requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((req) => (
                <RequestCard
                  key={req.id}
                  req={req}
                  onApprove={() => approveMutation.mutate(req.id)}
                  onReject={(reason) =>
                    rejectMutation.mutate({ requestId: req.id, reason })
                  }
                  isApproving={approveMutation.isPending}
                  isRejecting={rejectMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          {approved.length === 0 ? (
            <div
              data-ocid="withdrawal.empty_state"
              className="rounded-xl border border-purple-800/40 bg-[#0d0d1a] p-8 text-center"
            >
              <p className="text-gray-400">
                No approved withdrawal requests yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {approved.map((req) => (
                <RequestCard key={req.id} req={req} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          {rejected.length === 0 ? (
            <div
              data-ocid="withdrawal.empty_state"
              className="rounded-xl border border-purple-800/40 bg-[#0d0d1a] p-8 text-center"
            >
              <p className="text-gray-400">
                No rejected withdrawal requests yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rejected.map((req) => (
                <RequestCard key={req.id} req={req} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
