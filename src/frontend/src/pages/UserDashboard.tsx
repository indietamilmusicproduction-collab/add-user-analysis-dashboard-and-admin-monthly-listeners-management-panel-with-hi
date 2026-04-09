import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralSupportTab from "../components/GeneralSupportTab";
import SongSubmissionForm from "../components/SongSubmissionForm";
import TopVibingSongsSection from "../components/TopVibingSongsSection";
import UserAnalysisPanel from "../components/UserAnalysisPanel";
import UserArtistProfilesManager from "../components/UserArtistProfilesManager";
import UserChatPanel from "../components/UserChatPanel";
import UserPodcastSubmissionSection from "../components/UserPodcastSubmissionSection";
import UserRevenuePanel from "../components/UserRevenuePanel";
import UserSubmissionsList from "../components/UserSubmissionsList";
import UserVideoSubmissionSection from "../components/UserVideoSubmissionSection";
import VideoSubmissionForm from "../components/VideoSubmissionForm";

export default function UserDashboard() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>

      <Tabs defaultValue="profiles" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
          <TabsTrigger value="profiles">Artist Profiles</TabsTrigger>
          <TabsTrigger value="submit">Submit Song</TabsTrigger>
          <TabsTrigger value="submissions">My Submissions</TabsTrigger>
          <TabsTrigger value="podcast">Podcast</TabsTrigger>
          <TabsTrigger value="video">Video Submissions</TabsTrigger>
          <TabsTrigger value="topVibing">Top Vibing Songs</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="revenue">₹ My Revenue</TabsTrigger>
          <TabsTrigger value="chat">💬 Chat</TabsTrigger>
          <TabsTrigger value="generalSupport">🎧 General Support</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles">
          <UserArtistProfilesManager />
        </TabsContent>

        <TabsContent value="submit">
          <SongSubmissionForm />
        </TabsContent>

        <TabsContent value="submissions">
          <UserSubmissionsList />
        </TabsContent>

        <TabsContent value="podcast">
          <UserPodcastSubmissionSection />
        </TabsContent>

        <TabsContent value="video">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Submit New Video</h2>
              <VideoSubmissionForm />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                My Video Submissions
              </h2>
              <UserVideoSubmissionSection />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="topVibing">
          <div className="py-4">
            <TopVibingSongsSection />
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <UserAnalysisPanel />
        </TabsContent>

        <TabsContent value="revenue">
          <UserRevenuePanel />
        </TabsContent>

        <TabsContent value="chat">
          <div className="max-w-2xl mx-auto py-4">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold">Chat with Admin</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Send a message to our admin team. Messages are updated
                automatically every 5 seconds.
              </p>
            </div>
            <UserChatPanel />
          </div>
        </TabsContent>

        <TabsContent value="generalSupport">
          <GeneralSupportTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
