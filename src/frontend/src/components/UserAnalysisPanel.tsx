import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Loader2, Music, TrendingUp } from "lucide-react";
import { useGetMyLiveSongsWithStats } from "../hooks/useQueries";

export default function UserAnalysisPanel() {
  const { data: liveSongs, isLoading } = useGetMyLiveSongsWithStats();

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
            Monthly Listeners Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Track your monthly listener counts for all your live songs. Stats
            are updated by the admin team.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {liveSongs.map((item) => (
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
              {!item.stats || item.stats.length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-lg">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground font-medium">
                    No listener data yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Monthly listener counts will be added by the admin team.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                    Monthly Listener History
                  </h4>
                  <div className="grid gap-3">
                    {item.stats
                      .sort((a, b) => {
                        // Sort by year desc, then month desc (newest first)
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
        ))}
      </div>
    </div>
  );
}
