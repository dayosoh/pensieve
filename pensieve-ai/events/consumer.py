"""
Event consumer — polls the Go backend for new ThoughtCaptured events
and triggers auto-labelling and emotion inference.

In production, this would subscribe to an event bus (NATS).
For Phase 1, we poll the backend API.

TODO: Implement:
- Polling loop with configurable interval
- Event deduplication (track last processed sequence number)
- Call labeller and emotion services for each new thought
- Produce ThoughtLabelled events back to the backend
"""
