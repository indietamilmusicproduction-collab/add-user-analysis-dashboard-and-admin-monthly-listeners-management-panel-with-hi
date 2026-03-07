import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, User } from "lucide-react";
import { useState } from "react";
import { type ArtistProfile, ExternalBlob } from "../backend";
import { useAdminEditArtistProfile } from "../hooks/useQueries";

interface AdminEditArtistDialogProps {
  artistProfile: ArtistProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdminEditArtistDialog({
  artistProfile,
  open,
  onOpenChange,
}: AdminEditArtistDialogProps) {
  const [formData, setFormData] = useState({
    fullName: artistProfile.fullName,
    stageName: artistProfile.stageName,
    email: artistProfile.email,
    mobileNumber: artistProfile.mobileNumber,
    instagramLink: artistProfile.instagramLink,
    facebookLink: artistProfile.facebookLink,
    spotifyProfile: artistProfile.spotifyProfile,
    appleProfile: artistProfile.appleProfile,
    youtubeChannelLink: artistProfile.youtubeChannelLink,
  });

  const [hasSpotifyProfile, setHasSpotifyProfile] = useState(
    !!artistProfile.spotifyProfile,
  );
  const [hasAppleProfile, setHasAppleProfile] = useState(
    !!artistProfile.appleProfile,
  );

  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(
    artistProfile.profilePhoto.getDirectURL(),
  );
  const [uploadProgress, setUploadProgress] = useState(0);

  const editArtistProfile = useAdminEditArtistProfile();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpotifyCheckboxChange = (checked: boolean) => {
    setHasSpotifyProfile(checked);
    if (!checked) {
      setFormData((prev) => ({ ...prev, spotifyProfile: "" }));
    }
  };

  const handleAppleCheckboxChange = (checked: boolean) => {
    setHasAppleProfile(checked);
    if (!checked) {
      setFormData((prev) => ({ ...prev, appleProfile: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let profilePhotoBlob = artistProfile.profilePhoto;
      let profilePhotoFilename = artistProfile.profilePhotoFilename;

      if (profilePhotoFile) {
        const photoBytes = new Uint8Array(await profilePhotoFile.arrayBuffer());
        profilePhotoBlob = ExternalBlob.fromBytes(
          photoBytes,
        ).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
        profilePhotoFilename = profilePhotoFile.name;
      }

      const profileInput = {
        ...formData,
        profilePhoto: profilePhotoBlob,
        profilePhotoFilename,
        isApproved: artistProfile.isApproved,
      };

      await editArtistProfile.mutateAsync({
        id: artistProfile.id,
        input: profileInput,
      });

      setUploadProgress(0);
      onOpenChange(false);
    } catch (error) {
      console.error("Edit artist profile error:", error);
      setUploadProgress(0);
    }
  };

  const isUploading = uploadProgress > 0 && uploadProgress < 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Artist Profile</DialogTitle>
          <DialogDescription>
            Update the artist's profile information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="profilePhoto">Profile Photo</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
              {photoPreview ? (
                <div className="space-y-4">
                  <img
                    src={photoPreview}
                    alt="Profile preview"
                    className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-primary/20"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("profilePhoto")?.click()
                    }
                  >
                    Change Photo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <User className="w-12 h-12 mx-auto text-muted-foreground" />
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("profilePhoto")?.click()
                      }
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                </div>
              )}
              <input
                id="profilePhoto"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-1">
                <Progress value={uploadProgress} />
                <p className="text-xs text-muted-foreground text-center">
                  Uploading: {uploadProgress}%
                </p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stageName">Stage Name</Label>
              <Input
                id="stageName"
                value={formData.stageName}
                onChange={(e) => handleInputChange("stageName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                value={formData.mobileNumber}
                onChange={(e) =>
                  handleInputChange("mobileNumber", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagramLink">Instagram Link</Label>
              <Input
                id="instagramLink"
                value={formData.instagramLink}
                onChange={(e) =>
                  handleInputChange("instagramLink", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebookLink">Facebook Link</Label>
              <Input
                id="facebookLink"
                value={formData.facebookLink}
                onChange={(e) =>
                  handleInputChange("facebookLink", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtubeChannelLink">YouTube Channel Link</Label>
              <Input
                id="youtubeChannelLink"
                value={formData.youtubeChannelLink}
                onChange={(e) =>
                  handleInputChange("youtubeChannelLink", e.target.value)
                }
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasSpotifyProfile"
                  checked={hasSpotifyProfile}
                  onCheckedChange={handleSpotifyCheckboxChange}
                />
                <Label htmlFor="hasSpotifyProfile" className="cursor-pointer">
                  Has Spotify Profile
                </Label>
              </div>

              {hasSpotifyProfile && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="spotifyProfile">Spotify Profile Link</Label>
                  <Input
                    id="spotifyProfile"
                    value={formData.spotifyProfile}
                    onChange={(e) =>
                      handleInputChange("spotifyProfile", e.target.value)
                    }
                    required={hasSpotifyProfile}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasAppleProfile"
                  checked={hasAppleProfile}
                  onCheckedChange={handleAppleCheckboxChange}
                />
                <Label htmlFor="hasAppleProfile" className="cursor-pointer">
                  Has Apple Music Profile
                </Label>
              </div>

              {hasAppleProfile && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="appleProfile">Apple Music Profile Link</Label>
                  <Input
                    id="appleProfile"
                    value={formData.appleProfile}
                    onChange={(e) =>
                      handleInputChange("appleProfile", e.target.value)
                    }
                    required={hasAppleProfile}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || editArtistProfile.isPending}
            >
              {isUploading
                ? `Uploading... ${uploadProgress}%`
                : editArtistProfile.isPending
                  ? "Saving..."
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
