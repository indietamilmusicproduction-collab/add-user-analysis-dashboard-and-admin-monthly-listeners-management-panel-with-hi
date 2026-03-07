import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Loader2 } from "lucide-react";
import { useState } from "react";
import type { VideoSubmission } from "../backend";
import { useGetUserVideoSubmissions } from "../hooks/useQueries";
import UserEditVideoDialog from "./UserEditVideoDialog";

export default function UserVideoSubmissionSection() {
  const { data: videos, isLoading } = useGetUserVideoSubmissions();
  const [editingVideo, setEditingVideo] = useState<VideoSubmission | null>(
    null,
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge className="bg-blue-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "waiting":
        return <Badge className="bg-yellow-500">Waiting</Badge>;
      case "live":
        return <Badge className="bg-green-500">Live</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const canEdit = (status: string) => {
    return status === "pending" || status === "rejected";
  };

  const handleEdit = (video: VideoSubmission) => {
    setEditingVideo(video);
    setEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">
            You haven't submitted any videos yet. Use the form above to submit
            your first video!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {videos.map((video) => (
          <Card key={video.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{video.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Submitted on{" "}
                    {new Date(
                      Number(video.submittedAt / BigInt(1000000)),
                    ).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(video.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Thumbnail Preview */}
                <div>
                  <img
                    src={video.thumbnail.getDirectURL()}
                    alt={video.title}
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                  />
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm font-medium">Description:</p>
                  <p className="text-sm text-muted-foreground">
                    {video.description}
                  </p>
                </div>

                {/* Category */}
                <div>
                  <p className="text-sm font-medium">Category:</p>
                  <p className="text-sm text-muted-foreground">
                    {video.category}
                  </p>
                </div>

                {/* Tags */}
                {video.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {video.tags.map((tag, index) => (
                        <Badge
                          // biome-ignore lint/suspicious/noArrayIndexKey: tags are plain strings
                          key={index}
                          variant="outline"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live URL */}
                {video.liveUrl && (
                  <div>
                    <p className="text-sm font-medium">Live URL:</p>
                    <a
                      href={video.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {video.liveUrl}
                    </a>
                  </div>
                )}

                {/* Edit Button */}
                {canEdit(video.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(video)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <UserEditVideoDialog
        video={editingVideo}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
}
