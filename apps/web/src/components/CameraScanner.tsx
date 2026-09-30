import { useEffect, useRef, useState } from 'react';

interface Props {
  onCapture: (dataUrl: string) => void;
  onCancel?: () => void;
}

export default function CameraScanner({ onCapture, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStreaming(true);
        }
      } catch (e) {
        setError('Tidak bisa mengakses kamera: ' + (e as Error).message);
      }
    }

    start();

    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCaptured(canvas.toDataURL('image/jpeg', 0.85));
  };

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden">
      <div className="relative aspect-video bg-black flex items-center justify-center">
        {!captured && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
        )}
        {captured && (
          <img src={captured} alt="capture" className="w-full h-full object-cover" />
        )}
        {error && (
          <div className="text-red-400 text-sm p-4 text-center">{error}</div>
        )}
        <canvas ref={canvasRef} className="hidden" />

        {!streaming && !error && !captured && (
          <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm">
            Memuat kamera...
          </div>
        )}
      </div>

      <div className="p-3 flex items-center gap-2 justify-center bg-slate-800">
        {!captured && (
          <button
            type="button"
            onClick={capture}
            disabled={!streaming}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-600 text-white rounded-lg text-sm font-medium"
          >
            📸 Ambil Foto
          </button>
        )}
        {captured && (
          <>
            <button
              type="button"
              onClick={() => setCaptured(null)}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium"
            >
              🔄 Ulangi
            </button>
            <button
              type="button"
              onClick={() => onCapture(captured)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
            >
              ✓ Gunakan Foto
            </button>
          </>
        )}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium ml-auto"
          >
            Tutup
          </button>
        )}
      </div>
    </div>
  );
}