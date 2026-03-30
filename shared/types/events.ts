/**
 * Pensieve — Shared Event Schema Definitions
 *
 * These types are the canonical event definitions for the entire system.
 * Designed for Phase 1 (private mind layer) with forward-compatible fields
 * for Phase 2 (emotional geography) and Phase 3 (collective consciousness).
 *
 * Rules:
 * - Never store derived state — only events
 * - All events are immutable once persisted
 * - Location is optional on all events (Phase 2 populates it)
 * - All timestamps are ISO 8601 UTC strings
 */

// ─── Base Types ──────────────────────────────────────────────────────

export type EventType =
  | "ThoughtCaptured"
  | "EmotionTagged"
  | "ThoughtLabelled"
  | "ThoughtResurfaced"
  | "NudgeTriggered"
  | "ThoughtDeleted"
  | "UserSignedIn";

export type EmotionType = "calm" | "joy" | "tension" | "grief" | "neutral";

export type CaptureType = "text" | "image" | "voice";

export type LabelSource = "ai" | "user";

export type SurfaceType = "pensieve" | "onthisday" | "nudge";

export type AuthMethod = "apple" | "anonymous";

/** GeoJSON-compatible point — Phase 2+ */
export interface GeoPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
}

// ─── Base Event Envelope ─────────────────────────────────────────────

export interface BaseEvent<T extends EventType = EventType> {
  /** Unique event ID (UUIDv7 recommended for sortability) */
  id: string;
  /** Discriminator for event type */
  type: T;
  /** ISO 8601 UTC timestamp */
  timestamp: string;
  /** Device that produced this event */
  deviceId: string;
  /** User ID — empty string for anonymous users */
  userId: string;
  /** Monotonically increasing per-device sequence number for CRDT ordering */
  sequenceNumber: number;
  /** Optional location — Phase 2 populates this */
  location?: GeoPoint;
}

// ─── Domain Events ───────────────────────────────────────────────────

export interface ThoughtCapturedEvent extends BaseEvent<"ThoughtCaptured"> {
  data: {
    content: string;
    captureType: CaptureType;
    /** URL or local path for image/voice attachments */
    mediaUrl?: string;
    /** Transcription for voice notes */
    transcription?: string;
    /** Inline emotion at capture time (optional) */
    emotion?: EmotionType;
  };
}

export interface EmotionTaggedEvent extends BaseEvent<"EmotionTagged"> {
  data: {
    thoughtId: string;
    emotion: EmotionType;
    /** Intensity 0.0–1.0, optional — Phase 2+ may use for heatmaps */
    intensity?: number;
  };
}

export interface ThoughtLabelledEvent extends BaseEvent<"ThoughtLabelled"> {
  data: {
    thoughtId: string;
    labels: string[];
    source: LabelSource;
    /** Confidence score when source is "ai" */
    confidence?: number;
  };
}

export interface ThoughtResurfacedEvent extends BaseEvent<"ThoughtResurfaced"> {
  data: {
    thoughtId: string;
    surfaceType: SurfaceType;
  };
}

export interface NudgeTriggeredEvent extends BaseEvent<"NudgeTriggered"> {
  data: {
    scheduleId: string;
    /** If the nudge surfaced a thought, its ID */
    thoughtId?: string;
  };
}

export interface ThoughtDeletedEvent extends BaseEvent<"ThoughtDeleted"> {
  data: {
    thoughtId: string;
  };
}

export interface UserSignedInEvent extends BaseEvent<"UserSignedIn"> {
  data: {
    method: AuthMethod;
    /** Anonymous node count at time of sign-in (for migration) */
    anonymousNodeCount?: number;
  };
}

// ─── Union Type ──────────────────────────────────────────────────────

export type PensieveEvent =
  | ThoughtCapturedEvent
  | EmotionTaggedEvent
  | ThoughtLabelledEvent
  | ThoughtResurfacedEvent
  | NudgeTriggeredEvent
  | ThoughtDeletedEvent
  | UserSignedInEvent;

// ─── Read Models (Derived State) ────────────────────────────────────

/** A fully projected thought entry for UI consumption */
export interface ThoughtEntry {
  id: string;
  content: string;
  captureType: CaptureType;
  mediaUrl?: string;
  transcription?: string;
  emotion?: EmotionType;
  /** Emotion intensity if set */
  emotionIntensity?: number;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  deviceId: string;
  userId: string;
  location?: GeoPoint;
  /** Whether this entry has been soft-deleted */
  deleted: boolean;
  /** Number of times this entry has been resurfaced */
  resurfaceCount: number;
  /** Last time this entry was resurfaced */
  lastResurfacedAt?: string;
}

/** Emotion tag with metadata for UI display */
export interface EmotionTag {
  type: EmotionType;
  label: string;
  color: string;
  /** Icon name or emoji */
  icon: string;
}

/** Nudge configuration — user-editable */
export interface NudgeConfig {
  id: string;
  userId: string;
  enabled: boolean;
  /** Minimum interval in minutes */
  intervalMinMinutes: number;
  /** Maximum interval in minutes */
  intervalMaxMinutes: number;
  /** Whether to surface a random past thought with the nudge */
  surfaceThought: boolean;
  /** Quiet hours — no nudges during this window */
  quietStart?: string; // HH:MM
  quietEnd?: string;   // HH:MM
  /** Days of week (0=Sun, 6=Sat). Empty = every day */
  activeDays: number[];
  createdAt: string;
  updatedAt: string;
}

/** Sync event envelope for CRDT replication */
export interface SyncEvent {
  /** Batch ID for this sync operation */
  syncId: string;
  /** Device sending the sync */
  sourceDeviceId: string;
  /** Target device (empty for server) */
  targetDeviceId?: string;
  /** Events in this sync batch, ordered by sequence number */
  events: PensieveEvent[];
  /** Vector clock for causal ordering */
  vectorClock: Record<string, number>;
  /** ISO 8601 UTC timestamp of sync initiation */
  timestamp: string;
}

// ─── Emotion Palette ─────────────────────────────────────────────────

export const EMOTION_PALETTE: Record<EmotionType, EmotionTag> = {
  calm: {
    type: "calm",
    label: "Calm",
    color: "#7EC8B8",
    icon: "leaf",
  },
  joy: {
    type: "joy",
    label: "Joy",
    color: "#F5C563",
    icon: "sun",
  },
  tension: {
    type: "tension",
    label: "Tension",
    color: "#E87461",
    icon: "bolt",
  },
  grief: {
    type: "grief",
    label: "Grief",
    color: "#8B9DC3",
    icon: "droplet",
  },
  neutral: {
    type: "neutral",
    label: "Neutral",
    color: "#A8A8A8",
    icon: "circle",
  },
};
