// @ts-nocheck
// This file intentionally uses (actor as any) for all backend calls.
// The backend.d.ts only exports an empty interface; all types are defined locally here.

import type { Principal } from "@dfinity/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// ================================
// LOCALLY-DEFINED TYPES
// (backend.d.ts is auto-generated and minimal — types are defined here)
// ================================

export interface UserProfile {
  principalId?: string;
  displayName?: string;
  email?: string;
  [key: string]: unknown;
}

export interface ArtistProfile {
  id: string;
  owner?: Principal;
  fullName: string;
  stageName: string;
  artistName?: string;
  profilePhoto: unknown;
  profilePhotoFilename?: string;
  contactEmail: string;
  phone: string;
  aadhaarNumber?: string;
  youtubeChannel: string;
  instagramLink: string;
  facebookLink: string;
  twitterLink: string;
  spotifyLink: string;
  status?: unknown;
  [key: string]: unknown;
}

export interface SaveArtistProfileInput {
  fullName: string;
  stageName?: string;
  artistName?: string;
  contactEmail?: string;
  phone?: string;
  aadhaarNumber?: string;
  youtubeChannel?: string;
  instagramLink?: string;
  facebookLink?: string;
  twitterLink?: string;
  spotifyLink?: string;
  profilePhoto?: unknown;
  profilePhotoFilename?: string;
  [key: string]: unknown;
}

export interface TrackMetadata {
  title: string;
  composer?: string;
  lyricist?: string;
  audioFile?: unknown;
  audioFilename?: string;
  [key: string]: unknown;
}

export interface SongSubmission {
  id: string;
  title: string;
  genre?: string;
  language?: string;
  releaseType?: string;
  releaseDate?: string;
  status: unknown;
  artwork?: unknown;
  artworkFilename?: string;
  audioFile?: unknown;
  audioFilename?: string;
  artist?: string[];
  featuredArtist?: string[];
  composer?: string[];
  producer?: string[];
  lyricist?: string[];
  additionalDetails?: string;
  discountCode?: string;
  musicVideoLink?: string;
  albumTracks?: TrackMetadata[];
  spotifyLink?: string;
  appleMusicLink?: string;
  monthlyListeners?: number;
  revenue?: number;
  [key: string]: unknown;
}

export interface SongSubmissionAdmin extends SongSubmission {
  submitterId?: string;
  adminRemarks?: string;
  adminComment?: string;
  [key: string]: unknown;
}

export interface SongSubmissionInput {
  title: string;
  genre?: string;
  language?: string;
  releaseType?: string;
  releaseDate?: string;
  artworkBlob?: unknown;
  artworkFilename?: string;
  audioFile?: unknown;
  audioFilename?: string;
  artist?: string[];
  featuredArtist?: string[];
  composer?: string[];
  producer?: string[];
  lyricist?: string[];
  additionalDetails?: string;
  discountCode?: string;
  musicVideoLink?: string;
  albumTracks?: TrackMetadata[];
  customCLine?: string;
  customPLine?: string;
  premiumLabel?: string;
  contentType?: string;
  sunoTrackLink?: string;
  sunoAgreementFile?: unknown;
  sunoAgreementFilename?: string;
  licenceFile?: unknown;
  licenceFilename?: string;
  contentId?: boolean;
  callerTuneStartSecond?: number;
  [key: string]: unknown;
}

export interface SongSubmissionEditInput extends SongSubmissionInput {
  songSubmissionId: string;
}

export type SongStatus =
  | { draft: null }
  | { pending: null }
  | { approved: null }
  | { live: null }
  | { rejected: null };

export interface PublicSongInfo {
  id: string;
  title: string;
  artist?: string[];
  artwork?: unknown;
  spotifyLink?: string;
  appleMusicLink?: string;
  [key: string]: unknown;
}

export interface PodcastShow {
  id: string;
  title: string;
  description?: string;
  artwork?: unknown;
  category?: string;
  language?: string;
  status?: unknown;
  [key: string]: unknown;
}

