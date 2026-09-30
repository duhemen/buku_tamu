import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface Props {
  onDetected: (text: string) => void;
  onClose: () => void;
}

const SCANNER_ID = 'qr-scanner-region';

export default function QRScanner({ onDetected, onClose }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  const detectedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const scanner = new Html5Qrcode(SCANNER_ID, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
          ],
          verbose: false,
        });
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 260, height: 260 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (detectedRef.current) return;
            detectedRef.current = true;
            stopScanner().then(() => onDetected(decodedText));
          },
          () => {
            // ignore per-frame errors
          }
        );

        if (!cancelled) setStarting(false);
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message || 'Tidak bisa mengakses kamera');
          setStarting(false);
        }
      }
    }

    async function stopScanner() {
      try {
        if (scannerRef.current) {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        }
      } catch {
        // ignore
      }
    }

    start();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [onDetected]);

  const handleClose = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      }
    } catch {
      // ignore
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl overflow-hidden w-full max-w-md">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Scan QR Kartu Tamu</h3>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
          >
            x
          </button>
        </div>

        <div className="relative">
          <div id={SCANNER_ID} className="w-full bg-black" style={{ minHeight: 320 }} />

          {starting && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white pointer-events-none">
              <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-3" />
              <div className="text-sm">Memuat kamera...</div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white p-6 text-center">
              <div className="text-4xl mb-3">!</div>
              <p className="text-sm mb-2">{error}</p>
              <p className="text-xs text-white/60">
                Pastikan situs diakses via HTTPS dan izin kamera diberikan.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50">
          <button
            onClick={handleClose}
            className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium text-sm"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}