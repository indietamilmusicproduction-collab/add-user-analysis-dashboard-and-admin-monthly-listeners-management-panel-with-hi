// @ts-nocheck
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

export default function AdminRevenueManagement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const { data: liveSongs = [], isLoading: songsLoading } = useQuery({
    queryKey: ["getLiveSongsForAdmin"],
    queryFn: () => actor!.getLiveSongsForAdmin(),
    enabled: !!actor,
  });

  const { data: revenues = [], isLoading: revenuesLoading } = useQuery({
    queryKey: ["getAllSongRevenues"],
    queryFn: () => actor!.getAllSongRevenues(),
    enabled: !!actor,
  });

  const revenueMap = Object.fromEntries(revenues);

  const { mutate: setRevenue, isPending } = useMutation({
    mutationFn: ({ songId, amount }: { songId: string; amount: number }) =>
      actor!.setSongRevenue(songId, amount),
    onSuccess: (_data, { songId }) => {
      queryClient.invalidateQueries({ queryKey: ["getAllSongRevenues"] });
      toast.success("Revenue updated successfully");
      setAmounts((prev) => {
        const next = { ...prev };
        delete next[songId];
        return next;
      });
    },
    onError: () => toast.error("Failed to update revenue"),
  });

  const approvedLiveSongs = liveSongs.filter(
    (s) => s.status === "approved" || s.status === "live",
  );

  if (songsLoading || revenuesLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">
          Revenue Management
        </h2>
        <p className="text-gray-400 text-sm">
          Set or update revenue amounts for approved and live songs. Users can
          view their revenue in their dashboard.
        </p>
      </div>

      {approvedLiveSongs.length === 0 ? (
        <div className="rounded-xl border border-purple-800/40 bg-[#0d0d1a] p-8 text-center">
          <p className="text-gray-400">No approved or live songs found.</p>
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
                  Current Revenue (₹)
                </th>
                <th className="text-left px-4 py-3 text-purple-300 font-semibold">
                  Set Revenue (₹)
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {approvedLiveSongs.map((song) => {
                const current = revenueMap[song.id] ?? 0;
                const inputVal = amounts[song.id] ?? "";
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
                    <td className="px-4 py-3 text-cyan-400 font-semibold">
                      ₹
                      {current.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={inputVal}
                        onChange={(e) =>
                          setAmounts((prev) => ({
                            ...prev,
                            [song.id]: e.target.value,
                          }))
                        }
                        placeholder={String(current)}
                        className="w-32 px-3 py-1.5 bg-[#1a1a2e] border border-purple-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={!inputVal || isPending}
                        onClick={() => {
                          const parsed = Number.parseFloat(inputVal);
                          if (!Number.isNaN(parsed) && parsed >= 0) {
                            setRevenue({ songId: song.id, amount: parsed });
                          } else {
                            toast.error("Enter a valid positive amount");
                          }
                        }}
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg font-medium transition-colors"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