export interface PodcastShowInput {
  title: string;
  description?: string;
  artwork?: unknown;
  artworkFilename?: string;
  category?: string;
  language?: string;
  [key: string]: unknown;
}

export interface PodcastEpisode {
  id: string;
  showId?: string;
  title: string;
  description?: string;
  status?: unknown;
  [key: string]: unknown;
}

export interface PodcastEpisodeInput {
  showId?: string;
  title: string;
  description?: string;
  contentFile?: unknown;
  contentFilename?: string;
  [key: string]: unknown;
}

export type PodcastModerationStatus =
  | { pending: null }
  | { approved: null }
  | { live: null }
  | { rejected: null };

export interface VideoSubmission {
  id: string;
  title: string;
  description?: string;
  status?: unknown;
  tags?: unknown;
  [key: string]: unknown;
}

export interface VideoSubmissionInput {
  title: string;
  description?: string;
  videoFile?: unknown;
  videoFilename?: string;
  [key: string]: unknown;
}

export type VideoSubmissionStatus =
  | { pending: null }
  | { approved: null }
  | { live: null }
  | { rejected: null }
  | { waitingList: null };

export interface FeaturedArtistSong {
  title: string;
  link: string;
}

export interface FeaturedArtist {
  slot: bigint;
  name: string;
  photoUrl: string;
  about: string;
  songs?: FeaturedArtistSong[];
  isActive: boolean;
  [key: string]: unknown;
}

export interface FeaturedArtistInput {
  name?: string;
  photoUrl?: string;
  about?: string;
  songs?: FeaturedArtistSong[];
  [key: string]: unknown;
}

export interface SubscriptionPlan {
  name: string;
  benefits?: string[];
  price?: number;
  planType?: string;
  redirectUrl?: string;
  [key: string]: unknown;
}

export interface TopVibingSong {
  id?: bigint;
  title: string;
  artistName: string;
  genre?: string;
  artworkUrl?: string;
  streamingLink?: string;
  tagline?: string;
  rank?: bigint;
  [key: string]: unknown;
}

export type UserCategory =
  | { generalArtist: null }
  | { proArtist: null }
  | { ultraArtist: null }
  | { generalLabel: null }
  | { proLabel: null };

export interface AdminUserView {
  principalId: string;
  displayName?: string;
  role?: string;
  createdAt?: bigint;
  isSongBlocked?: boolean;
  isPodcastBlocked?: boolean;
  isAdmin?: boolean;
  isTeamMember?: boolean;
  isPremium?: boolean;
  isVerified?: boolean;
  [key: string]: unknown;
}

export interface VerificationRequest {
  id: string;
  userId?: string;
  status?: unknown;
  [key: string]: unknown;
}

export type VerificationStatus =
  | { pending: null }
  | { approved: null }
  | { rejected: null };

export interface InviteCode {
  code: string;
  createdAt?: bigint;
  usedBy?: string;
  [key: string]: unknown;
}

export interface RSVP {
  code: string;
  userId?: string;
  [key: string]: unknown;
}

export interface WithdrawRequest {
  id: string;
  userId?: string;
  fullName?: string;
  googlePayAccountName?: string;
  upiId?: string;
  message?: string;
  amount?: number;
  status: unknown;
  rejectionReason?: string;
  [key: string]: unknown;
}

export interface LabelPartner {
  id: bigint;
  name: string;
  logoUrl?: string;
  websiteLink?: string;
  description?: string;
  [key: string]: unknown;
}

export interface LabelPartnerInput {
  name: string;
  logoUrl?: string;
  websiteLink?: string;
  description?: string;
  [key: string]: unknown;
}

export interface LabelRelease {
  id: bigint;
  labelId: bigint;
  songTitle?: string;
  artistName?: string;
  artworkUrl?: string;
  streamingLink?: string;
  [key: string]: unknown;
}

export interface LabelReleaseInput {
  labelId: bigint;
  songTitle?: string;
  artistName?: string;
  artworkUrl?: string;
  streamingLink?: string;
  [key: string]: unknown;
}

// Support Request types
export type GeneralSupportRequestType =
  | { trackTakedown: null }
  | { contentIdClaim: null }
  | { trackNotLiveInMeta: null }
  | { linkInstagramProfile: null };

