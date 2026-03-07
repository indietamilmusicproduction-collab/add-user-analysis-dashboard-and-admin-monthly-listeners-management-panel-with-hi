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
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Edit2,
  Facebook,
  Instagram,
  Mail,
  Phone,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { SiApplemusic, SiSpotify } from "react-icons/si";
import type { ArtistProfile } from "../backend";
import {
  useAdminDeleteArtistProfile,
  useGetAllArtistProfiles,
} from "../hooks/useQueries";
import AdminEditArtistDialog from "./AdminEditArtistDialog";
import ArtistNameWithVerified from "./ArtistNameWithVerified";

interface AdminArtistManagementProps {
  isTeamMember?: boolean;
}

export default function AdminArtistManagement({
  isTeamMember = false,
}: AdminArtistManagementProps) {
  const { data: allProfiles } = useGetAllArtistProfiles();
  const deleteProfile = useAdminDeleteArtistProfile();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProfile, setEditingProfile] = useState<ArtistProfile | null>(
    null,
  );
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(
    null,
  );

  const filteredProfiles = useMemo(() => {
    if (!allProfiles) return [];

    return allProfiles.filter(
      (profile) =>
        profile.stageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.owner
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );
  }, [allProfiles, searchTerm]);

  const handleDeleteConfirm = async () => {
    if (deletingProfileId) {
      try {
        await deleteProfile.mutateAsync(deletingProfileId);
        setDeletingProfileId(null);
      } catch (error) {
        console.error("Failed to delete profile:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="search">Search Artist Profiles</Label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search by stage name, full name, or owner principal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredProfiles.length > 0 ? (
        <div className="grid gap-4">
          {filteredProfiles.map((profile) => {
            return (
              <Card key={profile.id} className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <img
                    src={profile.profilePhoto.getDirectURL()}
                    alt={profile.stageName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary/30"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">
                          <ArtistNameWithVerified
                            artistName={profile.stageName}
                            ownerPrincipal={profile.owner}
                            badgeSize="medium"
                          />
                        </h3>
                        <p className="text-muted-foreground">
                          {profile.fullName}
                        </p>
                        <code className="text-xs text-muted-foreground block mt-1">
                          Owner: {profile.owner.toString()}
                        </code>
                        <code className="text-xs text-muted-foreground block">
                          Profile ID: {profile.id}
                        </code>
                      </div>
                      {!isTeamMember && (
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
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {profile.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{profile.email}</span>
                        </div>
                      )}
                      {profile.mobileNumber && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{profile.mobileNumber}</span>
                        </div>
                      )}
                      {profile.instagramLink && (
                        <div className="flex items-center gap-2">
                          <Instagram className="w-4 h-4 text-muted-foreground" />
                          <a
                            href={profile.instagramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Instagram
                          </a>
                        </div>
                      )}
                      {profile.facebookLink && (
                        <div className="flex items-center gap-2">
                          <Facebook className="w-4 h-4 text-muted-foreground" />
                          <a
                            href={profile.facebookLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Facebook
                          </a>
                        </div>
                      )}
                      {profile.spotifyProfile && (
                        <div className="flex items-center gap-2">
                          <SiSpotify className="w-4 h-4 text-muted-foreground" />
                          <a
                            href={profile.spotifyProfile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Spotify
                          </a>
                        </div>
                      )}
                      {profile.appleProfile && (
                        <div className="flex items-center gap-2">
                          <SiApplemusic className="w-4 h-4 text-muted-foreground" />
                          <a
                            href={profile.appleProfile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Apple Music
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm ? "No artist profiles found" : "No artist profiles yet"}
          </p>
        </div>
      )}

      {!isTeamMember && editingProfile && (
        <AdminEditArtistDialog
          artistProfile={editingProfile}
          open={!!editingProfile}
          onOpenChange={(open) => !open && setEditingProfile(null)}
        />
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
              This action cannot be undone. This will permanently delete the
              artist profile. Note: All songs submitted by this artist will
              remain visible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
