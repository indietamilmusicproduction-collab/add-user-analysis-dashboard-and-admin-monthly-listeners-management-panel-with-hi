import Map "mo:core/Map";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Storage "blob-storage/Storage";
import List "mo:core/List";
import Random "mo:core/Random";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import InviteLinksModule "invite-links/invite-links-module";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import UserApproval "user-approval/approval";
import MixinAuthorization "authorization/MixinAuthorization";
import Iter "mo:core/Iter";


// Apply data migration on upgrade.


actor {
  include MixinStorage();

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
  };

  public type ACRResult = {
    statusCode : Text;
    music : Text;
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

  public type RetrieveSongSubmissionEditDataResponseText = {
    songSubmissionId : Text;
    title : Text;
    releaseType : Text;
    genre : Text;
    language : Text;
    releaseDate : Text;
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

  public type SubscriptionPlan = {
    planName : Text;
    pricePerYear : Nat;
    redirectUrl : Text;
    benefits : [Text];
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

  let submissions = Map.empty<Text, SongSubmission>();
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

  let subscriptionPlans = Map.empty<Text, SubscriptionPlan>();

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
      case (#pending) { false };
      case (#approved) { false };
      case (#live) { false };
    };
  };

  // Featured Artist API
  // Set featured artist for a slot
  public shared ({ caller }) func setFeaturedArtist(slot : Nat, data : FeaturedArtistInput) : async () {
    requireAdmin(caller);
    if (slot < 1 or slot > 3) {
      Runtime.trap("Slot must be 1, 2, or 3");
    };

    let songs = if (data.songs.size() > 3) {
      data.songs.sliceToArray(0, 3);
    } else {
      data.songs;
    };

    let artist : FeaturedArtist = {
      id = slot;
      slotIndex = slot;
      artistName = data.artistName;
      photoUrl = data.photoUrl;
      aboutBlurb = data.aboutBlurb;
      songs;
      isActive = data.isActive;
    };

    featuredArtists.add(slot, artist);
  };

  // Toggle active/inactive state for a featured artist slot
  public shared ({ caller }) func toggleFeaturedArtistSlot(slot : Nat, active : Bool) : async () {
    requireAdmin(caller);
    if (slot < 1 or slot > 3) {
      Runtime.trap("Slot must be 1, 2, or 3");
    };

    switch (featuredArtists.get(slot)) {
      case (null) { Runtime.trap("Featured artist slot not found") };
      case (?artist) {
        let updated = { artist with isActive = active };
        featuredArtists.add(slot, updated);
      };
    };
  };

  // Get all 3 featured artist slots
  public query func getFeaturedArtists() : async [FeaturedArtist] {
    [1, 2, 3].map(
      func(slot) {
        switch (featuredArtists.get(slot)) {
          case (null) {
            {
              id = slot;
              slotIndex = slot;
              artistName = "";
              photoUrl = "";
              aboutBlurb = "";
              songs = [];
              isActive = false;
            };
          };
          case (?artist) { artist };
        };
      }
    );
  };

  public query func getAllTopVibingSongs() : async [TopVibingSong] {
    let list = List.empty<TopVibingSong>();
    for ((_, song) in topVibingSongs.entries()) {
      list.add(song);
    };
    list.toArray();
  };

  public shared ({ caller }) func addTopVibingSong(song : TopVibingSong) : async Nat {
    requireAdmin(caller);
    topVibingSongs.add(song.id, song);
    topVibingSongsSize += 1;
    song.id;
  };

  public query ({ caller }) func getTopVibingSong(id : Nat) : async TopVibingSong {
    requireAdmin(caller);
    switch (topVibingSongs.get(id)) {
      case (null) { Runtime.trap("Song not found") };
      case (?song) { song };
    };
  };

  public shared ({ caller }) func updateTopVibingSong(song : TopVibingSong) : async () {
    requireAdmin(caller);
    if (not topVibingSongs.containsKey(song.id)) {
      Runtime.trap("Song not found");
    };
    topVibingSongs.add(song.id, song);
  };

  public shared ({ caller }) func deleteTopVibingSong(id : Nat) : async () {
    requireAdmin(caller);
    if (not topVibingSongs.containsKey(id)) {
      Runtime.trap("Song not found");
    };
    topVibingSongs.remove(id);

    let songsArray = topVibingSongs.values().toArray();
    let sortedSongs = songsArray.sort(
      func(a, b) {
        if (a.rank == b.rank) {
          Nat.compare(a.id, b.id);
        } else {
          Nat.compare(a.rank, b.rank);
        };
      }
    );
    for (song in sortedSongs.values()) {
      topVibingSongs.add(song.id, song);
    };
    topVibingSongsSize -= 1;
  };

  public query func getRankedTopVibingSongs() : async [TopVibingSong] {
    let songsArray = topVibingSongs.values().toArray();
    songsArray.sort(
      func(a, b) {
        if (a.rank == b.rank) {
          Nat.compare(a.id, b.id);
        } else {
          Nat.compare(a.rank, b.rank);
        };
      }
    );
  };

  public shared ({ caller }) func reorderTopVibingSongs(ids : [Nat]) : async () {
    requireAdmin(caller);

    let songsArray = topVibingSongs.values().toArray();
    if (ids.size() != songsArray.size()) {
      Runtime.trap("Size mismatch between IDs and songs");
    };

    let idsSet = Set.empty<Nat>();
    for (id in ids.values()) {
      if (idsSet.contains(id)) {
        Runtime.trap("Duplicate ID found in reorder array: " # id.toText());
      };
      idsSet.add(id);
    };

    let songsIdsSet = Set.empty<Nat>();
    for (song in songsArray.values()) {
      songsIdsSet.add(song.id);
    };

    let expectedIdsArray = songsIdsSet.toArray();
    let sortedIds = ids.sort();
    let sortedExpected = expectedIdsArray.sort();

    if (sortedIds.size() != sortedExpected.size()) {
      Runtime.trap("Mismatch in total number of IDs");
    };

    for (i in Nat.range(0, sortedIds.size())) {
      if (sortedIds[i] != sortedExpected[i]) {
        Runtime.trap("ID mismatch at position " # i.toText() # ": expected " # sortedExpected[i].toText() # ", got " # sortedIds[i].toText());
      };
    };

    let songsMap = Map.empty<Nat, TopVibingSong>();
    for (song in songsArray.values()) {
      songsMap.add(song.id, song);
    };

    let finalOrderedSongs = ids.map(
      func(id) {
        switch (songsMap.get(id)) {
          case (null) { Runtime.trap("Song not found for ID: " # id.toText()) };
          case (?song) { song };
        };
      }
    );

    let preservedSongs = finalOrderedSongs.map(
      func(song) { { song with rank = song.rank } }
    );

    topVibingSongs.clear();
    for (song in preservedSongs.values()) {
      topVibingSongs.add(song.id, song);
    };
  };

  // Get only active featured artists
  public query func getActiveFeaturedArtists() : async [FeaturedArtist] {
    let allArtists = [1, 2, 3].map(
      func(slot) {
        switch (featuredArtists.get(slot)) {
          case (null) {
            {
              id = slot;
              slotIndex = slot;
              artistName = "";
              photoUrl = "";
              aboutBlurb = "";
              songs = [];
              isActive = false;
            };
          };
          case (?artist) { artist };
        };
      }
    );
    allArtists.filter(func(a) { a.isActive });
  };

  // Admin management section

  public shared ({ caller }) func promoteToAdmin(target : Principal) : async () {
    requireAdmin(caller);
    AccessControl.assignRole(accessControlState, caller, target, #admin);
  };

  public shared ({ caller }) func demoteFromAdmin(target : Principal) : async () {
    requireAdmin(caller);

    if (not AccessControl.isAdmin(accessControlState, target)) {
      Runtime.trap("Principal is not an admin");
    };

    let currentAdmins = await listAdmins();
    let numAdmins = currentAdmins.size();

    if (numAdmins <= 1) {
      Runtime.trap("Cannot demote the last remaining admin");
    };

    AccessControl.assignRole(accessControlState, caller, target, #user);
  };

  public query ({ caller }) func listAdmins() : async [Principal] {
    requireAdmin(caller);
    let principals = Principal.fromText("2vxsx-fae");
    [principals];
  };

  // ================================
  // PUBLIC SONG PAGE ACCESS
  // ================================
  public query func getSongInfo(songId : Text) : async PublicSongInfo {
    let song = switch (submissions.get(songId)) {
      case (null) { Runtime.trap("Song not found") };
      case (?song) { song };
    };

    if (song.status != #live) {
      Runtime.trap("Song not available");
    };

    {
      id = song.id;
      title = song.title;
      artist = song.artist;
      featuredArtist = song.featuredArtist;
      artwork = song.artwork;
      spotifyLink = song.spotifyLink;
      appleMusicLink = song.appleMusicLink;
      releaseDate = song.releaseDate;
      genre = song.genre;
      language = song.language;
      musicVideoLink = song.musicVideoLink;
    };
  };

  // ================================
  // VIDEO SUBMISSION WORKFLOW
  // ================================
  public shared ({ caller }) func submitVideo(input : VideoSubmissionInput) : async Text {
    requireUser(caller);

    let blob = await Random.blob();
    let videoId = InviteLinksModule.generateUUID(blob);

    let currentTime = Time.now();

    let submission : VideoSubmission = {
      id = videoId;
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
      submittedAt = currentTime;
      updatedAt = currentTime;
    };

    videoSubmissions.add(videoId, submission);
    videoId;
  };

  public query ({ caller }) func getUserVideoSubmissions() : async [VideoSubmission] {
    requireUser(caller);

    videoSubmissions.values().toArray().filter(
      func(submission) { submission.userId == caller }
    );
  };

  public query ({ caller }) func getAllVideoSubmissions() : async [VideoSubmission] {
    requireAdmin(caller);
    videoSubmissions.values().toArray();
  };

  public shared ({ caller }) func updateVideoStatus(videoId : Text, newStatus : VideoSubmissionStatus, liveUrl : ?Text) : async () {
    requireAdmin(caller);

    switch (videoSubmissions.get(videoId)) {
      case (null) { Runtime.trap("Video submission not found") };
      case (?submission) {
        switch (liveUrl) {
          case (?url) {
            if (not isValidUrl(url)) {
              Runtime.trap("Invalid live URL format");
            };
          };
          case (null) {};
        };

        let updatedSubmission = {
          submission with status = newStatus;
          liveUrl;
          updatedAt = Time.now();
        };
        videoSubmissions.add(videoId, updatedSubmission);
      };
    };
  };

  public shared ({ caller }) func updateVideoSubmission(input : VideoSubmissionInput, videoId : Text) : async () {
    requireAdmin(caller);

    switch (videoSubmissions.get(videoId)) {
      case (null) { Runtime.trap("Video submission not found") };
      case (?submission) {
        let updatedSubmission = {
          submission with
          title = input.title;
          description = input.description;
          category = input.category;
          tags = input.tags;
          thumbnail = input.thumbnail;
          artwork = input.artwork;
          videoFile = input.videoFile;
          updatedAt = Time.now();
        };
        videoSubmissions.add(videoId, updatedSubmission);
      };
    };
  };

  public shared ({ caller }) func deleteVideoSubmission(videoId : Text) : async () {
    requireAdmin(caller);

    if (not videoSubmissions.containsKey(videoId)) {
      Runtime.trap("Video submission not found");
    };
    videoSubmissions.remove(videoId);
  };

  public shared ({ caller }) func downloadVideoFile(videoId : Text) : async Storage.ExternalBlob {
    requireAdmin(caller);

    switch (videoSubmissions.get(videoId)) {
      case (null) { Runtime.trap("Video submission not found") };
      case (?submission) {
        submission.videoFile;
      };
    };
  };

  // ================================
  // SUBSCRIPTION PLAN MANAGEMENT
  // ================================
  public shared ({ caller }) func createSubscriptionPlan(plan : SubscriptionPlan) : async () {
    requireAdmin(caller);
    subscriptionPlans.add(plan.planName, plan);
  };

  public shared ({ caller }) func updateSubscriptionPlan(plan : SubscriptionPlan) : async () {
    requireAdmin(caller);
    if (not subscriptionPlans.containsKey(plan.planName)) {
      Runtime.trap("Subscription plan does not exist");
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

  // ================================
  // USER CATEGORY MANAGEMENT
  // ================================

  public shared ({ caller }) func updateUserCategory(userId : Principal, newCategory : UserCategory) : async () {
    requireAdmin(caller);

    switch (userProfiles.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        let updatedProfile = {
          profile with category = newCategory;
        };
        userProfiles.add(userId, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getUsersByCategory(category : UserCategory) : async [UserProfile] {
    requireAdmin(caller);

    userProfiles.values().toArray().filter(
      func(profile) { profile.category == category }
    );
  };

  // ================================
  // USER BLOCKING MANAGEMENT
  // ================================
  public shared ({ caller }) func blockUserSongSubmission(user : Principal) : async () {
    requireAdmin(caller);
    let existingStatus = switch (blockedUsers.get(user)) {
      case (null) { { songSubmissionBlocked = false; podcastSubmissionBlocked = false } };
      case (?status) { status };
    };

    let updatedStatus = {
      existingStatus with songSubmissionBlocked = true;
    };
    blockedUsers.add(user, updatedStatus);
  };

  public shared ({ caller }) func blockUserPodcastSubmission(user : Principal) : async () {
    requireAdmin(caller);
    let existingStatus = switch (blockedUsers.get(user)) {
      case (null) { { songSubmissionBlocked = false; podcastSubmissionBlocked = false } };
      case (?status) { status };
    };
    let updatedStatus = {
      existingStatus with podcastSubmissionBlocked = true;
    };
    blockedUsers.add(user, updatedStatus);
  };

  public shared ({ caller }) func unblockUserSongSubmission(user : Principal) : async () {
    requireAdmin(caller);
    switch (blockedUsers.get(user)) {
      case (null) {
        Runtime.trap("User is not in restricted for song submissions");
      };
      case (?status) {
        let updatedStatus = {
          status with songSubmissionBlocked = false;
        };
        if (not updatedStatus.songSubmissionBlocked and not updatedStatus.podcastSubmissionBlocked) {
          blockedUsers.remove(user);
        } else {
          blockedUsers.add(user, updatedStatus);
        };
      };
    };
  };

  public shared ({ caller }) func unblockUserPodcastSubmission(user : Principal) : async () {
    requireAdmin(caller);
    switch (blockedUsers.get(user)) {
      case (null) {
        Runtime.trap("User is not in restricted for podcast submissions");
      };
      case (?status) {
        let updatedStatus = {
          status with podcastSubmissionBlocked = false;
        };
        if (not updatedStatus.songSubmissionBlocked and not updatedStatus.podcastSubmissionBlocked) {
          blockedUsers.remove(user);
        } else {
          blockedUsers.add(user, updatedStatus);
        };
      };
    };
  };

  public query ({ caller }) func isUserBlockedSongSubmission(user : Principal) : async Bool {
    requireAdminOrTeam(caller);
    isBlockedForSongs(user);
  };

  public query ({ caller }) func isUserBlockedPodcastSubmission(user : Principal) : async Bool {
    requireAdminOrTeam(caller);
    isBlockedForPodcasts(user);
  };

  public query ({ caller }) func getAllBlockedUsersAdmin() : async [Principal] {
    requireAdminOrTeam(caller);

    let distinctUsers = Set.empty<Principal>();
    for ((user, status) in blockedUsers.entries()) {
      if (status.songSubmissionBlocked or status.podcastSubmissionBlocked) {
        distinctUsers.add(user);
      };
    };
    distinctUsers.toArray();
  };

  // ================================
  // VERIFICATION WORKFLOW
  // ================================
  public shared ({ caller }) func applyForVerification() : async Text {
    requireUser(caller);

    let blob = await Random.blob();
    let verificationId = InviteLinksModule.generateUUID(blob);

    let verificationRequest : VerificationRequest = {
      id = verificationId;
      user = caller;
      status = #pending;
      timestamp = Time.now();
      verificationApprovedTimestamp = null;
      expiryExtensionDays = 0;
    };

    verificationRequests.add(verificationId, verificationRequest);
    verificationId;
  };

  public shared ({ caller }) func updateVerificationStatus(verificationId : Text, status : VerificationStatus, expiryExtensionDays : Nat) : async () {
    requireAdmin(caller);

    switch (verificationRequests.get(verificationId)) {
      case (null) { Runtime.trap("Verification request not found") };
      case (?request) {
        var maybeApprovalTimestamp : ?Time.Time = request.verificationApprovedTimestamp;
        if (status == #approved) {
          maybeApprovalTimestamp := ?Time.now();
        };
        let updatedRequest = {
          request with
          status;
          expiryExtensionDays;
          verificationApprovedTimestamp = maybeApprovalTimestamp;
        };
        verificationRequests.add(verificationId, updatedRequest);
      };
    };
  };

  public query func getVerificationRequests() : async [VerificationRequest] {
    verificationRequests.values().toArray();
  };

  public query func getVerificationRequestsByUser(user : Principal) : async [VerificationRequest] {
    verificationRequests.values().toArray().filter(
      func(request) { request.user == user }
    );
  };

  public shared ({ caller }) func upgradeUserToTeamMember(user : Principal) : async () {
    requireAdmin(caller);
    teamMembers.add(user, true);
  };

  public shared ({ caller }) func downgradeTeamMember(user : Principal) : async () {
    requireAdmin(caller);
    teamMembers.remove(user);
  };

  public query ({ caller }) func isUserTeamMember(user : Principal) : async Bool {
    requireAdminOrTeam(caller);
    isTeamMember(user);
  };

  public query ({ caller }) func getAllTeamMembers() : async [Principal] {
    requireAdminOrTeam(caller);
    teamMembers.keys().toArray().filter(func(p) { isTeamMember(p) });
  };

  public shared ({ caller }) func setWebsiteLogo(logo : Storage.ExternalBlob) : async () {
    requireAdmin(caller);
    websiteLogo := ?logo;
  };

  public shared ({ caller }) func removeWebsiteLogo() : async () {
    requireAdmin(caller);
    websiteLogo := null;
  };

  public query func getWebsiteLogo() : async ?Storage.ExternalBlob {
    websiteLogo;
  };

  public shared ({ caller }) func createPodcastShow(input : PodcastShowInput) : async Text {
    requireUser(caller);
    requireUserNotBlockedForPodcasts(caller);

    let blob = await Random.blob();
    let showId = InviteLinksModule.generateUUID(blob);

    let show : PodcastShow = {
      id = showId;
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

    podcasts.add(showId, show);
    showId;
  };

  public query ({ caller }) func getMyPodcastShows() : async [PodcastShow] {
    requireUser(caller);

    podcasts.values().toArray().filter(
      func(show) { show.createdBy == caller }
    );
  };

  public query ({ caller }) func getAllPendingPodcasts() : async [PodcastShow] {
    requireAdminOrTeam(caller);

    podcasts.values().toArray().filter(
      func(show) { show.moderationStatus == #pending }
    );
  };

  public query ({ caller }) func getAllPodcasts() : async [PodcastShow] {
    requireAdminOrTeam(caller);
    podcasts.values().toArray();
  };

  public shared ({ caller }) func approvePodcast(id : Text) : async () {
    requireAdminOrTeam(caller);

    switch (podcasts.get(id)) {
      case (null) { Runtime.trap("Podcast not found") };
      case (?show) {
        let updatedShow = { show with moderationStatus = #approved };
        podcasts.add(id, updatedShow);
      };
    };
  };

  public shared ({ caller }) func rejectPodcast(id : Text) : async () {
    requireAdminOrTeam(caller);

    switch (podcasts.get(id)) {
      case (null) { Runtime.trap("Podcast not found") };
      case (?show) {
        let updatedShow = { show with moderationStatus = #rejected };
        podcasts.add(id, updatedShow);
      };
    };
  };

  public shared ({ caller }) func markPodcastLive(id : Text, liveLink : Text) : async () {
    requireAdminOrTeam(caller);

    switch (podcasts.get(id)) {
      case (null) { Runtime.trap("Podcast not found") };
      case (?show) {
        let updatedShow = {
          show with
          moderationStatus = #live;
          liveLink = ?liveLink;
        };
        podcasts.add(id, updatedShow);
      };
    };
  };

  public query ({ caller }) func getPodcastsByCategory(category : PodcastCategory) : async [PodcastShow] {
    requireAdminOrTeam(caller);

    podcasts.values().toArray().filter(
      func(show) { show.category == category }
    );
  };

  public shared ({ caller }) func createPodcastEpisode(input : PodcastEpisodeInput) : async Text {
    requireUser(caller);
    requireUserNotBlockedForPodcasts(caller);

    switch (podcasts.get(input.showId)) {
      case (null) {
        Runtime.trap("Podcast show not found");
      };
      case (?show) {
        if (show.createdBy != caller) {
          Runtime.trap("Unauthorized: Can only create episodes for your own podcast shows");
        };
      };
    };

    let blob = await Random.blob();
    let episodeId = InviteLinksModule.generateUUID(blob);

    let episode : PodcastEpisode = {
      id = episodeId;
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

    podcastEpisodes.add(episodeId, episode);
    episodeId;
  };

  public query ({ caller }) func getMyEpisodes(showId : Text) : async [PodcastEpisode] {
    requireUser(caller);

    podcastEpisodes.values().toArray().filter(
      func(episode) {
        episode.showId == showId and episode.createdBy == caller
      }
    );
  };

  public query ({ caller }) func getEpisodesByShowId(showId : Text) : async [PodcastEpisode] {
    requireAdminOrTeam(caller);

    podcastEpisodes.values().toArray().filter(
      func(episode) { episode.showId == showId }
    );
  };

  public query ({ caller }) func getAllEpisodes() : async [PodcastEpisode] {
    requireAdminOrTeam(caller);

    podcastEpisodes.values().toArray();
  };

  public query ({ caller }) func getAllPendingEpisodes() : async [PodcastEpisode] {
    requireAdminOrTeam(caller);

    podcastEpisodes.values().toArray().filter(
      func(episode) { episode.moderationStatus == #pending }
    );
  };

  public shared ({ caller }) func approveEpisode(id : Text) : async () {
    requireAdminOrTeam(caller);

    switch (podcastEpisodes.get(id)) {
      case (null) { Runtime.trap("Episode not found") };
      case (?episode) {
        let updatedEpisode = { episode with moderationStatus = #approved };
        podcastEpisodes.add(id, updatedEpisode);
      };
    };
  };

  public shared ({ caller }) func rejectEpisode(id : Text) : async () {
    requireAdminOrTeam(caller);

    switch (podcastEpisodes.get(id)) {
      case (null) { Runtime.trap("Episode not found") };
      case (?episode) {
        let updatedEpisode = { episode with moderationStatus = #rejected };
        podcastEpisodes.add(id, updatedEpisode);
      };
    };
  };

  public shared ({ caller }) func markEpisodeLive(id : Text) : async () {
    requireAdminOrTeam(caller);

    switch (podcastEpisodes.get(id)) {
      case (null) { Runtime.trap("Episode not found") };
      case (?episode) {
        let updatedEpisode = { episode with moderationStatus = #live };
        podcastEpisodes.add(id, updatedEpisode);
      };
    };
  };

  public shared ({ caller }) func submitSong(input : SongSubmissionInput) : async Text {
    requireUser(caller);
    requireUserNotBlockedForSongs(caller);

    let blob = await Random.blob();
    let submissionId = InviteLinksModule.generateUUID(blob);

    let submission : SongSubmission = {
      id = submissionId;
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
      albumTracks = input.albumTracks;
      publicLink = null;
      musicVideoLink = input.musicVideoLink;
      adminLiveLink = null;
      isManuallyRejected = false;
      spotifyLink = input.spotifyLink;
      appleMusicLink = input.appleMusicLink;
    };

    submissions.add(submissionId, submission);
    submissionId;
  };

  public shared ({ caller }) func editSongSubmission(input : SongSubmissionEditInput) : async () {
    requireUser(caller);
    requireUserNotBlockedForSongs(caller);

    switch (submissions.get(input.songSubmissionId)) {
      case (null) {
        Runtime.trap("Submission not found");
      };
      case (?submission) {
        if (submission.submitter != caller) {
          Runtime.trap("Unauthorized: Can only edit your own submissions");
        };
        if (not canEditSubmission(submission)) {
          Runtime.trap("Unauthorized: Cannot edit submission in current status");
        };

        let updatedSubmission = {
          submission with
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
          discountCode = input.discountCode;
          musicVideoLink = input.musicVideoLink;
          albumTracks = input.albumTracks;
          spotifyLink = input.spotifyLink;
          appleMusicLink = input.appleMusicLink;
        };
        submissions.add(input.songSubmissionId, updatedSubmission);
      };
    };
  };

  public query ({ caller }) func getMySubmissions() : async [SongSubmission] {
    requireUser(caller);

    submissions.values().toArray().filter(
      func(submission) { submission.submitter == caller }
    );
  };

  public query ({ caller }) func getAllSubmissionsForAdmin() : async [SongSubmission] {
    requireAdminOrTeam(caller);
    submissions.values().toArray();
  };

  public shared ({ caller }) func adminUpdateSubmission(id : Text, status : SongStatus, adminRemarks : Text, adminComment : Text) : async () {
    requireAdminOrTeam(caller);

    switch (submissions.get(id)) {
      case (null) {
        Runtime.trap("Submission not found");
      };
      case (?submission) {
        let updatedSubmission = {
          submission with
          status;
          adminRemarks;
          adminComment;
          isManuallyRejected = (status == #rejected);
        };
        submissions.add(id, updatedSubmission);
      };
    };
  };

  public shared ({ caller }) func adminSetSubmissionLive(id : Text, liveUrl : Text, adminRemarks : Text, adminComment : Text) : async () {
    requireAdminOrTeam(caller);

    if (not isValidUrl(liveUrl)) {
      Runtime.trap("Invalid URL: Live URL must start with http:// or https://");
    };

    switch (submissions.get(id)) {
      case (null) {
        Runtime.trap("Submission not found");
      };
      case (?submission) {
        let updatedSubmission = {
          submission with
          status = #live;
          adminLiveLink = ?liveUrl;
          adminRemarks;
          adminComment;
        };
        submissions.add(id, updatedSubmission);
      };
    };
  };

  public shared ({ caller }) func adminEditSubmission(input : SongSubmissionEditInput) : async () {
    requireAdminOrTeam(caller);

    switch (submissions.get(input.songSubmissionId)) {
      case (null) {
        Runtime.trap("Submission not found");
      };
      case (?submission) {
        let updatedSubmission = {
          submission with
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
          discountCode = input.discountCode;
          musicVideoLink = input.musicVideoLink;
          albumTracks = input.albumTracks;
          spotifyLink = input.spotifyLink;
          appleMusicLink = input.appleMusicLink;
        };
        submissions.add(input.songSubmissionId, updatedSubmission);
      };
    };
  };

  public shared ({ caller }) func adminDeleteSubmission(id : Text) : async () {
    requireAdminOrTeam(caller);

    if (not submissions.containsKey(id)) {
      Runtime.trap("Submission not found");
    };
    submissions.remove(id);
  };

  public shared ({ caller }) func createArtistProfile(input : SaveArtistProfileInput) : async Text {
    requireUser(caller);

    if (input.instagramLink == "" or not isValidUrl(input.instagramLink)) {
      Runtime.trap("Instagram link is required and must be a valid URL");
    };
    if (input.facebookLink == "" or not isValidUrl(input.facebookLink)) {
      Runtime.trap("Facebook link is required and must be a valid URL");
    };

    let blob = await Random.blob();
    let newId = InviteLinksModule.generateUUID(blob);

    let profile : ArtistProfile = {
      id = newId;
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

    artistProfiles.add(newId, profile);
    newId;
  };

  public query ({ caller }) func getMyArtistProfiles() : async [ArtistProfile] {
    requireUser(caller);
    artistProfiles.values().toArray().filter(
      func(profile) { profile.owner == caller }
    );
  };

  public shared ({ caller }) func updateArtistProfile(id : Text, input : SaveArtistProfileInput) : async () {
    requireUser(caller);

    switch (artistProfiles.get(id)) {
      case (null) {
        Runtime.trap("Artist profile not found");
      };
      case (?profile) {
        if (profile.owner != caller) {
          Runtime.trap("Unauthorized: Can only edit your own artist profiles");
        };

        if (input.instagramLink == "" or not isValidUrl(input.instagramLink)) {
          Runtime.trap("Instagram link is required and must be a valid URL");
        };
        if (input.facebookLink == "" or not isValidUrl(input.facebookLink)) {
          Runtime.trap("Facebook link is required and must be a valid URL");
        };
        let updatedProfile = {
          profile with
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
        };
        artistProfiles.add(id, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func deleteArtistProfile(id : Text) : async () {
    requireUser(caller);

    switch (artistProfiles.get(id)) {
      case (null) {
        Runtime.trap("Artist profile not found");
      };
      case (?_profile) {
        artistProfiles.remove(id);
      };
    };
  };

  public query ({ caller }) func getAllArtistProfilesForAdmin() : async [ArtistProfile] {
    requireAdminOrTeam(caller);
    artistProfiles.values().toArray();
  };

  public shared ({ caller }) func adminEditArtistProfile(id : Text, input : SaveArtistProfileInput) : async () {
    requireAdminOrTeam(caller);

    switch (artistProfiles.get(id)) {
      case (null) {
        Runtime.trap("Artist profile not found");
      };
      case (?profile) {
        if (input.instagramLink == "" or not isValidUrl(input.instagramLink)) {
          Runtime.trap("Instagram link is required and must be a valid URL");
        };
        if (input.facebookLink == "" or not isValidUrl(input.facebookLink)) {
          Runtime.trap("Facebook link is required and must be a valid URL");
        };
        let updatedProfile = {
          profile with
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
        };
        artistProfiles.add(id, updatedProfile);
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

  public query ({ caller }) func getAllArtistProfileOwnersForAdmin() : async [Principal] {
    requireAdminOrTeam(caller);

    let ownersSet = Set.empty<Principal>();

    for (profile in artistProfiles.values()) {
      ownersSet.add(profile.owner);
    };

    ownersSet.toArray();
  };

  public query ({ caller }) func getArtistProfilesByUserForAdmin(user : Principal) : async [ArtistProfile] {
    requireAdminOrTeam(caller);

    artistProfiles.values().toArray().filter(
      func(profile) { profile.owner == user }
    );
  };

  public shared ({ caller }) func generateInviteCode() : async Text {
    requireAdmin(caller);
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  public shared ({ caller }) func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    requireUser(caller);
    InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    requireAdmin(caller);
    InviteLinksModule.getAllRSVPs(inviteState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    requireAdmin(caller);
    InviteLinksModule.getInviteCodes(inviteState);
  };

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

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    requireUser(caller);
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    requireUser(caller);
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    requireUser(caller);
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    requireAdmin(caller);
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    requireAdmin(caller);
    UserApproval.listApprovals(approvalState);
  };

  public query ({ caller }) func isArtistProfileEditingEnabled() : async Bool {
    requireUser(caller);
    artistProfileEditingAccessEnabled;
  };

  public shared ({ caller }) func setArtistProfileEditingAccess(enabled : Bool) : async () {
    requireAdmin(caller);
    artistProfileEditingAccessEnabled := enabled;
  };

  public query ({ caller }) func getArtistProfileEditingAccessStatus() : async Bool {
    requireUser(caller);
    artistProfileEditingAccessEnabled;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    requireUser(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    requireUser(caller);
    userProfiles.add(caller, profile);
  };

  public query func isArtistVerified(owner : Principal) : async Bool {
    let matchingProfiles = artistProfiles.values().toArray().filter(
      func(p) { p.owner == owner }
    );

    if (matchingProfiles.size() == 0) {
      false;
    } else {
      let profile = matchingProfiles[0];
      if (not profile.isVerified) {
        let matchingVerifications = verificationRequests.values().toArray().filter(
          func(v) { v.user == owner and v.status == #approved }
        );
        matchingVerifications.size() > 0;
      } else {
        profile.isVerified;
      };
    };
  };

  public shared ({ caller }) func handleVerificationRequest(artistProfileId : Text, isVerified : Bool, verificationRequestId : Text, newStatus : VerificationStatus) : async () {
    requireAdmin(caller);

    switch (artistProfiles.get(artistProfileId)) {
      case (null) { Runtime.trap("Artist profile not found") };
      case (?profile) {
        let updatedProfile = { profile with isVerified };
        artistProfiles.add(artistProfileId, updatedProfile);
      };
    };

    switch (verificationRequests.get(verificationRequestId)) {
      case (null) { Runtime.trap("Verification request not found") };
      case (?request) {
        let updatedRequest = { request with status = newStatus };
        verificationRequests.add(verificationRequestId, updatedRequest);
      };
    };
  };

  public query ({ caller }) func doesUserHaveArtistProfile(owner : Principal) : async Bool {
    if (caller != owner and not isAdminOrTeam(caller)) {
      Runtime.trap("Unauthorized: Can only check your own profile existence");
    };

    artistProfiles.values().toArray().find(
      func(p) { p.owner == owner }
    ) != null;
  };

  public query ({ caller }) func getArtistProfileByOwner(owner : Principal) : async ?ArtistProfile {
    if (caller != owner and not isAdminOrTeam(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    let matchingProfiles = artistProfiles.values().toArray().filter(
      func(p) { p.owner == owner }
    );

    if (matchingProfiles.size() > 0) { ?matchingProfiles[0] } else {
      null;
    };
  };

  public query ({ caller }) func getArtistProfileIdByOwnerId(owner : Principal) : async ?Text {
    if (caller != owner and not isAdminOrTeam(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile ID");
    };

    let matchingProfiles = artistProfiles.values().toArray().filter(
      func(p) { p.owner == owner }
    );

    if (matchingProfiles.size() > 0) { ?matchingProfiles[0].id } else {
      null;
    };
  };
};
