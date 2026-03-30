"use client";

import { useState } from "react";
import { EmotionPicker } from "@/components/capture/EmotionPicker";
import { ImageUpload } from "@/components/capture/ImageUpload";
import { useThoughtStore } from "@/store/thoughts";
import type { EmotionType } from "@/types/events";

export default function CapturePage() {
  const [content, setContent] = useState("");
  const [emotion, setEmotion] = useState<EmotionType | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const addThought = useThoughtStore((s) => s.addThought);

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) return;

    setIsSaving(true);
    try {
      await addThought({
        content: content.trim(),
        captureType: imageFile ? "image" : "text",
        emotion: emotion ?? undefined,
        mediaFile: imageFile ?? undefined,
      });
      setContent("");
      setEmotion(null);
      setImageFile(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold">Capture</h1>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full min-h-[160px] p-4 rounded-lg bg-surface border border-text-tertiary/20 font-body text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-standard"
        autoFocus
      />

      <EmotionPicker selected={emotion} onSelect={setEmotion} />

      <ImageUpload onFileSelected={setImageFile} selectedFile={imageFile} />

      <button
        onClick={handleSubmit}
        disabled={isSaving || (!content.trim() && !imageFile)}
        className="w-full py-4 rounded-lg bg-primary text-background font-heading text-lg font-medium disabled:opacity-40 hover:opacity-90 transition-standard"
      >
        {isSaving ? "Saving..." : "Save thought"}
      </button>
    </div>
  );
}
