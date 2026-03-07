import { ExternalLink } from "lucide-react";

interface StreamingPlatformButtonProps {
  platform:
    | "spotify"
    | "appleMusic"
    | "amazonMusic"
    | "soundcloud"
    | "youtube"
    | "youtubeMusic";
  url: string;
  platformName: string;
}

export default function StreamingPlatformButton({
  platform,
  url,
  platformName,
}: StreamingPlatformButtonProps) {
  const platformStyles = {
    spotify: {
      bg: "bg-[#1DB954] hover:bg-[#1ed760]",
      logo: "/assets/generated/spotify-logo.dim_128x128.png",
    },
    appleMusic: {
      bg: "bg-[#FA243C] hover:bg-[#fb4458]",
      logo: "/assets/generated/apple-music-logo.dim_128x128.png",
    },
    amazonMusic: {
      bg: "bg-[#00A8E1] hover:bg-[#1ab5e8]",
      logo: "/assets/generated/amazon-music-logo.dim_120x120.png",
    },
    soundcloud: {
      bg: "bg-[#FF5500] hover:bg-[#ff6a1f]",
      logo: "/assets/generated/soundcloud-logo.dim_120x120.png",
    },
    youtube: {
      bg: "bg-[#FF0000] hover:bg-[#ff1a1a]",
      logo: "/assets/generated/youtube-logo.dim_120x120.png",
    },
    youtubeMusic: {
      bg: "bg-[#FF0000] hover:bg-[#ff1a1a]",
      logo: "/assets/generated/youtube-music-logo.dim_120x120.png",
    },
  };

  const style = platformStyles[platform];

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-between px-6 py-4 ${style.bg} text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg group`}
    >
      <div className="flex items-center gap-4">
        <img
          src={style.logo}
          alt={`${platformName} logo`}
          className="w-8 h-8 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <span className="font-semibold text-lg">Listen on {platformName}</span>
      </div>
      <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </a>
  );
}
