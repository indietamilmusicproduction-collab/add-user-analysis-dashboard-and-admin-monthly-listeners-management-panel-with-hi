import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Flame, Music } from "lucide-react";
import React from "react";
import { useGetRankedTopVibingSongs } from "../hooks/useQueries";

export default function TopVibingSongsSection() {
  const { data: songs = [], isLoading } = useGetRankedTopVibingSongs();

  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Flame className="h-7 w-7 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">
              Top Vibing Songs
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders use index
                key={i}
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
      </section>
    );
  }

  if (songs.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-2">
          <Flame className="h-7 w-7 text-primary animate-pulse" />
          <h2 className="text-3xl font-bold text-foreground">
            Top Vibing Songs
          </h2>
        </div>
        <p className="text-muted-foreground mb-8 ml-10">
          Curated picks that are setting the vibe right now
        </p>

        {/* Songs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {songs.map((song, index) => (
            <div
              key={String(song.id)}
              className="group rounded-xl overflow-hidden border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            >
              {/* Artwork */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                {song.artworkUrl ? (
                  <img
                    src={song.artworkUrl}
                    alt={`${song.title} artwork`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                    <Music className="h-16 w-16 text-muted-foreground/40" />
                  </div>
                )}
                {/* Rank badge */}
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/70 text-white text-sm font-bold backdrop-blur-sm">
                    #{index + 1}
                  </span>
                </div>
                {/* Tagline badge */}
                {song.tagline && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium backdrop-blur-sm truncate max-w-full">
                      {song.tagline}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-foreground truncate text-base leading-tight">
                  {song.title}
                </h3>
                <p className="text-muted-foreground text-sm truncate mt-0.5">
                  {song.artistName}
                </p>
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {song.genre}
                  </Badge>
                </div>
                <Button
                  className="w-full mt-3 gap-2 text-sm"
                  size="sm"
                  onClick={() =>
                    window.open(
                      song.streamingLink,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Listen Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
