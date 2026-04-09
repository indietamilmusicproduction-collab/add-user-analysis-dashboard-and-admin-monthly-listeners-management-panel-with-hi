/**
 * Local enum constants that mirror the Motoko backend variants.
 * These are used as fallbacks when backend.ts enums are not available
 * (e.g. during local development before backend regeneration).
 * The string values must match exactly what the Motoko backend produces.
 */

export const SongStatus = {
  pending: "pending",
  live: "live",
  approved: "approved",
  rejected: "rejected",
  draft: "draft",
} as const;
export type SongStatus = (typeof SongStatus)[keyof typeof SongStatus];

export const VerificationStatus = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
  waiting: "waiting",
} as const;
export type VerificationStatus =
  (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const VideoSubmissionStatus = {
  pending: "pending",
  live: "live",
  approved: "approved",
  rejected: "rejected",
  waiting: "waiting",
} as const;
export type VideoSubmissionStatus =
  (typeof VideoSubmissionStatus)[keyof typeof VideoSubmissionStatus];

export const UserCategory = {
  generalArtist: "generalArtist",
  generalLabel: "generalLabel",
  proArtist: "proArtist",
  ultraArtist: "ultraArtist",
  proLabel: "proLabel",
} as const;
export type UserCategory = (typeof UserCategory)[keyof typeof UserCategory];

export const Language = {
  tamil: "tamil",
  hindi: "hindi",
  other: "other",
  marathi: "marathi",
  gujarati: "gujarati",
  punjabi: "punjabi",
  malayalam: "malayalam",
  kannada: "kannada",
  telugu: "telugu",
  bengali: "bengali",
  english: "english",
} as const;
export type Language = (typeof Language)[keyof typeof Language];

export const PodcastCategory = {
  kidsFamily: "kidsFamily",
  music: "music",
  newsPolitics: "newsPolitics",
  other: "other",
  arts: "arts",
  education: "education",
  religionSpirituality: "religionSpirituality",
  healthFitness: "healthFitness",
  tvFilm: "tvFilm",
  technology: "technology",
  business: "business",
  sports: "sports",
  comedy: "comedy",
  science: "science",
} as const;
export type PodcastCategory =
  (typeof PodcastCategory)[keyof typeof PodcastCategory];

export const PodcastType = {
  audio: "audio",
  video: "video",
} as const;
export type PodcastType = (typeof PodcastType)[keyof typeof PodcastType];

export const PodcastModerationStatus = {
  pending: "pending",
  live: "live",
  approved: "approved",
  rejected: "rejected",
} as const;
export type PodcastModerationStatus =
  (typeof PodcastModerationStatus)[keyof typeof PodcastModerationStatus];

export const EpisodeType = {
  full: "full",
  trailer: "trailer",
  bonus: "bonus",
} as const;
export type EpisodeType = (typeof EpisodeType)[keyof typeof EpisodeType];

export const ApprovalStatus = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
} as const;
export type ApprovalStatus =
  (typeof ApprovalStatus)[keyof typeof ApprovalStatus];

export const UserRole = {
  admin: "admin",
  user: "user",
  guest: "guest",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
