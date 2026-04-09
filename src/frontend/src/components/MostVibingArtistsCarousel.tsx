// @ts-nocheck
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Flame,
  Music,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FeaturedArtist } from "../backend";
import { useGetActiveFeaturedArtists } from "../hooks/useQueries";

function ArtistSlide({ artist }: { artist: FeaturedArtist }) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Background image with blur + dark overlay */}
      {artist.photoUrl && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${artist.photoUrl})` }}
          />
          <div className="absolute inset-0 backdrop-blur-sm" />
        </>
      )}
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Artist Photo */}
        <div className="shrink-0">
          {artist.photoUrl ? (
            <div className="relative">
              <div
                className="absolute inset-0 rounded-2xl blur-xl opacity-60"
                style={{
                  background:
                    "radial-gradient(circle, rgba(251,146,60,0.6) 0%, transparent 70%)",
                }}
              />
              <img
                src={artist.photoUrl}
                alt={artist.artistName}
                className="relative w-44 h-44 md:w-56 md:h-56 rounded-2xl object-cover border-2 border-amber-400/40 shadow-2xl"
                style={{
                  boxShadow:
                    "0 0 40px rgba(251,146,60,0.3), 0 20px 60px rgba(0,0,0,0.8)",
                }}
              />
            </div>
          ) : (
            <div
              className="w-44 h-44 md:w-56 md:h-56 rounded-2xl border-2 border-amber-400/40 flex items-center justify-center"
              style={{ background: "rgba(251,146,60,0.1)" }}
            >
              <Music className="w-16 h-16 text-amber-400/60" />
            </div>
          )}
        </div>

        {/* Artist Info */}
        <div className="flex-1 text-center md:text-left space-y-4">
          {/* Artist Name */}
          <h3
            className="text-3xl md:text-5xl font-black tracking-tight leading-tight"
            style={{
              textShadow:
                "0 0 20px rgba(251,146,60,0.9), 0 0 40px rgba(251,146,60,0.6), 0 0 80px rgba(251,146,60,0.3)",
              color: "#fbbf24",
            }}
          >
            {artist.artistName}
          </h3>

          {/* About Blurb */}
          {artist.aboutBlurb && (
            <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-xl">
              {artist.aboutBlurb}
            </p>
          )}

          {/* Pinned Songs */}
          {artist.songs && artist.songs.length > 0 && (
            <div className="space-y-2">
              <p className="text-amber-400/70 text-xs font-semibold uppercase tracking-widest">
                Featured Tracks
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {artist.songs.map((song, idx) => (
                  <a
                    // biome-ignore lint/suspicious/noArrayIndexKey: songs have no stable id
                    key={idx}
                    href={song.link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => !song.link && e.preventDefault()}
                    className="group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                    style={{
                      background: "rgba(251,146,60,0.15)",
                      border: "1px solid rgba(251,146,60,0.35)",
                      color: "#fde68a",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "rgba(251,146,60,0.3)";
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "rgba(251,146,60,0.7)";
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 0 16px rgba(251,146,60,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "rgba(251,146,60,0.15)";
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "rgba(251,146,60,0.35)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    <Music className="w-3.5 h-3.5 text-amber-400" />
                    <span>{song.title}</span>
                    {song.link && (
                      <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MostVibingArtistsCarousel() {
  const { data: artists, isLoading } = useGetActiveFeaturedArtists();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeArtists = artists?.filter((a) => a.isActive) ?? [];

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || activeArtists.length <= 1) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setIsTransitioning(false);
      }, 300);
    },
    [isTransitioning, activeArtists.length],
  );

  const goNext = useCallback(() => {
    const next = (currentIndex + 1) % activeArtists.length;
    goToSlide(next);
  }, [currentIndex, activeArtists.length, goToSlide]);

  const goPrev = useCallback(() => {
    const prev =
      (currentIndex - 1 + activeArtists.length) % activeArtists.length;
    goToSlide(prev);
  }, [currentIndex, activeArtists.length, goToSlide]);

  // Auto-rotate every 5 seconds, pause on hover
  useEffect(() => {
    if (activeArtists.length <= 1 || isHovered) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(goNext, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeArtists.length, isHovered, goNext]);

  // Reset index if artists change
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on count change only
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeArtists.length]);

  // Hide section if no active artists or still loading
  if (isLoading || activeArtists.length === 0) return null;

  const currentArtist = activeArtists[currentIndex];

  return (
    <section className="relative w-full py-0 overflow-hidden">
      {/* Section Header */}
      <div className="relative z-10 text-center pt-12 pb-6 px-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Flame
            className="w-7 h-7"
            style={{
              color: "#fb923c",
              filter: "drop-shadow(0 0 8px rgba(251,146,60,0.8))",
            }}
          />
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight"
            style={{
              textShadow:
                "0 0 20px rgba(251,146,60,0.8), 0 0 40px rgba(251,146,60,0.5), 0 0 80px rgba(251,146,60,0.3)",
              color: "#fbbf24",
            }}
          >
            Most Vibing Artists
          </h2>
          <Flame
            className="w-7 h-7"
            style={{
              color: "#fb923c",
              filter: "drop-shadow(0 0 8px rgba(251,146,60,0.8))",
            }}
          />
        </div>
        <p className="text-muted-foreground text-sm tracking-widest uppercase">
          Spotlight on the hottest talent
        </p>
      </div>

      {/* Carousel */}
      <div
        className="relative w-full"
        style={{ minHeight: "420px" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Slide */}
        <div
          className="w-full transition-opacity duration-300"
          style={{
            opacity: isTransitioning ? 0 : 1,
            minHeight: "420px",
          }}
        >
          <ArtistSlide artist={currentArtist} />
        </div>

        {/* Arrow Navigation — only show if more than 1 artist */}
        {activeArtists.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              disabled={isTransitioning}
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-40"
              style={{
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(251,146,60,0.4)",
                color: "#fbbf24",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(251,146,60,0.2)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(251,146,60,0.8)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 0 16px rgba(251,146,60,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(0,0,0,0.5)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(251,146,60,0.4)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
              aria-label="Previous artist"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={isTransitioning}
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-40"
              style={{
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(251,146,60,0.4)",
                color: "#fbbf24",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(251,146,60,0.2)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(251,146,60,0.8)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 0 16px rgba(251,146,60,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(0,0,0,0.5)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(251,146,60,0.4)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
              aria-label="Next artist"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {activeArtists.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {activeArtists.map((_, idx) => (
              <button
                // biome-ignore lint/suspicious/noArrayIndexKey: dot indicators use index by design
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: idx === currentIndex ? "24px" : "8px",
                  height: "8px",
                  background:
                    idx === currentIndex ? "#fbbf24" : "rgba(251,191,36,0.35)",
                  boxShadow:
                    idx === currentIndex
                      ? "0 0 8px rgba(251,191,36,0.8)"
                      : "none",
                }}
                aria-label={`Go to artist ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom separator glow */}
      <div
        className="w-full h-px mt-4"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(251,146,60,0.4), rgba(251,191,36,0.6), rgba(251,146,60,0.4), transparent)",
        }}
      />
    </section>
  );
}
