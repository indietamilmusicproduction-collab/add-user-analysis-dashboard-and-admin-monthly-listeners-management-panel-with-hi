// @ts-nocheck
import { useParams } from "@tanstack/react-router";
import { Music } from "lucide-react";
import StreamingPlatformButton from "../components/StreamingPlatformButton";
import { useGetSongInfo } from "../hooks/useQueries";

export default function SongPage() {
  const { songId } = useParams({ from: "/song/$songId" });
  const { data: songInfo, isLoading, error } = useGetSongInfo(songId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg text-muted-foreground">Loading song...</p>
        </div>
      </div>
    );
  }

  if (error || !songInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="text-center space-y-4 max-w-md">
          <Music className="w-16 h-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground">
            Song Not Available
          </h1>
          <p className="text-muted-foreground">
            This song is not currently available for public viewing.
          </p>
        </div>
      </div>
    );
  }

  const artworkUrl = songInfo.artwork.getDirectURL();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          {/* Artwork */}
          <div className="aspect-square w-full relative">
            <img
              src={artworkUrl}
              alt={songInfo.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "/assets/generated/default-artwork.dim_300x300.png";
              }}
            />
          </div>

          {/* Song Info */}
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                {songInfo.title}
              </h1>
              <p className="text-xl text-muted-foreground">{songInfo.artist}</p>
              {songInfo.featuredArtist && (
                <p className="text-lg text-muted-foreground">
                  ft. {songInfo.featuredArtist}
                </p>
              )}
            </div>

            {/* Streaming Platform Links */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">
                Listen Now
              </h2>
              <div className="flex flex-col gap-3">
                {songInfo.spotifyLink && (
                  <StreamingPlatformButton
                    platform="spotify"
                    url={songInfo.spotifyLink}
                    platformName="Spotify"
                  />
                )}
                {songInfo.appleMusicLink && (
                  <StreamingPlatformButton
                    platform="appleMusic"
                    url={songInfo.appleMusicLink}
                    platformName="Apple Music"
                  />
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="pt-4 border-t border-border space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Genre:</span>
                <span className="font-medium">{songInfo.genre}</span>
              </div>
              <div className="flex justify-between">
                <span>Language:</span>
                <span className="font-medium">{songInfo.language}</span>
              </div>
              <div className="flex justify-between">
                <span>Release Date:</span>
                <span className="font-medium">
                  {new Date(
                    Number(songInfo.releaseDate / BigInt(1000000)),
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Music Video Link */}
            {songInfo.musicVideoLink && (
              <div className="pt-4">
                <a
                  href={songInfo.musicVideoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Watch Music Video
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer Attribution */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Powered by INDIE TAMIL MUSIC PRODUCTION</p>
        </div>
      </div>
    </div>
  );
}
