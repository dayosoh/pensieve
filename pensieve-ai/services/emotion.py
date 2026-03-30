"""
Emotion inference service.

POST /api/v1/emotion — takes entry text, returns inferred emotion.

In production, this will use sentiment analysis or an LLM.
Currently returns stub responses.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Literal

router = APIRouter()

EmotionType = Literal["calm", "joy", "tension", "grief", "neutral"]


class EmotionRequest(BaseModel):
    """Request to infer emotion from text."""
    thought_id: str
    content: str


class EmotionResponse(BaseModel):
    """Response with inferred emotion."""
    thought_id: str
    emotion: EmotionType
    confidence: float
    intensity: float  # 0.0-1.0, for Phase 2 heatmaps


@router.post("/emotion", response_model=EmotionResponse)
async def infer_emotion(request: EmotionRequest) -> EmotionResponse:
    """
    Infer the emotional tone of a thought entry.

    TODO: Integrate with sentiment analysis model or LLM.
    Current implementation returns neutral as a placeholder.
    """
    emotion, confidence, intensity = _stub_infer(request.content)

    return EmotionResponse(
        thought_id=request.thought_id,
        emotion=emotion,
        confidence=confidence,
        intensity=intensity,
    )


def _stub_infer(content: str) -> tuple[EmotionType, float, float]:
    """Placeholder emotion inference. Replace with real model."""
    # Simple keyword-based stub
    content_lower = content.lower()

    emotion_signals: dict[EmotionType, list[str]] = {
        "joy": ["happy", "excited", "great", "love", "amazing", "wonderful", "glad"],
        "calm": ["peaceful", "relaxed", "quiet", "serene", "content", "steady"],
        "tension": ["stressed", "anxious", "worried", "angry", "frustrated", "overwhelmed"],
        "grief": ["sad", "miss", "lost", "hurt", "lonely", "disappointed"],
    }

    for emotion, signals in emotion_signals.items():
        if any(signal in content_lower for signal in signals):
            return emotion, 0.0, 0.5  # Stub confidence

    return "neutral", 0.0, 0.3
