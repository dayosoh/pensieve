"use client";

import type { ThoughtEntry } from "@/types/events";
import { EMOTION_OPTIONS } from "@/types/events";

interface EntryRowProps {
  entry: ThoughtEntry;
  expanded?: boolean;
}

export function EntryRow({ entry, expanded = false }: EntryRowProps) {
  const emotionMeta = entry.emotion
    ? EMOTION_OPTIONS.find((e) => e.type === entry.emotion)
    : null;

  const dateStr = new Date(entry.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg bg-surface border border-text-tertiary/10 transition-standard hover:border-text-tertiary/25">
      <div className="flex items-center justify-between">
        <span className="font-caption text-xs text-text-tertiary">
          {dateStr}
        </span>
        {emotionMeta && (
          <span
            className="flex items-center gap-1 text-xs font-caption px-2 py-0.5 rounded-pill"
            style={{ backgroundColor: emotionMeta.color + "22", color: emotionMeta.color }}
          >
            {emotionMeta.icon} {emotionMeta.label}
          </span>
        )}
      </div>

      <p
        className={`font-body text-text-primary ${
          expanded ? "" : "line-clamp-3"
        }`}
      >
        {entry.content}
      </p>

      {entry.labels.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {entry.labels.map((label) => (
            <span
              key={label}
              className="text-xs font-caption px-2 py-0.5 rounded-pill bg-surface-elevated text-text-secondary"
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
