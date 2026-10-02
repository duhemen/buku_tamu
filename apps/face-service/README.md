# Face Service

Microservice Python FastAPI untuk deteksi + recognition wajah menggunakan **InsightFace** (model `buffalo_l`).

Dipakai oleh Buku Tamu Digital untuk auto-fill data tamu lama di kiosk.

---

## Fitur

| Endpoint | Method | Fungsi |
|---|---|---|
| `/health` | GET | Cek service + status model |
| `/enroll` | POST | Extract embedding dari foto (multipart) |
| `/enroll-base64` | POST | Extract embedding dari foto (JSON base64) |
| `/recognize` | POST | Cari kandidat terdekat dari list embedding |
| `/detect` | POST | Deteksi wajah saja (bbox + score) |

**Model InsightFace:**
- Detection: SCRFD (`det_10g.onnx`)
- Recognition: ArcFace (`w600k_r50.onnx`)
- Embedding: 512-dim float

**Akurasi:** ~99.8% (LFW benchmark)

**Threshold similarity:** 0.5 (cosine)

---

## Setup

### Prasyarat

- Python 3.11 (**bukan** 3.12+, karena InsightFace belum support)
- ~2 GB disk (dependencies + model)
- Koneksi internet untuk download model pertama kali

### Instalasi

```powershell
cd C:\buku_tamu\apps\face-service

# Buat virtual environment
py -3.11 -m venv .venv

# Install dependencies
.venv\Scripts\python.exe -m pip install -r requirements.txt