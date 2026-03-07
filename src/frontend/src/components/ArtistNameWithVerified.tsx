import type { Principal } from "@dfinity/principal";
import { useIsArtistVerified } from "../hooks/useQueries";
import GreenBadge from "./GreenBadge";
import VerifiedBadge from "./VerifiedBadge";

interface ArtistNameWithVerifiedProps {
  artistName: string;
  ownerPrincipal: Principal;
  className?: string;
  badgeSize?: "small" | "medium" | "large";
}

export default function ArtistNameWithVerified({
  artistName,
  ownerPrincipal: _ownerPrincipal,
  className = "",
  badgeSize = "medium",
}: ArtistNameWithVerifiedProps) {
  const { data: isVerified, isLoading } = useIsArtistVerified();

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span>{artistName}</span>
      {!isLoading &&
        (isVerified ? (
          <VerifiedBadge size={badgeSize} />
        ) : (
          <GreenBadge size={badgeSize} />
        ))}
    </span>
  );
}
