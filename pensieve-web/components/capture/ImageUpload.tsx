"use client";

import { useRef } from "react";

interface ImageUploadProps {
  onFileSelected: (file: File | null) => void;
  selectedFile: File | null;
}

export function ImageUpload({ onFileSelected, selectedFile }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          onFileSelected(file);
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-text-tertiary/40 text-text-secondary font-body hover:bg-surface-elevated transition-standard"
      >
        {selectedFile ? (
          <span>
            {selectedFile.name}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileSelected(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="ml-2 text-text-tertiary hover:text-emotion-tension"
            >
              Remove
            </button>
          </span>
        ) : (
          <span>Add an image</span>
        )}
      </button>
    </div>
  );
}
