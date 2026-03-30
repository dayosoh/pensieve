import { create } from "zustand";
import { api } from "@/lib/api/client";
import type { ThoughtEntry, EmotionType, CaptureType } from "@/types/events";

interface CaptureInput {
  content: string;
  captureType: CaptureType;
  emotion?: EmotionType;
  mediaFile?: File;
}

interface ThoughtState {
  thoughts: ThoughtEntry[];
  isLoading: boolean;
  error: string | null;
  fetchThoughts: () => Promise<void>;
  addThought: (input: CaptureInput) => Promise<void>;
}

function generateId(): string {
  return crypto.randomUUID();
}

export const useThoughtStore = create<ThoughtState>((set, get) => ({
  thoughts: [],
  isLoading: false,
  error: null,

  fetchThoughts: async () => {
    set({ isLoading: true, error: null });
    const res = await api.listEvents({ limit: 100, type: "ThoughtCaptured" });
    if (res.error) {
      set({ isLoading: false, error: res.error });
      return;
    }

    // Map raw events to ThoughtEntry read model
    const entries: ThoughtEntry[] = (res.data?.events || []).map(
      (evt: any) => ({
        id: evt.id,
        content: evt.data?.content || "",
        captureType: evt.data?.captureType || "text",
        mediaUrl: evt.data?.mediaUrl,
        transcription: evt.data?.transcription,
        emotion: evt.data?.emotion,
        labels: [],
        createdAt: evt.timestamp,
        updatedAt: evt.timestamp,
        deviceId: evt.deviceId || "",
        userId: evt.userId || "",
        deleted: false,
        resurfaceCount: 0,
      })
    );

    set({ thoughts: entries, isLoading: false });
  },

  addThought: async (input) => {
    const now = new Date().toISOString();
    const id = generateId();

    const event = {
      id,
      type: "ThoughtCaptured",
      timestamp: now,
      deviceId: "web-" + generateId().slice(0, 8),
      userId: "",
      sequenceNumber: Date.now(),
      data: {
        content: input.content,
        captureType: input.captureType,
        emotion: input.emotion,
      },
    };

    // Optimistic update
    const newEntry: ThoughtEntry = {
      id,
      content: input.content,
      captureType: input.captureType,
      emotion: input.emotion,
      labels: [],
      createdAt: now,
      updatedAt: now,
      deviceId: event.deviceId,
      userId: "",
      deleted: false,
      resurfaceCount: 0,
    };

    set((state) => ({ thoughts: [newEntry, ...state.thoughts] }));

    // Fire and forget to backend (local-first: UI already updated)
    const res = await api.postEvent(event);
    if (res.error) {
      console.warn("Failed to sync thought to backend:", res.error);
      // In production, queue for retry
    }
  },
}));