export type GeneralSupportStatus =
  | { pending: null }
  | { approved: null }
  | { rejected: null };

export interface GeneralSupportRequest {
  id: string;
  requestType: GeneralSupportRequestType;
  submitter: Principal;
  songId: string;
  songTitle: string;
  reasonForTakedown: [] | [string];
  youtubeChannelLink: [] | [string];
  instagramProfileLink: [] | [string];
  status: GeneralSupportStatus;
  rejectionReason: [] | [string];
  submittedAt: bigint;
}

export interface GeneralSupportRequestInput {
  requestType: GeneralSupportRequestType;
  songId: string;
  songTitle: string;
  reasonForTakedown: [] | [string];
  youtubeChannelLink: [] | [string];
  instagramProfileLink: [] | [string];
}

// ================================
// USER PROFILE HOOKS
// ================================
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).getCallerUserProfile();
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
      return (actor as any).saveCallerUserProfile(profile);
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
      return (actor as any).isCallerAdmin();
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
      return (actor as any).isCallerAdmin();
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
      return (actor as any).getSongInfo(songId);
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
      return (actor as any).getMyArtistProfiles();
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
      return (actor as any).getAllArtistProfilesForAdmin();
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
      return (actor as any).createArtistProfile(input);
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
      return (actor as any).updateArtistProfile(id, input);
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
      return (actor as any).deleteArtistProfile(id);
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
      return (actor as any).adminEditArtistProfile(id, input);
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
      return (actor as any).adminDeleteArtistProfile(id);
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
      return (actor as any).isArtistVerified(identity.getPrincipal());
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
      return (actor as any).getArtistProfileEditingAccessStatus();
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
      return (actor as any).setArtistProfileEditingAccess(enabled);
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
      return (actor as any).getMySubmissions();
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
      return (actor as any).getAllSubmissionsForAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllSubmissionsWithStatsForAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<SongSubmissionAdmin[]>({
    queryKey: ["allSubmissionsWithStats"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllSubmissionsWithStatsForAdmin();
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
      return (actor as any).submitSong(input);
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
      return (actor as any).editSongSubmission(input);
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
      return (actor as any).adminUpdateSubmission(
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
      return (actor as any).adminSetSubmissionLive(
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
      return (actor as any).adminEditSubmission(input);
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
      return (actor as any).adminDeleteSubmission(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allSubmissions"] });
    },
  });
}

export function useAdminUpdateSongStats() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      songId,
      monthlyListeners,
      revenue,
    }: {
      songId: string;
      monthlyListeners?: number;
      revenue?: number;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const ml: [] | [number] =
        monthlyListeners !== undefined ? [monthlyListeners] : [];
      const rev: [] | [number] = revenue !== undefined ? [revenue] : [];
      return (actor as any).adminUpdateSongStats(songId, ml, rev);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allSubmissions"] });
      queryClient.invalidateQueries({ queryKey: ["mySubmissions"] });
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
      const submissions = await (actor as any).getAllSubmissionsForAdmin();
      const submission = submissions.find((s: any) => s.id === songId);
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

      return (actor as any).adminEditSubmission(editInput);
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

export function useIsCurrentUserBlockedSongSubmission() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ["isCurrentUserBlockedSong", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return (actor as any).isUserBlockedSongSubmission(
        identity.getPrincipal(),
      );
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

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
      return (actor as any).isUserBlockedPodcastSubmission(
        identity.getPrincipal(),
      );
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
      return (actor as any).getVerificationRequests();
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
      return (actor as any).updateVerificationStatus(
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
      return (actor as any).applyForVerification();
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
      return (actor as any).getMyPodcastShows();
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
      return (actor as any).getAllPodcasts();
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
      return (actor as any).getAllEpisodes();
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
      return (actor as any).createPodcastShow(input);
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
      return (actor as any).createPodcastEpisode(input);
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
      return (actor as any).approvePodcast(id);
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
      return (actor as any).rejectPodcast(id);
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
      return (actor as any).markPodcastLive(id, liveLink);
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
      return (actor as any).approveEpisode(id);
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
      return (actor as any).rejectEpisode(id);
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
      return (actor as any).markEpisodeLive(id);
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
      return (actor as any).getUserVideoSubmissions();
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
      return (actor as any).getAllVideoSubmissions();
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
      return (actor as any).submitVideo(input);
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
      return (actor as any).updateVideoStatus(videoId, newStatus, liveUrl);
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
      return (actor as any).updateVideoSubmission(input, videoId);
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
      return (actor as any).deleteVideoSubmission(videoId);
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
      return (actor as any).downloadVideoFile(videoId);
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
      return (actor as any).getFeaturedArtists();
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
      return (actor as any).getActiveFeaturedArtists();
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
      return (actor as any).setFeaturedArtist(slot, data);
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
      return (actor as any).toggleFeaturedArtistSlot(slot, active);
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
      return (actor as any).getAllSubscriptionPlans();
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
      return (actor as any).createSubscriptionPlan(plan);
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
      return (actor as any).updateSubscriptionPlan(plan);
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
      return (actor as any).deleteSubscriptionPlan(planName);
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
      return (actor as any).updateUserCategory(userId, newCategory);
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
      return (actor as any).blockUserSongSubmission(user);
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
      return (actor as any).unblockUserSongSubmission(user);
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
      return (actor as any).blockUserPodcastSubmission(user);
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
      return (actor as any).unblockUserPodcastSubmission(user);
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
      return (actor as any).getAllBlockedUsersAdmin();
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
      return (actor as any).promoteToAdmin(target);
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
      return (actor as any).demoteFromAdmin(target);
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
      return (actor as any).listAdmins();
    },
    enabled: !!actor && !isFetching,
  });
}

