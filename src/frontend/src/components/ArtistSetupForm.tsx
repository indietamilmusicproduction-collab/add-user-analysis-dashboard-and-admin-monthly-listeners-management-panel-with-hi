import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Lock, Upload, User } from "lucide-react";
import { useEffect, useState } from "react";
import { ExternalBlob } from "../backend";
import {
  useCreateArtistProfile,
  useGetArtistProfileEditingAccessStatus,
  useUpdateArtistProfile,
} from "../hooks/useQueries";

interface ArtistSetupFormProps {
  onSuccess?: () => void;
  initialData?: any;
  profileId?: string;
  isEditing?: boolean;
}

export default function ArtistSetupForm({
  onSuccess,
  initialData,
  profileId,
  isEditing = false,
}: ArtistSetupFormProps) {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || "",
    stageName: initialData?.stageName || "",
    email: initialData?.email || "",
    mobileNumber: initialData?.mobileNumber || "",
    instagramLink: initialData?.instagramLink || "",
    facebookLink: initialData?.facebookLink || "",
    spotifyProfile: initialData?.spotifyProfile || "",
    appleProfile: initialData?.appleProfile || "",
    youtubeChannelLink: initialData?.youtubeChannelLink || "",
  });

  const [hasSpotifyProfile, setHasSpotifyProfile] = useState(
    !!initialData?.spotifyProfile,
  );
  const [hasAppleProfile, setHasAppleProfile] = useState(
    !!initialData?.appleProfile,
  );

  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(
    initialData?.profilePhoto ? initialData.profilePhoto.getDirectURL() : "",
  );
  const [uploadProgress, setUploadProgress] = useState(0);

  const createProfile = useCreateArtistProfile();
  const updateProfile = useUpdateArtistProfile();
  const { data: editingEnabled, isLoading: editingStatusLoading } =
    useGetArtistProfileEditingAccessStatus();

  const isApproved = initialData?.isApproved || false;
  const isEditingDisabled =
    isEditing && (isApproved || editingEnabled === false);

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

    if (!profilePhotoFile && !initialData?.profilePhoto) {
      return;
    }

    try {
      let profilePhotoBlob: any;
      let profilePhotoFilename = "";

      if (profilePhotoFile) {
        const photoBytes = new Uint8Array(await profilePhotoFile.arrayBuffer());
        profilePhotoBlob = ExternalBlob.fromBytes(
          photoBytes,
        ).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
        profilePhotoFilename = profilePhotoFile.name;
      } else {
        profilePhotoBlob = initialData.profilePhoto;
        profilePhotoFilename = initialData.profilePhotoFilename || "";
      }

      const profileInput = {
        ...formData,
        profilePhoto: profilePhotoBlob,
        profilePhotoFilename,
        isApproved: initialData?.isApproved || false,
      };

      if (isEditing && profileId) {
        await updateProfile.mutateAsync({ id: profileId, input: profileInput });
      } else {
        await createProfile.mutateAsync(profileInput);
      }

      setUploadProgress(0);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Profile save error:", error);
      setUploadProgress(0);
    }
  };

  const isUploading = uploadProgress > 0 && uploadProgress < 100;

  if (editingStatusLoading && isEditing) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isEditingDisabled) {
    const message = isApproved
      ? "This profile has been approved and cannot be edited."
      : "Profile editing is currently disabled by the administrator.";

    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Editing Disabled</h3>
          <p className="text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="profilePhoto">Profile Photo *</Label>
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
                onClick={() => document.getElementById("profilePhoto")?.click()}
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
            required={!initialData?.profilePhoto}
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
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stageName">Stage Name *</Label>
          <Input
            id="stageName"
            value={formData.stageName}
            onChange={(e) => handleInputChange("stageName", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobileNumber">Mobile Number *</Label>
          <Input
            id="mobileNumber"
            value={formData.mobileNumber}
            onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagramLink">Instagram Link *</Label>
          <Input
            id="instagramLink"
            value={formData.instagramLink}
            onChange={(e) => handleInputChange("instagramLink", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="facebookLink">Facebook Link *</Label>
          <Input
            id="facebookLink"
            value={formData.facebookLink}
            onChange={(e) => handleInputChange("facebookLink", e.target.value)}
            required
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

      <Button
        type="submit"
        disabled={
          isUploading || createProfile.isPending || updateProfile.isPending
        }
        className="w-full"
      >
        {isUploading
          ? `Uploading... ${uploadProgress}%`
          : createProfile.isPending || updateProfile.isPending
            ? "Saving..."
            : isEditing
              ? "Update Profile"
              : "Create Profile"}
      </Button>
    </form>
  );
}
