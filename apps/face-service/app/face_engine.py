"""
Face Engine - InsightFace wrapper untuk Buku Tamu Digital.

Model yang dipakai: buffalo_l (detection + recognition)
- Detection: SCRFD
- Recognition: ArcFace (512-dim embedding)

Model akan auto-download (~300 MB) saat pertama kali dipakai.
Tersimpan di ~/.insightface/models/buffalo_l/
"""

import logging
import time
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
from insightface.app import FaceAnalysis

logger = logging.getLogger(__name__)


class FaceEngine:
    """Singleton wrapper untuk InsightFace."""

    def __init__(
        self,
        model_name: str = "buffalo_l",
        det_size: tuple = (640, 640),
        ctx_id: int = -1,  # -1 = CPU, 0+ = GPU
    ):
        self.model_name = model_name
        self.det_size = det_size
        self.ctx_id = ctx_id
        self.app: Optional[FaceAnalysis] = None
        self._ready = False

    def load(self) -> None:
        """Load model InsightFace. Auto-download jika belum ada."""
        if self._ready:
            logger.info("Model sudah loaded")
            return

        start = time.time()
        logger.info(f"Loading InsightFace model: {self.model_name}")

        self.app = FaceAnalysis(
            name=self.model_name,
            providers=["CPUExecutionProvider"],
        )
        self.app.prepare(ctx_id=self.ctx_id, det_size=self.det_size)

        elapsed = time.time() - start
        logger.info(f"Model loaded dalam {elapsed:.2f} detik")
        self._ready = True

    @property
    def ready(self) -> bool:
        return self._ready

    def _decode_image(self, image_bytes: bytes) -> np.ndarray:
        """Decode bytes menjadi numpy array BGR."""
        arr = np.frombuffer(image_bytes, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Gagal decode gambar - format tidak didukung")
        return img

    def extract_embedding(
        self, image_bytes: bytes
    ) -> tuple[Optional[list], Optional[float]]:
        """
        Ekstrak embedding dari foto.

        Returns:
            (embedding_list, quality_score) atau (None, None) jika gagal.
            embedding_list = 512 float
            quality_score = 0.0 - 1.0 (detection confidence)
        """
        if not self._ready:
            raise RuntimeError("Model belum di-load. Panggil .load() dulu.")

        try:
            img = self._decode_image(image_bytes)
        except ValueError as e:
            logger.warning(f"Decode error: {e}")
            return None, None

        # Detect + extract
        faces = self.app.get(img)

        if not faces:
            logger.info("Tidak ada wajah terdeteksi")
            return None, None

        # Ambil wajah paling besar (paling dekat kamera)
        face = max(faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))

        embedding = face.embedding
        if embedding is None:
            logger.warning("Embedding kosong")
            return None, None

        # Normalize L2
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm

        quality = float(face.det_score) if hasattr(face, "det_score") else 1.0

        return embedding.astype(np.float32).tolist(), quality

    def detect_only(self, image_bytes: bytes) -> dict:
        """
        Deteksi wajah saja tanpa extract embedding.

        Returns: dict dengan info bbox, count, quality.
        """
        if not self._ready:
            raise RuntimeError("Model belum di-load.")

        try:
            img = self._decode_image(image_bytes)
        except ValueError as e:
            return {"ok": False, "error": str(e), "count": 0}

        faces = self.app.get(img)

        return {
            "ok": True,
            "count": len(faces),
            "faces": [
                {
                    "bbox": [float(x) for x in f.bbox],
                    "score": float(f.det_score) if hasattr(f, "det_score") else 1.0,
                }
                for f in faces
            ],
        }


def cosine_similarity(emb1: list, emb2: list) -> float:
    """
    Hitung cosine similarity antara 2 embedding.
    Return nilai 0.0 - 1.0 (makin tinggi = makin mirip).
    """
    a = np.asarray(emb1, dtype=np.float32)
    b = np.asarray(emb2, dtype=np.float32)
    if a.size == 0 or b.size == 0:
        return 0.0
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    sim = float(np.dot(a, b) / (norm_a * norm_b))
    # Clamp ke [0, 1] (cosine biasanya di [-1, 1], tapi untuk embedding ArcFace selalu positif)
    return max(0.0, min(1.0, sim))


# Singleton instance
_engine: Optional[FaceEngine] = None


def get_engine() -> FaceEngine:
    """Get atau init engine singleton."""
    global _engine
    if _engine is None:
        _engine = FaceEngine(model_name="buffalo_l", det_size=(640, 640), ctx_id=-1)
    return _engine