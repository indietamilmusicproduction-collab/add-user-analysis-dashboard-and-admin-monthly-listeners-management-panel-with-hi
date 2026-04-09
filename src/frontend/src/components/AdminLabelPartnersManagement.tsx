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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Edit2,
  ExternalLink,
  Loader2,
  Music,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import type { LabelPartner, LabelRelease } from "../backend";
import {
  useAddLabelPartner,
  useAddLabelRelease,
  useDeleteLabelPartner,
  useDeleteLabelRelease,
  useGetAllLabelPartners,
  useGetAllLabelReleases,
  useUpdateLabelPartner,
  useUpdateLabelRelease,
} from "../hooks/useQueries";

// ─── Label Partner Form ───────────────────────────────────────────────────────

interface PartnerFormData {
  logoUrl: string;
  labelName: string;
  websiteLink: string;
  description: string;
}

const emptyPartnerForm: PartnerFormData = {
  logoUrl: "",
  labelName: "",
  websiteLink: "",
  description: "",
};

// ─── Label Release Form ───────────────────────────────────────────────────────

interface ReleaseFormData {
  artworkUrl: string;
  songTitle: string;
  artistName: string;
  streamingLink: string;
}

const emptyReleaseForm: ReleaseFormData = {
  artworkUrl: "",
  songTitle: "",
  artistName: "",
  streamingLink: "",
};

// ─── Release Sub-Panel ────────────────────────────────────────────────────────

