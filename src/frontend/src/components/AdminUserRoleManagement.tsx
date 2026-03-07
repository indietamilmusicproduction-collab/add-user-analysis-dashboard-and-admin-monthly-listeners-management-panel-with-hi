import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Principal } from "@dfinity/principal";
import {
  AlertCircle,
  Check,
  Copy,
  Loader2,
  ShieldCheck,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import {
  useDemoteAdmin,
  useListAdmins,
  usePromoteToAdmin,
} from "../hooks/useQueries";

function truncatePrincipal(principal: string): string {
  if (principal.length <= 20) return principal;
  return `${principal.slice(0, 10)}...${principal.slice(-8)}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 shrink-0"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );
}

export default function AdminUserRoleManagement() {
  const [promoteInput, setPromoteInput] = useState("");
  const [promoteError, setPromoteError] = useState("");
  const [promoteSuccess, setPromoteSuccess] = useState("");
  const [demoteErrors, setDemoteErrors] = useState<Record<string, string>>({});

  const { data: admins = [], isLoading } = useListAdmins();
  const promoteToAdmin = usePromoteToAdmin();
  const demoteAdmin = useDemoteAdmin();

  const handlePromote = async () => {
    setPromoteError("");
    setPromoteSuccess("");

    const trimmed = promoteInput.trim();
    if (!trimmed) {
      setPromoteError("Please enter a principal ID.");
      return;
    }

    let target: Principal;
    try {
      target = Principal.fromText(trimmed);
    } catch {
      setPromoteError("Invalid principal ID format.");
      return;
    }

    try {
      await promoteToAdmin.mutateAsync(target);
      setPromoteSuccess(
        `Successfully promoted ${truncatePrincipal(trimmed)} to admin.`,
      );
      setPromoteInput("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPromoteError(`Failed to promote: ${msg}`);
    }
  };

  const handleDemote = async (principalStr: string) => {
    setDemoteErrors((prev) => ({ ...prev, [principalStr]: "" }));

    let target: Principal;
    try {
      target = Principal.fromText(principalStr);
    } catch {
      setDemoteErrors((prev) => ({
        ...prev,
        [principalStr]: "Invalid principal.",
      }));
      return;
    }

    try {
      await demoteAdmin.mutateAsync(target);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setDemoteErrors((prev) => ({ ...prev, [principalStr]: msg }));
    }
  };

  const isOnlyAdmin = admins.length <= 1;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Promote Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Promote to Admin
            </CardTitle>
            <CardDescription>
              Enter a user's principal ID to grant them admin privileges.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="promote-principal">Principal ID</Label>
              <div className="flex gap-2">
                <Input
                  id="promote-principal"
                  placeholder="e.g. aaaaa-aa or xxxxx-xxxxx-xxxxx-xxxxx-cai"
                  value={promoteInput}
                  onChange={(e) => {
                    setPromoteInput(e.target.value);
                    setPromoteError("");
                    setPromoteSuccess("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handlePromote();
                  }}
                  className="font-mono text-sm"
                />
                <Button
                  onClick={handlePromote}
                  disabled={promoteToAdmin.isPending || !promoteInput.trim()}
                >
                  {promoteToAdmin.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  Promote
                </Button>
              </div>
            </div>

            {promoteError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{promoteError}</AlertDescription>
              </Alert>
            )}

            {promoteSuccess && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-400">
                  {promoteSuccess}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Current Admins List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Current Admins
              {!isLoading && (
                <Badge variant="secondary" className="ml-1">
                  {admins.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              All principals with admin privileges. The last remaining admin
              cannot be demoted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : admins.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShieldCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No admins found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {admins.map((principal) => {
                  const principalStr = principal.toString();
                  const demoteError = demoteErrors[principalStr];
                  const isDemoting =
                    demoteAdmin.isPending &&
                    demoteAdmin.variables?.toString() === principalStr;

                  return (
                    <div
                      key={principalStr}
                      className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                        <span
                          className="font-mono text-sm truncate"
                          title={principalStr}
                        >
                          {truncatePrincipal(principalStr)}
                        </span>
                        <CopyButton text={principalStr} />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {demoteError && (
                          <span
                            className="text-xs text-destructive max-w-[160px] truncate"
                            title={demoteError}
                          >
                            {demoteError}
                          </span>
                        )}

                        {isOnlyAdmin ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled
                                  className="opacity-50 cursor-not-allowed"
                                >
                                  <UserMinus className="h-4 w-4 mr-1" />
                                  Demote
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              Cannot demote the last remaining admin
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDemote(principalStr)}
                            disabled={isDemoting}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                          >
                            {isDemoting ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <UserMinus className="h-4 w-4 mr-1" />
                            )}
                            Demote
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
