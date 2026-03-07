import type { Principal } from "@dfinity/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ArtistProfile,
  FeaturedArtist,
  FeaturedArtistInput,
  InviteCode,
  PodcastEpisode,
  PodcastEpisodeInput,
  PodcastShow,
  PodcastShowInput,
  PublicSongInfo,
  RSVP,
  SaveArtistProfileInput,
  SongSubmission,
  SongSubmissionEditInput,
  SongSubmissionInput,
  SubscriptionPlan,
  TopVibingSong,
  UserCategory,
  UserProfile,
  VerificationRequest,
  VerificationStatus,
  VideoSubmission,
  VideoSubmissionInput,
  VideoSubmissionStatus,
} from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// ================================
// USER PROFILE HOOKS
// ================================
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ================================
// ADMIN/AUTH CHECKS
// ================================
export function useIsCurrentUserAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isCurrentUserAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isCurrentUserAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ================================
// PUBLIC SONG INFO (NO AUTH REQUIRED)
// ================================
export function useGetSongInfo(songId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PublicSongInfo>({
    queryKey: ["songInfo", songId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getSongInfo(songId);
    },
    enabled: !!actor && !isFetching && !!songId,
    retry: false,
  });
}

// ================================
// ARTIST PROFILE HOOKS
// ================================
export function useGetMyArtistProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistProfile[]>({
    queryKey: ["myArtistProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyArtistProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllArtistProfilesForAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistProfile[]>({
    queryKey: ["allArtistProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllArtistProfilesForAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias used by several components
export function useGetAllArtistProfiles() {
  return useGetAllArtistProfilesForAdmin();
}

// Alias used by AdminUserManagement and AdminVerificationList
export function useGetAllArtistsWithUserIds() {
  return useGetAllArtistProfilesForAdmin();
}

export function useCreateArtistProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveArtistProfileInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createArtistProfile(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myArtistProfiles"] });
      queryClient.invalidateQueries({ queryKey: ["allArtistProfiles"] });
    },
  });
}

export function useUpdateArtistProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: { id: string; input: SaveArtistProfileInput }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateArtistProfile(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myArtistProfiles"] });
      queryClient.invalidateQueries({ queryKey: ["allArtistProfiles"] });
    },
  });
}

export function useDeleteArtistProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteArtistProfile(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myArtistProfiles"] });
      queryClient.invalidateQueries({ queryKey: ["allArtistProfiles"] });
    },
  });
}

export function useAdminEditArtistProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: { id: string; input: SaveArtistProfileInput }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.adminEditArtistProfile(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allArtistProfiles"] });
    },
  });
}

export function useAdminDeleteArtistProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.adminDeleteArtistProfile(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allArtistProfiles"] });
    },
  });
}

export function useIsArtistVerified() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ["isArtistVerified", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isArtistVerified(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetArtistProfileEditingAccessStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["artistProfileEditingAccess"],
    queryFn: async () => {
      if (!actor) return true;
      return actor.getArtistProfileEditingAccessStatus();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetArtistProfileEditingAccess() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setArtistProfileEditingAccess(enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["artistProfileEditingAccess"],
      });
    },
  });
}

// ================================
// SONG SUBMISSION HOOKS
// ================================
export function useGetMySubmissions() {
  const { actor, isFetching } = useActor();

  return useQuery<SongSubmission[]>({
    queryKey: ["mySubmissions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMySubmissions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllSubmissionsForAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<SongSubmission[]>({
    queryKey: ["allSubmissions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubmissionsForAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SongSubmissionInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitSong(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mySubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["allSubmissions"] });
    },
  });
}

export function useEditSongSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SongSubmissionEditInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.editSongSubmission(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mySubmissions"] });
    },
  });
}

export function useAdminUpdateSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      adminRemarks,
      adminComment,
    }: {
      id: string;
      status: any;
      adminRemarks: string;
      adminComment: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.adminUpdateSubmission(
        id,
        status,
        adminRemarks,
        adminComment,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["mySubmissions"] });
    },
  });
}

export function useAdminSetSubmissionLive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      liveUrl,
      adminRemarks,
      adminComment,
    }: {
      id: string;
      liveUrl: string;
      adminRemarks: string;
      adminComment: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.adminSetSubmissionLive(
        id,
        liveUrl,
        adminRemarks,
        adminComment,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["mySubmissions"] });
    },
  });
}

export function useAdminEditSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SongSubmissionEditInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.adminEditSubmission(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["mySubmissions"] });
    },
  });
}

