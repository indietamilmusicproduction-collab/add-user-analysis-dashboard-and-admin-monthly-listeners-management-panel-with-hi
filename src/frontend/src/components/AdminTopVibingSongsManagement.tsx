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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Edit2,
  ExternalLink,
  GripVertical,
  Loader2,
  Music,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import type { TopVibingSong } from "../backend";
import {
  useAddTopVibingSong,
  useDeleteTopVibingSong,
  useGetAllTopVibingSongs,
  useReorderTopVibingSongs,
  useUpdateTopVibingSong,
} from "../hooks/useQueries";

interface SongFormData {
  title: string;
  artistName: string;
  genre: string;
  streamingLink: string;
  tagline: string;
  artworkUrl: string;
}

const emptyForm: SongFormData = {
  title: "",
  artistName: "",
  genre: "",
  streamingLink: "",
  tagline: "",
  artworkUrl: "",
};

export default function AdminTopVibingSongsManagement() {
  const { data: songs = [], isLoading } = useGetAllTopVibingSongs();
  const addSong = useAddTopVibingSong();
  const updateSong = useUpdateTopVibingSong();
  const deleteSong = useDeleteTopVibingSong();
  const reorderSongs = useReorderTopVibingSongs();

  const [form, setForm] = useState<SongFormData>(emptyForm);
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [formError, setFormError] = useState("");

  // Drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [orderedSongs, setOrderedSongs] = useState<TopVibingSong[]>([]);

  // Sync orderedSongs with fetched songs
  useEffect(() => {
    const sorted = [...songs].sort((a, b) => Number(a.rank) - Number(b.rank));
    setOrderedSongs(sorted);
  }, [songs]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setFormError("");
  };

  const handleEdit = (song: TopVibingSong) => {
    setEditingId(song.id);
    setForm({
      title: song.title,
      artistName: song.artistName,
      genre: song.genre,
      streamingLink: song.streamingLink,
      tagline: song.tagline ?? "",
      artworkUrl: song.artworkUrl,
    });
    setShowForm(true);
    setFormError("");
  };

  const validateForm = (): boolean => {
    if (!form.title.trim()) {
      setFormError("Song title is required.");
      return false;
    }
    if (!form.artistName.trim()) {
      setFormError("Artist name is required.");
      return false;
    }
    if (!form.genre.trim()) {
      setFormError("Genre is required.");
      return false;
    }
    if (!form.streamingLink.trim()) {
      setFormError("Streaming link is required.");
      return false;
    }
    if (!form.streamingLink.startsWith("http")) {
      setFormError("Streaming link must be a valid URL.");
      return false;
    }
    if (!form.artworkUrl.trim()) {
      setFormError("Artwork URL is required.");
      return false;
    }
    if (!form.artworkUrl.startsWith("http")) {
      setFormError("Artwork URL must be a valid URL.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!validateForm()) return;

    try {
      if (editingId !== null) {
        const existing = songs.find((s) => s.id === editingId);
        if (!existing) return;
        await updateSong.mutateAsync({
          id: editingId,
          title: form.title,
          artistName: form.artistName,
          genre: form.genre,
          streamingLink: form.streamingLink,
          tagline: form.tagline ? form.tagline : undefined,
          artworkUrl: form.artworkUrl,
          rank: existing.rank,
        });
      } else {
        const newRank = BigInt(orderedSongs.length + 1);
        const newId = BigInt(Date.now());
        await addSong.mutateAsync({
          id: newId,
          title: form.title,
          artistName: form.artistName,
          genre: form.genre,
          streamingLink: form.streamingLink,
          tagline: form.tagline ? form.tagline : undefined,
          artworkUrl: form.artworkUrl,
          rank: newRank,
        });
      }

      resetForm();
    } catch (err: any) {
      setFormError(err?.message ?? "Failed to save song.");
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrder = [...orderedSongs];
    const [moved] = newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, moved);
    setOrderedSongs(newOrder);
    setDragIndex(null);
    setDragOverIndex(null);

    try {
      await reorderSongs.mutateAsync(newOrder.map((s) => s.id));
    } catch {
      // Revert on error
      const sorted = [...songs].sort((a, b) => Number(a.rank) - Number(b.rank));
      setOrderedSongs(sorted);
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteSong.mutateAsync(deleteId);
    } catch {
      // ignore
    }
    setDeleteId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Top Vibing Songs
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage the curated list of top vibing songs shown on the landing
            page and user dashboard.
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Song
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="border-primary/30 bg-card/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {editingId !== null ? "Edit Song" : "Add New Song"}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Song Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="Enter song title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artistName">
                    Artist Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="artistName"
                    value={form.artistName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, artistName: e.target.value }))
                    }
                    placeholder="Enter artist name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">
                    Genre <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="genre"
                    value={form.genre}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, genre: e.target.value }))
                    }
                    placeholder="e.g. Tamil Pop, Hip-Hop"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="streamingLink">
                    Streaming Link <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="streamingLink"
                    type="url"
                    value={form.streamingLink}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, streamingLink: e.target.value }))
                    }
                    placeholder="https://..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline (Optional)</Label>
                  <Input
                    id="tagline"
                    value={form.tagline}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, tagline: e.target.value }))
                    }
                    placeholder="e.g. Hot Right Now, Trending This Week"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artworkUrl">
                    Artwork URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="artworkUrl"
                    type="url"
                    value={form.artworkUrl}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, artworkUrl: e.target.value }))
                    }
                    placeholder="https://example.com/artwork.jpg"
                    required
                  />
                  {form.artworkUrl?.startsWith("http") && (
                    <div className="mt-2">
                      <img
                        src={form.artworkUrl}
                        alt="Artwork preview"
                        className="w-20 h-20 object-cover rounded-lg border border-border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {formError && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                  {formError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={addSong.isPending || updateSong.isPending}
                  className="gap-2"
                >
                  {(addSong.isPending || updateSong.isPending) && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {editingId !== null ? "Update Song" : "Add Song"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Songs List */}
      {orderedSongs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Music className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground font-medium">
              No songs added yet
            </p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              Click "Add Song" to add your first top vibing song.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <GripVertical className="h-4 w-4" />
            Drag rows to reorder
          </p>
          {orderedSongs.map((song, index) => (
            <div
              key={String(song.id)}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-3 rounded-lg border bg-card transition-all cursor-grab active:cursor-grabbing ${
                dragOverIndex === index && dragIndex !== index
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border hover:border-primary/40"
              } ${dragIndex === index ? "opacity-50" : "opacity-100"}`}
            >
              {/* Drag handle */}
              <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />

              {/* Rank badge */}
              <Badge
                variant="outline"
                className="text-xs font-bold min-w-[2rem] justify-center flex-shrink-0"
              >
                #{index + 1}
              </Badge>

              {/* Artwork */}
              <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                {song.artworkUrl ? (
                  <img
                    src={song.artworkUrl}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {song.title}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {song.artistName}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-xs">
                    {song.genre}
                  </Badge>
                  {song.tagline && (
                    <span className="text-xs text-primary/80 italic truncate">
                      {song.tagline}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    window.open(
                      song.streamingLink,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  title="Open streaming link"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEdit(song)}
                  title="Edit song"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => setDeleteId(song.id)}
                  title="Delete song"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reorder status */}
      {reorderSongs.isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving new order...
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Song</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this song from the Top Vibing
              Songs list? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSong.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
