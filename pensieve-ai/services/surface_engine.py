"""
Pensieve surfacing algorithm.

Determines which thoughts to resurface and when.
Subscribes to ThoughtCaptured and ThoughtLabelled events
to build the surfacing pool.

TODO: Implement weighted random surfacing with:
- Recency decay (older = more interesting to resurface)
- Emotion diversity (don't surface 5 sad entries in a row)
- "On this day" matching by date
- Label-based clustering for thematic resurfacing
- User feedback loop (dismissed = lower weight)
"""