export function useAdminDeleteSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.adminDeleteSubmission(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allSubmissions"] });
    },
  });
}

// Alias for streaming links update (used by AdminManageLinksDialog)
export function useUpdateSongLinks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      songId,
      spotifyLink,
      appleMusicLink,
    }: {
      songId: string;
      spotifyLink: string | null;
      appleMusicLink: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const submissions = await actor.getAllSubmissionsForAdmin();
      const submission = submissions.find((s) => s.id === songId);
      if (!submission) throw new Error("Song not found");

      const editInput: SongSubmissionEditInput = {
        songSubmissionId: songId,
        title: submission.title,
        releaseType: submission.releaseType,
        genre: submission.genre,
        language: submission.language,
        releaseDate: submission.releaseDate,
        artworkBlob: submission.artwork,
        artworkFilename: submission.artworkFilename,
        artist: submission.artist,
        featuredArtist: submission.featuredArtist,
        composer: submission.composer,
        producer: submission.producer,
        lyricist: submission.lyricist,
        audioFile: submission.audioFile,
        audioFilename: submission.audioFilename,
        additionalDetails: submission.additionalDetails,
        discountCode: submission.discountCode,
        musicVideoLink: submission.musicVideoLink,
        albumTracks: submission.albumTracks,
        spotifyLink: spotifyLink ?? undefined,
        appleMusicLink: appleMusicLink ?? undefined,
      };

      return actor.adminEditSubmission(editInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["mySubmissions"] });
    },
  });
}

// ================================
// BLOCKED USER CHECK HOOKS (caller-side)
// ================================

/**
 * Checks if the current caller is blocked for song submissions.
 * Uses isUserBlockedSongSubmission with the caller's own principal.
 * Falls back to false if actor/identity not available.
 */
export function useIsCurrentUserBlockedSongSubmission() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ["isCurrentUserBlockedSong", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isUserBlockedSongSubmission(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

/**
 * Checks if the current caller is blocked for podcast submissions.
 * Uses isUserBlockedPodcastSubmission with the caller's own principal.
 * Falls back to false if actor/identity not available.
 */
export function useIsCurrentUserBlockedPodcastSubmission() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: [
      "isCurrentUserBlockedPodcast",
      identity?.getPrincipal().toString(),
    ],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isUserBlockedPodcastSubmission(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// ================================
// VERIFICATION HOOKS
// ================================
export function useGetVerificationRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<VerificationRequest[]>({
    queryKey: ["verificationRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVerificationRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export const useGetVerificationRequestsForAdmin = useGetVerificationRequests;

export function useUpdateVerificationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      verificationId,
      status,
      expiryExtensionDays,
    }: {
      verificationId: string;
      status: VerificationStatus;
      expiryExtensionDays: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateVerificationStatus(
        verificationId,
        status,
        expiryExtensionDays,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verificationRequests"] });
    },
  });
}

export function useApplyForVerification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.applyForVerification();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verificationRequests"] });
    },
  });
}

// ================================
// BLOG HOOKS (actor as any — not in typed interface)
// ================================
export function useGetBlogPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ["blogPosts"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getBlogPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: any) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).createBlogPost(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
    },
  });
}

export function useUpdateBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: any }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).updateBlogPost(id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
    },
  });
}

export function useDeleteBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).deleteBlogPost(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
    },
  });
}

export function usePublishBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).publishBlogPost(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
    },
  });
}

// ================================
// COMMUNITY HOOKS (actor as any)
// ================================
export function useGetCommunityMessages() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ["communityMessages"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getCommunityMessages();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useSendCommunityMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).sendCommunityMessage({ content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityMessages"] });
    },
  });
}

// ================================
// PODCAST HOOKS
// ================================
export function useGetMyPodcastShows() {
  const { actor, isFetching } = useActor();

  return useQuery<PodcastShow[]>({
    queryKey: ["myPodcastShows"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyPodcastShows();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllPodcasts() {
  const { actor, isFetching } = useActor();

  return useQuery<PodcastShow[]>({
    queryKey: ["allPodcasts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPodcasts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllEpisodes() {
  const { actor, isFetching } = useActor();

  return useQuery<PodcastEpisode[]>({
    queryKey: ["allEpisodes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEpisodes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePodcastShow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PodcastShowInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createPodcastShow(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myPodcastShows"] });
      queryClient.invalidateQueries({ queryKey: ["allPodcasts"] });
    },
  });
}

export function useCreatePodcastEpisode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PodcastEpisodeInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createPodcastEpisode(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allEpisodes"] });
    },
  });
}

export function useApprovePodcast() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.approvePodcast(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPodcasts"] });
    },
  });
}

