// Package projections builds and maintains read models from the event stream.
// Projections subscribe to events and update denormalized views optimized for queries.
package projections

// TODO: Implement projection builders:
// - TimelineProjection: maintains timeline_view
// - DigestProjection: maintains digest_view
// - TagProjection: maintains tag_index
// - EmotionProjection: maintains emotion_index
// - SurfaceProjection: maintains pensieve_surface (weighted random pool)
