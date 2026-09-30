from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import cv2
import io
from PIL import Image

app = FastAPI(title='Face Service', version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

# Placeholder - model akan di-load saat produksi
FACE_MODEL_READY = False

class EnrollResponse(BaseModel):
    ok: bool
    embedding: list
    quality: float

class RecognizeResponse(BaseModel):
    ok: bool
    matched: bool
    similarity: float
    guestId: str | None = None

@app.get('/health')
def health():
    return {'status': 'ok', 'model_ready': FACE_MODEL_READY}

@app.post('/enroll', response_model=EnrollResponse)
async def enroll(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        img = Image.open(io.BytesIO(contents)).convert('RGB')
        arr = np.array(img)
        gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
        faces = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        ).detectMultiScale(gray, 1.1, 4)
        if len(faces) == 0:
            raise HTTPException(400, 'Wajah tidak terdeteksi')
        # Placeholder embedding - nanti ganti dengan InsightFace
        embedding = np.random.rand(512).astype(np.float32).tolist()
        return EnrollResponse(ok=True, embedding=embedding, quality=0.85)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post('/recognize', response_model=RecognizeResponse)
async def recognize(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        img = Image.open(io.BytesIO(contents)).convert('RGB')
        arr = np.array(img)
        gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
        faces = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        ).detectMultiScale(gray, 1.1, 4)
        if len(faces) == 0:
            return RecognizeResponse(ok=False, matched=False, similarity=0)
        # Placeholder - nanti bandingkan dengan embedding tersimpan
        return RecognizeResponse(ok=True, matched=False, similarity=0.0)
    except Exception as e:
        raise HTTPException(500, str(e))