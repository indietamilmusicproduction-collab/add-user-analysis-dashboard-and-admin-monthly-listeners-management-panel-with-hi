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
import { Calendar, Loader2, Music, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useGetLiveSongsForAnalysis,
  useGetSongMonthlyListenerStats,
  useUpdateMonthlyListenerStats,
} from "../hooks/useQueries";

interface ListenerEntry {
  month: number;
  year: number;
  value: number;
}

interface MonthlyListenerStat {
  month: number;
  year: number;
  value: number;
}

export default function AdminMonthlyListenersManagement() {
  const { data: liveSongs, isLoading } = useGetLiveSongsForAnalysis();
  const updateStats = useUpdateMonthlyListenerStats();
  const getStats = useGetSongMonthlyListenerStats();

  const [selectedSongId, setSelectedSongId] = useState<string>("");
  const [entries, setEntries] = useState<ListenerEntry[]>([]);
  const [existingStats, setExistingStats] = useState<MonthlyListenerStat[]>([]);

  const selectedSong = liveSongs?.find((s) => s.id === selectedSongId);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  // Fetch existing stats when song is selected
  // biome-ignore lint/correctness/useExhaustiveDependencies: getStats.mutate is stable
  useEffect(() => {
    if (selectedSongId) {
      getStats.mutate(selectedSongId, {
        onSuccess: (stats: MonthlyListenerStat[]) => {
          setExistingStats(stats ?? []);
        },
      });
    } else {
      setExistingStats([]);
    }
  }, [selectedSongId]);

  const addEntry = () => {
    setEntries([...entries, { month: 1, year: currentYear, value: 0 }]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (
    index: number,
    field: keyof ListenerEntry,
    value: number,
  ) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  };

  const handleSave = async () => {
    if (!selectedSongId) {
      toast.error("Please select a song");
      return;
    }

    if (entries.length === 0) {
      toast.error("Please add at least one listener entry");
      return;
    }

    // Validate entries
    for (const entry of entries) {
      if (entry.value < 0) {
        toast.error("Listener count cannot be negative");
        return;
      }
    }

    try {
      await updateStats.mutateAsync({
        songId: selectedSongId,
        stats: entries.map((e) => ({
          month: e.month,
          year: e.year,
          value: e.value,
        })),
      });
      setEntries([]);
      // Refresh existing stats
      getStats.mutate(selectedSongId, {
        onSuccess: (stats: MonthlyListenerStat[]) => {
          setExistingStats(stats ?? []);
        },
      });
      toast.success("Monthly listener stats saved successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save stats");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading live songs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!liveSongs || liveSongs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Listeners Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Music className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg font-medium mb-2">
              No Live Songs Available
            </p>
            <p className="text-sm text-muted-foreground">
              Monthly listener stats can only be added for songs with Live
              status.
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
          <CardTitle>Monthly Listeners Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Select Live Song</Label>
            <Select value={selectedSongId} onValueChange={setSelectedSongId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a live song..." />
              </SelectTrigger>
              <SelectContent>
                {liveSongs.map((song) => (
                  <SelectItem key={song.id} value={song.id}>
                    {song.title} - {song.artist}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSong && (
            <Card className="border-2 bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedSong.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedSong.artist} • {selectedSong.genre}
                    </p>
                  </div>
                  <Badge className="bg-green-600">Live</Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">
                      Add Monthly Listener Stats
                    </h4>
                    <Button size="sm" onClick={addEntry} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Entry
                    </Button>
                  </div>

                  {entries.length === 0 ? (
                    <div className="text-center py-8 bg-background rounded-lg border-2 border-dashed">
                      <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">
                        No entries yet. Click "Add Entry" to start.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {entries.map((entry, index) => (
                        <div
                          // biome-ignore lint/suspicious/noArrayIndexKey: entries have no stable id
                          key={index}
                          className="flex gap-3 items-end p-4 bg-background rounded-lg border"
                        >
                          <div className="flex-1 grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <Label className="text-xs">Month</Label>
                              <Select
                                value={entry.month.toString()}
                                onValueChange={(value) =>
                                  updateEntry(
                                    index,
                                    "month",
                                    Number.parseInt(value),
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {months.map((m) => (
                                    <SelectItem
                                      key={m.value}
                                      value={m.value.toString()}
                                    >
                                      {m.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Year</Label>
                              <Select
                                value={entry.year.toString()}
                                onValueChange={(value) =>
                                  updateEntry(
                                    index,
                                    "year",
                                    Number.parseInt(value),
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {years.map((y) => (
                                    <SelectItem key={y} value={y.toString()}>
                                      {y}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Listeners</Label>
                              <Input
                                type="number"
                                min="0"
                                value={entry.value}
                                onChange={(e) =>
                                  updateEntry(
                                    index,
                                    "value",
                                    Number.parseInt(e.target.value) || 0,
                                  )
                                }
                                placeholder="0"
                              />
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => removeEntry(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {entries.length > 0 && (
                    <Button
                      onClick={handleSave}
                      disabled={updateStats.isPending}
                      className="w-full"
                    >
                      {updateStats.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Monthly Listener Stats
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {selectedSong && existingStats && existingStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Existing Listener History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {existingStats
                .sort((a, b) => {
                  if (b.year !== a.year) {
                    return b.year - a.year;
                  }
                  return b.month - a.month;
                })
                .map((stat, index) => {
                  const monthName =
                    months.find((m) => m.value === stat.month)?.label ||
                    "Unknown";
                  return (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: stats have no stable id
                      key={index}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-primary" />
                        <p className="font-medium">
                          {monthName} {stat.year}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-primary">
                        {stat.value} listeners
                      </p>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
