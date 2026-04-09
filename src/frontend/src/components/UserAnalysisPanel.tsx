// @ts-nocheck
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Loader2, Music, TrendingUp, Users } from "lucide-react";
import { useActor } from "../hooks/useActor";
import { useGetMyLiveSongsWithStats } from "../hooks/useQueries";

export default function UserAnalysisPanel() {
  const { actor } = useActor();
  const { data: liveSongs, isLoading } = useGetMyLiveSongsWithStats();

  const songIds = liveSongs?.map((item) => item.song.id) ?? [];

  const { data: statsMap = {} } = useQuery<
    Record<string, { ml: number; rev: number }>
  >({
    queryKey: ["mySongStats", songIds],
    queryFn: async () => {
      if (!actor || songIds.length === 0) return {};
      const entries = await Promise.all(
        songIds.map(async (id) => {
          const [ml, rev] = await Promise.all([
            actor.getSongMonthlyListeners(id),
            actor.getSongRevenue(id),
          ]);
          return [id, { ml, rev }] as [string, { ml: number; rev: number }];
        }),
      );
      return Object.fromEntries(entries);
    },
    enabled: !!actor && songIds.length > 0,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!liveSongs || liveSongs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Music className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg font-medium mb-2">
              No Live Songs Yet
            </p>
            <p className="text-sm text-muted-foreground">
              Your monthly listener stats will appear here once your songs go
              live.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Monthly listener counts and revenue for your live songs, updated by
            the admin team.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {liveSongs.map((item) => {
          const stats = statsMap[item.song.id];
          const ml = stats?.ml ?? 0;
          const rev = stats?.rev ?? 0;

          return (
            <Card key={item.song.id} className="border-2">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      {item.song.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span>{item.song.artist}</span>
                      <span>•</span>
                      <span>{item.song.genre}</span>
                      <span>•</span>
                      <span>{item.song.language}</span>
                    </div>
                  </div>
                  <Badge className="bg-green-600">Live</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Monthly Listeners */}
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center gap-4">
                    <Users className="w-8 h-8 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Monthly Listeners
                      </p>
                      {ml > 0 ? (
                        <p className="text-2xl font-bold text-primary">
                          {ml.toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Not set yet
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 flex items-center gap-4">
                    <span className="text-2xl shrink-0">₹</span>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Revenue
                      </p>
                      {rev > 0 ? (
                        <p className="text-2xl font-bold text-cyan-400">
                          ₹
                          {rev.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Not set yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Legacy monthly history if present */}
                {item.stats && item.stats.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Monthly Listener History
                    </h4>
                    <div className="grid gap-3">
                      {item.stats
                        .sort((a, b) => {
                          if (Number(b.year) !== Number(a.year)) {
                            return Number(b.year) - Number(a.year);
                          }
                          return Number(b.month) - Number(a.month);
                        })
                        .map((stat, index) => {
                          const monthNames = [
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December",
                          ];
                          const monthName =
                            monthNames[Number(stat.month) - 1] || "Unknown";
                          return (
                            <div
                              // biome-ignore lint/suspicious/noArrayIndexKey: stats have no stable id
                              key={index}
                              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-primary" />
                                <div>
                                  <p className="font-medium">
                                    {monthName} {stat.year.toString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">
                                  {stat.value.toString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  listeners
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