// ================================
// USERS PANEL HOOKS
// ================================
export function useGetAllRegisteredUsers() {
  const { actor, isFetching } = useActor();

  return useQuery<AdminUserView[]>({
    queryKey: ["allRegisteredUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllRegisteredUsersForAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

export function useGrantPremiumRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).grantPremiumRole(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allRegisteredUsers"] });
    },
  });
}

export function useRevokePremiumRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).revokePremiumRole(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allRegisteredUsers"] });
    },
  });
}

export function useIsCallerPremium() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["isCallerPremium"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await (actor as any).isCallerPremium();
      } catch {
        return false;
      }
    },
    retry: false,
  });
}

export function useGetAllPremiumUsers() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["allPremiumUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllPremiumUsers();
    },
    retry: false,
  });
}

export function useUpgradeUserToTeamMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).upgradeUserToTeamMember(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allRegisteredUsers"] });
    },
  });
}

export function useDowngradeTeamMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).downgradeTeamMember(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allRegisteredUsers"] });
    },
  });
}

export function usePromoteToAdminForUsers() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).promoteToAdmin(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allRegisteredUsers"] });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
}

export function useDemoteFromAdminForUsers() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).demoteFromAdmin(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allRegisteredUsers"] });
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
}

export function useBlockSongForUsers() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).blockUserSongSubmission(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allRegisteredUsers"] });
    },
  });
}

export function useUnblockSongForUsers() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).unblockUserSongSubmission(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allRegisteredUsers"] });
    },
  });
}

export function useBlockPodcastForUsers() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).blockUserPodcastSubmission(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allRegisteredUsers"] });
    },
  });
}

export function useUnblockPodcastForUsers() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).unblockUserPodcastSubmission(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allRegisteredUsers"] });
    },
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
      return (actor as any).generateInviteCode();
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
      return (actor as any).getInviteCodes();
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
      return (actor as any).getAllRSVPs();
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
      return (actor as any).getAllTopVibingSongs();
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
      return (actor as any).getRankedTopVibingSongs();
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
      return (actor as any).addTopVibingSong(song);
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
      return (actor as any).updateTopVibingSong(song);
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
      return (actor as any).deleteTopVibingSong(id);
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
      return (actor as any).reorderTopVibingSongs(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTopVibingSongs"] });
      queryClient.invalidateQueries({ queryKey: ["rankedTopVibingSongs"] });
    },
  });
}

