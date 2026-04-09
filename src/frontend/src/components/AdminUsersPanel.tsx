// @ts-nocheck
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Principal } from "@dfinity/principal";
import {
  Ban,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  Star,
  UserCheck,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { AdminUserView } from "../backend";
import {
  useBlockPodcastForUsers,
  useBlockSongForUsers,
  useDemoteFromAdminForUsers,
  useDowngradeTeamMember,
  useGetAllRegisteredUsers,
  useGrantPremiumRole,
  usePromoteToAdminForUsers,
  useRevokePremiumRole,
  useUnblockPodcastForUsers,
  useUnblockSongForUsers,
  useUpgradeUserToTeamMember,
} from "../hooks/useQueries";

type RoleFilter = "all" | "admin" | "team" | "premium" | "blocked";

function getRoleBadge(user: AdminUserView) {
  if (user.isAdmin) {
    return (
      <Badge className="bg-red-500/20 text-red-400 border border-red-500/40 text-xs">
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    );
  }
  if (user.isTeamMember) {
    return (
      <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/40 text-xs">
        <UserCheck className="w-3 h-3 mr-1" />
        Team
      </Badge>
    );
  }
  if (user.isVerified) {
    return (
      <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-xs">
        <Star className="w-3 h-3 mr-1" />
        Premium
      </Badge>
    );
  }
  return (
    <Badge className="bg-zinc-500/20 text-zinc-400 border border-zinc-500/40 text-xs">
      User
    </Badge>
  );
}

function truncatePrincipal(p: string) {
  if (p.length <= 20) return p;
  return `${p.slice(0, 10)}...${p.slice(-8)}`;
}

interface UserActionsProps {
  user: AdminUserView;
  onRefetch: () => void;
}

function UserActions({ user, onRefetch }: UserActionsProps) {
  const [open, setOpen] = useState(false);
  const principal = user.principal as Principal;

  const grantPremium = useGrantPremiumRole();
  const revokePremium = useRevokePremiumRole();
  const promoteAdmin = usePromoteToAdminForUsers();
  const demoteAdmin = useDemoteFromAdminForUsers();
  const upgradeTeam = useUpgradeUserToTeamMember();
  const downgradeTeam = useDowngradeTeamMember();
  const blockSong = useBlockSongForUsers();
  const unblockSong = useUnblockSongForUsers();
  const blockPodcast = useBlockPodcastForUsers();
  const unblockPodcast = useUnblockPodcastForUsers();

  const isAnyPending =
    grantPremium.isPending ||
    revokePremium.isPending ||
    promoteAdmin.isPending ||
    demoteAdmin.isPending ||
    upgradeTeam.isPending ||
    downgradeTeam.isPending ||
    blockSong.isPending ||
    unblockSong.isPending ||
    blockPodcast.isPending ||
    unblockPodcast.isPending;

  async function run(label: string, fn: () => Promise<void>) {
    try {
      await fn();
      toast.success(`${label} successful`);
      onRefetch();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`${label} failed: ${msg}`);
    }
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        disabled={isAnyPending}
        className="text-xs"
      >
        {isAnyPending ? (
          <Loader2 className="w-3 h-3 animate-spin mr-1" />
        ) : (
          <>
            Actions{" "}
            {open ? (
              <ChevronUp className="w-3 h-3 ml-1" />
            ) : (
              <ChevronDown className="w-3 h-3 ml-1" />
            )}
          </>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-52 rounded-lg border bg-popover shadow-xl flex flex-col gap-1 p-1">
          {/* Premium */}
          {user.isVerified ? (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-xs h-8"
              onClick={() =>
                run("Revoke Premium", () =>
                  revokePremium.mutateAsync(principal),
                )
              }
            >
              <Star className="w-3 h-3 mr-2 text-yellow-400" />
              Revoke Premium
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-xs h-8"
              onClick={() =>
                run("Grant Premium", () => grantPremium.mutateAsync(principal))
              }
            >
              <Star className="w-3 h-3 mr-2 text-yellow-400" />
              Grant Premium
            </Button>
          )}

          {/* Admin */}
          {user.isAdmin ? (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-xs h-8 text-red-400"
              onClick={() =>
                run("Demote from Admin", () =>
                  demoteAdmin.mutateAsync(principal),
                )
              }
            >
              <Shield className="w-3 h-3 mr-2" />
              Demote from Admin
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-xs h-8"
              onClick={() =>
                run("Promote to Admin", () =>
                  promoteAdmin.mutateAsync(principal),
                )
              }
            >
              <Shield className="w-3 h-3 mr-2" />
              Promote to Admin
            </Button>
          )}

          {/* Team */}
          {user.isTeamMember ? (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-xs h-8"
              onClick={() =>
                run("Downgrade Team Member", () =>
                  downgradeTeam.mutateAsync(principal),
                )
              }
            >
              <UserCheck className="w-3 h-3 mr-2" />
              Downgrade Team
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-xs h-8"
              onClick={() =>
                run("Upgrade to Team Member", () =>
                  upgradeTeam.mutateAsync(principal),
                )
              }
            >
              <UserCheck className="w-3 h-3 mr-2" />
              Upgrade to Team
            </Button>
          )}

          <div className="border-t my-1" />

          {/* Song block */}
          {user.isSongBlocked ? (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-xs h-8 text-green-400"
              onClick={() =>
                run("Unblock Song", () => unblockSong.mutateAsync(principal))
              }
            >
              <CheckCircle className="w-3 h-3 mr-2" />
              Unblock Song Sub.
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-xs h-8 text-red-400"
              onClick={() =>
                run("Block Song", () => blockSong.mutateAsync(principal))
              }
            >
              <Ban className="w-3 h-3 mr-2" />
              Block Song Sub.
            </Button>
          )}

          {/* Podcast block */}
          {user.isPodcastBlocked ? (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-xs h-8 text-green-400"
              onClick={() =>
                run("Unblock Podcast", () =>
                  unblockPodcast.mutateAsync(principal),
                )
              }
            >
              <CheckCircle className="w-3 h-3 mr-2" />
              Unblock Podcast Sub.
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-xs h-8 text-red-400"
              onClick={() =>
                run("Block Podcast", () => blockPodcast.mutateAsync(principal))
              }
            >
              <Ban className="w-3 h-3 mr-2" />
              Block Podcast Sub.
            </Button>
          )}

          <div className="border-t my-1" />
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-xs h-8 text-muted-foreground"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
}

interface UserDetailDialogProps {
  user: AdminUserView | null;
  open: boolean;
  onClose: () => void;
  onRefetch: () => void;
}

function UserDetailDialog({
  user,
  open,
  onClose,
  onRefetch,
}: UserDetailDialogProps) {
  if (!user) return null;
  const principalStr = (user.principal as Principal).toString();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>Principal: {principalStr}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Display Name</p>
              <p className="font-medium">
                {user.displayName || (
                  <span className="text-muted-foreground italic">Not set</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Role</p>
              <div>{getRoleBadge(user)}</div>
            </div>
          </div>

          <div className="border rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium">Submission Status</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Song Submissions</span>
              {user.isSongBlocked ? (
                <Badge variant="destructive" className="text-xs">
                  <Ban className="w-3 h-3 mr-1" />
                  Blocked
                </Badge>
              ) : (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/40 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Podcast Submissions</span>
              {user.isPodcastBlocked ? (
                <Badge variant="destructive" className="text-xs">
                  <Ban className="w-3 h-3 mr-1" />
                  Blocked
                </Badge>
              ) : (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/40 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-2">
              Full Principal ID
            </p>
            <code className="block text-xs bg-muted rounded p-2 break-all">
              {principalStr}
            </code>
          </div>

          <div className="flex justify-between pt-2">
            <UserActions
              user={user}
              onRefetch={() => {
                onRefetch();
                onClose();
              }}
            />
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUsersPanel() {
  const {
    data: users = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetAllRegisteredUsers();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [selectedUser, setSelectedUser] = useState<AdminUserView | null>(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const p = (u.principal as Principal).toString();
      const name = u.displayName.toLowerCase();
      const q = search.toLowerCase();
      const matchesSearch =
        !q || name.includes(q) || p.toLowerCase().includes(q);

      let matchesRole = true;
      if (roleFilter === "admin") matchesRole = u.isAdmin;
      else if (roleFilter === "team") matchesRole = u.isTeamMember;
      else if (roleFilter === "premium") matchesRole = u.isVerified;
      else if (roleFilter === "blocked")
        matchesRole = u.isSongBlocked || u.isPodcastBlocked;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Loading users...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-3">
            <p className="text-destructive font-medium">Failed to load users</p>
            <p className="text-muted-foreground text-sm">
              Make sure you are logged in as an admin and try again.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users Panel
              <Badge variant="secondary" className="ml-1">
                {users.length}
              </Badge>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or Principal ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(v) => setRoleFilter(v as RoleFilter)}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="team">Team Members</SelectItem>
                <SelectItem value="premium">Premium / Verified</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {users.length === 0
                ? "No users have registered yet."
                : "No users match your search or filter."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-2 px-3 font-medium">Name</th>
                    <th className="text-left py-2 px-3 font-medium">
                      Principal ID
                    </th>
                    <th className="text-left py-2 px-3 font-medium">Role</th>
                    <th className="text-center py-2 px-3 font-medium">Song</th>
                    <th className="text-center py-2 px-3 font-medium">
                      Podcast
                    </th>
                    <th className="text-right py-2 px-3 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const p = (u.principal as Principal).toString();
                    return (
                      <tr
                        key={p}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            className="font-medium hover:underline text-left"
                            onClick={() => setSelectedUser(u)}
                          >
                            {u.displayName || (
                              <span className="text-muted-foreground italic">
                                Anonymous
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-3">
                          <code className="text-xs text-muted-foreground">
                            {truncatePrincipal(p)}
                          </code>
                        </td>
                        <td className="py-3 px-3">{getRoleBadge(u)}</td>
                        <td className="py-3 px-3 text-center">
                          {u.isSongBlocked ? (
                            <Badge variant="destructive" className="text-xs">
                              <Ban className="w-3 h-3 mr-1" />
                              Blocked
                            </Badge>
                          ) : (
                            <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {u.isPodcastBlocked ? (
                            <Badge variant="destructive" className="text-xs">
                              <Ban className="w-3 h-3 mr-1" />
                              Blocked
                            </Badge>
                          ) : (
                            <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <UserActions user={u} onRefetch={() => refetch()} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-3 text-xs text-muted-foreground">
            Showing {filtered.length} of {users.length} users
          </p>
        </CardContent>
      </Card>

      <UserDetailDialog
        user={selectedUser}
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onRefetch={() => refetch()}
      />
    </>
  );
}
