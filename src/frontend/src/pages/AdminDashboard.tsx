import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminArtistManagement from "../components/AdminArtistManagement";
import AdminChatInbox from "../components/AdminChatInbox";
import AdminDebugPanel from "../components/AdminDebugPanel";
import AdminFeaturedArtistsManagement from "../components/AdminFeaturedArtistsManagement";
import AdminLabelPartnersManagement from "../components/AdminLabelPartnersManagement";
import AdminPodcastSubmissions from "../components/AdminPodcastSubmissions";
import AdminSubmissionsList from "../components/AdminSubmissionsList";
import AdminSubscriptionPlansManagement from "../components/AdminSubscriptionPlansManagement";
import AdminSupportRequestsManagement from "../components/AdminSupportRequestsManagement";
import AdminTopVibingSongsManagement from "../components/AdminTopVibingSongsManagement";
import AdminUserRoleManagement from "../components/AdminUserRoleManagement";
import AdminUsersPanel from "../components/AdminUsersPanel";
import AdminVerificationList from "../components/AdminVerificationList";
import AdminVideoSubmissions from "../components/AdminVideoSubmissions";
import AdminWithdrawalRequestsManagement from "../components/AdminWithdrawalRequestsManagement";
import { useGetChatThreads } from "../hooks/useQueries";

function MessagesTabLabel() {
  const { data: threads = [] } = useGetChatThreads();
  const totalUnread = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  return (
    <span className="flex items-center gap-1.5">
      💬 Messages
      {totalUnread > 0 && (
        <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground">
          {totalUnread > 9 ? "9+" : totalUnread}
        </span>
      )}
    </span>
  );
}

export default function AdminDashboard() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="artists" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
          <TabsTrigger value="artists">Artists</TabsTrigger>
          <TabsTrigger value="songs">Song Submissions</TabsTrigger>
          <TabsTrigger value="podcasts">Podcast Submission</TabsTrigger>
          <TabsTrigger value="videos">Video Submissions</TabsTrigger>
          <TabsTrigger value="verification">Verification List</TabsTrigger>
          <TabsTrigger value="withdrawals" data-ocid="withdrawal.tab">
            💸 Withdrawals
          </TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="featured">Featured Artists</TabsTrigger>
          <TabsTrigger value="topVibing">Top Vibing Songs</TabsTrigger>
          <TabsTrigger value="labelPartners">Label Partners</TabsTrigger>
          <TabsTrigger value="adminroles">Admin Role Management</TabsTrigger>
          <TabsTrigger value="messages">
            <MessagesTabLabel />
          </TabsTrigger>
          <TabsTrigger value="debug" data-ocid="debug.tab">
            🔧 Debug
          </TabsTrigger>
          <TabsTrigger value="generalSupport" data-ocid="admin.support.tab">
            🎧 Support Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="artists">
          <AdminArtistManagement />
        </TabsContent>

        <TabsContent value="songs">
          <AdminSubmissionsList />
        </TabsContent>

        <TabsContent value="podcasts">
          <AdminPodcastSubmissions />
        </TabsContent>

        <TabsContent value="videos">
          <AdminVideoSubmissions />
        </TabsContent>

        <TabsContent value="verification">
          <AdminVerificationList />
        </TabsContent>

        <TabsContent value="withdrawals">
          <AdminWithdrawalRequestsManagement />
        </TabsContent>

        <TabsContent value="users">
          <AdminUsersPanel />
        </TabsContent>

        <TabsContent value="plans">
          <AdminSubscriptionPlansManagement />
        </TabsContent>

        <TabsContent value="featured">
          <AdminFeaturedArtistsManagement />
        </TabsContent>

        <TabsContent value="topVibing">
          <AdminTopVibingSongsManagement />
        </TabsContent>

        <TabsContent value="labelPartners">
          <AdminLabelPartnersManagement />
        </TabsContent>

        <TabsContent value="adminroles">
          <AdminUserRoleManagement />
        </TabsContent>

        <TabsContent value="messages">
          <AdminChatInbox />
        </TabsContent>

        <TabsContent value="debug">
          <AdminDebugPanel />
        </TabsContent>

        <TabsContent value="generalSupport">
          <AdminSupportRequestsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