// ================================
// LABEL PARTNERS HOOKS
// ================================
export function useGetAllLabelPartners() {
  const { actor, isFetching } = useActor();

  return useQuery<LabelPartner[]>({
    queryKey: ["allLabelPartners"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllLabelPartners();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddLabelPartner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LabelPartnerInput) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).addLabelPartner(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allLabelPartners"] });
    },
  });
}

export function useUpdateLabelPartner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partner: LabelPartner) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).updateLabelPartner(partner);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allLabelPartners"] });
    },
  });
}

export function useDeleteLabelPartner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).deleteLabelPartner(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allLabelPartners"] });
      queryClient.invalidateQueries({ queryKey: ["allLabelReleases"] });
    },
  });
}

export function useGetLabelReleases(labelId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<LabelRelease[]>({
    queryKey: ["labelReleases", labelId?.toString()],
    queryFn: async () => {
      if (!actor || labelId === null) return [];
      return (actor as any).getLabelReleases(labelId);
    },
    enabled: !!actor && !isFetching && labelId !== null,
  });
}

export function useGetAllLabelReleases() {
  const { actor, isFetching } = useActor();

  return useQuery<LabelRelease[]>({
    queryKey: ["allLabelReleases"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllLabelReleases();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddLabelRelease() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LabelReleaseInput) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).addLabelRelease(input);
    },
    onSuccess: (_data: any, variables: LabelReleaseInput) => {
      queryClient.invalidateQueries({
        queryKey: ["labelReleases", variables.labelId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["allLabelReleases"] });
    },
  });
}

export function useUpdateLabelRelease() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (release: LabelRelease) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).updateLabelRelease(release);
    },
    onSuccess: (_data: any, variables: LabelRelease) => {
      queryClient.invalidateQueries({
        queryKey: ["labelReleases", variables.labelId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["allLabelReleases"] });
    },
  });
}

export function useDeleteLabelRelease() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      labelId: _labelId,
    }: { id: bigint; labelId: bigint }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).deleteLabelRelease(id);
    },
    onSuccess: (_data: any, variables: { id: bigint; labelId: bigint }) => {
      queryClient.invalidateQueries({
        queryKey: ["labelReleases", variables.labelId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["allLabelReleases"] });
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
      return await (actor as any).getLiveSongsForAdmin();
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
      const allSongs = await (actor as any).getMySubmissions();
      const liveSongs = allSongs.filter(
        (s: any) => s.status === ("live" as any),
      );
      return liveSongs.map((song: SongSubmission) => ({ song, stats: [] }));
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

export function useGetSongMonthlyListenerStats() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (
      songId: string,
    ): Promise<{ month: number; year: number; value: number }[]> => {
      if (!actor) throw new Error("Actor not available");
      const result = await (actor as any).getSongMonthlyListenerStats(songId);
      if (!result) return [];
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
// GENERAL SUPPORT REQUEST HOOKS
// ================================

export function useGetMySupportRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<GeneralSupportRequest[]>({
    queryKey: ["mySupportRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getMySupportRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllSupportRequestsForAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<GeneralSupportRequest[]>({
    queryKey: ["allSupportRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllSupportRequestsForAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Keep old alias for backward compatibility
export const useGetAllSupportRequests = useGetAllSupportRequestsForAdmin;

export function useSubmitSupportRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: GeneralSupportRequestInput) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).submitSupportRequest(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mySupportRequests"] });
      queryClient.invalidateQueries({ queryKey: ["allSupportRequests"] });
    },
  });
}

export function useApproveSupportRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).approveSupportRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allSupportRequests"] });
      queryClient.invalidateQueries({ queryKey: ["mySupportRequests"] });
    },
  });
}

export function useRejectSupportRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      reason,
    }: { requestId: string; reason: string }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).rejectSupportRequest(requestId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allSupportRequests"] });
      queryClient.invalidateQueries({ queryKey: ["mySupportRequests"] });
    },
  });
}

// Legacy stub kept for backward compat
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
