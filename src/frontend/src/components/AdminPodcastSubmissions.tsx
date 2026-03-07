import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Download, Loader2, Radio } from "lucide-react";
import { useState } from "react";
import {
  PodcastEpisode,
  type PodcastModerationStatus,
  PodcastShow,
} from "../backend";
import {
  useApproveEpisode,
  useApprovePodcast,
  useGetAllEpisodes,
  useGetAllPodcasts,
  useMarkEpisodeLive,
  useMarkPodcastLive,
  useRejectEpisode,
  useRejectPodcast,
} from "../hooks/useQueries";
import { downloadExternalBlob } from "../utils/downloadExternalBlob";

export default function AdminPodcastSubmissions() {
  const [liveLinkInput, setLiveLinkInput] = useState<{ [key: string]: string }>(
    {},
  );

  const { data: shows = [], isLoading: showsLoading } = useGetAllPodcasts();
  const { data: episodes = [], isLoading: episodesLoading } =
    useGetAllEpisodes();

  const approvePodcast = useApprovePodcast();
  const rejectPodcast = useRejectPodcast();
  const markPodcastLive = useMarkPodcastLive();
  const approveEpisode = useApproveEpisode();
  const rejectEpisode = useRejectEpisode();
  const markEpisodeLive = useMarkEpisodeLive();

  const getStatusBadge = (status: PodcastModerationStatus) => {
    const statusMap = {
      pending: { label: "Pending", variant: "secondary" as const },
      approved: { label: "Approved", variant: "default" as const },
      rejected: { label: "Rejected", variant: "destructive" as const },
      live: { label: "Live", variant: "default" as const },
    };

    const statusKey = Object.keys(status)[0] as keyof typeof statusMap;
    const { label, variant } = statusMap[statusKey] || {
      label: "Unknown",
      variant: "secondary" as const,
    };

    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleShowStatusChange = async (showId: string, newStatus: string) => {
    try {
      if (newStatus === "approved") {
        await approvePodcast.mutateAsync(showId);
      } else if (newStatus === "rejected") {
        await rejectPodcast.mutateAsync(showId);
      } else if (newStatus === "live") {
        const liveLink = liveLinkInput[showId];
        if (!liveLink) {
          alert("Please enter a live link");
          return;
        }
        await markPodcastLive.mutateAsync({ id: showId, liveLink });
        setLiveLinkInput((prev) => ({ ...prev, [showId]: "" }));
      }
    } catch (error) {
      console.error("Failed to update show status:", error);
    }
  };

  const handleEpisodeStatusChange = async (
    episodeId: string,
    newStatus: string,
  ) => {
    try {
      if (newStatus === "approved") {
        await approveEpisode.mutateAsync(episodeId);
      } else if (newStatus === "rejected") {
        await rejectEpisode.mutateAsync(episodeId);
      } else if (newStatus === "live") {
        await markEpisodeLive.mutateAsync(episodeId);
      }
    } catch (error) {
      console.error("Failed to update episode status:", error);
    }
  };

  const handleDownload = async (blob: any, filename: string) => {
    try {
      await downloadExternalBlob(blob, filename);
    } catch (error) {
      console.error("Failed to download file:", error);
    }
  };

  const getEpisodesForShow = (showId: string) => {
    return episodes.filter((ep) => ep.showId === showId);
  };

  if (showsLoading || episodesLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Podcast Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {shows.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No podcast submissions yet.
            </p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {shows.map((show) => {
                const showEpisodes = getEpisodesForShow(show.id);
                return (
                  <AccordionItem key={show.id} value={show.id}>
                    <AccordionTrigger>
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <Radio className="h-5 w-5" />
                          <span className="font-medium">{show.title}</span>
                        </div>
                        {getStatusBadge(show.moderationStatus)}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Type:</span>{" "}
                            {Object.keys(show.podcastType)[0]}
                          </div>
                          <div>
                            <span className="font-medium">Category:</span>{" "}
                            {Object.keys(show.category)[0]}
                          </div>
                          <div>
                            <span className="font-medium">Language:</span>{" "}
                            {Object.keys(show.language)[0]}
                          </div>
                          <div>
                            <span className="font-medium">Created:</span>{" "}
                            {new Date(
                              Number(show.timestamp / BigInt(1000000)),
                            ).toLocaleDateString()}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">
                            {show.description}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleDownload(
                                show.artwork,
                                `${show.title}-artwork.jpg`,
                              )
                            }
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download Artwork
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label>Update Status</Label>
                          <div className="flex gap-2">
                            <Select
                              onValueChange={(value) =>
                                handleShowStatusChange(show.id, value)
                              }
                              value={Object.keys(show.moderationStatus)[0]}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">
                                  Approved
                                </SelectItem>
                                <SelectItem value="rejected">
                                  Rejected
                                </SelectItem>
                                <SelectItem value="live">Live</SelectItem>
                              </SelectContent>
                            </Select>
                            {Object.keys(show.moderationStatus)[0] !==
                              "live" && (
                              <Input
                                placeholder="Live link (for Live status)"
                                value={liveLinkInput[show.id] || ""}
                                onChange={(e) =>
                                  setLiveLinkInput((prev) => ({
                                    ...prev,
                                    [show.id]: e.target.value,
                                  }))
                                }
                                className="flex-1"
                              />
                            )}
                          </div>
                        </div>

                        {showEpisodes.length > 0 && (
                          <div className="mt-6 border-t pt-4">
                            <h4 className="font-medium mb-3">
                              Episodes ({showEpisodes.length})
                            </h4>
                            <div className="space-y-3">
                              {showEpisodes.map((episode) => (
                                <Card key={episode.id}>
                                  <CardContent className="pt-4">
                                    <div className="flex items-start justify-between mb-3">
                                      <div>
                                        <h5 className="font-medium">
                                          S{episode.seasonNumber.toString()} E
                                          {episode.episodeNumber.toString()}:{" "}
                                          {episode.title}
                                        </h5>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {episode.description}
                                        </p>
                                      </div>
                                      {getStatusBadge(episode.moderationStatus)}
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                                      <div>
                                        Type:{" "}
                                        {Object.keys(episode.episodeType)[0]}
                                      </div>
                                      <div>
                                        18+:{" "}
                                        {episode.isEighteenPlus ? "Yes" : "No"}
                                      </div>
                                      <div>
                                        Explicit:{" "}
                                        {episode.isExplicit ? "Yes" : "No"}
                                      </div>
                                    </div>

                                    <div className="flex gap-2 mb-3">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleDownload(
                                            episode.thumbnail,
                                            `${episode.title}-thumbnail.jpg`,
                                          )
                                        }
                                      >
                                        <Download className="h-3 w-3 mr-1" />
                                        Thumbnail
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleDownload(
                                            episode.artwork,
                                            `${episode.title}-artwork.jpg`,
                                          )
                                        }
                                      >
                                        <Download className="h-3 w-3 mr-1" />
                                        Artwork
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleDownload(
                                            episode.mediaFile,
                                            `${episode.title}-media`,
                                          )
                                        }
                                      >
                                        <Download className="h-3 w-3 mr-1" />
                                        Media
                                      </Button>
                                    </div>

                                    <Select
                                      onValueChange={(value) =>
                                        handleEpisodeStatusChange(
                                          episode.id,
                                          value,
                                        )
                                      }
                                      value={
                                        Object.keys(episode.moderationStatus)[0]
                                      }
                                    >
                                      <SelectTrigger className="w-[180px]">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">
                                          Pending
                                        </SelectItem>
                                        <SelectItem value="approved">
                                          Approved
                                        </SelectItem>
                                        <SelectItem value="rejected">
                                          Rejected
                                        </SelectItem>
                                        <SelectItem value="live">
                                          Live
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
