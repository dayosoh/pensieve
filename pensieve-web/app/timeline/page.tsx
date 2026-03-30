"use client";

import { useEffect } from "react";
import { EntryRow } from "@/components/timeline/EntryRow";
import { useThoughtStore } from "@/store/thoughts";

export default function TimelinePage() {
  const thoughts = useThoughtStore((s) => s.thoughts);
  const fetchThoughts = useThoughtStore((s) => s.fetchThoughts);
  const isLoading = useThoughtStore((s) => s.isLoading);

  useEffect(() => {
    fetchThoughts();
  }, [fetchThoughts]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold">Timeline</h1>

      {isLoading && (
        <p className="text-text-tertiary font-body">Loading thoughts...</p>
      )}

      {!isLoading && thoughts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-text-secondary font-body text-lg">
            No thoughts yet
          </p>
          <p className="text-text-tertiary font-caption">
            Capture your first thought to see it here
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {thoughts.map((thought) => (
          <EntryRow key={thought.id} entry={thought} />
        ))}
      </div>
    </div>
  );
}
