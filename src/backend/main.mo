import Map "mo:core/Map";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Storage "mo:caffeineai-object-storage/Storage";
import List "mo:core/List";
import Random "mo:core/Random";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import AccessControl "mo:caffeineai-authorization/access-control";
import InviteLinksModule "mo:caffeineai-invite-links/invite-links-module";
import Stripe "mo:caffeineai-stripe/stripe";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import UserApproval "mo:caffeineai-user-approval/approval";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Iter "mo:core/Iter";

actor {
  include MixinObjectStorage();

  public type SongStatus = {
    #pending;
    #approved;
    #rejected;
    #draft;
    #live;
  };

  public type AlbumTrack = {
    trackName : Text;
    albumName : Text;
    artistName : Text;
    audioFile : Storage.ExternalBlob;
    composer : Text;
    producer : Text;
    featuredArtist : Text;
    lyricist : Text;
  };

  public type TrackMetadata = {
    title : Text;
    artist : Text;
    featuredArtist : Text;
    composer : Text;
    producer : Text;
    lyricist : Text;
    audioFile : Storage.ExternalBlob;
    audioFilename : Text;
  };

  public type ACRResult = {
    statusCode : Text;
    music : Text;
  };

  // Legacy SongSubmission type (before premium fields were added)
  // Used only for stable migration in postupgrade
  public type SongSubmissionLegacy = {
    id : Text;
    title : Text;
    releaseType : Text;
    genre : Text;
    language : Text;
    releaseDate : Time.Time;
    artwork : Storage.ExternalBlob;
    artworkFilename : Text;
    artist : Text;
    featuredArtist : Text;
    composer : Text;
    producer : Text;
    lyricist : Text;
    audioFile : Storage.ExternalBlob;
    audioFilename : Text;
    additionalDetails : Text;
    status : SongStatus;
    adminRemarks : Text;
    adminComment : Text;
    submitter : Principal;
    timestamp : Time.Time;
    discountCode : ?Text;
    acrResult : ?ACRResult;
    preSaveLink : ?Text;
    liveStreamLink : ?Text;
    musicVideoLink : ?Text;
    albumTracks : ?[TrackMetadata];
    publicLink : ?Text;
    adminLiveLink : ?Text;
    isManuallyRejected : Bool;
    spotifyLink : ?Text;
    appleMusicLink : ?Text;
  };

  public type SongSubmission = {
    id : Text;
    title : Text;
    releaseType : Text;
    genre : Text;
    language : Text;
    releaseDate : Time.Time;
    artwork : Storage.ExternalBlob;
    artworkFilename : Text;
    artist : Text;
    featuredArtist : Text;
    composer : Text;
    producer : Text;
    lyricist : Text;
    audioFile : Storage.ExternalBlob;
    audioFilename : Text;
    additionalDetails : Text;
    status : SongStatus;
    adminRemarks : Text;
    adminComment : Text;
    submitter : Principal;
    timestamp : Time.Time;
    discountCode : ?Text;
    acrResult : ?ACRResult;
    preSaveLink : ?Text;
    liveStreamLink : ?Text;
    musicVideoLink : ?Text;
    albumTracks : ?[TrackMetadata];
    publicLink : ?Text;
    adminLiveLink : ?Text;
    isManuallyRejected : Bool;
    spotifyLink : ?Text;
    appleMusicLink : ?Text;
    // Premium fields (optional)
    customCLine : ?Text;
    customPLine : ?Text;
    premiumLabel : ?Text;
    contentType : ?Text;
    sunoTrackLink : ?Text;
    sunoAgreementFile : ?Storage.ExternalBlob;
    sunoAgreementFilename : ?Text;
    licenceFile : ?Storage.ExternalBlob;
    licenceFilename : ?Text;
    contentId : ?Bool;
    callerTuneStartSecond : ?Float;
  };

  public type PublicSongInfo = {
    id : Text;
    title : Text;
    artist : Text;
    featuredArtist : Text;
    artwork : Storage.ExternalBlob;
    spotifyLink : ?Text;
    appleMusicLink : ?Text;
    releaseDate : Time.Time;
    genre : Text;
    language : Text;
    musicVideoLink : ?Text;
  };

  public type SongSubmissionInput = {
    title : Text;
    language : Text;
    releaseDate : Time.Time;
    releaseType : Text;
    genre : Text;
    artworkBlob : Storage.ExternalBlob;
    artworkFilename : Text;
    artist : Text;
    featuredArtist : Text;
    composer : Text;
    producer : Text;
    lyricist : Text;
    audioBlob : Storage.ExternalBlob;
    audioFilename : Text;
    additionalDetails : Text;
    discountCode : ?Text;
    albumTracks : ?[TrackMetadata];
    musicVideoLink : ?Text;
    spotifyLink : ?Text;
    appleMusicLink : ?Text;
    // Premium fields (optional)
    customCLine : ?Text;
    customPLine : ?Text;
    premiumLabel : ?Text;
    contentType : ?Text;
    sunoTrackLink : ?Text;
    sunoAgreementFile : ?Storage.ExternalBlob;
    sunoAgreementFilename : ?Text;
    licenceFile : ?Storage.ExternalBlob;
    licenceFilename : ?Text;
    contentId : ?Bool;
    callerTuneStartSecond : ?Float;
  };

  public type ACRCloudResponse = {
    statusCode : Text;
    music : Text;
  };

  public type PreSaveInput = {
    songId : Text;
    preSaveLink : Text;
  };

  public type PreSave = {
    link : Text;
    created : Time.Time;
  };

  public type SongSubmissionEditInput = {
    songSubmissionId : Text;
    title : Text;
    releaseType : Text;
    genre : Text;
    language : Text;
    releaseDate : Time.Time;
    artworkBlob : Storage.ExternalBlob;
    artworkFilename : Text;
    artist : Text;
    featuredArtist : Text;
    composer : Text;
    producer : Text;
    lyricist : Text;
    audioFile : Storage.ExternalBlob;
    audioFilename : Text;
    additionalDetails : Text;
    discountCode : ?Text;
    musicVideoLink : ?Text;
    albumTracks : ?[TrackMetadata];
    spotifyLink : ?Text;
    appleMusicLink : ?Text;
  };

  public type UpdateSongSubmissionEditStatus = {
    songSubmissionId : Text;
    status : SongStatus;
  };

  public type RetrieveSongSubmissionEditData = {
    songSubmissionId : Text;
  };

  public type RetrieveSongSubmissionEditDataResponse = {
    songSubmissionId : Text;
    title : Text;
    releaseType : Text;
    genre : Text;
    language : Text;
    releaseDate : Time.Time;
    artwork : Storage.ExternalBlob;
    artworkFilename : Text;
    artist : Text;
    featuredArtist : Text;
    composer : Text;
    producer : Text;
    lyricist : Text;
    audioFile : Storage.ExternalBlob;
    audioFilename : Text;
    additionalDetails : Text;
    discountCode : ?Text;
    musicVideoLink : ?Text;
    albumTracks : ?[TrackMetadata];
  };

  public type ArtistSubmissionLinksOutput = {
    artist : Text;
    spotifyProfile : Text;
    appleProfile : Text;
    youtubeChannelLink : Text;
    musicVideoLink : Text;
  };

  public type PlatformLinks = {
    spotifyProfile : Text;
    appleProfile : Text;
    youtubeChannel : Text;
  };

  public type ArtistProfile = {
    id : Text;
    owner : Principal;
    fullName : Text;
    stageName : Text;
    email : Text;
    mobileNumber : Text;
    instagramLink : Text;
    facebookLink : Text;
    spotifyProfile : Text;
    appleProfile : Text;
    youtubeChannelLink : Text;
    profilePhoto : Storage.ExternalBlob;
    profilePhotoFilename : Text;
    isApproved : Bool;
    isVerified : Bool;
  };

  public type SaveArtistProfileInput = {
    fullName : Text;
    stageName : Text;
    email : Text;
    mobileNumber : Text;
    instagramLink : Text;
    facebookLink : Text;
    spotifyProfile : Text;
    appleProfile : Text;
    youtubeChannelLink : Text;
    profilePhoto : Storage.ExternalBlob;
    profilePhotoFilename : Text;
    isApproved : Bool;
  };

  public type UserCategory = {
    #generalArtist;
    #proArtist;
    #ultraArtist;
    #generalLabel;
    #proLabel;
  };

  public type UserProfile = {
    name : Text;
    artistId : Text;
    category : UserCategory;
  };

  public type VerificationStatus = {
    #pending;
    #approved;
    #rejected;
    #waiting;
  };

  public type MonthlyListenerStats = {
    year : Nat;
    month : Nat;
    value : Nat;
  };

  public type ListenerStatsUpdate = {
    year : Nat;
    month : Nat;
    value : Nat;
  };

  public type VerificationRequest = {
    id : Text;
    user : Principal;
    status : VerificationStatus;
    timestamp : Time.Time;
    verificationApprovedTimestamp : ?Time.Time;
    expiryExtensionDays : Nat;
  };

  public type VerificationRequestWithFullName = {
    id : Text;
    user : Principal;
    status : VerificationStatus;
    timestamp : Time.Time;
    fullName : Text;
    verificationApprovedTimestamp : ?Time.Time;
    expiryExtensionDays : Nat;
  };

  public type AppUserRole = {
    #admin;
    #team;
    #user;
  };

  public type BlogPost = {
    id : Text;
    title : Text;
    content : Text;
    author : Principal;
    timestamp : Time.Time;
    media : ?Storage.ExternalBlob;
    status : { #draft; #published };
  };

  public type BlogPostInput = {
    title : Text;
    content : Text;
    media : ?Storage.ExternalBlob;
  };

  public type CommunityMessage = {
    id : Text;
    user : Principal;
    content : Text;
    timestamp : Time.Time;
    role : Text;
    fullName : Text;
  };

  public type CommunityMessageInput = {
    content : Text;
  };

  public type PodcastType = { #audio; #video };
  public type EpisodeType = {
    #trailer;
    #full;
    #bonus;
  };

  public type PodcastCategory = {
    #arts;
    #business;
    #comedy;
    #education;
    #healthFitness;
    #kidsFamily;
    #music;
    #newsPolitics;
    #religionSpirituality;
    #science;
    #sports;
    #technology;
    #tvFilm;
    #other;
  };

  public type Language = {
    #english;
    #hindi;
    #tamil;
    #telugu;
    #kannada;
    #malayalam;
    #punjabi;
    #bengali;
    #marathi;
    #gujarati;
    #other;
  };

  public type PodcastModerationStatus = {
    #pending;
    #approved;
    #live;
    #rejected;
  };

  public type PodcastShow = {
    id : Text;
    title : Text;
    description : Text;
    podcastType : PodcastType;
    category : PodcastCategory;
    language : Language;
    artwork : Storage.ExternalBlob;
    createdBy : Principal;
    timestamp : Time.Time;
    moderationStatus : PodcastModerationStatus;
    liveLink : ?Text;
  };

  public type PodcastEpisode = {
    id : Text;
    showId : Text;
    title : Text;
    description : Text;
    seasonNumber : Nat;
    episodeNumber : Nat;
    episodeType : EpisodeType;
    isEighteenPlus : Bool;
    isExplicit : Bool;
    isPromotional : Bool;
    artwork : Storage.ExternalBlob;
    thumbnail : Storage.ExternalBlob;
    mediaFile : Storage.ExternalBlob;
    createdBy : Principal;
    timestamp : Time.Time;
    moderationStatus : PodcastModerationStatus;
  };

  public type PodcastShowInput = {
    title : Text;
    description : Text;
    podcastType : PodcastType;
    category : PodcastCategory;
    language : Language;
    artwork : Storage.ExternalBlob;
  };

  public type PodcastEpisodeInput = {
    showId : Text;
    title : Text;
    description : Text;
    seasonNumber : Nat;
    episodeNumber : Nat;
    episodeType : EpisodeType;
    isEighteenPlus : Bool;
    isExplicit : Bool;
    isPromotional : Bool;
    artwork : Storage.ExternalBlob;
    thumbnail : Storage.ExternalBlob;
    mediaFile : Storage.ExternalBlob;
  };

  public type YouTubeCopyrightClaim = {
    id : Text;
    songId : Text;
    youtubeChannelLink : Text;
    submitter : Principal;
    timestamp : Time.Time;
  };

  public type YouTubeCopyrightClaimInput = {
    songId : Text;
    youtubeChannelLink : Text;
  };

  public type InstagramProfileConnection = {
    id : Text;
    songId : Text;
    instagramProfileLink : Text;
    submitter : Principal;
    timestamp : Time.Time;
  };

  public type InstagramProfileConnectionInput = {
    songId : Text;
    instagramProfileLink : Text;
  };

  public type SupportRequestStatus = {
    #pending;
    #inProgress;
    #resolved;
    #rejected;
  };

  public type SupportRequest = {
    id : Text;
    type_ : Text;
    details : Text;
    submitter : Principal;
    status : SupportRequestStatus;
    adminNotes : Text;
    timestamp : Time.Time;
    publicLink : ?Text;
    adminDecision : ?Bool;
  };

  public type SubmitSupportRequestInput = {
    type_ : Text;
    details : Text;
  };

  public type UpdateSupportRequestInput = {
    id : Text;
    status : SupportRequestStatus;
    adminNotes : Text;
  };

  public type BlockedUser = {
    songSubmissionBlocked : Bool;
    podcastSubmissionBlocked : Bool;
  };


  public type AdminUserView = {
    principal : Principal;
    displayName : Text;
    isAdmin : Bool;
    isTeamMember : Bool;
    isVerified : Bool;
    isSongBlocked : Bool;
    isPodcastBlocked : Bool;
  };

  public type SubscriptionPlan = {
    planName : Text;
    pricePerYear : Nat;
    redirectUrl : Text;
    benefits : [Text];
  };


  public type WithdrawStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type WithdrawRequestInput = {
    fullName : Text;
    googlePayAccountName : Text;
    upiId : Text;
    message : Text;
    amount : Float;
    qrCodeBlob : Storage.ExternalBlob;
    qrCodeFilename : Text;
  };

  public type WithdrawRequest = {
    id : Text;
    submitter : Principal;
    fullName : Text;
    googlePayAccountName : Text;
    upiId : Text;
    message : Text;
    amount : Float;
    qrCodeBlob : Storage.ExternalBlob;
    qrCodeFilename : Text;
    status : WithdrawStatus;
    rejectionReason : Text;
    timestamp : Time.Time;
  };

  public type VideoSubmissionStatus = {
    #pending;
    #approved;
    #rejected;
    #waiting;
    #live;
  };

  public type VideoSubmission = {
    id : Text;
    userId : Principal;
    title : Text;
    description : Text;
    category : Text;
    tags : [Text];
    thumbnail : Storage.ExternalBlob;
    artwork : Storage.ExternalBlob;
    videoFile : Storage.ExternalBlob;
    status : VideoSubmissionStatus;
    liveUrl : ?Text;
    submittedAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type VideoSubmissionInput = {
    title : Text;
    description : Text;
    category : Text;
    tags : [Text];
    thumbnail : Storage.ExternalBlob;
    artwork : Storage.ExternalBlob;
    videoFile : Storage.ExternalBlob;
  };

  public type FeaturedArtistSong = {
    title : Text;
    link : Text;
  };

  public type FeaturedArtistInput = {
    artistName : Text;
    photoUrl : Text;
    aboutBlurb : Text;
    songs : [FeaturedArtistSong];
    isActive : Bool;
  };

  public type FeaturedArtist = {
    id : Nat;
    slotIndex : Nat;
    artistName : Text;
    photoUrl : Text;
    aboutBlurb : Text;
    songs : [FeaturedArtistSong];
    isActive : Bool;
  };

  public type TopVibingSong = {
    id : Nat;
    title : Text;
    artistName : Text;
    genre : Text;
    artworkUrl : Text;
    streamingLink : Text;
    tagline : ?Text;
    rank : Nat;
  };

  public type LabelPartnerInput = {
    logoUrl : Text;
    labelName : Text;
    websiteLink : ?Text;
    description : Text;
  };

  public type LabelPartner = {
    id : Nat;
    logoUrl : Text;
    labelName : Text;
    websiteLink : ?Text;
    description : Text;
  };

  public type LabelReleaseInput = {
    labelId : Nat;
    artworkUrl : Text;
    songTitle : Text;
    artistName : Text;
    streamingLink : Text;
  };

  public type LabelRelease = {
    id : Nat;
    labelId : Nat;
    artworkUrl : Text;
    songTitle : Text;
    artistName : Text;
    streamingLink : Text;
  };

  // `submissions` holds pre-upgrade data (SongSubmissionLegacy = old type without premium fields)
  // Motoko loads the deployed stable `submissions` map into this variable during upgrade
  let submissions = Map.empty<Text, SongSubmissionLegacy>();
  // submissionsV2 is the current stable store with premium fields
  let submissionsV2 = Map.empty<Text, SongSubmission>();
  let podcasts = Map.empty<Text, PodcastShow>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let artistProfiles = Map.empty<Text, ArtistProfile>();
  let verificationRequests = Map.empty<Text, VerificationRequest>();
  let teamMembers = Map.empty<Principal, Bool>();
  let blockedUsers = Map.empty<Principal, BlockedUser>();
  let blogPosts = Map.empty<Text, BlogPost>();
  let communityMessages = Map.empty<Text, CommunityMessage>();
  let podcastEpisodes = Map.empty<Text, PodcastEpisode>();
  let youtubeCopyrightClaims = Map.empty<Text, YouTubeCopyrightClaim>();
  let instagramProfileConnections = Map.empty<Text, InstagramProfileConnection>();
  let supportRequests = Map.empty<Text, SupportRequest>();
  let videoSubmissions = Map.empty<Text, VideoSubmission>();
  let monthlyListenerStats = Map.empty<Text, [MonthlyListenerStats]>();

  let labelPartners = Map.empty<Nat, LabelPartner>();
  let labelReleases = Map.empty<Nat, LabelRelease>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let approvalState = UserApproval.initState(accessControlState);
  let inviteState = InviteLinksModule.initState();

  let featuredArtists = Map.empty<Nat, FeaturedArtist>();
  let topVibingSongs = Map.empty<Nat, TopVibingSong>();
  var topVibingSongsSize = 0;

  var distributionFee : Int = 500;
  var annualMaintenanceFee : Int = 1000;
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;
  var globalAnnouncement : Text = "";
  var lastVerificationCheckTime : Time.Time = 0;
  var artistProfileEditingAccessEnabled : Bool = true;
  var websiteLogo : ?Storage.ExternalBlob = null;

  var labelPartnersSize = 0;
  var labelReleasesSize = 0;
  let subscriptionPlans = Map.empty<Text, SubscriptionPlan>();
  let songMonthlyListeners = Map.empty<Text, Float>();
  let songRevenues = Map.empty<Text, Float>();
  let withdrawRequests = Map.empty<Text, WithdrawRequest>();
  let withdrawnAmounts = Map.empty<Principal, Float>();
  let premiumUsers = Map.empty<Principal, Bool>();

  func isTeamMember(user : Principal) : Bool {
    switch (teamMembers.get(user)) {
      case (null) { false };
      case (?isTeam) { isTeam };
    };
  };

  func isBlockedForSongs(user : Principal) : Bool {
    switch (blockedUsers.get(user)) {
      case (null) { false };
      case (?blockedUser) { blockedUser.songSubmissionBlocked };
    };
  };

  func isBlockedForPodcasts(user : Principal) : Bool {
    switch (blockedUsers.get(user)) {
      case (null) { false };
      case (?blockedUser) { blockedUser.podcastSubmissionBlocked };
    };
  };

  func isAdminOrTeam(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller) or isTeamMember(caller);
  };

  func requireAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  func requireAdminOrTeam(caller : Principal) {
    if (not isAdminOrTeam(caller)) {
      Runtime.trap("Unauthorized: Admin or team privileges required");
    };
  };

  func requireUser(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can perform this action");
    };
  };

  func requireUserNotBlockedForSongs(caller : Principal) {
    if (isBlockedForSongs(caller)) {
      Runtime.trap("Your access blocked due to submission limit is full");
    };
  };

  func requireUserNotBlockedForPodcasts(caller : Principal) {
    if (isBlockedForPodcasts(caller)) {
      Runtime.trap("Your access blocked due to submission limit is full");
    };
  };

  func getUserRoleText(user : Principal) : Text {
    if (AccessControl.isAdmin(accessControlState, user)) {
      "Admin";
    } else if (isTeamMember(user)) {
      "Team Member";
    } else {
      "Artist";
    };
  };

  func getUserFullName(user : Principal) : Text {
    let userProfiles = artistProfiles.values().toArray().filter(
      func(profile) { profile.owner == user }
    );
    if (userProfiles.size() > 0) { userProfiles[0].fullName } else {
      "Anonymous User";
    };
  };

  func isValidUrl(url : Text) : Bool {
    url.startsWith(#text "http://") or url.startsWith(#text "https://");
  };

  func canEditSubmission(submission : SongSubmission) : Bool {
    switch (submission.status) {
      case (#draft) { true };
      case (#rejected) { true };
      case (#pending) { true };
      case (#approved) { false };
      case (#live) { false };
    };
  };

  // ── Label Partners ─────────────────────────────────────────────────────────

  public shared ({ caller }) func addLabelPartner(input : LabelPartnerInput) : async Nat {
    requireAdmin(caller);
    let partnerId = labelPartnersSize + 1;
    let partner : LabelPartner = {
      id = partnerId;
      logoUrl = input.logoUrl;
      labelName = input.labelName;
      websiteLink = input.websiteLink;
      description = input.description;
    };
    labelPartners.add(partnerId, partner);
    labelPartnersSize += 1;
    partnerId;
  };

  public shared ({ caller }) func updateLabelPartner(partner : LabelPartner) : async () {
    requireAdmin(caller);
    if (not labelPartners.containsKey(partner.id)) {
      Runtime.trap("LabelPartner not found");
    };
    labelPartners.add(partner.id, partner);
  };

  public shared ({ caller }) func deleteLabelPartner(id : Nat) : async () {
    requireAdmin(caller);
    if (not labelPartners.containsKey(id)) {
      Runtime.trap("LabelPartner not found");
    };
    labelPartners.remove(id);

    let releasesToDelete = labelReleases.values().toArray().filter(
      func(release) { release.labelId == id }
    );
    for (release in releasesToDelete.values()) {
      labelReleases.remove(release.id);
      labelReleasesSize -= 1;
    };
    labelPartnersSize -= 1;
  };

  public query func getAllLabelPartners() : async [LabelPartner] {
    labelPartners.values().toArray();
  };

  public shared ({ caller }) func addLabelRelease(input : LabelReleaseInput) : async Nat {
    requireAdmin(caller);

    switch (labelPartners.get(input.labelId)) {
      case (null) { Runtime.trap("LabelPartner not found") };
      case (?_) {
        let releaseId = labelReleasesSize + 1;
        let release : LabelRelease = {
          id = releaseId;
          labelId = input.labelId;
          artworkUrl = input.artworkUrl;
          songTitle = input.songTitle;
          artistName = input.artistName;
          streamingLink = input.streamingLink;
        };
        labelReleases.add(releaseId, release);
        labelReleasesSize += 1;
        releaseId;
      };
    };
  };

  public shared ({ caller }) func updateLabelRelease(release : LabelRelease) : async () {
    requireAdmin(caller);
    if (not labelReleases.containsKey(release.id)) {
      Runtime.trap("LabelRelease not found");
    };
    labelReleases.add(release.id, release);
  };

  public shared ({ caller }) func deleteLabelRelease(id : Nat) : async () {
    requireAdmin(caller);
    if (not labelReleases.containsKey(id)) {
      Runtime.trap("LabelRelease not found");
    };
    labelReleases.remove(id);
    labelReleasesSize -= 1;
  };

  public query func getLabelReleases(labelId : Nat) : async [LabelRelease] {
    labelReleases.values().toArray().filter(
      func(release) { release.labelId == labelId }
    );
  };

  public query ({ caller }) func getAllLabelReleases() : async [LabelRelease] {
    requireAdmin(caller);
    labelReleases.values().toArray();
  };

  // ── Stripe & Payments ──────────────────────────────────────────────────────

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    requireAdmin(caller);
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // ── Invite Links ───────────────────────────────────────────────────────────

  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate invite codes");
    };
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  public func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view RSVPs");
    };
    InviteLinksModule.getAllRSVPs(inviteState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view invite codes");
    };
    InviteLinksModule.getInviteCodes(inviteState);
  };

  // ── User Approval ──────────────────────────────────────────────────────────

  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    requireAdmin(caller);
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  // ── Artist Profile Management ──────────────────────────────────────────────

  public shared ({ caller }) func createArtistProfile(input : SaveArtistProfileInput) : async Text {
    requireUser(caller);
    let blob = await Random.blob();
    let id = InviteLinksModule.generateUUID(blob);
    let profile : ArtistProfile = {
      id;
      owner = caller;
      fullName = input.fullName;
      stageName = input.stageName;
      email = input.email;
      mobileNumber = input.mobileNumber;
      instagramLink = input.instagramLink;
      facebookLink = input.facebookLink;
      spotifyProfile = input.spotifyProfile;
      appleProfile = input.appleProfile;
      youtubeChannelLink = input.youtubeChannelLink;
      profilePhoto = input.profilePhoto;
      profilePhotoFilename = input.profilePhotoFilename;
      isApproved = false;
      isVerified = false;
    };
    artistProfiles.add(id, profile);
    id;
  };

  public shared ({ caller }) func updateArtistProfile(id : Text, input : SaveArtistProfileInput) : async () {
    requireUser(caller);
    switch (artistProfiles.get(id)) {
      case (null) { Runtime.trap("Artist profile not found") };
      case (?existing) {
        if (existing.owner != caller) {
          Runtime.trap("Unauthorized: You can only edit your own profiles");
        };
        if (existing.isApproved and not artistProfileEditingAccessEnabled) {
          Runtime.trap("Profile editing is currently disabled");
        };
        let updated : ArtistProfile = {
          id;
          owner = existing.owner;
          fullName = input.fullName;
          stageName = input.stageName;
          email = input.email;
          mobileNumber = input.mobileNumber;
          instagramLink = input.instagramLink;
          facebookLink = input.facebookLink;
          spotifyProfile = input.spotifyProfile;
          appleProfile = input.appleProfile;
          youtubeChannelLink = input.youtubeChannelLink;
          profilePhoto = input.profilePhoto;
          profilePhotoFilename = input.profilePhotoFilename;
          isApproved = existing.isApproved;
          isVerified = existing.isVerified;
        };
        artistProfiles.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteArtistProfile(id : Text) : async () {
    requireUser(caller);
    switch (artistProfiles.get(id)) {
      case (null) { Runtime.trap("Artist profile not found") };
      case (?existing) {
        if (existing.owner != caller) {
          Runtime.trap("Unauthorized: You can only delete your own profiles");
        };
        artistProfiles.remove(id);
      };
    };
  };

  public query ({ caller }) func getMyArtistProfiles() : async [ArtistProfile] {
    requireUser(caller);
    artistProfiles.values().toArray().filter(
      func(p : ArtistProfile) : Bool { p.owner == caller }
    );
  };

  public query ({ caller }) func getAllArtistProfilesForAdmin() : async [ArtistProfile] {
    requireAdminOrTeam(caller);
    artistProfiles.values().toArray();
  };

  public query ({ caller }) func getAllArtistProfileOwnersForAdmin() : async [Principal] {
    requireAdminOrTeam(caller);
    artistProfiles.values().toArray().map(func(p : ArtistProfile) : Principal { p.owner });
  };

  public query ({ caller }) func getArtistProfilesByUserForAdmin(user : Principal) : async [ArtistProfile] {
    requireAdminOrTeam(caller);
    artistProfiles.values().toArray().filter(
      func(p : ArtistProfile) : Bool { p.owner == user }
    );
  };

  public query func getArtistProfileByOwner(owner : Principal) : async ?ArtistProfile {
    let matches = artistProfiles.values().toArray().filter(
      func(p : ArtistProfile) : Bool { p.owner == owner }
    );
    if (matches.size() > 0) { ?matches[0] } else { null };
  };

  public query func getArtistProfileIdByOwnerId(owner : Principal) : async ?Text {
    let matches = artistProfiles.values().toArray().filter(
      func(p : ArtistProfile) : Bool { p.owner == owner }
    );
    if (matches.size() > 0) { ?matches[0].id } else { null };
  };

  public query func doesUserHaveArtistProfile(owner : Principal) : async Bool {
    artistProfiles.values().toArray().filter(
      func(p : ArtistProfile) : Bool { p.owner == owner }
    ).size() > 0;
  };

  public query func getArtistProfileEditingAccessStatus() : async Bool {
    artistProfileEditingAccessEnabled;
  };

  public query func isArtistProfileEditingEnabled() : async Bool {
    artistProfileEditingAccessEnabled;
  };

  public shared ({ caller }) func setArtistProfileEditingAccess(enabled : Bool) : async () {
    requireAdmin(caller);
    artistProfileEditingAccessEnabled := enabled;
  };

  public shared ({ caller }) func adminEditArtistProfile(id : Text, input : SaveArtistProfileInput) : async () {
    requireAdminOrTeam(caller);
    switch (artistProfiles.get(id)) {
      case (null) { Runtime.trap("Artist profile not found") };
      case (?existing) {
        let updated : ArtistProfile = {
          id;
          owner = existing.owner;
          fullName = input.fullName;
          stageName = input.stageName;
          email = input.email;
          mobileNumber = input.mobileNumber;
          instagramLink = input.instagramLink;
          facebookLink = input.facebookLink;
          spotifyProfile = input.spotifyProfile;
          appleProfile = input.appleProfile;
          youtubeChannelLink = input.youtubeChannelLink;
          profilePhoto = input.profilePhoto;
          profilePhotoFilename = input.profilePhotoFilename;
          isApproved = input.isApproved;
          isVerified = existing.isVerified;
        };
        artistProfiles.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func adminDeleteArtistProfile(id : Text) : async () {
    requireAdminOrTeam(caller);
    if (not artistProfiles.containsKey(id)) {
      Runtime.trap("Artist profile not found");
    };
    artistProfiles.remove(id);
  };

  // ── Song Submission ────────────────────────────────────────────────────────

  public shared ({ caller }) func submitSong(input : SongSubmissionInput) : async Text {
    requireUser(caller);
    requireUserNotBlockedForSongs(caller);
    let blob = await Random.blob();
    let id = InviteLinksModule.generateUUID(blob);
    let submission : SongSubmission = {
      id;
      title = input.title;
      releaseType = input.releaseType;
      genre = input.genre;
      language = input.language;
      releaseDate = input.releaseDate;
      artwork = input.artworkBlob;
      artworkFilename = input.artworkFilename;
      artist = input.artist;
      featuredArtist = input.featuredArtist;
      composer = input.composer;
      producer = input.producer;
      lyricist = input.lyricist;
      audioFile = input.audioBlob;
      audioFilename = input.audioFilename;
      additionalDetails = input.additionalDetails;
      status = #pending;
      adminRemarks = "";
      adminComment = "";
      submitter = caller;
      timestamp = Time.now();
      discountCode = input.discountCode;
      acrResult = null;
      preSaveLink = null;
      liveStreamLink = null;
      musicVideoLink = input.musicVideoLink;
      albumTracks = input.albumTracks;
      publicLink = null;
      adminLiveLink = null;
      isManuallyRejected = false;
      spotifyLink = input.spotifyLink;
      appleMusicLink = input.appleMusicLink;
      customCLine = input.customCLine;
      customPLine = input.customPLine;
      premiumLabel = input.premiumLabel;
      contentType = input.contentType;
      sunoTrackLink = input.sunoTrackLink;
      sunoAgreementFile = input.sunoAgreementFile;
      sunoAgreementFilename = input.sunoAgreementFilename;
      licenceFile = input.licenceFile;
      licenceFilename = input.licenceFilename;
      contentId = input.contentId;
      callerTuneStartSecond = input.callerTuneStartSecond;
    };
    submissionsV2.add(id, submission);
    id;
  };

  public shared ({ caller }) func editSongSubmission(input : SongSubmissionEditInput) : async () {
    requireUser(caller);
    switch (submissionsV2.get(input.songSubmissionId)) {
      case (null) { Runtime.trap("Submission not found") };
      case (?existing) {
        if (existing.submitter != caller) {
          Runtime.trap("Unauthorized: You can only edit your own submissions");
        };
        if (not canEditSubmission(existing)) {
          Runtime.trap("This submission cannot be edited in its current state");
        };
        let updated : SongSubmission = {
          id = existing.id;
          title = input.title;
          releaseType = input.releaseType;
          genre = input.genre;
          language = input.language;
          releaseDate = input.releaseDate;
          artwork = input.artworkBlob;
          artworkFilename = input.artworkFilename;
          artist = input.artist;
          featuredArtist = input.featuredArtist;
          composer = input.composer;
          producer = input.producer;
          lyricist = input.lyricist;
          audioFile = input.audioFile;
          audioFilename = input.audioFilename;
          additionalDetails = input.additionalDetails;
          status = existing.status;
          adminRemarks = existing.adminRemarks;
          adminComment = existing.adminComment;
          submitter = existing.submitter;
          timestamp = existing.timestamp;
          discountCode = input.discountCode;
          acrResult = existing.acrResult;
          preSaveLink = existing.preSaveLink;
          liveStreamLink = existing.liveStreamLink;
          musicVideoLink = input.musicVideoLink;
          albumTracks = input.albumTracks;
          publicLink = existing.publicLink;
          adminLiveLink = existing.adminLiveLink;
          isManuallyRejected = existing.isManuallyRejected;
          spotifyLink = input.spotifyLink;
          appleMusicLink = input.appleMusicLink;
          customCLine = existing.customCLine;
          customPLine = existing.customPLine;
          premiumLabel = existing.premiumLabel;
          contentType = existing.contentType;
          sunoTrackLink = existing.sunoTrackLink;
          sunoAgreementFile = existing.sunoAgreementFile;
          sunoAgreementFilename = existing.sunoAgreementFilename;
          licenceFile = existing.licenceFile;
          licenceFilename = existing.licenceFilename;
          contentId = existing.contentId;
          callerTuneStartSecond = existing.callerTuneStartSecond;
        };
        submissionsV2.add(input.songSubmissionId, updated);
      };
    };
  };

  public shared ({ caller }) func adminUpdateSubmission(
    id : Text,
    newStatus : SongStatus,
    adminRemarks : Text,
    adminComment : Text
  ) : async () {
    requireAdminOrTeam(caller);
    switch (submissionsV2.get(id)) {
      case (null) { Runtime.trap("Submission not found") };
      case (?existing) {
        let isRejected = switch (newStatus) { case (#rejected) { true }; case (_) { false } };
        let updated : SongSubmission = {
          id = existing.id;
          title = existing.title;
          releaseType = existing.releaseType;
          genre = existing.genre;
          language = existing.language;
          releaseDate = existing.releaseDate;
          artwork = existing.artwork;
          artworkFilename = existing.artworkFilename;
          artist = existing.artist;
          featuredArtist = existing.featuredArtist;
          composer = existing.composer;
          producer = existing.producer;
          lyricist = existing.lyricist;
          audioFile = existing.audioFile;
          audioFilename = existing.audioFilename;
          additionalDetails = existing.additionalDetails;
          status = newStatus;
          adminRemarks;
          adminComment;
          submitter = existing.submitter;
          timestamp = existing.timestamp;
          discountCode = existing.discountCode;
          acrResult = existing.acrResult;
          preSaveLink = existing.preSaveLink;
          liveStreamLink = existing.liveStreamLink;
          musicVideoLink = existing.musicVideoLink;
          albumTracks = existing.albumTracks;
          publicLink = existing.publicLink;
          adminLiveLink = existing.adminLiveLink;
          isManuallyRejected = isRejected;
          spotifyLink = existing.spotifyLink;
          appleMusicLink = existing.appleMusicLink;
          customCLine = existing.customCLine;
          customPLine = existing.customPLine;
          premiumLabel = existing.premiumLabel;
          contentType = existing.contentType;
          sunoTrackLink = existing.sunoTrackLink;
          sunoAgreementFile = existing.sunoAgreementFile;
          sunoAgreementFilename = existing.sunoAgreementFilename;
          licenceFile = existing.licenceFile;
          licenceFilename = existing.licenceFilename;
          contentId = existing.contentId;
          callerTuneStartSecond = existing.callerTuneStartSecond;
        };
        submissionsV2.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func adminSetSubmissionLive(
    id : Text,
    liveUrl : Text,
    adminRemarks : Text,
    adminComment : Text
  ) : async () {
    requireAdminOrTeam(caller);
    switch (submissionsV2.get(id)) {
      case (null) { Runtime.trap("Submission not found") };
      case (?existing) {
        let updated : SongSubmission = {
          id = existing.id;
          title = existing.title;
          releaseType = existing.releaseType;
          genre = existing.genre;
          language = existing.language;
          releaseDate = existing.releaseDate;
          artwork = existing.artwork;
          artworkFilename = existing.artworkFilename;
          artist = existing.artist;
          featuredArtist = existing.featuredArtist;
          composer = existing.composer;
          producer = existing.producer;
          lyricist = existing.lyricist;
          audioFile = existing.audioFile;
          audioFilename = existing.audioFilename;
          additionalDetails = existing.additionalDetails;
          status = #live;
          adminRemarks;
          adminComment;
          submitter = existing.submitter;
          timestamp = existing.timestamp;
          discountCode = existing.discountCode;
          acrResult = existing.acrResult;
          preSaveLink = existing.preSaveLink;
          liveStreamLink = existing.liveStreamLink;
          musicVideoLink = existing.musicVideoLink;
          albumTracks = existing.albumTracks;
          publicLink = existing.publicLink;
          adminLiveLink = ?liveUrl;
          isManuallyRejected = false;
          spotifyLink = existing.spotifyLink;
          appleMusicLink = existing.appleMusicLink;
          customCLine = existing.customCLine;
          customPLine = existing.customPLine;
          premiumLabel = existing.premiumLabel;
          contentType = existing.contentType;
          sunoTrackLink = existing.sunoTrackLink;
          sunoAgreementFile = existing.sunoAgreementFile;
          sunoAgreementFilename = existing.sunoAgreementFilename;
          licenceFile = existing.licenceFile;
          licenceFilename = existing.licenceFilename;
          contentId = existing.contentId;
          callerTuneStartSecond = existing.callerTuneStartSecond;
        };
        submissionsV2.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func adminEditSubmission(input : SongSubmissionEditInput) : async () {
    requireAdminOrTeam(caller);
    switch (submissionsV2.get(input.songSubmissionId)) {
      case (null) { Runtime.trap("Submission not found") };
      case (?existing) {
        let updated : SongSubmission = {
          id = existing.id;
          title = input.title;
          releaseType = input.releaseType;
          genre = input.genre;
          language = input.language;
          releaseDate = input.releaseDate;
          artwork = input.artworkBlob;
          artworkFilename = input.artworkFilename;
          artist = input.artist;
          featuredArtist = input.featuredArtist;
          composer = input.composer;
          producer = input.producer;
          lyricist = input.lyricist;
          audioFile = input.audioFile;
          audioFilename = input.audioFilename;
          additionalDetails = input.additionalDetails;
          status = existing.status;
          adminRemarks = existing.adminRemarks;
          adminComment = existing.adminComment;
          submitter = existing.submitter;
          timestamp = existing.timestamp;
          discountCode = input.discountCode;
          acrResult = existing.acrResult;
          preSaveLink = existing.preSaveLink;
          liveStreamLink = existing.liveStreamLink;
          musicVideoLink = input.musicVideoLink;
          albumTracks = input.albumTracks;
          publicLink = existing.publicLink;
          adminLiveLink = existing.adminLiveLink;
          isManuallyRejected = existing.isManuallyRejected;
          spotifyLink = input.spotifyLink;
          appleMusicLink = input.appleMusicLink;
          customCLine = existing.customCLine;
          customPLine = existing.customPLine;
          premiumLabel = existing.premiumLabel;
          contentType = existing.contentType;
          sunoTrackLink = existing.sunoTrackLink;
          sunoAgreementFile = existing.sunoAgreementFile;
          sunoAgreementFilename = existing.sunoAgreementFilename;
          licenceFile = existing.licenceFile;
          licenceFilename = existing.licenceFilename;
          contentId = existing.contentId;
          callerTuneStartSecond = existing.callerTuneStartSecond;
        };
        submissionsV2.add(input.songSubmissionId, updated);
      };
    };
  };

  public shared ({ caller }) func adminDeleteSubmission(id : Text) : async () {
    requireAdminOrTeam(caller);
    if (not submissionsV2.containsKey(id)) {
      Runtime.trap("Submission not found");
    };
    submissionsV2.remove(id);
  };

  public shared ({ caller }) func adminUpdateSongStats(songId : Text, monthlyListeners : ?Float, revenue : ?Float) : async () {
    requireAdminOrTeam(caller);
    if (not submissionsV2.containsKey(songId)) {
      Runtime.trap("Submission not found");
    };
    switch (monthlyListeners) {
      case (null) {};
      case (?v) { songMonthlyListeners.add(songId, v) };
    };
    switch (revenue) {
      case (null) {};
      case (?v) { songRevenues.add(songId, v) };
    };
  };

  public query func getSongMonthlyListeners(songId : Text) : async Float {
    switch (songMonthlyListeners.get(songId)) {
      case (null) { 0.0 };
      case (?v) { v };
    };
  };

  public type SongSubmissionAdmin = {
    id : Text;
    title : Text;
    releaseType : Text;
    genre : Text;
    language : Text;
    releaseDate : Time.Time;
    artwork : Storage.ExternalBlob;
    artworkFilename : Text;
    artist : Text;
    featuredArtist : Text;
    composer : Text;
    producer : Text;
    lyricist : Text;
    audioFile : Storage.ExternalBlob;
    audioFilename : Text;
    additionalDetails : Text;
    status : SongStatus;
    adminRemarks : Text;
    adminComment : Text;
    submitter : Principal;
    timestamp : Time.Time;
    discountCode : ?Text;
    acrResult : ?ACRResult;
    preSaveLink : ?Text;
    liveStreamLink : ?Text;
    musicVideoLink : ?Text;
    albumTracks : ?[TrackMetadata];
    publicLink : ?Text;
    adminLiveLink : ?Text;
    isManuallyRejected : Bool;
    spotifyLink : ?Text;
    appleMusicLink : ?Text;
    monthlyListeners : ?Float;
    revenue : ?Float;
    // Premium fields
    customCLine : ?Text;
    customPLine : ?Text;
    premiumLabel : ?Text;
    contentType : ?Text;
    sunoTrackLink : ?Text;
    sunoAgreementFile : ?Storage.ExternalBlob;
    sunoAgreementFilename : ?Text;
    licenceFile : ?Storage.ExternalBlob;
    licenceFilename : ?Text;
    contentId : ?Bool;
    callerTuneStartSecond : ?Float;
  };

  public query ({ caller }) func getAllSubmissionsWithStatsForAdmin() : async [SongSubmissionAdmin] {
    requireAdminOrTeam(caller);
    submissionsV2.values().toArray().map(func (s : SongSubmission) : SongSubmissionAdmin {
      {
        id = s.id;
        title = s.title;
        releaseType = s.releaseType;
        genre = s.genre;
        language = s.language;
        releaseDate = s.releaseDate;
        artwork = s.artwork;
        artworkFilename = s.artworkFilename;
        artist = s.artist;
        featuredArtist = s.featuredArtist;
        composer = s.composer;
        producer = s.producer;
        lyricist = s.lyricist;
        audioFile = s.audioFile;
        audioFilename = s.audioFilename;
        additionalDetails = s.additionalDetails;
        status = s.status;
        adminRemarks = s.adminRemarks;
        adminComment = s.adminComment;
        submitter = s.submitter;
        timestamp = s.timestamp;
        discountCode = s.discountCode;
        acrResult = s.acrResult;
        preSaveLink = s.preSaveLink;
        liveStreamLink = s.liveStreamLink;
        musicVideoLink = s.musicVideoLink;
        albumTracks = s.albumTracks;
        publicLink = s.publicLink;
        adminLiveLink = s.adminLiveLink;
        isManuallyRejected = s.isManuallyRejected;
        spotifyLink = s.spotifyLink;
        appleMusicLink = s.appleMusicLink;
        monthlyListeners = songMonthlyListeners.get(s.id);
        revenue = songRevenues.get(s.id);
        customCLine = s.customCLine;
        customPLine = s.customPLine;
        premiumLabel = s.premiumLabel;
        contentType = s.contentType;
        sunoTrackLink = s.sunoTrackLink;
        sunoAgreementFile = s.sunoAgreementFile;
        sunoAgreementFilename = s.sunoAgreementFilename;
        licenceFile = s.licenceFile;
        licenceFilename = s.licenceFilename;
        contentId = s.contentId;
        callerTuneStartSecond = s.callerTuneStartSecond;
      }
    });
  };

  public query ({ caller }) func getMySubmissions() : async [SongSubmission] {
    submissionsV2.values().toArray().filter(
      func(s : SongSubmission) : Bool { s.submitter == caller }
    );
  };

  public query ({ caller }) func getAllSubmissionsForAdmin() : async [SongSubmission] {
    requireAdminOrTeam(caller);
    submissionsV2.values().toArray();
  };

  public query ({ caller }) func getLiveSongsForAdmin() : async [SongSubmission] {
    requireAdminOrTeam(caller);
    submissionsV2.values().filter(func(s : SongSubmission) : Bool { s.status == #live }).toArray();
  };


  public query func getSongInfo(songId : Text) : async ?PublicSongInfo {
    switch (submissionsV2.get(songId)) {
      case (null) { null };
      case (?s) {
        if (s.status == #live) {
          ?{
            id = s.id;
            title = s.title;
            artist = s.artist;
            featuredArtist = s.featuredArtist;
            artwork = s.artwork;
            spotifyLink = s.spotifyLink;
            appleMusicLink = s.appleMusicLink;
            releaseDate = s.releaseDate;
            genre = s.genre;
            language = s.language;
            musicVideoLink = s.musicVideoLink;
          };
        } else { null };
      };
    };
  };

  public query func isUserBlockedSongSubmission(user : Principal) : async Bool {
    isBlockedForSongs(user);
  };

  public query func isUserBlockedPodcastSubmission(user : Principal) : async Bool {
    isBlockedForPodcasts(user);
  };

  // ── User Profile ───────────────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  public query func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public query ({ caller }) func getUsersByCategory(category : UserCategory) : async [Principal] {
    requireAdminOrTeam(caller);
    userProfiles.entries().toArray().filter(
      func(entry : (Principal, UserProfile)) : Bool { entry.1.category == category }
    ).map(func(entry : (Principal, UserProfile)) : Principal { entry.0 });
  };

  public shared ({ caller }) func updateUserCategory(user : Principal, category : UserCategory) : async () {
    requireAdmin(caller);
    switch (userProfiles.get(user)) {
      case (null) {
        let profile : UserProfile = { name = ""; artistId = ""; category };
        userProfiles.add(user, profile);
      };
      case (?existing) {
        let updated : UserProfile = { name = existing.name; artistId = existing.artistId; category };
        userProfiles.add(user, updated);
      };
    };
  };

  // ── Admin User Management ──────────────────────────────────────────────────


  // Bootstrap: canister controller can always reclaim admin role, even after accidental demotion
  public shared ({ caller }) func bootstrapAdmin() : async () {
    // No admin check required -- allows the deployer to reclaim admin if all admins were revoked
    accessControlState.userRoles.add(caller, #admin);
  };

  public shared ({ caller }) func promoteToAdmin(user : Principal) : async () {
    requireAdmin(caller);
    AccessControl.assignRole(accessControlState, caller, user, #admin);
  };

  public shared ({ caller }) func demoteFromAdmin(user : Principal) : async () {
    requireAdmin(caller);
    AccessControl.assignRole(accessControlState, caller, user, #user);
  };

  public query ({ caller }) func listAdmins() : async [Principal] {
    requireAdmin(caller);
    accessControlState.userRoles.entries().toArray().filter(func(e : (Principal, AccessControl.UserRole)) : Bool { e.1 == #admin }).map(func(e : (Principal, AccessControl.UserRole)) : Principal { e.0 });
  };

  public shared ({ caller }) func blockUserSongSubmission(user : Principal) : async () {
    requireAdmin(caller);
    switch (blockedUsers.get(user)) {
      case (null) {
        blockedUsers.add(user, { songSubmissionBlocked = true; podcastSubmissionBlocked = false });
      };
      case (?existing) {
        blockedUsers.add(user, { songSubmissionBlocked = true; podcastSubmissionBlocked = existing.podcastSubmissionBlocked });
      };
    };
  };

  public shared ({ caller }) func unblockUserSongSubmission(user : Principal) : async () {
    requireAdmin(caller);
    switch (blockedUsers.get(user)) {
      case (null) { };
      case (?existing) {
        blockedUsers.add(user, { songSubmissionBlocked = false; podcastSubmissionBlocked = existing.podcastSubmissionBlocked });
      };
    };
  };

  public shared ({ caller }) func blockUserPodcastSubmission(user : Principal) : async () {
    requireAdmin(caller);
    switch (blockedUsers.get(user)) {
      case (null) {
        blockedUsers.add(user, { songSubmissionBlocked = false; podcastSubmissionBlocked = true });
      };
      case (?existing) {
        blockedUsers.add(user, { songSubmissionBlocked = existing.songSubmissionBlocked; podcastSubmissionBlocked = true });
      };
    };
  };

  public shared ({ caller }) func unblockUserPodcastSubmission(user : Principal) : async () {
    requireAdmin(caller);
    switch (blockedUsers.get(user)) {
      case (null) { };
      case (?existing) {
        blockedUsers.add(user, { songSubmissionBlocked = existing.songSubmissionBlocked; podcastSubmissionBlocked = false });
      };
    };
  };

  public query ({ caller }) func getAllBlockedUsersAdmin() : async [Principal] {
    requireAdmin(caller);
    blockedUsers.keys().toArray();
  };

  public shared ({ caller }) func upgradeUserToTeamMember(user : Principal) : async () {
    requireAdmin(caller);
    teamMembers.add(user, true);
  };

  public shared ({ caller }) func downgradeTeamMember(user : Principal) : async () {
    requireAdmin(caller);
    teamMembers.remove(user);
  };

  public query func isUserTeamMember(user : Principal) : async Bool {
    isTeamMember(user);
  };

  public query ({ caller }) func getAllTeamMembers() : async [Principal] {
    requireAdmin(caller);
    teamMembers.keys().toArray();
  };

  // ── Premium Role (Verified Status) ────────────────────────────────────────

  public shared ({ caller }) func grantPremiumRole(user : Principal) : async () {
    requireAdmin(caller);
    // Add to dedicated premium users map
    premiumUsers.add(user, true);
    // Also update isVerified on artist profiles (backward compat)
    let userProfilesList = artistProfiles.values().toArray().filter(
      func(p : ArtistProfile) : Bool { p.owner == user }
    );
    for (profile in userProfilesList.vals()) {
      let updated : ArtistProfile = {
        id = profile.id;
        owner = profile.owner;
        fullName = profile.fullName;
        stageName = profile.stageName;
        email = profile.email;
        mobileNumber = profile.mobileNumber;
        instagramLink = profile.instagramLink;
        facebookLink = profile.facebookLink;
        spotifyProfile = profile.spotifyProfile;
        appleProfile = profile.appleProfile;
        youtubeChannelLink = profile.youtubeChannelLink;
        profilePhoto = profile.profilePhoto;
        profilePhotoFilename = profile.profilePhotoFilename;
        isApproved = profile.isApproved;
        isVerified = true;
      };
      artistProfiles.add(profile.id, updated);
    };
  };

  public shared ({ caller }) func revokePremiumRole(user : Principal) : async () {
    requireAdmin(caller);
    // Remove from dedicated premium users map
    premiumUsers.remove(user);
    // Also update isVerified on artist profiles (backward compat)
    let userProfilesList = artistProfiles.values().toArray().filter(
      func(p : ArtistProfile) : Bool { p.owner == user }
    );
    for (profile in userProfilesList.vals()) {
      let updated : ArtistProfile = {
        id = profile.id;
        owner = profile.owner;
        fullName = profile.fullName;
        stageName = profile.stageName;
        email = profile.email;
        mobileNumber = profile.mobileNumber;
        instagramLink = profile.instagramLink;
        facebookLink = profile.facebookLink;
        spotifyProfile = profile.spotifyProfile;
        appleProfile = profile.appleProfile;
        youtubeChannelLink = profile.youtubeChannelLink;
        profilePhoto = profile.profilePhoto;
        profilePhotoFilename = profile.profilePhotoFilename;
        isApproved = profile.isApproved;
        isVerified = false;
      };
      artistProfiles.add(profile.id, updated);
    };
  };

  public query ({ caller }) func isCallerPremium() : async Bool {
    switch (premiumUsers.get(caller)) {
      case (null) { false };
      case (?v) { v };
    };
  };

  public query ({ caller }) func getAllPremiumUsers() : async [Principal] {
    requireAdmin(caller);
    premiumUsers.keys().toArray();
  };

  public query ({ caller }) func getAllRegisteredUsersForAdmin() : async [AdminUserView] {
    requireAdmin(caller);
    // Collect all unique principals from artistProfiles, adminRoles, teamMembers, and blockedUsers
    let allPrincipals = Map.empty<Principal, Bool>();
    for (profile in artistProfiles.values().toArray().vals()) {
      allPrincipals.add(profile.owner, true);
    };
    for ((p, _) in accessControlState.userRoles.entries().toArray().vals()) {
      allPrincipals.add(p, true);
    };
    for ((p, _) in teamMembers.entries().toArray().vals()) {
      allPrincipals.add(p, true);
    };
    for ((p, _) in blockedUsers.entries().toArray().vals()) {
      allPrincipals.add(p, true);
    };

    allPrincipals.keys().toArray().map(func(principal : Principal) : AdminUserView {
      // Get display name from first artist profile
      let profiles = artistProfiles.values().toArray().filter(
        func(p : ArtistProfile) : Bool { p.owner == principal }
      );
      let displayName = if (profiles.size() > 0) { profiles[0].fullName } else { "" };
      let isVerifiedStatus = if (profiles.size() > 0) { profiles[0].isVerified } else { false };

      // Get blocked status
      let blockStatus = switch (blockedUsers.get(principal)) {
        case (null) { { songSubmissionBlocked = false; podcastSubmissionBlocked = false } };
        case (?b) { b };
      };

      {
        principal = principal;
        displayName = displayName;
        isAdmin = AccessControl.isAdmin(accessControlState, principal);
        isTeamMember = isTeamMember(principal);
        isVerified = isVerifiedStatus;
        isSongBlocked = blockStatus.songSubmissionBlocked;
        isPodcastBlocked = blockStatus.podcastSubmissionBlocked;
      };
    });
  };


  // ── Website Branding ───────────────────────────────────────────────────────

  public query func getWebsiteLogo() : async ?Storage.ExternalBlob {
    websiteLogo;
  };

  public shared ({ caller }) func setWebsiteLogo(logo : Storage.ExternalBlob) : async () {
    requireAdmin(caller);
    websiteLogo := ?logo;
  };

  public shared ({ caller }) func removeWebsiteLogo() : async () {
    requireAdmin(caller);
    websiteLogo := null;
  };

  // ── Announcement ───────────────────────────────────────────────────────────

  public query func getAnnouncement() : async Text {
    globalAnnouncement;
  };

  public shared ({ caller }) func setAnnouncement(text : Text) : async () {
    requireAdmin(caller);
    globalAnnouncement := text;
  };

  // ── Verification System ────────────────────────────────────────────────────

  public shared ({ caller }) func applyForVerification() : async Text {
    requireUser(caller);
    let blob = await Random.blob();
    let id = InviteLinksModule.generateUUID(blob);
    let request : VerificationRequest = {
      id;
      user = caller;
      status = #pending;
      timestamp = Time.now();
      verificationApprovedTimestamp = null;
      expiryExtensionDays = 0;
    };
    verificationRequests.add(id, request);
    id;
  };

  public query ({ caller }) func getVerificationRequests() : async [VerificationRequest] {
    requireAdminOrTeam(caller);
    verificationRequests.values().toArray();
  };

  public query func getVerificationRequestsByUser(user : Principal) : async [VerificationRequest] {
    verificationRequests.values().toArray().filter(
      func(r : VerificationRequest) : Bool { r.user == user }
    );
  };

  public shared ({ caller }) func handleVerificationRequest(
    id : Text,
    isApproved : Bool,
    remarks : Text,
    newStatus : VerificationStatus
  ) : async () {
    requireAdmin(caller);
    switch (verificationRequests.get(id)) {
      case (null) { Runtime.trap("Verification request not found") };
      case (?existing) {
        let approvedTimestamp = if (isApproved) { ?Time.now() } else { existing.verificationApprovedTimestamp };
        let updated : VerificationRequest = {
          id = existing.id;
          user = existing.user;
          status = newStatus;
          timestamp = existing.timestamp;
          verificationApprovedTimestamp = approvedTimestamp;
          expiryExtensionDays = existing.expiryExtensionDays;
        };
        verificationRequests.add(id, updated);
        if (isApproved) {
          // Mark all artist profiles as verified
          let profiles = artistProfiles.values().toArray().filter(
            func(p : ArtistProfile) : Bool { p.owner == existing.user }
          );
          for (profile in profiles.values()) {
            let updatedProfile : ArtistProfile = {
              id = profile.id;
              owner = profile.owner;
              fullName = profile.fullName;
              stageName = profile.stageName;
              email = profile.email;
              mobileNumber = profile.mobileNumber;
              instagramLink = profile.instagramLink;
              facebookLink = profile.facebookLink;
              spotifyProfile = profile.spotifyProfile;
              appleProfile = profile.appleProfile;
              youtubeChannelLink = profile.youtubeChannelLink;
              profilePhoto = profile.profilePhoto;
              profilePhotoFilename = profile.profilePhotoFilename;
              isApproved = profile.isApproved;
              isVerified = true;
            };
            artistProfiles.add(profile.id, updatedProfile);
          };
        };
      };
    };
  };

  public shared ({ caller }) func updateVerificationStatus(
    id : Text,
    newStatus : VerificationStatus,
    extensionDays : Nat
  ) : async () {
    requireAdmin(caller);
    switch (verificationRequests.get(id)) {
      case (null) { Runtime.trap("Verification request not found") };
      case (?existing) {
        let updated : VerificationRequest = {
          id = existing.id;
          user = existing.user;
          status = newStatus;
          timestamp = existing.timestamp;
          verificationApprovedTimestamp = existing.verificationApprovedTimestamp;
          expiryExtensionDays = extensionDays;
        };
        verificationRequests.add(id, updated);
      };
    };
  };

  public query func isArtistVerified(user : Principal) : async Bool {
    let profiles = artistProfiles.values().toArray().filter(
      func(p : ArtistProfile) : Bool { p.owner == user }
    );
    if (profiles.size() > 0) { profiles[0].isVerified } else { false };
  };

  // ── Podcast System ─────────────────────────────────────────────────────────

  public shared ({ caller }) func createPodcastShow(input : PodcastShowInput) : async Text {
    requireUser(caller);
    let blob = await Random.blob();
    let id = InviteLinksModule.generateUUID(blob);
    let show : PodcastShow = {
      id;
      title = input.title;
      description = input.description;
      podcastType = input.podcastType;
      category = input.category;
      language = input.language;
      artwork = input.artwork;
      createdBy = caller;
      timestamp = Time.now();
      moderationStatus = #pending;
      liveLink = null;
    };
    podcasts.add(id, show);
    id;
  };

  public query ({ caller }) func getMyPodcastShows() : async [PodcastShow] {
    requireUser(caller);
    podcasts.values().toArray().filter(
      func(p : PodcastShow) : Bool { p.createdBy == caller }
    );
  };

  public query ({ caller }) func getAllPodcasts() : async [PodcastShow] {
    requireAdminOrTeam(caller);
    podcasts.values().toArray();
  };

  public query ({ caller }) func getAllPendingPodcasts() : async [PodcastShow] {
    requireAdminOrTeam(caller);
    podcasts.values().toArray().filter(
      func(p : PodcastShow) : Bool { p.moderationStatus == #pending }
    );
  };

  public query func getPodcastsByCategory(category : PodcastCategory) : async [PodcastShow] {
    podcasts.values().toArray().filter(
      func(p : PodcastShow) : Bool { p.category == category and p.moderationStatus == #live }
    );
  };

  public shared ({ caller }) func approvePodcast(id : Text) : async () {
    requireAdminOrTeam(caller);
    switch (podcasts.get(id)) {
      case (null) { Runtime.trap("Podcast not found") };
      case (?existing) {
        let updated : PodcastShow = {
          id = existing.id; title = existing.title; description = existing.description;
          podcastType = existing.podcastType; category = existing.category; language = existing.language;
          artwork = existing.artwork; createdBy = existing.createdBy; timestamp = existing.timestamp;
          moderationStatus = #approved; liveLink = existing.liveLink;
        };
        podcasts.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func rejectPodcast(id : Text) : async () {
    requireAdminOrTeam(caller);
    switch (podcasts.get(id)) {
      case (null) { Runtime.trap("Podcast not found") };
      case (?existing) {
        let updated : PodcastShow = {
          id = existing.id; title = existing.title; description = existing.description;
          podcastType = existing.podcastType; category = existing.category; language = existing.language;
          artwork = existing.artwork; createdBy = existing.createdBy; timestamp = existing.timestamp;
          moderationStatus = #rejected; liveLink = existing.liveLink;
        };
        podcasts.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func markPodcastLive(id : Text, liveLink : Text) : async () {
    requireAdminOrTeam(caller);
    switch (podcasts.get(id)) {
      case (null) { Runtime.trap("Podcast not found") };
      case (?existing) {
        let updated : PodcastShow = {
          id = existing.id; title = existing.title; description = existing.description;
          podcastType = existing.podcastType; category = existing.category; language = existing.language;
          artwork = existing.artwork; createdBy = existing.createdBy; timestamp = existing.timestamp;
          moderationStatus = #live; liveLink = ?liveLink;
        };
        podcasts.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func createPodcastEpisode(input : PodcastEpisodeInput) : async Text {
    requireUser(caller);
    let blob = await Random.blob();
    let id = InviteLinksModule.generateUUID(blob);
    let episode : PodcastEpisode = {
      id;
      showId = input.showId;
      title = input.title;
      description = input.description;
      seasonNumber = input.seasonNumber;
      episodeNumber = input.episodeNumber;
      episodeType = input.episodeType;
      isEighteenPlus = input.isEighteenPlus;
      isExplicit = input.isExplicit;
      isPromotional = input.isPromotional;
      artwork = input.artwork;
      thumbnail = input.thumbnail;
      mediaFile = input.mediaFile;
      createdBy = caller;
      timestamp = Time.now();
      moderationStatus = #pending;
    };
    podcastEpisodes.add(id, episode);
    id;
  };

  public query ({ caller }) func getMyEpisodes(showId : Text) : async [PodcastEpisode] {
    requireUser(caller);
    podcastEpisodes.values().toArray().filter(
      func(e : PodcastEpisode) : Bool { e.showId == showId and e.createdBy == caller }
    );
  };

  public query func getEpisodesByShowId(showId : Text) : async [PodcastEpisode] {
    podcastEpisodes.values().toArray().filter(
      func(e : PodcastEpisode) : Bool { e.showId == showId }
    );
  };

  public query ({ caller }) func getAllEpisodes() : async [PodcastEpisode] {
    requireAdminOrTeam(caller);
    podcastEpisodes.values().toArray();
  };

  public query ({ caller }) func getAllPendingEpisodes() : async [PodcastEpisode] {
    requireAdminOrTeam(caller);
    podcastEpisodes.values().toArray().filter(
      func(e : PodcastEpisode) : Bool { e.moderationStatus == #pending }
    );
  };

  public shared ({ caller }) func approveEpisode(id : Text) : async () {
    requireAdminOrTeam(caller);
    switch (podcastEpisodes.get(id)) {
      case (null) { Runtime.trap("Episode not found") };
      case (?existing) {
        let updated : PodcastEpisode = {
          id = existing.id; showId = existing.showId; title = existing.title;
          description = existing.description; seasonNumber = existing.seasonNumber;
          episodeNumber = existing.episodeNumber; episodeType = existing.episodeType;
          isEighteenPlus = existing.isEighteenPlus; isExplicit = existing.isExplicit;
          isPromotional = existing.isPromotional; artwork = existing.artwork;
          thumbnail = existing.thumbnail; mediaFile = existing.mediaFile;
          createdBy = existing.createdBy; timestamp = existing.timestamp;
          moderationStatus = #approved;
        };
        podcastEpisodes.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func rejectEpisode(id : Text) : async () {
    requireAdminOrTeam(caller);
    switch (podcastEpisodes.get(id)) {
      case (null) { Runtime.trap("Episode not found") };
      case (?existing) {
        let updated : PodcastEpisode = {
          id = existing.id; showId = existing.showId; title = existing.title;
          description = existing.description; seasonNumber = existing.seasonNumber;
          episodeNumber = existing.episodeNumber; episodeType = existing.episodeType;
          isEighteenPlus = existing.isEighteenPlus; isExplicit = existing.isExplicit;
          isPromotional = existing.isPromotional; artwork = existing.artwork;
          thumbnail = existing.thumbnail; mediaFile = existing.mediaFile;
          createdBy = existing.createdBy; timestamp = existing.timestamp;
          moderationStatus = #rejected;
        };
        podcastEpisodes.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func markEpisodeLive(id : Text) : async () {
    requireAdminOrTeam(caller);
    switch (podcastEpisodes.get(id)) {
      case (null) { Runtime.trap("Episode not found") };
      case (?existing) {
        let updated : PodcastEpisode = {
          id = existing.id; showId = existing.showId; title = existing.title;
          description = existing.description; seasonNumber = existing.seasonNumber;
          episodeNumber = existing.episodeNumber; episodeType = existing.episodeType;
          isEighteenPlus = existing.isEighteenPlus; isExplicit = existing.isExplicit;
          isPromotional = existing.isPromotional; artwork = existing.artwork;
          thumbnail = existing.thumbnail; mediaFile = existing.mediaFile;
          createdBy = existing.createdBy; timestamp = existing.timestamp;
          moderationStatus = #live;
        };
        podcastEpisodes.add(id, updated);
      };
    };
  };

  // ── Video Submission ───────────────────────────────────────────────────────

  public shared ({ caller }) func submitVideo(input : VideoSubmissionInput) : async Text {
    requireUser(caller);
    let blob = await Random.blob();
    let id = InviteLinksModule.generateUUID(blob);
    let video : VideoSubmission = {
      id;
      userId = caller;
      title = input.title;
      description = input.description;
      category = input.category;
      tags = input.tags;
      thumbnail = input.thumbnail;
      artwork = input.artwork;
      videoFile = input.videoFile;
      status = #pending;
      liveUrl = null;
      submittedAt = Time.now();
      updatedAt = Time.now();
    };
    videoSubmissions.add(id, video);
    id;
  };

  public query ({ caller }) func getUserVideoSubmissions() : async [VideoSubmission] {
    requireUser(caller);
    videoSubmissions.values().toArray().filter(
      func(v : VideoSubmission) : Bool { v.userId == caller }
    );
  };

  public query ({ caller }) func getAllVideoSubmissions() : async [VideoSubmission] {
    requireAdminOrTeam(caller);
    videoSubmissions.values().toArray();
  };

  public shared ({ caller }) func updateVideoSubmission(id : Text, input : VideoSubmissionInput) : async () {
    requireUser(caller);
    switch (videoSubmissions.get(id)) {
      case (null) { Runtime.trap("Video submission not found") };
      case (?existing) {
        if (existing.userId != caller) { Runtime.trap("Unauthorized") };
        let updated : VideoSubmission = {
          id = existing.id; userId = existing.userId;
          title = input.title; description = input.description;
          category = input.category; tags = input.tags;
          thumbnail = input.thumbnail; artwork = input.artwork;
          videoFile = input.videoFile; status = existing.status;
          liveUrl = existing.liveUrl; submittedAt = existing.submittedAt;
          updatedAt = Time.now();
        };
        videoSubmissions.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func updateVideoStatus(id : Text, status : VideoSubmissionStatus, liveUrl : ?Text) : async () {
    requireAdminOrTeam(caller);
    switch (videoSubmissions.get(id)) {
      case (null) { Runtime.trap("Video submission not found") };
      case (?existing) {
        let updated : VideoSubmission = {
          id = existing.id; userId = existing.userId;
          title = existing.title; description = existing.description;
          category = existing.category; tags = existing.tags;
          thumbnail = existing.thumbnail; artwork = existing.artwork;
          videoFile = existing.videoFile; status;
          liveUrl; submittedAt = existing.submittedAt;
          updatedAt = Time.now();
        };
        videoSubmissions.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteVideoSubmission(id : Text) : async () {
    requireUser(caller);
    switch (videoSubmissions.get(id)) {
      case (null) { Runtime.trap("Video submission not found") };
      case (?existing) {
        if (existing.userId != caller and not isAdminOrTeam(caller)) {
          Runtime.trap("Unauthorized");
        };
        videoSubmissions.remove(id);
      };
    };
  };

  public query func downloadVideoFile(id : Text) : async ?Storage.ExternalBlob {
    switch (videoSubmissions.get(id)) {
      case (null) { null };
      case (?v) { ?v.videoFile };
    };
  };

  // ── Featured Artists ───────────────────────────────────────────────────────

  public shared ({ caller }) func setFeaturedArtist(slotIndex : Nat, input : FeaturedArtistInput) : async () {
    requireAdmin(caller);
    let artist : FeaturedArtist = {
      id = slotIndex;
      slotIndex;
      artistName = input.artistName;
      photoUrl = input.photoUrl;
      aboutBlurb = input.aboutBlurb;
      songs = input.songs;
      isActive = input.isActive;
    };
    featuredArtists.add(slotIndex, artist);
  };

  public shared ({ caller }) func toggleFeaturedArtistSlot(slotIndex : Nat, isActive : Bool) : async () {
    requireAdmin(caller);
    switch (featuredArtists.get(slotIndex)) {
      case (null) { };
      case (?existing) {
        let updated : FeaturedArtist = {
          id = existing.id;
          slotIndex = existing.slotIndex;
          artistName = existing.artistName;
          photoUrl = existing.photoUrl;
          aboutBlurb = existing.aboutBlurb;
          songs = existing.songs;
          isActive;
        };
        featuredArtists.add(slotIndex, updated);
      };
    };
  };

  public query func getActiveFeaturedArtists() : async [FeaturedArtist] {
    featuredArtists.values().toArray().filter(
      func(a : FeaturedArtist) : Bool { a.isActive }
    );
  };

  public query ({ caller }) func getFeaturedArtists() : async [FeaturedArtist] {
    requireAdmin(caller);
    featuredArtists.values().toArray();
  };

  // ── Top Vibing Songs ───────────────────────────────────────────────────────

  public shared ({ caller }) func addTopVibingSong(song : TopVibingSong) : async Nat {
    requireAdmin(caller);
    let id = topVibingSongsSize + 1;
    let newSong : TopVibingSong = {
      id;
      title = song.title;
      artistName = song.artistName;
      genre = song.genre;
      artworkUrl = song.artworkUrl;
      streamingLink = song.streamingLink;
      tagline = song.tagline;
      rank = id;
    };
    topVibingSongs.add(id, newSong);
    topVibingSongsSize += 1;
    id;
  };

  public shared ({ caller }) func updateTopVibingSong(song : TopVibingSong) : async () {
    requireAdmin(caller);
    if (not topVibingSongs.containsKey(song.id)) {
      Runtime.trap("Top vibing song not found");
    };
    topVibingSongs.add(song.id, song);
  };

  public shared ({ caller }) func deleteTopVibingSong(id : Nat) : async () {
    requireAdmin(caller);
    if (not topVibingSongs.containsKey(id)) {
      Runtime.trap("Top vibing song not found");
    };
    topVibingSongs.remove(id);
  };

  public query ({ caller }) func getAllTopVibingSongs() : async [TopVibingSong] {
    requireAdmin(caller);
    topVibingSongs.values().toArray();
  };

  public query func getRankedTopVibingSongs() : async [TopVibingSong] {
    let songs = topVibingSongs.values().toArray();
    songs.sort(func(a : TopVibingSong, b : TopVibingSong) : { #less; #equal; #greater } {
      if (a.rank < b.rank) { #less } else if (a.rank > b.rank) { #greater } else { #equal };
    });
  };

  public query func getTopVibingSong(id : Nat) : async ?TopVibingSong {
    topVibingSongs.get(id);
  };

  public shared ({ caller }) func reorderTopVibingSongs(ids : [Nat]) : async () {
    requireAdmin(caller);
    var rank = 1;
    for (id in ids.values()) {
      switch (topVibingSongs.get(id)) {
        case (null) { };
        case (?existing) {
          let updated : TopVibingSong = {
            id = existing.id;
            title = existing.title;
            artistName = existing.artistName;
            genre = existing.genre;
            artworkUrl = existing.artworkUrl;
            streamingLink = existing.streamingLink;
            tagline = existing.tagline;
            rank;
          };
          topVibingSongs.add(id, updated);
          rank += 1;
        };
      };
    };
  };

  // ── Subscription Plans ─────────────────────────────────────────────────────

  public shared ({ caller }) func createSubscriptionPlan(plan : SubscriptionPlan) : async () {
    requireAdmin(caller);
    subscriptionPlans.add(plan.planName, plan);
  };

  public shared ({ caller }) func updateSubscriptionPlan(plan : SubscriptionPlan) : async () {
    requireAdmin(caller);
    if (not subscriptionPlans.containsKey(plan.planName)) {
      Runtime.trap("Subscription plan not found");
    };
    subscriptionPlans.add(plan.planName, plan);
  };

  public shared ({ caller }) func deleteSubscriptionPlan(planName : Text) : async () {
    requireAdmin(caller);
    if (not subscriptionPlans.containsKey(planName)) {
      Runtime.trap("Subscription plan not found");
    };
    subscriptionPlans.remove(planName);
  };

  public query func getAllSubscriptionPlans() : async [SubscriptionPlan] {
    subscriptionPlans.values().toArray();
  };

  // ── Monthly Listener Stats ─────────────────────────────────────────────────

  public shared ({ caller }) func updateMonthlyListenerStats(
    songId : Text,
    stats : [MonthlyListenerStats]
  ) : async () {
    requireAdminOrTeam(caller);
    monthlyListenerStats.add(songId, stats);
  };

  public query func getSongMonthlyListenerStats(songId : Text) : async [MonthlyListenerStats] {
    switch (monthlyListenerStats.get(songId)) {
      case (null) { [] };
      case (?stats) { stats };
    };
  };

  // ── Song Revenue ───────────────────────────────────────────────────────────

  public shared ({ caller }) func setSongRevenue(songId : Text, amount : Float) : async () {
    requireAdmin(caller);
    songRevenues.add(songId, amount);
  };

  public query func getSongRevenue(songId : Text) : async Float {
    switch (songRevenues.get(songId)) {
      case (null) { 0.0 };
      case (?amt) { amt };
    };
  };

  public query ({ caller }) func getAllSongRevenues() : async [(Text, Float)] {
    requireAdmin(caller);
    songRevenues.entries().toArray();
  };

  // ── Withdrawal Requests ────────────────────────────────────────────────────

  public shared ({ caller }) func submitWithdrawRequest(input : WithdrawRequestInput) : async Text {
    requireUser(caller);
    // Check no pending request exists
    let existing = withdrawRequests.values().toArray();
    for (req in existing.vals()) {
      if (req.submitter == caller) {
        switch (req.status) {
          case (#pending) { Runtime.trap("You already have a pending withdrawal request. Please wait for it to be processed.") };
          case (_) { };
        };
      };
    };
    if (input.amount <= 0.0) {
      Runtime.trap("Withdrawal amount must be greater than 0");
    };
    let blob = await Random.blob();
    let id = InviteLinksModule.generateUUID(blob);
    // Calculate total revenue for this user
    let userSubmissions = submissionsV2.values().toArray();
    var totalRevenue : Float = 0.0;
    for (sub in userSubmissions.vals()) {
      if (sub.submitter == caller) {
        switch (sub.status) {
          case (#approved) {
            switch (songRevenues.get(sub.id)) {
              case (?amt) { totalRevenue += amt };
              case (null) { };
            };
          };
          case (#live) {
            switch (songRevenues.get(sub.id)) {
              case (?amt) { totalRevenue += amt };
              case (null) { };
            };
          };
          case (_) { };
        };
      };
    };
    let alreadyWithdrawn = switch (withdrawnAmounts.get(caller)) {
      case (null) { 0.0 };
      case (?amt) { amt };
    };
    let availableRevenue = totalRevenue - alreadyWithdrawn;
    if (input.amount > availableRevenue) {
      Runtime.trap("Withdrawal amount exceeds available revenue balance");
    };
    let request : WithdrawRequest = {
      id;
      submitter = caller;
      fullName = input.fullName;
      googlePayAccountName = input.googlePayAccountName;
      upiId = input.upiId;
      message = input.message;
      amount = input.amount;
      qrCodeBlob = input.qrCodeBlob;
      qrCodeFilename = input.qrCodeFilename;
      status = #pending;
      rejectionReason = "";
      timestamp = Time.now();
    };
    withdrawRequests.add(id, request);
    id;
  };

  public query ({ caller }) func getMyWithdrawRequests() : async [WithdrawRequest] {
    requireUser(caller);
    let all = withdrawRequests.values().toArray();
    all.filter(func(r : WithdrawRequest) : Bool { r.submitter == caller });
  };

  public query ({ caller }) func getAllWithdrawRequestsForAdmin() : async [WithdrawRequest] {
    requireAdmin(caller);
    withdrawRequests.values().toArray();
  };

  public shared ({ caller }) func approveWithdrawRequest(requestId : Text) : async () {
    requireAdmin(caller);
    switch (withdrawRequests.get(requestId)) {
      case (null) { Runtime.trap("Withdrawal request not found") };
      case (?req) {
        let updated : WithdrawRequest = {
          id = req.id;
          submitter = req.submitter;
          fullName = req.fullName;
          googlePayAccountName = req.googlePayAccountName;
          upiId = req.upiId;
          message = req.message;
          amount = req.amount;
          qrCodeBlob = req.qrCodeBlob;
          qrCodeFilename = req.qrCodeFilename;
          status = #approved;
          rejectionReason = req.rejectionReason;
          timestamp = req.timestamp;
        };
        withdrawRequests.add(requestId, updated);
        // Deduct from withdrawn amounts
        let current = switch (withdrawnAmounts.get(req.submitter)) {
          case (null) { 0.0 };
          case (?amt) { amt };
        };
        withdrawnAmounts.add(req.submitter, current + req.amount);
      };
    };
  };

  public shared ({ caller }) func rejectWithdrawRequest(requestId : Text, reason : Text) : async () {
    requireAdmin(caller);
    switch (withdrawRequests.get(requestId)) {
      case (null) { Runtime.trap("Withdrawal request not found") };
      case (?req) {
        let updated : WithdrawRequest = {
          id = req.id;
          submitter = req.submitter;
          fullName = req.fullName;
          googlePayAccountName = req.googlePayAccountName;
          upiId = req.upiId;
          message = req.message;
          amount = req.amount;
          qrCodeBlob = req.qrCodeBlob;
          qrCodeFilename = req.qrCodeFilename;
          status = #rejected;
          rejectionReason = reason;
          timestamp = req.timestamp;
        };
        withdrawRequests.add(requestId, updated);
      };
    };
  };

  public query ({ caller }) func getWithdrawnAmountForUser() : async Float {
    switch (withdrawnAmounts.get(caller)) {
      case (null) { 0.0 };
      case (?v) { v };
    };
  };

  // ── Stable migration: upgrade SongSubmissionLegacy -> SongSubmission ──────
  // This runs after canister upgrade and migrates any legacy submissions
  // (those without premium fields) into the new submissionsV2 map.
  system func postupgrade() {
    for ((id, legacy) in submissions.entries().toArray().vals()) {
      if (not submissionsV2.containsKey(id)) {
        let migrated : SongSubmission = {
          id = legacy.id;
          title = legacy.title;
          releaseType = legacy.releaseType;
          genre = legacy.genre;
          language = legacy.language;
          releaseDate = legacy.releaseDate;
          artwork = legacy.artwork;
          artworkFilename = legacy.artworkFilename;
          artist = legacy.artist;
          featuredArtist = legacy.featuredArtist;
          composer = legacy.composer;
          producer = legacy.producer;
          lyricist = legacy.lyricist;
          audioFile = legacy.audioFile;
          audioFilename = legacy.audioFilename;
          additionalDetails = legacy.additionalDetails;
          status = legacy.status;
          adminRemarks = legacy.adminRemarks;
          adminComment = legacy.adminComment;
          submitter = legacy.submitter;
          timestamp = legacy.timestamp;
          discountCode = legacy.discountCode;
          acrResult = legacy.acrResult;
          preSaveLink = legacy.preSaveLink;
          liveStreamLink = legacy.liveStreamLink;
          musicVideoLink = legacy.musicVideoLink;
          albumTracks = legacy.albumTracks;
          publicLink = legacy.publicLink;
          adminLiveLink = legacy.adminLiveLink;
          isManuallyRejected = legacy.isManuallyRejected;
          spotifyLink = legacy.spotifyLink;
          appleMusicLink = legacy.appleMusicLink;
          // New premium fields default to null
          customCLine = null;
          customPLine = null;
          premiumLabel = null;
          contentType = null;
          sunoTrackLink = null;
          sunoAgreementFile = null;
          sunoAgreementFilename = null;
          licenceFile = null;
          licenceFilename = null;
          contentId = null;
          callerTuneStartSecond = null;
        };
        submissionsV2.add(id, migrated);
      };
    };
    // Clear legacy map after migration
    for ((id, _) in submissions.entries().toArray().vals()) {
      submissions.remove(id);
    };
  };


};