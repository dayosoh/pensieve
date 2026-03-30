// Package commands implements the write side of CQRS.
// Each command handler validates input, produces events, and appends them to the store.
package commands

// TODO: Implement command handlers for:
// - CaptureThought -> produces ThoughtCaptured event
// - TagEmotion -> produces EmotionTagged event
// - LabelThought -> produces ThoughtLabelled event
// - DeleteThought -> produces ThoughtDeleted event
// - TriggerNudge -> produces NudgeTriggered event
// - SignIn -> produces UserSignedIn event
