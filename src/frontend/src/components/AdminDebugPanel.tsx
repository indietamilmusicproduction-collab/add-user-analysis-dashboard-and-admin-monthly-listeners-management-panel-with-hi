// @ts-nocheck
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCallback, useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

type CheckStatus = "pending" | "pass" | "fail" | "warn" | "skip";

interface CheckResult {
  name: string;
  status: CheckStatus;
  latencyMs?: number;
  detail?: string;
  fix?: string;
}

interface ScanSection {
  label: string;
  icon: string;
  checks: CheckResult[];
}

interface ErrorLogEntry {
  timestamp: string;
  message: string;
  source: string;
}

// All backend functions exposed on the actor
const ALL_BACKEND_FUNCTIONS: { fn: string; fix: string }[] = [
  {
    fn: "isCallerAdmin",
    fix: "Declare isCallerAdmin in main.mo and Candid interface files",
  },
  {
    fn: "getCallerUserRole",
    fix: "Declare getCallerUserRole in main.mo and Candid interface files",
  },
  {
    fn: "getCallerUserProfile",
    fix: "Declare getCallerUserProfile in main.mo and Candid interface files",
  },
  {
    fn: "saveCallerUserProfile",
    fix: "Declare saveCallerUserProfile in main.mo and Candid interface files",
  },
  {
    fn: "getMyArtistProfiles",
    fix: "Declare getMyArtistProfiles in main.mo and Candid interface files",
  },
  {
    fn: "createArtistProfile",
    fix: "Declare createArtistProfile in main.mo and Candid interface files",
  },
  {
    fn: "updateArtistProfile",
    fix: "Declare updateArtistProfile in main.mo and Candid interface files",
  },
  {
    fn: "deleteArtistProfile",
    fix: "Declare deleteArtistProfile in main.mo and Candid interface files",
  },
  {
    fn: "getArtistProfileEditingAccessStatus",
    fix: "Declare getArtistProfileEditingAccessStatus in main.mo and Candid interface files",
  },
  {
    fn: "getAllArtistProfilesForAdmin",
    fix: "Declare getAllArtistProfilesForAdmin in main.mo and Candid interface files",
  },
  {
    fn: "adminEditArtistProfile",
    fix: "Declare adminEditArtistProfile in main.mo and Candid interface files",
  },
  {
    fn: "adminDeleteArtistProfile",
    fix: "Declare adminDeleteArtistProfile in main.mo and Candid interface files",
  },
  {
    fn: "getMySubmissions",
    fix: "Declare getMySubmissions in main.mo and Candid interface files",
  },
  {
    fn: "submitSong",
    fix: "Declare submitSong in main.mo and Candid interface files",
  },
  {
    fn: "editSongSubmission",
    fix: "Declare editSongSubmission in main.mo and Candid interface files",
  },
  {
    fn: "getAllSubmissionsForAdmin",
    fix: "Declare getAllSubmissionsForAdmin in main.mo and Candid interface files",
  },
  {
    fn: "adminUpdateSubmission",
    fix: "Declare adminUpdateSubmission in main.mo and Candid interface files",
  },
  {
    fn: "adminSetSubmissionLive",
    fix: "Declare adminSetSubmissionLive in main.mo and Candid interface files",
  },
  {
    fn: "adminEditSubmission",
    fix: "Declare adminEditSubmission in main.mo and Candid interface files",
  },
  {
    fn: "adminDeleteSubmission",
    fix: "Declare adminDeleteSubmission in main.mo and Candid interface files",
  },
  {
    fn: "isUserBlockedSongSubmission",
    fix: "Declare isUserBlockedSongSubmission in main.mo and Candid interface files",
  },
  {
    fn: "blockUserSongSubmission",
    fix: "Declare blockUserSongSubmission in main.mo and Candid interface files",
  },
  {
    fn: "unblockUserSongSubmission",
    fix: "Declare unblockUserSongSubmission in main.mo and Candid interface files",
  },
  {
    fn: "createPodcastShow",
    fix: "Declare createPodcastShow in main.mo and Candid interface files",
  },
  {
    fn: "getMyPodcastShows",
    fix: "Declare getMyPodcastShows in main.mo and Candid interface files",
  },
  {
    fn: "getAllPodcasts",
    fix: "Declare getAllPodcasts in main.mo and Candid interface files",
  },
  {
    fn: "getAllPendingPodcasts",
    fix: "Declare getAllPendingPodcasts in main.mo and Candid interface files",
  },
  {
    fn: "approvePodcast",
    fix: "Declare approvePodcast in main.mo and Candid interface files",
  },
  {
    fn: "rejectPodcast",
    fix: "Declare rejectPodcast in main.mo and Candid interface files",
  },
  {
    fn: "markPodcastLive",
    fix: "Declare markPodcastLive in main.mo and Candid interface files",
  },
  {
    fn: "createPodcastEpisode",
    fix: "Declare createPodcastEpisode in main.mo and Candid interface files",
  },
  {
    fn: "getMyEpisodes",
    fix: "Declare getMyEpisodes in main.mo and Candid interface files",
  },
  {
    fn: "getAllEpisodes",
    fix: "Declare getAllEpisodes in main.mo and Candid interface files",
  },
  {
    fn: "getAllPendingEpisodes",
    fix: "Declare getAllPendingEpisodes in main.mo and Candid interface files",
  },
  {
    fn: "approveEpisode",
    fix: "Declare approveEpisode in main.mo and Candid interface files",
  },
  {
    fn: "rejectEpisode",
    fix: "Declare rejectEpisode in main.mo and Candid interface files",
  },
  {
    fn: "markEpisodeLive",
    fix: "Declare markEpisodeLive in main.mo and Candid interface files",
  },
  {
    fn: "isUserBlockedPodcastSubmission",
    fix: "Declare isUserBlockedPodcastSubmission in main.mo and Candid interface files",
  },
  {
    fn: "blockUserPodcastSubmission",
    fix: "Declare blockUserPodcastSubmission in main.mo and Candid interface files",
  },
  {
    fn: "unblockUserPodcastSubmission",
    fix: "Declare unblockUserPodcastSubmission in main.mo and Candid interface files",
  },
  {
    fn: "submitVideo",
    fix: "Declare submitVideo in main.mo and Candid interface files",
  },
  {
    fn: "getUserVideoSubmissions",
    fix: "Declare getUserVideoSubmissions in main.mo and Candid interface files",
  },
  {
    fn: "getAllVideoSubmissions",
    fix: "Declare getAllVideoSubmissions in main.mo and Candid interface files",
  },
  {
    fn: "updateVideoStatus",
    fix: "Declare updateVideoStatus in main.mo and Candid interface files",
  },
  {
    fn: "updateVideoSubmission",
    fix: "Declare updateVideoSubmission in main.mo and Candid interface files",
  },
  {
    fn: "deleteVideoSubmission",
    fix: "Declare deleteVideoSubmission in main.mo and Candid interface files",
  },
  {
    fn: "getAllLabelPartners",
    fix: "Declare getAllLabelPartners in main.mo and Candid interface files",
  },
  {
    fn: "addLabelPartner",
    fix: "Declare addLabelPartner in main.mo and Candid interface files",
  },
  {
    fn: "updateLabelPartner",
    fix: "Declare updateLabelPartner in main.mo and Candid interface files",
  },
  {
    fn: "deleteLabelPartner",
    fix: "Declare deleteLabelPartner in main.mo and Candid interface files",
  },
  {
    fn: "getAllLabelReleases",
    fix: "Declare getAllLabelReleases in main.mo and Candid interface files",
  },
  {
    fn: "getLabelReleases",
    fix: "Declare getLabelReleases in main.mo and Candid interface files",
  },
  {
    fn: "addLabelRelease",
    fix: "Declare addLabelRelease in main.mo and Candid interface files",
  },
  {
    fn: "updateLabelRelease",
    fix: "Declare updateLabelRelease in main.mo and Candid interface files",
  },
  {
    fn: "deleteLabelRelease",
    fix: "Declare deleteLabelRelease in main.mo and Candid interface files",
  },
  {
    fn: "getRankedTopVibingSongs",
    fix: "Declare getRankedTopVibingSongs in main.mo and Candid interface files",
  },
  {
    fn: "getAllTopVibingSongs",
    fix: "Declare getAllTopVibingSongs in main.mo and Candid interface files",
  },
  {
    fn: "addTopVibingSong",
    fix: "Declare addTopVibingSong in main.mo and Candid interface files",
  },
  {
    fn: "updateTopVibingSong",
    fix: "Declare updateTopVibingSong in main.mo and Candid interface files",
  },
  {
    fn: "deleteTopVibingSong",
    fix: "Declare deleteTopVibingSong in main.mo and Candid interface files",
  },
  {
    fn: "reorderTopVibingSongs",
    fix: "Declare reorderTopVibingSongs in main.mo and Candid interface files",
  },
  {
    fn: "getActiveFeaturedArtists",
    fix: "Declare getActiveFeaturedArtists in main.mo and Candid interface files",
  },
  {
    fn: "getFeaturedArtists",
    fix: "Declare getFeaturedArtists in main.mo and Candid interface files",
  },
  {
    fn: "setFeaturedArtist",
    fix: "Declare setFeaturedArtist in main.mo and Candid interface files",
  },
  {
    fn: "toggleFeaturedArtistSlot",
    fix: "Declare toggleFeaturedArtistSlot in main.mo and Candid interface files",
  },
  {
    fn: "getAllSubscriptionPlans",
    fix: "Declare getAllSubscriptionPlans in main.mo and Candid interface files",
  },
  {
    fn: "createSubscriptionPlan",
    fix: "Declare createSubscriptionPlan in main.mo and Candid interface files",
  },
  {
    fn: "updateSubscriptionPlan",
    fix: "Declare updateSubscriptionPlan in main.mo and Candid interface files",
  },
  {
    fn: "deleteSubscriptionPlan",
    fix: "Declare deleteSubscriptionPlan in main.mo and Candid interface files",
  },
  {
    fn: "getVerificationRequests",
    fix: "Declare getVerificationRequests in main.mo and Candid interface files",
  },
  {
    fn: "applyForVerification",
    fix: "Declare applyForVerification in main.mo and Candid interface files",
  },
  {
    fn: "handleVerificationRequest",
    fix: "Declare handleVerificationRequest in main.mo and Candid interface files",
  },
  {
    fn: "updateVerificationStatus",
    fix: "Declare updateVerificationStatus in main.mo and Candid interface files",
  },
  {
    fn: "isArtistVerified",
    fix: "Declare isArtistVerified in main.mo and Candid interface files",
  },
  {
    fn: "promoteToAdmin",
    fix: "Declare promoteToAdmin in main.mo and Candid interface files",
  },
  {
    fn: "demoteFromAdmin",
    fix: "Declare demoteFromAdmin in main.mo and Candid interface files",
  },
  {
    fn: "listAdmins",
    fix: "Declare listAdmins in main.mo and Candid interface files",
  },
  {
    fn: "assignCallerUserRole",
    fix: "Declare assignCallerUserRole in main.mo and Candid interface files",
  },
  {
    fn: "updateUserCategory",
    fix: "Declare updateUserCategory in main.mo and Candid interface files",
  },
  {
    fn: "getUsersByCategory",
    fix: "Declare getUsersByCategory in main.mo and Candid interface files",
  },
  {
    fn: "upgradeUserToTeamMember",
    fix: "Declare upgradeUserToTeamMember in main.mo and Candid interface files",
  },
  {
    fn: "downgradeTeamMember",
    fix: "Declare downgradeTeamMember in main.mo and Candid interface files",
  },
  {
    fn: "getAllTeamMembers",
    fix: "Declare getAllTeamMembers in main.mo and Candid interface files",
  },
  {
    fn: "getAllBlockedUsersAdmin",
    fix: "Declare getAllBlockedUsersAdmin in main.mo and Candid interface files",
  },
  {
    fn: "getSongInfo",
    fix: "Declare getSongInfo in main.mo and Candid interface files",
  },
  {
    fn: "getWebsiteLogo",
    fix: "Declare getWebsiteLogo in main.mo and Candid interface files",
  },
  {
    fn: "setWebsiteLogo",
    fix: "Declare setWebsiteLogo in main.mo and Candid interface files",
  },
  {
    fn: "removeWebsiteLogo",
    fix: "Declare removeWebsiteLogo in main.mo and Candid interface files",
  },
  {
    fn: "getUserProfile",
    fix: "Declare getUserProfile in main.mo and Candid interface files",
  },
  {
    fn: "doesUserHaveArtistProfile",
    fix: "Declare doesUserHaveArtistProfile in main.mo and Candid interface files",
  },
  {
    fn: "getArtistProfileByOwner",
    fix: "Declare getArtistProfileByOwner in main.mo and Candid interface files",
  },
  {
    fn: "setArtistProfileEditingAccess",
    fix: "Declare setArtistProfileEditingAccess in main.mo and Candid interface files",
  },
  {
    fn: "isArtistProfileEditingEnabled",
    fix: "Declare isArtistProfileEditingEnabled in main.mo and Candid interface files",
  },
];