function LabelReleasesPanel({ partner }: { partner: LabelPartner }) {
  const { data: allReleases = [] } = useGetAllLabelReleases();
  const addRelease = useAddLabelRelease();
  const updateRelease = useUpdateLabelRelease();
  const deleteRelease = useDeleteLabelRelease();

  const releases = allReleases.filter((r) => r.labelId === partner.id);

  const [showForm, setShowForm] = useState(false);
  const [editingRelease, setEditingRelease] = useState<LabelRelease | null>(
    null,
  );
  const [form, setForm] = useState<ReleaseFormData>(emptyReleaseForm);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<LabelRelease | null>(null);

  const resetForm = () => {
    setForm(emptyReleaseForm);
    setEditingRelease(null);
    setShowForm(false);
    setFormError("");
  };

  const handleEditRelease = (release: LabelRelease) => {
    setEditingRelease(release);
    setForm({
      artworkUrl: release.artworkUrl,
      songTitle: release.songTitle,
      artistName: release.artistName,
      streamingLink: release.streamingLink,
    });
    setShowForm(true);
    setFormError("");
  };

  const validateReleaseForm = (): boolean => {
    if (!form.songTitle.trim()) {
      setFormError("Song title is required.");
      return false;
    }
    if (!form.artistName.trim()) {
      setFormError("Artist name is required.");
      return false;
    }
    if (!form.artworkUrl.trim() || !form.artworkUrl.startsWith("http")) {
      setFormError("Valid artwork URL is required.");
      return false;
    }
    if (!form.streamingLink.trim() || !form.streamingLink.startsWith("http")) {
      setFormError("Valid streaming link is required.");
      return false;
    }
    return true;
  };

  const handleSubmitRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!validateReleaseForm()) return;

    try {
      if (editingRelease) {
        await updateRelease.mutateAsync({
          ...editingRelease,
          artworkUrl: form.artworkUrl,
          songTitle: form.songTitle,
          artistName: form.artistName,
          streamingLink: form.streamingLink,
        });
        toast.success("Release updated successfully.");
      } else {
        await addRelease.mutateAsync({
          labelId: partner.id,
          artworkUrl: form.artworkUrl,
          songTitle: form.songTitle,
          artistName: form.artistName,
          streamingLink: form.streamingLink,
        });
        toast.success("Release added successfully.");
      }
      resetForm();
    } catch (err: any) {
      setFormError(err?.message ?? "Failed to save release.");
    }
  };

  const handleDeleteRelease = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRelease.mutateAsync({
        id: deleteTarget.id,
        labelId: partner.id,
      });
      toast.success("Release deleted.");
    } catch {
      toast.error("Failed to delete release.");
    }
    setDeleteTarget(null);
  };

  return (
    <div className="mt-4 pt-4 border-t border-orange-500/20 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-orange-400 uppercase tracking-wider flex items-center gap-2">
          <Music className="h-4 w-4" />
          Song Releases ({releases.length})
        </span>
        {!showForm && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowForm(true)}
            className="gap-1 border-orange-500/40 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/60"
            data-ocid="label.release.open_modal_button"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Release
          </Button>
        )}
      </div>

      {/* Add/Edit Release Form */}
      {showForm && (
        <div className="rounded-lg border border-orange-500/30 bg-orange-950/20 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              {editingRelease ? "Edit Release" : "Add New Release"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={resetForm}
              data-ocid="label.release.close_button"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <form onSubmit={handleSubmitRelease} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor={`release-songTitle-${partner.id}`}
                  className="text-xs"
                >
                  Song Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`release-songTitle-${partner.id}`}
                  value={form.songTitle}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, songTitle: e.target.value }))
                  }
                  placeholder="Enter song title"
                  data-ocid="label.release.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor={`release-artistName-${partner.id}`}
                  className="text-xs"
                >
                  Artist Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`release-artistName-${partner.id}`}
                  value={form.artistName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, artistName: e.target.value }))
                  }
                  placeholder="Enter artist name"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor={`release-artworkUrl-${partner.id}`}
                  className="text-xs"
                >
                  Artwork URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`release-artworkUrl-${partner.id}`}
                  type="url"
                  value={form.artworkUrl}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, artworkUrl: e.target.value }))
                  }
                  placeholder="https://..."
                />
                {form.artworkUrl.startsWith("http") && (
                  <img
                    src={form.artworkUrl}
                    alt="Artwork preview"
                    className="w-14 h-14 object-cover rounded-md border border-border mt-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor={`release-streamingLink-${partner.id}`}
                  className="text-xs"
                >
                  Streaming Link <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`release-streamingLink-${partner.id}`}
                  type="url"
                  value={form.streamingLink}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, streamingLink: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            {formError && (
              <p className="text-xs text-destructive bg-destructive/10 px-2 py-1.5 rounded-md">
                {formError}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={addRelease.isPending || updateRelease.isPending}
                className="gap-1"
                data-ocid="label.release.submit_button"
              >
                {(addRelease.isPending || updateRelease.isPending) && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                {editingRelease ? "Update" : "Add Release"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={resetForm}
                data-ocid="label.release.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Releases List */}
      {releases.length === 0 ? (
        <p
          className="text-xs text-muted-foreground italic"
          data-ocid="label.release.empty_state"
        >
          No releases added yet for this label.
        </p>
      ) : (
        <div className="space-y-2">
          {releases.map((release, idx) => (
            <div
              key={String(release.id)}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/50 hover:border-orange-500/30 transition-colors"
              data-ocid={`label.release.item.${idx + 1}`}
            >
              {/* Artwork */}
              <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                {release.artworkUrl ? (
                  <img
                    src={release.artworkUrl}
                    alt={release.songTitle}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {release.songTitle}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {release.artistName}
                </p>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() =>
                    window.open(
                      release.streamingLink,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  title="Open streaming link"
                  data-ocid={`label.release.link.${idx + 1}`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleEditRelease(release)}
                  title="Edit release"
                  data-ocid={`label.release.edit_button.${idx + 1}`}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(release)}
                  title="Delete release"
                  data-ocid={`label.release.delete_button.${idx + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Release Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="label.release.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Release</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.songTitle}"? This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="label.release.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRelease}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="label.release.confirm_button"
            >
              {deleteRelease.isPending && (
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminLabelPartnersManagement() {
  const { data: partners = [], isLoading } = useGetAllLabelPartners();
  const addPartner = useAddLabelPartner();
  const updatePartner = useUpdateLabelPartner();
  const deletePartner = useDeleteLabelPartner();

  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<LabelPartner | null>(
    null,
  );
  const [form, setForm] = useState<PartnerFormData>(emptyPartnerForm);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<LabelPartner | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const resetForm = () => {
    setForm(emptyPartnerForm);
    setEditingPartner(null);
    setShowForm(false);
    setFormError("");
  };

  const handleEditPartner = (partner: LabelPartner) => {
    setEditingPartner(partner);
    setForm({
      logoUrl: partner.logoUrl,
      labelName: partner.labelName,
      websiteLink: partner.websiteLink ?? "",
      description: partner.description,
    });
    setShowForm(true);
    setFormError("");
  };

  const validatePartnerForm = (): boolean => {
    if (!form.logoUrl.trim() || !form.logoUrl.startsWith("http")) {
      setFormError("Valid logo URL is required.");
      return false;
    }
    if (!form.labelName.trim()) {
      setFormError("Label name is required.");
      return false;
    }
    if (!form.description.trim()) {
      setFormError("Description is required.");
      return false;
    }
    if (form.websiteLink.trim() && !form.websiteLink.startsWith("http")) {
      setFormError("Website link must be a valid URL (starting with http).");
      return false;
    }
    return true;
  };

  const handleSubmitPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!validatePartnerForm()) return;

    try {
      if (editingPartner) {
        await updatePartner.mutateAsync({
          ...editingPartner,
          logoUrl: form.logoUrl,
          labelName: form.labelName,
          websiteLink: form.websiteLink.trim() || undefined,
          description: form.description,
        });
        toast.success("Label partner updated.");
      } else {
        await addPartner.mutateAsync({
          logoUrl: form.logoUrl,
          labelName: form.labelName,
          websiteLink: form.websiteLink.trim() || undefined,
          description: form.description,
        });
        toast.success("Label partner added.");
      }
      resetForm();
    } catch (err: any) {
      setFormError(err?.message ?? "Failed to save label partner.");
    }
  };

  const handleDeletePartner = async () => {
    if (!deleteTarget) return;
    try {
      await deletePartner.mutateAsync(deleteTarget.id);
      toast.success("Label partner deleted.");
    } catch {
      toast.error("Failed to delete label partner.");
    }
    setDeleteTarget(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-orange-400" />
            Label Partners
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage label partners shown on the landing page. Add song releases
            per label for their dedicated pages.
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="gap-2 bg-orange-600 hover:bg-orange-700 text-white"
            data-ocid="label.partner.open_modal_button"
          >
            <Plus className="h-4 w-4" />
            Add Label
          </Button>
        )}
      </div>

      {/* Add/Edit Partner Form */}
      {showForm && (
        <Card
          className="border-orange-500/50 bg-card/90"
          style={{
            boxShadow:
              "0 0 0 1px oklch(0.65 0.22 50 / 0.25), 0 4px 24px oklch(0.65 0.22 50 / 0.12)",
          }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-orange-400" />
                {editingPartner
                  ? "Edit Label Partner"
                  : "Add New Label Partner"}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetForm}
                data-ocid="label.partner.close_button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPartner} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Logo URL */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="logoUrl">
                    Logo URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="logoUrl"
                    type="url"
                    value={form.logoUrl}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, logoUrl: e.target.value }))
                    }
                    placeholder="https://example.com/logo.png"
                    data-ocid="label.partner.input"
                  />
                  {form.logoUrl.startsWith("http") && (
                    <div className="mt-2">
                      <img
                        src={form.logoUrl}
                        alt="Logo preview"
                        className="w-16 h-16 object-contain rounded-lg border border-border bg-muted"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Label Name */}
                <div className="space-y-2">
                  <Label htmlFor="labelName">
                    Label Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="labelName"
                    value={form.labelName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, labelName: e.target.value }))
                    }
                    placeholder="e.g. Sony Music Tamil"
                  />
                </div>

                {/* Website Link */}
                <div className="space-y-2">
                  <Label htmlFor="websiteLink">
                    Website Link{" "}
                    <span className="text-muted-foreground text-xs">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="websiteLink"
                    type="url"
                    value={form.websiteLink}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, websiteLink: e.target.value }))
                    }
                    placeholder="https://..."
                  />
                </div>

                {/* Description */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">
                    Short Description{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="Brief description of the label..."
                    rows={3}
                    data-ocid="label.partner.textarea"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                  {formError}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  type="submit"
                  disabled={addPartner.isPending || updatePartner.isPending}
                  className="gap-2"
                  data-ocid="label.partner.submit_button"
                >
                  {(addPartner.isPending || updatePartner.isPending) && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {editingPartner ? "Update Label" : "Add Label"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  data-ocid="label.partner.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Partners List */}
      {partners.length === 0 ? (
        <Card className="border-dashed" data-ocid="label.partner.empty_state">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">
              No label partners added yet
            </p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              Click "Add Label" to add your first label partner.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {partners.map((partner, idx) => {
            const idStr = String(partner.id);
            const isExpanded = expandedIds.has(idStr);

            return (
              <Card
                key={idStr}
                className="border-border hover:border-orange-500/30 transition-all"
                data-ocid={`label.partner.card.${idx + 1}`}
              >
                <CardContent className="p-4">
                  {/* Partner Row */}
                  <div className="flex items-center gap-4">
                    {/* Logo */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted border border-border flex items-center justify-center">
                      {partner.logoUrl ? (
                        <img
                          src={partner.logoUrl}
                          alt={partner.labelName}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                            (
                              e.target as HTMLImageElement
                            ).nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground truncate">
                          {partner.labelName}
                        </p>
                        {partner.websiteLink && (
                          <a
                            href={partner.websiteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 text-orange-400 hover:text-orange-300"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                        {partner.description}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(idStr)}
                        className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                        data-ocid={`label.partner.toggle.${idx + 1}`}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        Releases
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditPartner(partner)}
                        title="Edit label"
                        data-ocid={`label.partner.edit_button.${idx + 1}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(partner)}
                        title="Delete label"
                        data-ocid={`label.partner.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Releases Panel */}
                  {isExpanded && <LabelReleasesPanel partner={partner} />}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Partner Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="label.partner.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Label Partner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.labelName}"? This
              will remove the label and all its associated song releases. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="label.partner.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePartner}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="label.partner.confirm_button"
            >
              {deletePartner.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Delete Label
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
