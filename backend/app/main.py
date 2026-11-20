"""ShieldText FastAPI Application Server."""

import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.app.routes import predict, batch, metrics, visualizations, info

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ShieldText API",
    description="NLP-Based Cyberbullying Detection and Classification System (CSE472 Academic Project)",
    version="1.0.0",
)

# CORS setup for React frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API route modules
app.include_router(predict.router)
app.include_router(batch.router)
app.include_router(metrics.router)
app.include_router(visualizations.router)
app.include_router(info.router)


@app.get("/api")
def api_root():
    """API root status and metadata."""
    return {
        "project": "ShieldText",
        "description": "NLP-Based Cyberbullying Detection & Multi-Class Classification System",
        "course": "CSE472 — Deep Learning for Natural Language Processing",
        "status": "Online",
        "docs_url": "/docs",
    }


@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "healthy"}


# Mount Frontend production build if available
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")

if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Do not catch API routes or Swagger docs
        if full_path.startswith("api") or full_path in ["docs", "openapi.json", "health"]:
            return None
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    @app.get("/")
    def root():
        """Root status and API metadata when frontend build is not found."""
        return {
            "project": "ShieldText",
            "description": "NLP-Based Cyberbullying Detection & Multi-Class Classification System",
            "course": "CSE472 — Deep Learning for Natural Language Processing",
            "status": "Online",
            "docs_url": "/docs",
        }