export function useRejectPodcast() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.rejectPodcast(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPodcasts"] });
    },
  });
}

export function useMarkPodcastLive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, liveLink }: { id: string; liveLink: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.markPodcastLive(id, liveLink);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPodcasts"] });
    },
  });
}

export function useApproveEpisode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.approveEpisode(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allEpisodes"] });
    },
  });
}

export function useRejectEpisode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.rejectEpisode(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allEpisodes"] });
    },
  });
}

export function useMarkEpisodeLive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.markEpisodeLive(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allEpisodes"] });
    },
  });
}

// ================================
// VIDEO SUBMISSION HOOKS
// ================================
export function useGetUserVideoSubmissions() {
  const { actor, isFetching } = useActor();

  return useQuery<VideoSubmission[]>({
    queryKey: ["userVideoSubmissions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserVideoSubmissions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllVideoSubmissions() {
  const { actor, isFetching } = useActor();

  return useQuery<VideoSubmission[]>({
    queryKey: ["allVideoSubmissions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideoSubmissions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: VideoSubmissionInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitVideo(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userVideoSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["allVideoSubmissions"] });
    },
  });
}

export function useUpdateVideoStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      videoId,
      newStatus,
      liveUrl,
    }: {
      videoId: string;
      newStatus: VideoSubmissionStatus;
      liveUrl: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateVideoStatus(videoId, newStatus, liveUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allVideoSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["userVideoSubmissions"] });
    },
  });
}

export function useUpdateVideoSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      input,
      videoId,
    }: { input: VideoSubmissionInput; videoId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateVideoSubmission(input, videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allVideoSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["userVideoSubmissions"] });
    },
  });
}

export function useDeleteVideoSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteVideoSubmission(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allVideoSubmissions"] });
    },
  });
}

export function useDownloadVideoFile() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.downloadVideoFile(videoId);
    },
  });
}

// ================================
// FEATURED ARTISTS HOOKS
// ================================
export function useGetFeaturedArtists() {
  const { actor, isFetching } = useActor();

  return useQuery<FeaturedArtist[]>({
    queryKey: ["featuredArtists"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedArtists();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetActiveFeaturedArtists() {
  const { actor, isFetching } = useActor();

  return useQuery<FeaturedArtist[]>({
    queryKey: ["activeFeaturedArtists"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveFeaturedArtists();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetFeaturedArtist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      slot,
      data,
    }: { slot: bigint; data: FeaturedArtistInput }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setFeaturedArtist(slot, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featuredArtists"] });
      queryClient.invalidateQueries({ queryKey: ["activeFeaturedArtists"] });
    },
  });
}

export function useToggleFeaturedArtistSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slot, active }: { slot: bigint; active: boolean }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.toggleFeaturedArtistSlot(slot, active);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featuredArtists"] });
      queryClient.invalidateQueries({ queryKey: ["activeFeaturedArtists"] });
    },
  });
}

// ================================
// SUBSCRIPTION PLAN HOOKS
// ================================
export function useGetAllSubscriptionPlans() {
  const { actor, isFetching } = useActor();

  return useQuery<SubscriptionPlan[]>({
    queryKey: ["subscriptionPlans"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubscriptionPlans();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateSubscriptionPlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: SubscriptionPlan) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createSubscriptionPlan(plan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptionPlans"] });
    },
  });
}

export function useUpdateSubscriptionPlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: SubscriptionPlan) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateSubscriptionPlan(plan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptionPlans"] });
    },
  });
}

export function useDeleteSubscriptionPlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planName: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteSubscriptionPlan(planName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptionPlans"] });
    },
  });
}

// ================================
// USER MANAGEMENT HOOKS
// ================================
export function useUpdateUserCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      newCategory,
    }: { userId: Principal; newCategory: UserCategory }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateUserCategory(userId, newCategory);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allArtistProfiles"] });
    },
  });
}

export function useBlockUserSongSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.blockUserSongSubmission(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
    },
  });
}

export function useUnblockUserSongSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.unblockUserSongSubmission(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
    },
  });
}

export function useBlockUserPodcastSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.blockUserPodcastSubmission(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
    },
  });
}

export function useUnblockUserPodcastSubmission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.unblockUserPodcastSubmission(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
    },
  });
}

export function useGetAllBlockedUsers() {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ["blockedUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBlockedUsersAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ================================
// ADMIN ROLE MANAGEMENT HOOKS
// ================================
export function usePromoteToAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.promoteToAdmin(target);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
}

export function useDemoteFromAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.demoteFromAdmin(target);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
}

