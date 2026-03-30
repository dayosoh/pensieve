"use client";

import { EMOTION_OPTIONS, type EmotionType } from "@/types/events";

interface EmotionPickerProps {
  selected: EmotionType | null;
  onSelect: (emotion: EmotionType | null) => void;
}

export function EmotionPicker({ selected, onSelect }: EmotionPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-caption text-sm text-text-secondary">
        How are you feeling?
      </span>
      <div className="flex gap-2">
        {EMOTION_OPTIONS.map((opt) => (
          <button
            key={opt.type}
            onClick={() =>
              onSelect(selected === opt.type ? null : opt.type)
            }
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-pill text-sm font-body
              border transition-standard
              ${
                selected === opt.type
                  ? "border-transparent text-white"
                  : "border-text-tertiary/20 bg-surface text-text-secondary hover:bg-surface-elevated"
              }
            `}
            style={
              selected === opt.type
                ? { backgroundColor: opt.color }
                : undefined
            }
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
