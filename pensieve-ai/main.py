"""
Pensieve AI Service — FastAPI microservice for auto-labelling and emotion inference.

Subscribes to ThoughtCaptured events and produces ThoughtLabelled events.
Runs as an isolated service; communicates with the Go backend via HTTP/events.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.labeller import router as labeller_router
from services.emotion import router as emotion_router

app = FastAPI(
    title="Pensieve AI Service",
    version="0.1.0",
    description="Auto-labelling and emotion inference for Pensieve",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(labeller_router, prefix="/api/v1", tags=["labelling"])
app.include_router(emotion_router, prefix="/api/v1", tags=["emotion"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "pensieve-ai"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8081)
