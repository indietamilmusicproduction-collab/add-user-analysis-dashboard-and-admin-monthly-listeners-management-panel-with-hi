// @ts-nocheck
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Building2, ExternalLink, Music } from "lucide-react";
import {
  useGetAllLabelPartners,
  useGetAllLabelReleases,
} from "../hooks/useQueries";

export default function LabelPage() {
  const { labelName } = useParams({ from: "/label/$labelName" });
  const navigate = useNavigate();

  const { data: partners = [], isLoading: partnersLoading } =
    useGetAllLabelPartners();
  const { data: allReleases = [], isLoading: releasesLoading } =
    useGetAllLabelReleases();

  const decodedName = decodeURIComponent(labelName);

  // Find partner (case-insensitive)
  const partner = partners.find(
    (p) => p.labelName.toLowerCase() === decodedName.toLowerCase(),
  );

  const releases = partner
    ? allReleases.filter((r) => r.labelId === partner.id)
    : [];

  const isLoading = partnersLoading || releasesLoading;

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero skeleton */}
        <div className="relative py-16 px-4 bg-gradient-to-b from-primary/10 to-background">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-5 w-20 mb-8" />
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              <Skeleton className="w-32 h-32 rounded-2xl flex-shrink-0" />
              <div className="flex-1 space-y-3 w-full">
                <Skeleton className="h-9 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-9 w-32 mt-2" />
              </div>
            </div>
          </div>
        </div>
        {/* Releases skeleton */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Skeleton className="h-7 w-32 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(["a", "b", "c"] as const).map((key) => (
              <div
                key={key}
                className="rounded-xl overflow-hidden border border-border bg-card"
              >
                <Skeleton className="w-full aspect-square" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-8 w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Not Found State ────────────────────────────────────────────────────────
  if (!partner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md" data-ocid="label.error_state">
          <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Label Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The label "{decodedName}" could not be found.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/" })}
            className="gap-2"
            data-ocid="label.back.button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // ─── Label Page ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background" data-ocid="label.page">
      {/* Hero Section */}
      <div
        className="relative py-16 px-4 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.18 0.06 280) 0%, oklch(0.14 0.04 290) 50%, oklch(0.12 0.02 280) 100%)",
        }}
      >
        {/* Fire glow accent */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 30% 50%, oklch(0.55 0.18 50 / 0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            data-ocid="label.back.button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>

          {/* Label Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            {/* Logo */}
            <div
              className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-card border"
              style={{
                borderColor: "oklch(0.55 0.18 50 / 0.4)",
                boxShadow: "0 0 24px oklch(0.55 0.18 50 / 0.15)",
              }}
            >
              {partner.logoUrl ? (
                <img
                  src={partner.logoUrl}
                  alt={partner.labelName}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    const fallback = (e.target as HTMLImageElement)
                      .nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="flex-col items-center justify-center text-muted-foreground w-full h-full"
                style={{ display: partner.logoUrl ? "none" : "flex" }}
              >
                <Building2 className="h-12 w-12" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1
                className="text-3xl sm:text-4xl font-bold mb-3"
                style={{
                  color: "oklch(0.95 0.02 280)",
                }}
              >
                {partner.labelName}
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed mb-4 max-w-2xl">
                {partner.description}
              </p>
              {partner.websiteLink && (
                <a
                  href={partner.websiteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="label.website.link"
                >
                  <Button
                    variant="outline"
                    className="gap-2 border-orange-500/40 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/60"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Website
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Releases Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-6">
          <Music className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Releases
            {releases.length > 0 && (
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({releases.length})
              </span>
            )}
          </h2>
        </div>

        {releases.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="label.release.empty_state"
          >
            <Music className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">No releases yet</p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              Check back later for new music from this label.
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            data-ocid="label.release.list"
          >
            {releases.map((release, idx) => (
              <div
                key={String(release.id)}
                className="group rounded-xl overflow-hidden border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                data-ocid={`label.release.item.${idx + 1}`}
              >
                {/* Artwork */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {release.artworkUrl ? (
                    <img
                      src={release.artworkUrl}
                      alt={release.songTitle}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        const fallback = (e.target as HTMLImageElement)
                          .nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="absolute inset-0 flex-col items-center justify-center text-muted-foreground/40"
                    style={{ display: release.artworkUrl ? "none" : "flex" }}
                  >
                    <Music className="h-12 w-12" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="font-bold text-foreground text-sm leading-tight truncate mb-0.5">
                    {release.songTitle}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mb-3">
                    {release.artistName}
                  </p>
                  <a
                    href={release.streamingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-ocid={`label.release.link.${idx + 1}`}
                  >
                    <Button
                      size="sm"
                      className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Listen
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
