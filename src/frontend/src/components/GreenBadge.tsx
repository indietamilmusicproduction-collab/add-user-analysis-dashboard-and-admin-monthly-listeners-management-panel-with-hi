import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GreenBadgeProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function GreenBadge({
  size = "medium",
  className = "",
}: GreenBadgeProps) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-5 h-5",
    large: "w-6 h-6",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <img
            src="/assets/generated/green-tick-badge-transparent.dim_24x24.png"
            alt="Artist"
            className={`inline-block ${sizeClasses[size]} ${className}`}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Artist</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
