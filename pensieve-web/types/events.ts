/**
 * Web-local type definitions mirroring shared/ types.
 * In production these would be imported from @pensieve/shared.
 */

export type EmotionType = "calm" | "joy" | "tension" | "grief" | "neutral";
export type CaptureType = "text" | "image" | "voice";
export type SurfaceType = "pensieve" | "onthisday" | "nudge";

export interface ThoughtEntry {
  id: string;
  content: string;
  captureType: CaptureType;
  mediaUrl?: string;
  transcription?: string;
  emotion?: EmotionType;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  deviceId: string;
  userId: string;
  deleted: boolean;
  resurfaceCount: number;
  lastResurfacedAt?: string;
}

export interface EmotionOption {
  type: EmotionType;
  label: string;
  color: string;
  icon: string;
}

export const EMOTION_OPTIONS: EmotionOption[] = [
  { type: "calm", label: "Calm", color: "#7EC8B8", icon: "🍃" },
  { type: "joy", label: "Joy", color: "#F5C563", icon: "☀️" },
  { type: "tension", label: "Tension", color: "#E87461", icon: "⚡" },
  { type: "grief", label: "Grief", color: "#8B9DC3", icon: "💧" },
  { type: "neutral", label: "Neutral", color: "#A8A8A8", icon: "○" },
];
