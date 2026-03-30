"use client";

import { useState, useCallback } from "react";
import { EntryRow } from "@/components/timeline/EntryRow";
import { useThoughtStore } from "@/store/thoughts";
import type { ThoughtEntry } from "@/types/events";

export default function PensieveModePage() {
  const thoughts = useThoughtStore((s) => s.thoughts);
  const [surfaced, setSurfaced] = useState<ThoughtEntry | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const surfaceRandom = useCallback(() => {
    const available = thoughts.filter(
      (t) => !t.deleted && !dismissed.has(t.id)
    );
    if (available.length === 0) {
      setSurfaced(null);
      return;
    }
    const idx = Math.floor(Math.random() * available.length);
    setSurfaced(available[idx]);
  }, [thoughts, dismissed]);

  const dismiss = useCallback(() => {
    if (surfaced) {
      setDismissed((prev) => new Set([...prev, surfaced.id]));
      setSurfaced(null);
    }
  }, [surfaced]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold mb-2">
          Pensieve Mode
        </h1>
        <p className="text-text-secondary font-body">
          Resurface a memory from your mind
        </p>
      </div>

      {surfaced ? (
        <div className="w-full max-w-md flex flex-col gap-4">
          <EntryRow entry={surfaced} expanded />
          <div className="flex gap-3">
            <button
              onClick={dismiss}
              className="flex-1 py-3 rounded-lg bg-surface border border-text-tertiary/20 font-body text-text-secondary hover:bg-surface-elevated transition-standard"
            >
              Dismiss
            </button>
            <button
              onClick={surfaceRandom}
              className="flex-1 py-3 rounded-lg bg-primary text-background font-body font-medium hover:opacity-90 transition-standard"
            >
              Another
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={surfaceRandom}
          disabled={thoughts.length === 0}
          className="px-8 py-4 rounded-lg bg-primary text-background font-heading text-lg font-medium disabled:opacity-40 hover:opacity-90 transition-standard"
        >
          {thoughts.length === 0
            ? "No thoughts to resurface"
            : "Resurface a thought"}
        </button>
      )}
    </div>
  );
}
