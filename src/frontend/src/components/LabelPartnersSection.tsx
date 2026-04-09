// @ts-nocheck
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { useGetAllLabelPartners } from "../hooks/useQueries";

export default function LabelPartnersSection() {
  const { data: partners = [], isLoading } = useGetAllLabelPartners();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <section className="py-14 px-4 bg-gradient-to-b from-muted/10 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              Label Partners
            </h2>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                key={i}
                className="flex-shrink-0 w-56 rounded-xl border border-border bg-card p-4 space-y-3"
              >
                <Skeleton className="w-16 h-16 rounded-lg mx-auto" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (partners.length === 0) {
    return null;
  }

  return (
    <section className="py-14 px-4 bg-gradient-to-b from-muted/10 to-background">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Label Partners</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-6">
          Explore the record labels and music companies we work with
        </p>

        {/* Horizontal Scroll Row */}
        <div
          className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "oklch(var(--border)) transparent",
          }}
        >
          {partners.map((partner, idx) => (
            <button
              key={String(partner.id)}
              type="button"
              className="flex-shrink-0 w-56 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-pointer text-left overflow-hidden group"
              onClick={() =>
                navigate({
                  to: "/label/$labelName",
                  params: { labelName: encodeURIComponent(partner.labelName) },
                })
              }
              data-ocid={`label.partner.card.${idx + 1}`}
            >
              {/* Logo */}
              <div className="flex items-center justify-center h-28 bg-muted/40 border-b border-border/50 p-3">
                {partner.logoUrl ? (
                  <img
                    src={partner.logoUrl}
                    alt={partner.labelName}
                    className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      const fallback = (e.target as HTMLImageElement)
                        .nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="flex-col items-center justify-center text-muted-foreground"
                  style={{ display: partner.logoUrl ? "none" : "flex" }}
                >
                  <Building2 className="h-10 w-10" />
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                <p className="font-bold text-foreground text-sm leading-tight truncate mb-1 group-hover:text-primary transition-colors">
                  {partner.labelName}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {partner.description}
                </p>
                <p className="text-xs text-primary/70 mt-2 font-medium group-hover:text-primary transition-colors">
                  View releases →
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