// Alias
export const useDemoteAdmin = useDemoteFromAdmin;

export function useListAdmins() {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ["admins"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAdmins();
    },
    enabled: !!actor && !isFetching,
  });
}

// ================================
// INVITE LINKS HOOKS
// ================================
export function useGenerateInviteCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.generateInviteCode();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inviteCodes"] });
    },
  });
}

export function useGetInviteCodes() {
  const { actor, isFetching } = useActor();

  return useQuery<InviteCode[]>({
    queryKey: ["inviteCodes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInviteCodes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllRSVPs() {
  const { actor, isFetching } = useActor();

  return useQuery<RSVP[]>({
    queryKey: ["rsvps"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRSVPs();
    },
    enabled: !!actor && !isFetching,
  });
}

// ================================
// TOP VIBING SONGS HOOKS
// ================================
export function useGetAllTopVibingSongs() {
  const { actor, isFetching } = useActor();

  return useQuery<TopVibingSong[]>({
    queryKey: ["allTopVibingSongs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTopVibingSongs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRankedTopVibingSongs() {
  const { actor, isFetching } = useActor();

  return useQuery<TopVibingSong[]>({
    queryKey: ["rankedTopVibingSongs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRankedTopVibingSongs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTopVibingSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (song: TopVibingSong) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addTopVibingSong(song);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTopVibingSongs"] });
      queryClient.invalidateQueries({ queryKey: ["rankedTopVibingSongs"] });
    },
  });
}

export function useUpdateTopVibingSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (song: TopVibingSong) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateTopVibingSong(song);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTopVibingSongs"] });
      queryClient.invalidateQueries({ queryKey: ["rankedTopVibingSongs"] });
    },
  });
}

export function useDeleteTopVibingSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteTopVibingSong(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTopVibingSongs"] });
      queryClient.invalidateQueries({ queryKey: ["rankedTopVibingSongs"] });
    },
  });
}

export function useReorderTopVibingSongs() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: bigint[]) => {
      if (!actor) throw new Error("Actor not available");
      return actor.reorderTopVibingSongs(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTopVibingSongs"] });
      queryClient.invalidateQueries({ queryKey: ["rankedTopVibingSongs"] });
    },
  });
}

// ================================
// MONTHLY LISTENER STATS HOOKS
// ================================
export function useGetLiveSongsForAnalysis() {
  const { actor, isFetching } = useActor();

  return useQuery<SongSubmission[]>({
    queryKey: ["liveSongsForAnalysis"],
    queryFn: async () => {
      if (!actor) return [];
      const allSongs = await actor.getMySubmissions();
      return allSongs.filter((s) => s.status === ("live" as any));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyLiveSongsWithStats() {
  const { actor, isFetching } = useActor();

  return useQuery<{ song: SongSubmission; stats: any[] }[]>({
    queryKey: ["myLiveSongsWithStats"],
    queryFn: async () => {
      if (!actor) return [];
      const allSongs = await actor.getMySubmissions();
      const liveSongs = allSongs.filter((s) => s.status === ("live" as any));
      return liveSongs.map((song) => ({ song, stats: [] }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateMonthlyListenerStats() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      songId,
      stats,
    }: {
      songId: string;
      stats: { year: number; month: number; value: number }[];
    }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).updateMonthlyListenerStats(songId, stats);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myLiveSongsWithStats"] });
    },
  });
}

/**
 * Fetches monthly listener stats for a specific song (admin use).
 * Returns an array of { month, year, value } objects.
 */
export function useGetSongMonthlyListenerStats() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (
      songId: string,
    ): Promise<{ month: number; year: number; value: number }[]> => {
      if (!actor) throw new Error("Actor not available");
      const result = await (actor as any).getSongMonthlyListenerStats(songId);
      if (!result) return [];
      // Normalize bigint fields to number for display
      return (result as any[]).map((s: any) => ({
        month: Number(s.month),
        year: Number(s.year),
        value: Number(s.value),
      }));
    },
  });
}

// ================================
// ANNOUNCEMENT HOOKS (actor as any)
// ================================
export function useGetAnnouncement() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ["announcement"],
    queryFn: async () => {
      if (!actor) return "";
      return (actor as any).getAnnouncement();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).setAnnouncement(text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcement"] });
    },
  });
}

