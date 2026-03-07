import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Edit, ExternalLink, Loader2, Music } from "lucide-react";
import { useState } from "react";
import { SongStatus } from "../backend";
import { useGetMySubmissions } from "../hooks/useQueries";
import UserEditSubmissionDialog from "./UserEditSubmissionDialog";

export default function UserSubmissionsList() {
  const { data: submissions, isLoading } = useGetMySubmissions();
  const [editingSubmission, setEditingSubmission] = useState<string | null>(
    null,
  );

  const getStatusBadge = (status: SongStatus, isManuallyRejected: boolean) => {
    // Show rejected submissions as Draft
    if (status === SongStatus.rejected || isManuallyRejected) {
      return <Badge variant="outline">Draft</Badge>;
    }

    switch (status) {
      case SongStatus.pending:
        return <Badge variant="secondary">Pending</Badge>;
      case SongStatus.approved:
        return <Badge className="bg-green-600">Approved</Badge>;
      case SongStatus.draft:
        return <Badge variant="outline">Draft</Badge>;
      case SongStatus.live:
        return <Badge className="bg-blue-600">Live</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const canEdit = (status: SongStatus) => {
    return (
      status === SongStatus.draft ||
      status === SongStatus.pending ||
      status === SongStatus.rejected
    );
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

  if (!submissions || submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            My Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            You haven't submitted any songs yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const editingSubmissionData = submissions.find(
    (s) => s.id === editingSubmission,
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            My Submissions ({submissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <img
                      src={submission.artwork.getDirectURL()}
                      alt={submission.title}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {submission.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {submission.artist}
                            {submission.featuredArtist &&
                              ` ft. ${submission.featuredArtist}`}
                          </p>
                        </div>
                        {getStatusBadge(
                          submission.status,
                          submission.isManuallyRejected,
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Genre:</span>{" "}
                          {submission.genre}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Language:
                          </span>{" "}
                          {submission.language}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Release Type:
                          </span>{" "}
                          {submission.releaseType}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className="text-muted-foreground">
                            {new Date(
                              Number(submission.releaseDate / BigInt(1000000)),
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {submission.musicVideoLink && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Music Video:
                          </span>{" "}
                          <a
                            href={submission.musicVideoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View Video
                          </a>
                        </div>
                      )}
                      {submission.adminComment && (
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm font-medium">Admin Comment:</p>
                          <p className="text-sm text-muted-foreground">
                            {submission.adminComment}
                          </p>
                        </div>
                      )}
                      {submission.adminRemarks && (
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm font-medium">Admin Remarks:</p>
                          <p className="text-sm text-muted-foreground">
                            {submission.adminRemarks}
                          </p>
                        </div>
                      )}
                      {submission.status === SongStatus.live &&
                        submission.adminLiveLink && (
                          <Button
                            size="sm"
                            onClick={() =>
                              window.open(submission.adminLiveLink!, "_blank")
                            }
                            className="mt-2"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Visit Release
                          </Button>
                        )}
                      {canEdit(submission.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingSubmission(submission.id)}
                          className="mt-2"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Submission
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {editingSubmissionData && (
        <UserEditSubmissionDialog
          submission={editingSubmissionData}
          open={!!editingSubmission}
          onOpenChange={(open) => !open && setEditingSubmission(null)}
        />
      )}
    </>
  );
}
