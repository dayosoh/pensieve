"""
Auto-labelling service.

POST /api/v1/label — takes entry text, returns topic labels.

In production, this will use an LLM or fine-tuned classifier.
Currently returns stub responses for scaffolding.
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class LabelRequest(BaseModel):
    """Request to label a thought entry."""
    thought_id: str
    content: str
    capture_type: str = "text"


class LabelResponse(BaseModel):
    """Response with auto-generated labels."""
    thought_id: str
    labels: list[str]
    source: str = "ai"
    confidence: float


@router.post("/label", response_model=LabelResponse)
async def label_thought(request: LabelRequest) -> LabelResponse:
    """
    Auto-label a thought entry by topic.

    TODO: Integrate with LLM or fine-tuned classifier.
    Current implementation returns placeholder labels based on content length.
    """
    # Stub: generate placeholder labels
    labels = _stub_label(request.content)

    return LabelResponse(
        thought_id=request.thought_id,
        labels=labels,
        source="ai",
        confidence=0.0,  # Stub confidence
    )


def _stub_label(content: str) -> list[str]:
    """Placeholder labelling logic. Replace with real ML model."""
    labels = []

    # Simple keyword-based stub for development
    keywords = {
        "work": ["work", "meeting", "project", "deadline", "office"],
        "personal": ["family", "friend", "home", "weekend", "dinner"],
        "idea": ["idea", "think", "maybe", "what if", "could"],
        "task": ["todo", "need to", "must", "should", "remember"],
        "reflection": ["feel", "realized", "learned", "grateful", "wonder"],
    }

    content_lower = content.lower()
    for label, triggers in keywords.items():
        if any(trigger in content_lower for trigger in triggers):
            labels.append(label)

    if not labels:
        labels.append("uncategorized")

    return labels