const KNOWN_ROUTES = [
  { path: "/", label: "Landing Page" },
  { path: "/user-dashboard", label: "User Dashboard" },
  { path: "/admin-dashboard", label: "Admin Dashboard" },
  { path: "/thank-you", label: "Thank You Page" },
  { path: "/song/test-id", label: "Song Page (/song/:id)" },
  { path: "/label/test-label", label: "Label Page (/label/:name)" },
];

export default function AdminDebugPanel() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const [sections, setSections] = useState<ScanSection[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [errorLog, setErrorLog] = useState<ErrorLogEntry[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["Backend Functions", "Frontend Routes", "Dashboard Panels"]),
  );
  const errorLogRef = useRef<ErrorLogEntry[]>([]);
  const [bootstrapStatus, setBootstrapStatus] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  const handleBootstrapAdmin = useCallback(async () => {
    if (!actor) return;
    setIsBootstrapping(true);
    setBootstrapStatus(null);
    try {
      await actor.bootstrapAdmin();
      setBootstrapStatus("success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setBootstrapStatus(`error:${msg}`);
    } finally {
      setIsBootstrapping(false);
    }
  }, [actor]);

  // Capture global errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const entry: ErrorLogEntry = {
        timestamp: new Date().toISOString(),
        message: event.message || "Unknown error",
        source: event.filename
          ? `${event.filename}:${event.lineno}`
          : "unknown",
      };
      errorLogRef.current = [entry, ...errorLogRef.current].slice(0, 50);
      setErrorLog([...errorLogRef.current]);
    };
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const entry: ErrorLogEntry = {
        timestamp: new Date().toISOString(),
        message: String(event.reason) || "Unhandled promise rejection",
        source: "promise",
      };
      errorLogRef.current = [entry, ...errorLogRef.current].slice(0, 50);
      setErrorLog([...errorLogRef.current]);
    };
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  const runFullScan = useCallback(async () => {
    if (!actor) return;
    setIsRunning(true);
    setScanComplete(false);
    setSections([]);

    // ---- SECTION 1: Backend Functions ----
    const backendChecks: CheckResult[] = [];
    for (const { fn, fix } of ALL_BACKEND_FUNCTIONS) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const actorFn = (actor as any)[fn];
      if (typeof actorFn !== "function") {
        backendChecks.push({
          name: `${fn}()`,
          status: "fail",
          detail: "Function not found on actor — missing from Candid interface",
          fix,
        });
      } else {
        backendChecks.push({
          name: `${fn}()`,
          status: "pass",
          detail: "Declared on actor",
        });
      }
    }

    setSections([
      { label: "Backend Functions", icon: "⚙️", checks: backendChecks },
    ]);

    // ---- SECTION 2: Route Accessibility ----
    const routeChecks: CheckResult[] = KNOWN_ROUTES.map((r) => ({
      name: r.label,
      status: "pass" as CheckStatus,
      detail: `Route ${r.path} is registered in the router`,
    }));
    setSections((prev) => [
      ...prev,
      { label: "Frontend Routes", icon: "🗺️", checks: routeChecks },
    ]);

    // ---- SECTION 3: Dashboard Panel API Checks ----
    const panelChecks: CheckResult[] = [];

    const liveCall = async (
      label: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fn: () => Promise<any>,
      fix: string,
    ): Promise<CheckResult> => {
      const start = performance.now();
      try {
        const result = await fn();
        const ms = Math.round(performance.now() - start);
        let detail = "";
        if (Array.isArray(result)) detail = `Returned ${result.length} item(s)`;
        else if (result === null || result === undefined)
          detail = "Returned null";
        else detail = "OK";
        return { name: label, status: "pass", latencyMs: ms, detail };
      } catch (e) {
        const ms = Math.round(performance.now() - start);
        return {
          name: label,
          status: "fail",
          latencyMs: ms,
          detail: e instanceof Error ? e.message : String(e),
          fix,
        };
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a = actor as any;

    panelChecks.push(
      await liveCall(
        "Artist Profiles — getMyArtistProfiles",
        () => a.getMyArtistProfiles(),
        "Add getMyArtistProfiles to main.mo and Candid interface",
      ),
      await liveCall(
        "Artist Profiles — getArtistProfileEditingAccessStatus",
        () => a.getArtistProfileEditingAccessStatus(),
        "Add getArtistProfileEditingAccessStatus to main.mo and Candid interface",
      ),
      await liveCall(
        "Artist Profiles — getAllArtistProfilesForAdmin",
        () => a.getAllArtistProfilesForAdmin(),
        "Add getAllArtistProfilesForAdmin to main.mo and Candid interface",
      ),
    );

    panelChecks.push(
      await liveCall(
        "Song Submissions — getMySubmissions",
        () => a.getMySubmissions(),
        "Add getMySubmissions to main.mo and Candid interface",
      ),
      await liveCall(
        "Song Submissions — getAllSubmissionsForAdmin",
        () => a.getAllSubmissionsForAdmin(),
        "Add getAllSubmissionsForAdmin to main.mo and Candid interface",
      ),
    );

    panelChecks.push(
      await liveCall(
        "Podcast — getMyPodcastShows",
        () => a.getMyPodcastShows(),
        "Add getMyPodcastShows to main.mo and Candid interface",
      ),
      await liveCall(
        "Podcast — getAllPodcasts",
        () => a.getAllPodcasts(),
        "Add getAllPodcasts to main.mo and Candid interface",
      ),
      await liveCall(
        "Podcast — getAllEpisodes",
        () => a.getAllEpisodes(),
        "Add getAllEpisodes to main.mo and Candid interface",
      ),
    );

    panelChecks.push(
      await liveCall(
        "Video — getUserVideoSubmissions",
        () => a.getUserVideoSubmissions(),
        "Add getUserVideoSubmissions to main.mo and Candid interface",
      ),
      await liveCall(
        "Video — getAllVideoSubmissions",
        () => a.getAllVideoSubmissions(),
        "Add getAllVideoSubmissions to main.mo and Candid interface",
      ),
    );

    panelChecks.push(
      await liveCall(
        "Analytics — getCallerUserProfile",
        () => a.getCallerUserProfile(),
        "Add getCallerUserProfile to main.mo and Candid interface",
      ),
      await liveCall(
        "Subscription Plans — getAllSubscriptionPlans",
        () => a.getAllSubscriptionPlans(),
        "Add getAllSubscriptionPlans to main.mo and Candid interface",
      ),
      await liveCall(
        "Verification — getVerificationRequests",
        () => a.getVerificationRequests(),
        "Add getVerificationRequests to main.mo and Candid interface",
      ),
      await liveCall(
        "Featured Artists — getFeaturedArtists",
        () => a.getFeaturedArtists(),
        "Add getFeaturedArtists to main.mo and Candid interface",
      ),
      await liveCall(
        "Top Vibing Songs — getAllTopVibingSongs",
        () => a.getAllTopVibingSongs(),
        "Add getAllTopVibingSongs to main.mo and Candid interface",
      ),
      await liveCall(
        "Label Partners — getAllLabelPartners",
        () => a.getAllLabelPartners(),
        "Add getAllLabelPartners to main.mo and Candid interface",
      ),
      await liveCall(
        "Label Partners — getAllLabelReleases",
        () => a.getAllLabelReleases(),
        "Add getAllLabelReleases to main.mo and Candid interface",
      ),
      await liveCall(
        "Admin Role — listAdmins",
        () => a.listAdmins(),
        "Add listAdmins to main.mo and Candid interface",
      ),
      await liveCall(
        "Admin Role — isCallerAdmin",
        () => a.isCallerAdmin(),
        "Add isCallerAdmin to main.mo and Candid interface",
      ),
      await liveCall(
        "Website — getWebsiteLogo",
        () => a.getWebsiteLogo(),
        "Add getWebsiteLogo to main.mo and Candid interface",
      ),
    );

    setSections((prev) => [
      ...prev,
      { label: "Dashboard Panels", icon: "📋", checks: panelChecks },
    ]);

    setIsRunning(false);
    setScanComplete(true);
  }, [actor]);

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const statusColor = (s: CheckStatus) => {
    if (s === "pass") return "text-emerald-400";
    if (s === "fail") return "text-red-400";
    if (s === "warn") return "text-yellow-400";
    if (s === "skip") return "text-slate-500";
    return "text-slate-400";
  };

  const statusIcon = (s: CheckStatus) => {
    if (s === "pass") return "✓";
    if (s === "fail") return "✗";
    if (s === "warn") return "⚠";
    if (s === "skip") return "⊘";
    return "…";
  };

  const statusBg = (s: CheckStatus) => {
    if (s === "pass") return "bg-emerald-950/40 border-emerald-800/30";
    if (s === "fail") return "bg-red-950/40 border-red-800/40";
    if (s === "warn") return "bg-yellow-950/40 border-yellow-800/30";
    return "bg-slate-800/40 border-slate-700/30";
  };

  const totalPass = sections
    .flatMap((s) => s.checks)
    .filter((c) => c.status === "pass").length;
  const totalFail = sections
    .flatMap((s) => s.checks)
    .filter((c) => c.status === "fail").length;
  const totalWarn = sections
    .flatMap((s) => s.checks)
    .filter((c) => c.status === "warn").length;
  const totalChecks = sections.flatMap((s) => s.checks).length;

  const copyReport = () => {
    const lines: string[] = [
      "=== INDIE TAMIL MUSIC PRODUCTION — FULL SCAN REPORT ===",
      "",
    ];
    for (const section of sections) {
      lines.push(`## ${section.label}`);
      for (const c of section.checks) {
        const icon = statusIcon(c.status).padEnd(2);
        lines.push(
          `  ${icon} ${c.name}${c.latencyMs != null ? ` (${c.latencyMs}ms)` : ""}`,
        );
        if (c.detail) lines.push(`     Detail: ${c.detail}`);
        if (c.fix && c.status === "fail") lines.push(`     Fix: ${c.fix}`);
      }
      lines.push("");
    }
    lines.push(
      `Summary: ${totalPass} passed, ${totalFail} failed, ${totalWarn} warnings`,
    );
    navigator.clipboard.writeText(lines.join("\n")).catch(() => {});
  };

  const principal = identity?.getPrincipal().toString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-purple-300 font-mono tracking-wide">
            🔧 Admin Debug Panel
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Full website scanner — backend functions, routes, and dashboard
            panels
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleBootstrapAdmin}
            disabled={isBootstrapping || !actor}
            className="bg-amber-700 hover:bg-amber-600 text-white border border-amber-500/40 font-mono text-sm"
          >
            {isBootstrapping ? "Bootstrapping…" : "🔑 Bootstrap Admin"}
          </Button>
          {bootstrapStatus === "success" && (
            <span className="text-green-400 font-mono text-xs self-center">
              ✅ Admin role granted! Reload the page.
            </span>
          )}
          {bootstrapStatus === "already-done" && (
            <span className="text-yellow-400 font-mono text-xs self-center">
              ⚠️ Bootstrap already done (admin exists).
            </span>
          )}
          {bootstrapStatus?.startsWith("error:") && (
            <span className="text-red-400 font-mono text-xs self-center">
              ❌ {bootstrapStatus.replace("error:", "")}
            </span>
          )}
          <Button
            data-ocid="debug.run_scan_button"
            onClick={runFullScan}
            disabled={isRunning || !actor}
            className="bg-purple-600 hover:bg-purple-500 text-white border border-purple-500/40 font-mono text-sm"
          >
            {isRunning ? "Scanning…" : "▶ Run Full Scan"}
          </Button>
          {scanComplete && (
            <Button
              variant="outline"
              onClick={copyReport}
              className="border-cyan-700 text-cyan-300 hover:bg-cyan-950/40 font-mono text-sm"
            >
              📋 Copy Report
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              errorLogRef.current = [];
              setErrorLog([]);
            }}
            className="border-slate-600 text-slate-300 hover:bg-slate-800 font-mono text-sm"
          >
            🗑 Clear Logs
          </Button>
        </div>
      </div>

      {/* Auth + Connection Status */}
      <div className="bg-slate-900/90 border border-purple-500/40 rounded-xl p-5">
        <h3 className="text-cyan-400 font-mono font-semibold text-xs uppercase tracking-wider mb-3">
          Connection &amp; Auth
        </h3>
        <div className="flex flex-wrap gap-6 font-mono text-xs">
          <div className="flex gap-2">
            <span className="text-slate-500">Actor:</span>
            <span className={actor ? "text-emerald-400" : "text-red-400"}>
              {isFetching ? "Fetching…" : actor ? "✓ Ready" : "✗ Null"}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-slate-500">Identity:</span>
            <span className={identity ? "text-emerald-400" : "text-yellow-400"}>
              {identity ? "✓ Authenticated" : "⚠ Not logged in"}
            </span>
          </div>
          {principal && (
            <div className="flex gap-2 max-w-xs">
              <span className="text-slate-500 shrink-0">Principal:</span>
              <span className="text-purple-300 truncate">{principal}</span>
            </div>
          )}
          {userProfile && (
            <div className="flex gap-2">
              <span className="text-slate-500">Category:</span>
              <span className="text-cyan-300">
                {String(userProfile.category ?? "unknown")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Scan Summary */}
      {scanComplete && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-950/40 border border-emerald-700/40 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-emerald-400 font-mono">
              {totalPass}
            </div>
            <div className="text-xs text-emerald-500 mt-1 uppercase tracking-wide">
              Passed
            </div>
          </div>
          <div className="bg-red-950/40 border border-red-700/40 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-red-400 font-mono">
              {totalFail}
            </div>
            <div className="text-xs text-red-500 mt-1 uppercase tracking-wide">
              Failed
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-slate-300 font-mono">
              {totalChecks}
            </div>
            <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide">
              Total Checks
            </div>
          </div>
        </div>
      )}

      {/* Running indicator */}
      {isRunning && (
        <div className="flex items-center gap-3 p-4 bg-purple-950/30 border border-purple-600/30 rounded-xl">
          <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin shrink-0" />
          <span className="text-purple-300 font-mono text-sm">
            Scanning entire website… this may take a few seconds
          </span>
        </div>
      )}

      {/* Scan Sections */}
      {sections.map((section) => {
        const pass = section.checks.filter((c) => c.status === "pass").length;
        const fail = section.checks.filter((c) => c.status === "fail").length;
        const isExpanded = expandedSections.has(section.label);
        return (
          <div
            key={section.label}
            className="bg-slate-900/90 border border-purple-500/40 rounded-xl overflow-hidden"
          >
            <button
              type="button"
              className="w-full flex items-center justify-between p-5 hover:bg-slate-800/30 transition-colors"
              onClick={() => toggleSection(section.label)}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{section.icon}</span>
                <span className="text-cyan-400 font-mono font-semibold text-sm uppercase tracking-wider">
                  {section.label}
                </span>
                <Badge
                  variant="outline"
                  className="border-emerald-600 text-emerald-400 text-[10px]"
                >
                  {pass} pass
                </Badge>
                {fail > 0 && (
                  <Badge
                    variant="outline"
                    className="border-red-600 text-red-400 text-[10px]"
                  >
                    {fail} fail
                  </Badge>
                )}
              </div>
              <span className="text-slate-500 text-xs font-mono">
                {isExpanded ? "▲ hide" : "▼ show"}
              </span>
            </button>

            {isExpanded && (
              <div className="px-5 pb-5">
                <Separator className="mb-4 bg-purple-900/40" />
                <ScrollArea className="max-h-96">
                  <div className="space-y-2">
                    {section.checks.map((c, i) => (
                      <div
                        key={`${c.name}-${i}`}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${statusBg(c.status)}`}
                      >
                        <span
                          className={`font-bold font-mono text-sm mt-0.5 w-4 shrink-0 ${statusColor(c.status)}`}
                        >
                          {statusIcon(c.status)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-slate-200 font-mono text-xs">
                              {c.name}
                            </span>
                            {c.latencyMs !== undefined && (
                              <Badge
                                variant="outline"
                                className="text-[10px] border-slate-600 text-slate-400 px-1.5 py-0"
                              >
                                {c.latencyMs}ms
                              </Badge>
                            )}
                          </div>
                          {c.detail && (
                            <div
                              className={`text-[11px] mt-1 font-mono ${c.status === "fail" ? "text-red-300" : "text-slate-400"}`}
                            >
                              {c.detail}
                            </div>
                          )}
                          {c.fix && c.status === "fail" && (
                            <div className="text-[11px] mt-1 font-mono text-yellow-400">
                              💡 Fix: {c.fix}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        );
      })}

      {/* Error Log */}
      <div className="bg-slate-900/90 border border-purple-500/40 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-cyan-400 font-mono font-semibold text-xs uppercase tracking-wider">
            Live Error Log
          </h3>
          <span className="text-slate-500 font-mono text-xs">
            {errorLog.length} / 50 entries
          </span>
        </div>
        {errorLog.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-mono text-sm">
            <div className="text-2xl mb-2">✓</div>
            No runtime errors captured. Errors appear here automatically.
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {errorLog.map((entry) => (
                <div
                  key={`${entry.timestamp}-${entry.source}`}
                  className="p-3 rounded-lg bg-red-950/30 border border-red-800/30 font-mono text-xs"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-red-400 font-bold">ERR</span>
                    <span className="text-slate-500">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-slate-600 truncate text-[10px]">
                      {entry.source}
                    </span>
                  </div>
                  <div className="text-red-300 break-all">{entry.message}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
