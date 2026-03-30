# Pensieve — Build Status

**Date:** 2026-03-28
**Phase:** 1 (Private Mind Layer)
**Status:** Scaffold complete — ready for implementation

---

## What Was Built

### shared/
- **Event schema definitions** (TypeScript) covering all 7 domain event types: ThoughtCaptured, EmotionTagged, ThoughtLabelled, ThoughtResurfaced, NudgeTriggered, ThoughtDeleted, UserSignedIn
- **Read model types**: ThoughtEntry, EmotionTag, NudgeConfig, SyncEvent
- Forward-compatible: location field (Phase 2), intensity field (Phase 2 heatmaps), vector clock (Phase 3 multi-device)
- Emotion palette constants with colors, labels, and icons

### pensieve-backend/ (Go)
- Full project scaffold following `cmd/internal/pkg` convention
- **SQLite event store** with full CRUD: Append, GetByID, List, GetEventsSince
- WAL mode enabled for concurrent read/write performance
- **HTTP API** with routes:
  - `POST /api/v1/events` — append event
  - `GET /api/v1/events` — list with pagination and type filter
  - `GET /api/v1/events/{id}` — get single event
  - `POST /api/v1/sync` — batch sync with idempotent duplicate handling
  - `GET /api/v1/health` — health check
- CORS middleware included
- Stub packages for: commands, queries, projections, sync, auth

### pensieve-web/ (Next.js 14)
- App Router with TypeScript and Tailwind CSS
- **Design tokens** fully defined as CSS custom properties (light + dark mode):
  - Colors: background, surface, elevated, primary, secondary, emotion palette
  - Typography: display, heading, body, caption, mono
  - Spacing: 4pt base grid
  - Border radius: sm/md/lg/pill
  - Motion: fast/base/slow durations, standard/spring easing
- **Core pages:**
  - Home page with navigation to Capture, Timeline, Pensieve
  - **Capture page**: text input, EmotionPicker component, ImageUpload component, connected to store
  - **Timeline page**: fetches from backend, renders EntryRow components, empty state
  - **Pensieve mode page**: random thought resurfacing with dismiss/next flow
- **Components:** EmotionPicker, ImageUpload, EntryRow, Button (design system)
- **State management:** Zustand store with optimistic updates (local-first pattern)
- **API client:** typed fetch wrapper for all backend endpoints
- **Hooks:** useMediaQuery, useDarkMode

### pensieve-ai/ (Python FastAPI)
- FastAPI service scaffold on port 8081
- **POST /api/v1/label** — auto-labelling endpoint with keyword-based stub
- **POST /api/v1/emotion** — emotion inference endpoint with keyword-based stub
- Surfacing engine placeholder (weighted random algorithm spec)
- Event consumer placeholder (poll-based, to be replaced with NATS)
- Health check endpoint

### pensieve-ios/
- Directory created, awaiting Swift/Xcode project setup

---

## Key Decisions

1. **SQLite over PostgreSQL for Phase 1** — The context file specifies PostgreSQL, but for local-first development and the scaffold phase, SQLite is used. The event store interface is abstracted so swapping to PostgreSQL requires only a new implementation of the same methods. This matches the local-first principle.

2. **Zustand for web state** — Lightweight, no boilerplate, works well with the optimistic update pattern needed for local-first.

3. **Stub AI services** — Labeller and emotion inference use simple keyword matching. Designed to be swapped for LLM or fine-tuned model calls without changing the API contract.

4. **Event store is the single write path** — All mutations go through event append. No direct state updates anywhere. This is enforced by the architecture.

5. **Sync is idempotent** — Duplicate events (same ID) are silently skipped. This supports offline queue flush without conflict.

---

## What's Next

### Immediate (Phase 1 implementation)
1. **Install dependencies and verify builds** — `npm install` for web, `go mod tidy` for backend, `pip install` for AI
2. **Implement CQRS command handlers** — Wire up the command layer to produce events from API calls
3. **Build read model projections** — Timeline, digest, tag index, emotion index, pensieve surface pool
4. **Connect AI pipeline** — Event consumer polls backend, triggers labelling, posts ThoughtLabelled events back
5. **Add auth** — Apple Sign In validation, JWT middleware, anonymous mode with 10-thought limit
6. **iOS project setup** — Xcode project, SwiftData models, lock screen widget

### Later (Phase 1 completion)
- Nudge system (notification scheduling)
- Digest views (daily/weekly)
- Voice capture with transcription
- CRDT sync logic
- WebSocket real-time updates
- Search by tag/keyword
