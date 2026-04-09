// @ts-nocheck
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Edit2,
  Facebook,
  Instagram,
  Mail,
  Phone,
  RefreshCw,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { SiApplemusic, SiSpotify } from "react-icons/si";
import type { ArtistProfile } from "../backend";
import {
  useDeleteArtistProfile,
  useGetMyArtistProfiles,
} from "../hooks/useQueries";
import ArtistNameWithVerified from "./ArtistNameWithVerified";
import ArtistSetupForm from "./ArtistSetupForm";

export default function UserArtistProfilesManager() {
  const { data: profiles, isLoading, refetch } = useGetMyArtistProfiles();
  const deleteProfile = useDeleteArtistProfile();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ArtistProfile | null>(
    null,
  );
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(
    null,
  );

  const handleDeleteConfirm = async () => {
    if (deletingProfileId) {
      try {
        await deleteProfile.mutateAsync(deletingProfileId);
        setDeletingProfileId(null);
        refetch();
      } catch (error) {
        console.error("Failed to delete profile:", error);
      }
    }
  };

  const handleCreateSuccess = async () => {
    setCreateDialogOpen(false);
    // Force immediate refetch so new profile appears right away
    await refetch();
  };

  const handleEditSuccess = async () => {
    setEditingProfile(null);
    await refetch();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            Loading your artist profiles...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Artist Profiles</h2>
          <p className="text-muted-foreground">Manage your artist identities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Create New Profile
          </Button>
        </div>
      </div>

      {!profiles || profiles.length === 0 ? (
        <Card className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 border-primary/20">
          <CardContent className="py-12 text-center">
            <UserPlus className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              No Artist Profiles Yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first artist profile to get started
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Create Your First Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {profiles.map((profile) => (
            <Card
              key={profile.id}
              className="bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5"
            >
              <CardContent className="py-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <img
                    src={profile.profilePhoto.getDirectURL()}
                    alt={profile.stageName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold">
                            <ArtistNameWithVerified
                              artistName={profile.stageName}
                              ownerPrincipal={profile.owner}
                              badgeSize="medium"
                            />
                          </h3>
                        </div>
                        <p className="text-muted-foreground">
                          {profile.fullName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProfile(profile)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeletingProfileId(profile.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{profile.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{profile.mobileNumber}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      {profile.instagramLink && (
                        <a
                          href={profile.instagramLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Instagram className="w-4 h-4" />
                          Instagram
                        </a>
                      )}
                      {profile.facebookLink && (
                        <a
                          href={profile.facebookLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Facebook className="w-4 h-4" />
                          Facebook
                        </a>
                      )}
                      {profile.spotifyProfile && (
                        <a
                          href={profile.spotifyProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <SiSpotify className="w-4 h-4" />
                          Spotify
                        </a>
                      )}
                      {profile.appleProfile && (
                        <a
                          href={profile.appleProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <SiApplemusic className="w-4 h-4" />
                          Apple Music
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Artist Profile</DialogTitle>
          </DialogHeader>
          <ArtistSetupForm onSuccess={handleCreateSuccess} isEditing={false} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editingProfile && (
        <Dialog
          open={!!editingProfile}
          onOpenChange={(open) => !open && setEditingProfile(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Artist Profile</DialogTitle>
            </DialogHeader>
            <ArtistSetupForm
              initialData={editingProfile}
              profileId={editingProfile.id}
              isEditing={true}
              onSuccess={handleEditSuccess}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingProfileId}
        onOpenChange={(open) => !open && setDeletingProfileId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Artist Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              artist profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
