"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight mb-3">
          Pensieve
        </h1>
        <p className="font-body text-text-secondary text-lg">
          Your personal mind companion
        </p>
      </div>

      <nav className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/capture"
          className="flex items-center justify-center px-6 py-4 rounded-lg bg-surface border border-text-tertiary/20 hover:bg-surface-elevated transition-standard text-center"
        >
          <span className="font-heading text-lg">Capture a thought</span>
        </Link>
        <Link
          href="/timeline"
          className="flex items-center justify-center px-6 py-4 rounded-lg bg-surface border border-text-tertiary/20 hover:bg-surface-elevated transition-standard text-center"
        >
          <span className="font-heading text-lg">Timeline</span>
        </Link>
        <Link
          href="/pensieve"
          className="flex items-center justify-center px-6 py-4 rounded-lg bg-surface border border-text-tertiary/20 hover:bg-surface-elevated transition-standard text-center"
        >
          <span className="font-heading text-lg">Pensieve mode</span>
        </Link>
      </nav>
    </div>
  );
}
