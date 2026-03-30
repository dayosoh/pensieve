// Package queries implements the read side of CQRS.
// Query handlers read from optimized projections, never from the event log directly.
package queries

// TODO: Implement query handlers for read models:
// - TimelineView: all entries, reverse chronological
// - DigestView: entries grouped by day/week
// - TagIndex: entries by label
// - EmotionIndex: entries by emotion type
// - PensieveSurface: weighted random surfacing pool
