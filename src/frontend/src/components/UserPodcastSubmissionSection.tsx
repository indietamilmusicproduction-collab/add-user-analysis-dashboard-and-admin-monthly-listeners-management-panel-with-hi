import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Radio } from "lucide-react";
import { useState } from "react";
import { type PodcastEpisode, PodcastShow } from "../backend";
import { useActor } from "../hooks/useActor";
import { useGetMyPodcastShows } from "../hooks/useQueries";
import PodcastEpisodeForm from "./PodcastEpisodeForm";
import PodcastShowForm from "./PodcastShowForm";

export default function UserPodcastSubmissionSection() {
  const [activeTab, setActiveTab] = useState("shows");
  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [showEpisodes, setShowEpisodes] = useState<{
    [key: string]: PodcastEpisode[];
  }>({});
  const [loadingEpisodes, setLoadingEpisodes] = useState<{
    [key: string]: boolean;
  }>({});

  const { data: shows, isLoading } = useGetMyPodcastShows();
  const { actor } = useActor();

  const getModerationBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-600">Approved</Badge>;
      case "live":
        return <Badge className="bg-blue-600">Live</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const loadEpisodes = async (showId: string) => {
    if (!actor || showEpisodes[showId]) return;

    setLoadingEpisodes((prev) => ({ ...prev, [showId]: true }));
    try {
      const episodes = await actor.getMyEpisodes(showId);
      setShowEpisodes((prev) => ({ ...prev, [showId]: episodes }));
    } catch (error) {
      console.error("Failed to load episodes:", error);
    } finally {
      setLoadingEpisodes((prev) => ({ ...prev, [showId]: false }));
    }
  };

  const handleShowClick = (showId: string) => {
    if (selectedShow === showId) {
      setSelectedShow(null);
    } else {
      setSelectedShow(showId);
      loadEpisodes(showId);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shows">My Shows</TabsTrigger>
          <TabsTrigger value="create-show">Create Show</TabsTrigger>
          <TabsTrigger value="add-episode">Add Episode</TabsTrigger>
        </TabsList>

        <TabsContent value="shows">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5" />
                My Podcast Shows
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!shows || shows.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    You haven't created any podcast shows yet.
                  </p>
                  <Button onClick={() => setActiveTab("create-show")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Show
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {shows.map((show) => (
                    <Card
                      key={show.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <CardContent className="pt-6">
                        <div className="flex gap-4">
                          <img
                            src={show.artwork.getDirectURL()}
                            alt={show.title}
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {show.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {show.description}
                                </p>
                              </div>
                              {getModerationBadge(show.moderationStatus)}
                            </div>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>Type: {show.podcastType}</span>
                              <span>Category: {show.category}</span>
                              <span>Language: {show.language}</span>
                            </div>
                            {show.liveLink && (
                              <div className="mt-2">
                                <a
                                  href={show.liveLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline"
                                >
                                  View Live Show
                                </a>
                              </div>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3"
                              onClick={() => handleShowClick(show.id)}
                            >
                              {selectedShow === show.id
                                ? "Hide Episodes"
                                : "View Episodes"}
                            </Button>
                          </div>
                        </div>

                        {selectedShow === show.id && (
                          <div className="mt-4 pt-4 border-t">
                            <h4 className="font-semibold mb-3">Episodes</h4>
                            {loadingEpisodes[show.id] ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                              </div>
                            ) : showEpisodes[show.id] &&
                              showEpisodes[show.id].length > 0 ? (
                              <div className="space-y-2">
                                {showEpisodes[show.id].map((episode) => (
                                  <div
                                    key={episode.id}
                                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                  >
                                    <div>
                                      <p className="font-medium">
                                        {episode.title}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        S{episode.seasonNumber} E
                                        {episode.episodeNumber} •{" "}
                                        {episode.episodeType}
                                      </p>
                                    </div>
                                    {getModerationBadge(
                                      episode.moderationStatus,
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                No episodes yet. Add your first episode!
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create-show">
          <PodcastShowForm />
        </TabsContent>

        <TabsContent value="add-episode">
          <PodcastEpisodeForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
