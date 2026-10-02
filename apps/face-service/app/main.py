"""
Face Service - FastAPI wrapper untuk InsightFace.

Endpoint:
- GET  /health        -> cek status service
- POST /enroll        -> extract embedding dari foto
- POST /recognize     -> cek apakah wajah cocok dengan salah satu embedding di DB
- POST /detect        -> deteksi wajah saja (untuk debugging)
"""

import base64
import logging
import time
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .face_engine import get_engine, cosine_similarity

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("face-service")


# ============================================================
# Lifespan: load model saat startup
# ============================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Face Service...")
    engine = get_engine()
    try:
        engine.load()
        logger.info("Face Engine ready")
    except Exception as e:
        logger.error(f"Gagal load model: {e}")
        logger.warning("Service tetap jalan, tapi /enroll dan /recognize akan error")
    yield
    logger.info("Shutting down Face Service")


app = FastAPI(
    title="Face Service",
    version="0.1.0",
    description="InsightFace wrapper untuk Buku Tamu Digital",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Models
# ============================================================
class EmbeddingResponse(BaseModel):
    ok: bool
    embedding: Optional[list] = None
    quality: Optional[float] = None
    error: Optional[str] = None


class RecognizeRequest(BaseModel):
    image: str  # base64 (dengan atau tanpa data URL prefix)
    candidates: list[dict]  # [{ guestId: str, embedding: list }]


class RecognizeResponse(BaseModel):
    ok: bool
    matched: bool
    similarity: float
    guestId: Optional[str] = None
    error: Optional[str] = None


# ============================================================
# Helper
# ============================================================
def _strip_data_url(s: str) -> str:
    """Hapus prefix 'data:image/...;base64,' kalau ada."""
    if "," in s and s.startswith("data:"):
        return s.split(",", 1)[1]
    return s


def _b64_to_bytes(s: str) -> bytes:
    try:
        return base64.b64decode(_strip_data_url(s))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Base64 invalid: {e}")


# ============================================================
# Endpoints
# ============================================================
@app.get("/health")
def health():
    engine = get_engine()
    return {
        "status": "ok",
        "model_ready": engine.ready,
        "model_name": engine.model_name,
        "ts": int(time.time() * 1000),
    }


@app.post("/enroll", response_model=EmbeddingResponse)
async def enroll(file: UploadFile = File(...)):
    """
    Terima file foto, return embedding 512-dim.
    Untuk endpoint multipart/form-data.
    """
    engine = get_engine()
    if not engine.ready:
        return EmbeddingResponse(ok=False, error="Model belum siap")

    contents = await file.read()
    if len(contents) < 100:
        return EmbeddingResponse(ok=False, error="File terlalu kecil")

    try:
        emb, quality = engine.extract_embedding(contents)
        if emb is None:
            return EmbeddingResponse(ok=False, error="Wajah tidak terdeteksi")
        return EmbeddingResponse(ok=True, embedding=emb, quality=quality)
    except Exception as e:
        logger.error(f"Enroll error: {e}")
        return EmbeddingResponse(ok=False, error=str(e))


@app.post("/enroll-base64", response_model=EmbeddingResponse)
async def enroll_base64(payload: dict):
    """
    Terima foto dalam bentuk JSON base64.
    Body: { "image": "data:image/jpeg;base64,..." }
    """
    engine = get_engine()
    if not engine.ready:
        return EmbeddingResponse(ok=False, error="Model belum siap")

    image_b64 = payload.get("image")
    if not image_b64:
        return EmbeddingResponse(ok=False, error="Field 'image' wajib")

    try:
        contents = _b64_to_bytes(image_b64)
        emb, quality = engine.extract_embedding(contents)
        if emb is None:
            return EmbeddingResponse(ok=False, error="Wajah tidak terdeteksi")
        return EmbeddingResponse(ok=True, embedding=emb, quality=quality)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Enroll base64 error: {e}")
        return EmbeddingResponse(ok=False, error=str(e))


@app.post("/recognize", response_model=RecognizeResponse)
async def recognize(payload: RecognizeRequest):
    """
    Terima foto base64 + list kandidat embedding dari DB.
    Return kandidat terdekat kalau similarity >= 0.5.
    """
    engine = get_engine()
    if not engine.ready:
        return RecognizeResponse(
            ok=False, matched=False, similarity=0.0, error="Model belum siap"
        )

    try:
        contents = _b64_to_bytes(payload.image)
    except HTTPException as e:
        return RecognizeResponse(
            ok=False, matched=False, similarity=0.0, error=str(e.detail)
        )

    try:
        emb, _ = engine.extract_embedding(contents)
    except Exception as e:
        return RecognizeResponse(
            ok=False, matched=False, similarity=0.0, error=str(e)
        )

    if emb is None:
        return RecognizeResponse(
            ok=False, matched=False, similarity=0.0, error="Wajah tidak terdeteksi"
        )

    if not payload.candidates:
        return RecognizeResponse(ok=True, matched=False, similarity=0.0)

    # Cari kandidat dengan similarity tertinggi
    THRESHOLD = 0.5  # cosine similarity threshold
    best_id: Optional[str] = None
    best_sim = 0.0

    for c in payload.candidates:
        cand_emb = c.get("embedding")
        cand_id = c.get("guestId")
        if not cand_emb or not cand_id:
            continue
        sim = cosine_similarity(emb, cand_emb)
        if sim > best_sim:
            best_sim = sim
            best_id = cand_id

    matched = best_sim >= THRESHOLD
    logger.info(
        f"Recognize: best_sim={best_sim:.3f} matched={matched} guestId={best_id}"
    )

    return RecognizeResponse(
        ok=True,
        matched=matched,
        similarity=round(best_sim, 4),
        guestId=best_id if matched else None,
    )


@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    """Deteksi wajah saja (bbox + score). Untuk debugging."""
    engine = get_engine()
    if not engine.ready:
        return {"ok": False, "error": "Model belum siap"}

    contents = await file.read()
    try:
        result = engine.detect_only(contents)
        return result
    except Exception as e:
        return {"ok": False, "error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)