// ================================
// FEE MANAGEMENT HOOKS (actor as any)
// ================================
export function useGetFees() {
  const { actor, isFetching } = useActor();

  return useQuery<{ distributionFee: number; annualMaintenanceFee: number }>({
    queryKey: ["fees"],
    queryFn: async () => {
      if (!actor) return { distributionFee: 0, annualMaintenanceFee: 0 };
      return (actor as any).getFees();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetFees() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fees: {
      distributionFee: number;
      annualMaintenanceFee: number;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).setFees(fees);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
    },
  });
}

// ================================
// SUPPORT REQUEST HOOKS (actor as any)
// ================================
export function useGetMySupportRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ["mySupportRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getMySupportRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllSupportRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ["allSupportRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllSupportRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitSupportRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: any) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).submitSupportRequest(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mySupportRequests"] });
      queryClient.invalidateQueries({ queryKey: ["allSupportRequests"] });
    },
  });
}

export function useUpdateSupportRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: any) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).updateSupportRequest(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allSupportRequests"] });
    },
  });
}

// ================================
// CHAT HOOKS (localStorage-based, no backend required)
// ================================

export interface ChatMessage {
  id: string;
  threadId: string;
  senderName: string;
  text: string;
  isAdminReply: boolean;
  timestamp: number;
  isRead: boolean;
}

export interface ChatThread {
  id: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  messages: ChatMessage[];
}

const CHAT_STORAGE_KEY = "itmp_chat_threads";

function getChatThreads(): ChatThread[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveChatThreads(threads: ChatThread[]): void {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(threads));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useGetChatThreads() {
  return useQuery<ChatThread[]>({
    queryKey: ["chatThreads"],
    queryFn: async () => getChatThreads(),
    refetchInterval: 5000,
  });
}

export function useGetThreadMessages(threadId: string) {
  return useQuery<ChatMessage[]>({
    queryKey: ["threadMessages", threadId],
    queryFn: async () => {
      if (!threadId) return [];
      const threads = getChatThreads();
      const thread = threads.find((t) => t.id === threadId);
      return thread ? thread.messages : [];
    },
    enabled: !!threadId,
    refetchInterval: 5000,
  });
}

export function useSendUserMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      threadId,
      userName,
      text,
    }: {
      threadId: string;
      userName: string;
      text: string;
    }) => {
      const threads = getChatThreads();
      const existingIndex = threads.findIndex((t) => t.id === threadId);

      const newMessage: ChatMessage = {
        id: generateId(),
        threadId,
        senderName: userName,
        text,
        isAdminReply: false,
        timestamp: Date.now(),
        isRead: false,
      };

      if (existingIndex >= 0) {
        threads[existingIndex].messages.push(newMessage);
        threads[existingIndex].lastMessage = text;
        threads[existingIndex].lastMessageTime = Date.now();
        threads[existingIndex].unreadCount += 1;
      } else {
        const newThread: ChatThread = {
          id: threadId,
          userName,
          lastMessage: text,
          lastMessageTime: Date.now(),
          unreadCount: 1,
          messages: [newMessage],
        };
        threads.push(newThread);
      }

      saveChatThreads(threads);
      return newMessage;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chatThreads"] });
      queryClient.invalidateQueries({
        queryKey: ["threadMessages", variables.threadId],
      });
    },
  });
}

export function useSendAdminReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      threadId,
      text,
    }: {
      threadId: string;
      text: string;
    }) => {
      const threads = getChatThreads();
      const threadIndex = threads.findIndex((t) => t.id === threadId);

      if (threadIndex < 0) throw new Error("Thread not found");

      const newMessage: ChatMessage = {
        id: generateId(),
        threadId,
        senderName: "Admin",
        text,
        isAdminReply: true,
        timestamp: Date.now(),
        isRead: true,
      };

      threads[threadIndex].messages.push(newMessage);
      threads[threadIndex].lastMessage = text;
      threads[threadIndex].lastMessageTime = Date.now();

      saveChatThreads(threads);
      return newMessage;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chatThreads"] });
      queryClient.invalidateQueries({
        queryKey: ["threadMessages", variables.threadId],
      });
    },
  });
}

export function useMarkThreadRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (threadId: string) => {
      const threads = getChatThreads();
      const threadIndex = threads.findIndex((t) => t.id === threadId);

      if (threadIndex >= 0) {
        threads[threadIndex].unreadCount = 0;
        threads[threadIndex].messages = threads[threadIndex].messages.map(
          (m) => ({
            ...m,
            isRead: true,
          }),
        );
        saveChatThreads(threads);
      }
    },
    onSuccess: (_data, threadId) => {
      queryClient.invalidateQueries({ queryKey: ["chatThreads"] });
      queryClient.invalidateQueries({ queryKey: ["threadMessages", threadId] });
    },
  });
}
