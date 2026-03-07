import { Label } from "@/components/ui/label";
import type { ArtistProfile } from "../backend";

interface ArtistProfilesCheckboxSelectorProps {
  label: string;
  profiles: ArtistProfile[];
  selectedProfileIds: string[];
  onToggle: (profileId: string) => void;
  required?: boolean;
  helperText?: string;
}

export default function ArtistProfilesCheckboxSelector({
  label,
  profiles,
  selectedProfileIds,
  onToggle,
  required = false,
  helperText,
}: ArtistProfilesCheckboxSelectorProps) {
  return (
    <div>
      <Label>
        {label} {required && "*"}
      </Label>
      <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
        {profiles.map((profile) => (
          <div key={profile.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`${label}-${profile.id}`}
              checked={selectedProfileIds.includes(profile.id)}
              onChange={() => onToggle(profile.id)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label
              htmlFor={`${label}-${profile.id}`}
              className="text-sm cursor-pointer flex-1"
            >
              {profile.stageName} ({profile.fullName})
            </label>
          </div>
        ))}
      </div>
      {helperText && selectedProfileIds.length === 0 && (
        <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
      )}
    </div>
  );
}
