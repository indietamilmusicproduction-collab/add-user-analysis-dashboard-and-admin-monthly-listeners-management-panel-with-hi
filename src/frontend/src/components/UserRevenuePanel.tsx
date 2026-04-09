// @ts-nocheck
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
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

export default function UserRevenuePanel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [gpayAccountName, setGpayAccountName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [message, setMessage] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [termsChecked, setTermsChecked] = useState(false);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ["getMySubmissions"],
    queryFn: () => actor!.getMySubmissions(),
    enabled: !!actor,
  });

  const approvedLiveSongs = submissions.filter(
    (s) => s.status === "approved" || s.status === "live",
  );

  const { data: revenues = [], isLoading: revenuesLoading } = useQuery({
    queryKey: ["getSongRevenues", approvedLiveSongs.map((s) => s.id)],
    queryFn: async () => {
      const entries = await Promise.all(
        approvedLiveSongs.map(async (s) => {
          const amt = await actor!.getSongRevenue(s.id);
          return [s.id, amt] as [string, number];
        }),
      );
      return entries;
    },
    enabled: !!actor && approvedLiveSongs.length > 0,
  });

  const { data: withdrawRequests = [], isLoading: withdrawLoading } = useQuery({
    queryKey: ["getMyWithdrawRequests"],
    queryFn: () => actor!.getMyWithdrawRequests(),
    enabled: !!actor,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !qrFile) throw new Error("Missing data");
      const buffer = await qrFile.arrayBuffer();
      const blob = new Uint8Array(buffer);
      return actor.submitWithdrawRequest({
        fullName,
        googlePayAccountName: gpayAccountName,
        upiId,
        message,
        amount: Number.parseFloat(withdrawAmount),
        qrCodeBlob: blob,
        qrCodeFilename: qrFile.name,
      });
    },
    onSuccess: () => {
      toast.success("Withdrawal request submitted successfully!");
      setShowWithdrawForm(false);
      setFullName("");
      setGpayAccountName("");
      setUpiId("");
      setMessage("");
      setWithdrawAmount("");
      setTermsChecked(false);
      setQrFile(null);
      setQrPreviewUrl(null);
      queryClient.invalidateQueries({ queryKey: ["getMyWithdrawRequests"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to submit withdrawal request");
    },
  });

  const revenueMap = Object.fromEntries(revenues);
  const totalRevenue = revenues.reduce((sum, [, amt]) => sum + amt, 0);

  const approvedWithdrawals = withdrawRequests
    .filter((r) => "approved" in r.status)
    .reduce((sum, r) => sum + r.amount, 0);

  const availableBalance = totalRevenue - approvedWithdrawals;

  const hasPendingRequest = withdrawRequests.some((r) => "pending" in r.status);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrFile(file);
    const url = URL.createObjectURL(file);
    setQrPreviewUrl(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrFile) {
      toast.error("Please upload your Google Pay QR code");
      return;
    }
    if (!termsChecked) {
      toast.error("Please agree to the terms and conditions");
      return;
    }
    const amount = Number.parseFloat(withdrawAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid withdrawal amount");
      return;
    }
    if (amount > availableBalance) {
      toast.error(
        `Amount cannot exceed available balance ₹${formatINR(availableBalance)}`,
      );
      return;
    }
    submitMutation.mutate();
  };

  if (submissionsLoading || revenuesLoading || withdrawLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">My Revenue</h2>
        <p className="text-gray-400 text-sm">
          Revenue amounts are set by the admin for your approved and live songs.
        </p>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-cyan-700/40 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 p-6">
          <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-cyan-400">
            ₹{formatINR(totalRevenue)}
          </p>
        </div>
        <div className="rounded-xl border border-purple-700/40 bg-gradient-to-br from-purple-900/30 to-[#0d0d1a] p-6">
          <p className="text-gray-400 text-sm mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-purple-300">
            ₹{formatINR(availableBalance)}
          </p>
          {approvedWithdrawals > 0 && (
            <p className="text-gray-500 text-xs mt-1">
              ₹{formatINR(approvedWithdrawals)} withdrawn
            </p>
          )}
        </div>
      </div>

      {/* Withdraw Button */}
      {availableBalance > 0 && !hasPendingRequest && (
        <Button
          data-ocid="withdrawal.primary_button"
          onClick={() => setShowWithdrawForm(!showWithdrawForm)}
          className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold px-6 py-2 rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.3)]"
        >
          💸 Withdraw Revenue
        </Button>
      )}
      {hasPendingRequest && (
        <div className="rounded-lg bg-amber-900/20 border border-amber-700/40 px-4 py-3">
          <p className="text-amber-400 text-sm">
            ⏳ You have a pending withdrawal request. Wait for admin review
            before submitting a new one.
          </p>
        </div>
      )}

      {/* Withdrawal Form */}
      {showWithdrawForm && (
        <div
          data-ocid="withdrawal.modal"
          className="rounded-xl border border-purple-500/50 bg-gradient-to-br from-[#0d0d1a] to-[#120d24] p-6 shadow-[0_0_30px_rgba(168,85,247,0.15)] space-y-5"
        >
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              Withdrawal Request
            </h3>
            <p className="text-gray-400 text-sm">
              Available:{" "}
              <span className="text-purple-300 font-semibold">
                ₹{formatINR(availableBalance)}
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-gray-300 text-sm">Full Name *</Label>
                <Input
                  data-ocid="withdrawal.input"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="bg-[#0a0a1a] border-purple-700/40 text-white placeholder-gray-600 focus:border-purple-500"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-gray-300 text-sm">
                  Google Pay Account Name *
                </Label>
                <Input
                  data-ocid="withdrawal.input"
                  required
                  value={gpayAccountName}
                  onChange={(e) => setGpayAccountName(e.target.value)}
                  placeholder="GPay account name"
                  className="bg-[#0a0a1a] border-purple-700/40 text-white placeholder-gray-600 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-gray-300 text-sm">UPI ID *</Label>
                <Input
                  data-ocid="withdrawal.input"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="bg-[#0a0a1a] border-cyan-700/40 text-white placeholder-gray-600 font-mono focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-gray-300 text-sm">
                  Withdraw Amount (₹) *
                </Label>
                <Input
                  data-ocid="withdrawal.input"
                  required
                  type="number"
                  min="0.01"
                  max={availableBalance}
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`Max ₹${formatINR(availableBalance)}`}
                  className="bg-[#0a0a1a] border-purple-700/40 text-white placeholder-gray-600 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-gray-300 text-sm">
                Google Pay QR Code *
              </Label>
              <button
                type="button"
                className="w-full rounded-lg border-2 border-dashed border-purple-700/50 bg-[#0a0a1a] p-4 text-center cursor-pointer hover:border-purple-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                data-ocid="withdrawal.dropzone"
              >
                {qrPreviewUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={qrPreviewUrl}
                      alt="QR Preview"
                      className="w-32 h-32 object-contain rounded-lg"
                    />
                    <p className="text-gray-400 text-xs">
                      {qrFile?.name} — click to change
                    </p>
                  </div>
                ) : (
                  <div className="py-4">
                    <p className="text-gray-400 text-sm">
                      📷 Click to upload QR code image
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      JPG, PNG accepted
                    </p>
                  </div>
                )}
              </button>
              <input
                data-ocid="withdrawal.upload_button"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-gray-300 text-sm">
                Message to Admin (optional)
              </Label>
              <Textarea
                data-ocid="withdrawal.textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Any additional information..."
                className="bg-[#0a0a1a] border-purple-700/40 text-white placeholder-gray-600 focus:border-purple-500 resize-none"
                rows={3}
              />
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-purple-900/10 border border-purple-800/30 p-3">
              <Checkbox
                data-ocid="withdrawal.checkbox"
                id="terms"
                checked={termsChecked}
                onCheckedChange={(v) => setTermsChecked(!!v)}
                className="mt-0.5 border-purple-500"
              />
              <Label
                htmlFor="terms"
                className="text-gray-300 text-sm cursor-pointer"
              >
                I agree to the terms and conditions. I confirm that the payment
                details provided are accurate and the withdraw amount does not
                exceed my available balance.
              </Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                data-ocid="withdrawal.submit_button"
                type="submit"
                disabled={submitMutation.isPending || !termsChecked}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold px-6 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
              <Button
                data-ocid="withdrawal.cancel_button"
                type="button"
                variant="outline"
                onClick={() => setShowWithdrawForm(false)}
                className="border-purple-700/40 text-gray-400 hover:bg-purple-900/20"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Songs Table */}
      {approvedLiveSongs.length === 0 ? (
        <div
          data-ocid="revenue.empty_state"
          className="rounded-xl border border-purple-800/40 bg-[#0d0d1a] p-8 text-center"
        >
          <p className="text-gray-400">
            No approved or live songs yet. Submit a song and get it approved to
            see revenue here.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-purple-800/40 bg-[#0d0d1a] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-800/30 bg-purple-900/20">
                <th className="text-left px-4 py-3 text-purple-300 font-semibold">
                  Song Title
                </th>
                <th className="text-left px-4 py-3 text-purple-300 font-semibold">
                  Artist
                </th>
                <th className="text-left px-4 py-3 text-purple-300 font-semibold">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-purple-300 font-semibold">
                  Revenue (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {approvedLiveSongs.map((song) => {
                const revenue = revenueMap[song.id] ?? 0;
                const statusLabel =
                  song.status === "live" ? "Live" : "Approved";
                const statusColor =
                  song.status === "live"
                    ? "bg-green-900/40 text-green-400 border-green-700/40"
                    : "bg-amber-900/40 text-amber-400 border-amber-700/40";
                return (
                  <tr
                    key={song.id}
                    className="border-b border-purple-800/20 hover:bg-purple-900/10 transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">
                      {song.title}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{song.artist}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${statusColor}`}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {revenue === 0 ? (
                        <span className="text-gray-500 italic">Not set</span>
                      ) : (
                        <span className="text-cyan-400 font-semibold">
                          ₹{formatINR(revenue)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Withdrawal History */}
      {withdrawRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Withdrawal History</h3>
          <div className="space-y-3">
            {withdrawRequests.map((req) => {
              const status = getStatusFromRequest(req);
              const date = new Date(Number(req.timestamp / 1_000_000n));
              return (
                <div
                  key={req.id}
                  data-ocid="withdrawal.item.1"
                  className="rounded-xl border border-purple-800/40 bg-gradient-to-br from-[#0d0d1a] to-[#120d24] p-4 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <p className="text-white font-medium">
                      ₹{formatINR(req.amount)}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {date.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    {status === "rejected" && req.rejectionReason && (
                      <p className="text-red-400 text-xs mt-1">
                        Reason: {req.rejectionReason}
                      </p>
                    )}
                  </div>
                  <div>
                    {status === "pending" && (
                      <Badge className="bg-amber-900/40 text-amber-400 border-amber-700/40 border">
                        ⏳ Pending
                      </Badge>
                    )}
                    {status === "approved" && (
                      <Badge className="bg-green-900/40 text-green-400 border-green-700/40 border">
                        ✓ Approved
                      </Badge>
                    )}
                    {status === "rejected" && (
                      <Badge className="bg-red-900/40 text-red-400 border-red-700/40 border">
                        ✕ Rejected
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
