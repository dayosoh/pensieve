// Package sync implements CRDT-based multi-device synchronization.
// Devices push events with vector clocks; the server merges conflict-free.
package sync

// TODO: Implement:
// - Vector clock merge logic
// - Event deduplication by ID
// - Conflict-free merge for concurrent edits
// - Device registration and last-seen tracking
// - Batch sync endpoint logic (receive events, merge, return missing events)
