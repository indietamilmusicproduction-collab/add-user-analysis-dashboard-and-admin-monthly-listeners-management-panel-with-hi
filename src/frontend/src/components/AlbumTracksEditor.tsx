import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Music, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { TrackMetadata } from "../backend";
import { fileToExternalBlob } from "../utils/fileToExternalBlob";

interface AlbumTracksEditorProps {
  tracks: TrackMetadata[];
  onChange: (tracks: TrackMetadata[]) => void;
}

export default function AlbumTracksEditor({
  tracks,
  onChange,
}: AlbumTracksEditorProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const addTrack = () => {
    const newTrack: Partial<TrackMetadata> = {
      title: "",
      artist: "",
      featuredArtist: "",
      composer: "",
      producer: "",
      lyricist: "",
      audioFilename: "",
    };
    onChange([...tracks, newTrack as TrackMetadata]);
  };

  const removeTrack = (index: number) => {
    onChange(tracks.filter((_, i) => i !== index));
  };

  const updateTrack = (
    index: number,
    field: keyof TrackMetadata,
    value: any,
  ) => {
    const updated = [...tracks];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleAudioUpload = async (index: number, file: File) => {
    try {
      setUploadingIndex(index);
      setUploadProgress(0);

      const audioBlob = await fileToExternalBlob(file, (progress) => {
        setUploadProgress(progress);
      });

      updateTrack(index, "audioFile", audioBlob);
      updateTrack(index, "audioFilename", file.name);
      toast.success("Audio file uploaded");
    } catch {
      toast.error("Failed to upload audio file");
    } finally {
      setUploadingIndex(null);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      {tracks.map((track, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: tracks have no stable id
        <Card key={index}>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium flex items-center gap-2">
                <Music className="w-4 h-4" />
                Track {index + 1}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTrack(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Title *</Label>
                <Input
                  value={track.title}
                  onChange={(e) => updateTrack(index, "title", e.target.value)}
                  placeholder="Track title"
                  required
                />
              </div>

              <div>
                <Label>Artist *</Label>
                <Input
                  value={track.artist}
                  onChange={(e) => updateTrack(index, "artist", e.target.value)}
                  placeholder="Artist name"
                  required
                />
              </div>

              <div>
                <Label>Featured Artist</Label>
                <Input
                  value={track.featuredArtist}
                  onChange={(e) =>
                    updateTrack(index, "featuredArtist", e.target.value)
                  }
                  placeholder="Featured artist"
                />
              </div>

              <div>
                <Label>Composer</Label>
                <Input
                  value={track.composer}
                  onChange={(e) =>
                    updateTrack(index, "composer", e.target.value)
                  }
                  placeholder="Composer"
                />
              </div>

              <div>
                <Label>Producer</Label>
                <Input
                  value={track.producer}
                  onChange={(e) =>
                    updateTrack(index, "producer", e.target.value)
                  }
                  placeholder="Producer"
                />
              </div>

              <div>
                <Label>Lyricist</Label>
                <Input
                  value={track.lyricist}
                  onChange={(e) =>
                    updateTrack(index, "lyricist", e.target.value)
                  }
                  placeholder="Lyricist"
                />
              </div>
            </div>

            <div>
              <Label>Audio File *</Label>
              <Input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAudioUpload(index, file);
                }}
                disabled={uploadingIndex === index}
              />
              {uploadingIndex === index && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Uploading: {uploadProgress}%
                </div>
              )}
              {track.audioFilename && uploadingIndex !== index && (
                <div className="mt-2 text-sm text-green-600">
                  ✓ {track.audioFilename}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addTrack}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Track
      </Button>
    </div>
  );
}
