import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserProfile {
    name: string;
    artistId: string;
    category: UserCategory;
}
export interface PodcastShow {
    id: string;
    podcastType: PodcastType;
    title: string;
    createdBy: Principal;
    description: string;
    artwork: ExternalBlob;
    language: Language;
    moderationStatus: PodcastModerationStatus;
    timestamp: Time;
    category: PodcastCategory;
    liveLink?: string;
}
export interface FeaturedArtist {
    id: bigint;
    aboutBlurb: string;
    photoUrl: string;
    isActive: boolean;
    songs: Array<FeaturedArtistSong>;
    slotIndex: bigint;
    artistName: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface PodcastEpisodeInput {
    isPromotional: boolean;
    title: string;
    isEighteenPlus: boolean;
    thumbnail: ExternalBlob;
    showId: string;
    description: string;
    artwork: ExternalBlob;
    seasonNumber: bigint;
    episodeNumber: bigint;
    episodeType: EpisodeType;
    mediaFile: ExternalBlob;
    isExplicit: boolean;
}
export interface VideoSubmission {
    id: string;
    status: VideoSubmissionStatus;
    title: string;
    thumbnail: ExternalBlob;
    userId: Principal;
    tags: Array<string>;
    submittedAt: Time;
    description: string;
    videoFile: ExternalBlob;
    artwork: ExternalBlob;
    updatedAt: Time;
    category: string;
    liveUrl?: string;
}
export interface FeaturedArtistInput {
    aboutBlurb: string;
    photoUrl: string;
    isActive: boolean;
    songs: Array<FeaturedArtistSong>;
    artistName: string;
}
export interface TopVibingSong {
    id: bigint;
    title: string;
    streamingLink: string;
    tagline?: string;
    rank: bigint;
    artworkUrl: string;
    genre: string;
    artistName: string;
}
export interface SongSubmissionEditInput {
    artworkBlob: ExternalBlob;
    albumTracks?: Array<TrackMetadata>;
    title: string;
    additionalDetails: string;
    lyricist: string;
    spotifyLink?: string;
    discountCode?: string;
    songSubmissionId: string;
    artworkFilename: string;
    audioFile: ExternalBlob;
    audioFilename: string;
    language: string;
    composer: string;
    genre: string;
    musicVideoLink?: string;
    artist: string;
    appleMusicLink?: string;
    producer: string;
    releaseDate: Time;
    releaseType: string;
    featuredArtist: string;
}
export interface SaveArtistProfileInput {
    isApproved: boolean;
    instagramLink: string;
    profilePhoto: ExternalBlob;
    fullName: string;
    mobileNumber: string;
    email: string;
    spotifyProfile: string;
    youtubeChannelLink: string;
    facebookLink: string;
    appleProfile: string;
    profilePhotoFilename: string;
    stageName: string;
}
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export interface ArtistProfile {
    id: string;
    isApproved: boolean;
    instagramLink: string;
    owner: Principal;
    profilePhoto: ExternalBlob;
    fullName: string;
    mobileNumber: string;
    email: string;
    isVerified: boolean;
    spotifyProfile: string;
    youtubeChannelLink: string;
    facebookLink: string;
    appleProfile: string;
    profilePhotoFilename: string;
    stageName: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface SubscriptionPlan {
    redirectUrl: string;
    pricePerYear: bigint;
    benefits: Array<string>;
    planName: string;
}
export interface TrackMetadata {
    title: string;
    lyricist: string;
    audioFile: ExternalBlob;
    audioFilename: string;
    composer: string;
    artist: string;
    producer: string;
    featuredArtist: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface PodcastShowInput {
    podcastType: PodcastType;
    title: string;
    description: string;
    artwork: ExternalBlob;
    language: Language;
    category: PodcastCategory;
}
export interface VideoSubmissionInput {
    title: string;
    thumbnail: ExternalBlob;
    tags: Array<string>;
    description: string;
    videoFile: ExternalBlob;
    artwork: ExternalBlob;
    category: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface SongSubmissionInput {
    artworkBlob: ExternalBlob;
    albumTracks?: Array<TrackMetadata>;
    title: string;
    additionalDetails: string;
    lyricist: string;
    spotifyLink?: string;
    discountCode?: string;
    artworkFilename: string;
    audioBlob: ExternalBlob;
    audioFilename: string;
    language: string;
    composer: string;
    genre: string;
    musicVideoLink?: string;
    artist: string;
    appleMusicLink?: string;
    producer: string;
    releaseDate: Time;
    releaseType: string;
    featuredArtist: string;
}
export interface PublicSongInfo {
    id: string;
    title: string;
    spotifyLink?: string;
    artwork: ExternalBlob;
    language: string;
    genre: string;
    musicVideoLink?: string;
    artist: string;
    appleMusicLink?: string;
    releaseDate: Time;
    featuredArtist: string;
}
export interface PodcastEpisode {
    id: string;
    isPromotional: boolean;
    title: string;
    isEighteenPlus: boolean;
    thumbnail: ExternalBlob;
    showId: string;
    createdBy: Principal;
    description: string;
    artwork: ExternalBlob;
    seasonNumber: bigint;
    episodeNumber: bigint;
    episodeType: EpisodeType;
    moderationStatus: PodcastModerationStatus;
    mediaFile: ExternalBlob;
    timestamp: Time;
    isExplicit: boolean;
}
export interface FeaturedArtistSong {
    title: string;
    link: string;
}
export interface ACRResult {
    music: string;
    statusCode: string;
}
export interface SongSubmission {
    id: string;
    status: SongStatus;
    albumTracks?: Array<TrackMetadata>;
    adminLiveLink?: string;
    title: string;
    preSaveLink?: string;
    additionalDetails: string;
    lyricist: string;
    spotifyLink?: string;
    publicLink?: string;
    submitter: Principal;
    discountCode?: string;
    artworkFilename: string;
    audioFile: ExternalBlob;
    liveStreamLink?: string;
    artwork: ExternalBlob;
    audioFilename: string;
    language: string;
    composer: string;
    adminComment: string;
    genre: string;
    musicVideoLink?: string;
    timestamp: Time;
    artist: string;
    appleMusicLink?: string;
    acrResult?: ACRResult;
    producer: string;
    releaseDate: Time;
    isManuallyRejected: boolean;
    releaseType: string;
    adminRemarks: string;
    featuredArtist: string;
}
export interface VerificationRequest {
    id: string;
    status: VerificationStatus;
    expiryExtensionDays: bigint;
    user: Principal;
    verificationApprovedTimestamp?: Time;
    timestamp: Time;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum EpisodeType {
    full = "full",
    trailer = "trailer",
    bonus = "bonus"
}
export enum Language {
    tamil = "tamil",
    hindi = "hindi",
    other = "other",
    marathi = "marathi",
    gujarati = "gujarati",
    punjabi = "punjabi",
    malayalam = "malayalam",
    kannada = "kannada",
    telugu = "telugu",
    bengali = "bengali",
    english = "english"
}
export enum PodcastCategory {
    kidsFamily = "kidsFamily",
    music = "music",
    newsPolitics = "newsPolitics",
    other = "other",
    arts = "arts",
    education = "education",
    religionSpirituality = "religionSpirituality",
    healthFitness = "healthFitness",
    tvFilm = "tvFilm",
    technology = "technology",
    business = "business",
    sports = "sports",
    comedy = "comedy",
    science = "science"
}
export enum PodcastModerationStatus {
    pending = "pending",
    live = "live",
    approved = "approved",
    rejected = "rejected"
}
export enum PodcastType {
    audio = "audio",
    video = "video"
}
export enum SongStatus {
    pending = "pending",
    live = "live",
    approved = "approved",
    rejected = "rejected",
    draft = "draft"
}
export enum UserCategory {
    generalArtist = "generalArtist",
    generalLabel = "generalLabel",
    proArtist = "proArtist",
    ultraArtist = "ultraArtist",
    proLabel = "proLabel"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum VerificationStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected",
    waiting = "waiting"
}
export enum VideoSubmissionStatus {
    pending = "pending",
    live = "live",
    approved = "approved",
    rejected = "rejected",
    waiting = "waiting"
}
export interface backendInterface {
    addTopVibingSong(song: TopVibingSong): Promise<bigint>;
    adminDeleteArtistProfile(id: string): Promise<void>;
    adminDeleteSubmission(id: string): Promise<void>;
    adminEditArtistProfile(id: string, input: SaveArtistProfileInput): Promise<void>;
    adminEditSubmission(input: SongSubmissionEditInput): Promise<void>;
    adminSetSubmissionLive(id: string, liveUrl: string, adminRemarks: string, adminComment: string): Promise<void>;
    adminUpdateSubmission(id: string, status: SongStatus, adminRemarks: string, adminComment: string): Promise<void>;
    applyForVerification(): Promise<string>;
    approveEpisode(id: string): Promise<void>;
    approvePodcast(id: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    blockUserPodcastSubmission(user: Principal): Promise<void>;
    blockUserSongSubmission(user: Principal): Promise<void>;
    createArtistProfile(input: SaveArtistProfileInput): Promise<string>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createPodcastEpisode(input: PodcastEpisodeInput): Promise<string>;
    createPodcastShow(input: PodcastShowInput): Promise<string>;
    createSubscriptionPlan(plan: SubscriptionPlan): Promise<void>;
    deleteArtistProfile(id: string): Promise<void>;
    deleteSubscriptionPlan(planName: string): Promise<void>;
    deleteTopVibingSong(id: bigint): Promise<void>;
    deleteVideoSubmission(videoId: string): Promise<void>;
    demoteFromAdmin(target: Principal): Promise<void>;
    doesUserHaveArtistProfile(owner: Principal): Promise<boolean>;
    downgradeTeamMember(user: Principal): Promise<void>;
    downloadVideoFile(videoId: string): Promise<ExternalBlob>;
    editSongSubmission(input: SongSubmissionEditInput): Promise<void>;
    generateInviteCode(): Promise<string>;
    getActiveFeaturedArtists(): Promise<Array<FeaturedArtist>>;
    getAllArtistProfileOwnersForAdmin(): Promise<Array<Principal>>;
    getAllArtistProfilesForAdmin(): Promise<Array<ArtistProfile>>;
    getAllBlockedUsersAdmin(): Promise<Array<Principal>>;
    getAllEpisodes(): Promise<Array<PodcastEpisode>>;
    getAllPendingEpisodes(): Promise<Array<PodcastEpisode>>;
    getAllPendingPodcasts(): Promise<Array<PodcastShow>>;
    getAllPodcasts(): Promise<Array<PodcastShow>>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getAllSubmissionsForAdmin(): Promise<Array<SongSubmission>>;
    getAllSubscriptionPlans(): Promise<Array<SubscriptionPlan>>;
    getAllTeamMembers(): Promise<Array<Principal>>;
    getAllTopVibingSongs(): Promise<Array<TopVibingSong>>;
    getAllVideoSubmissions(): Promise<Array<VideoSubmission>>;
    getArtistProfileByOwner(owner: Principal): Promise<ArtistProfile | null>;
    getArtistProfileEditingAccessStatus(): Promise<boolean>;
    getArtistProfileIdByOwnerId(owner: Principal): Promise<string | null>;
    getArtistProfilesByUserForAdmin(user: Principal): Promise<Array<ArtistProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEpisodesByShowId(showId: string): Promise<Array<PodcastEpisode>>;
    getFeaturedArtists(): Promise<Array<FeaturedArtist>>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getMyArtistProfiles(): Promise<Array<ArtistProfile>>;
    getMyEpisodes(showId: string): Promise<Array<PodcastEpisode>>;
    getMyPodcastShows(): Promise<Array<PodcastShow>>;
    getMySubmissions(): Promise<Array<SongSubmission>>;
    getPodcastsByCategory(category: PodcastCategory): Promise<Array<PodcastShow>>;
    getRankedTopVibingSongs(): Promise<Array<TopVibingSong>>;
    getSongInfo(songId: string): Promise<PublicSongInfo>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getTopVibingSong(id: bigint): Promise<TopVibingSong>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserVideoSubmissions(): Promise<Array<VideoSubmission>>;
    getUsersByCategory(category: UserCategory): Promise<Array<UserProfile>>;
    getVerificationRequests(): Promise<Array<VerificationRequest>>;
    getVerificationRequestsByUser(user: Principal): Promise<Array<VerificationRequest>>;
    getWebsiteLogo(): Promise<ExternalBlob | null>;
    handleVerificationRequest(artistProfileId: string, isVerified: boolean, verificationRequestId: string, newStatus: VerificationStatus): Promise<void>;
    isArtistProfileEditingEnabled(): Promise<boolean>;
    isArtistVerified(owner: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    isUserBlockedPodcastSubmission(user: Principal): Promise<boolean>;
    isUserBlockedSongSubmission(user: Principal): Promise<boolean>;
    isUserTeamMember(user: Principal): Promise<boolean>;
    listAdmins(): Promise<Array<Principal>>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    markEpisodeLive(id: string): Promise<void>;
    markPodcastLive(id: string, liveLink: string): Promise<void>;
    promoteToAdmin(target: Principal): Promise<void>;
    rejectEpisode(id: string): Promise<void>;
    rejectPodcast(id: string): Promise<void>;
    removeWebsiteLogo(): Promise<void>;
    reorderTopVibingSongs(ids: Array<bigint>): Promise<void>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setArtistProfileEditingAccess(enabled: boolean): Promise<void>;
    setFeaturedArtist(slot: bigint, data: FeaturedArtistInput): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    setWebsiteLogo(logo: ExternalBlob): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    submitSong(input: SongSubmissionInput): Promise<string>;
    submitVideo(input: VideoSubmissionInput): Promise<string>;
    toggleFeaturedArtistSlot(slot: bigint, active: boolean): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    unblockUserPodcastSubmission(user: Principal): Promise<void>;
    unblockUserSongSubmission(user: Principal): Promise<void>;
    updateArtistProfile(id: string, input: SaveArtistProfileInput): Promise<void>;
    updateSubscriptionPlan(plan: SubscriptionPlan): Promise<void>;
    updateTopVibingSong(song: TopVibingSong): Promise<void>;
    updateUserCategory(userId: Principal, newCategory: UserCategory): Promise<void>;
    updateVerificationStatus(verificationId: string, status: VerificationStatus, expiryExtensionDays: bigint): Promise<void>;
    updateVideoStatus(videoId: string, newStatus: VideoSubmissionStatus, liveUrl: string | null): Promise<void>;
    updateVideoSubmission(input: VideoSubmissionInput, videoId: string): Promise<void>;
    upgradeUserToTeamMember(user: Principal): Promise<void>;
}
