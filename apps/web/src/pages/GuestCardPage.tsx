import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import GuestCard from '@/components/GuestCard';
import HandoverReceipt from '@/components/HandoverReceipt';
import { getVisit } from '@/services/visit.service';
import { listHandovers, Handover } from '@/services/handover.service';
import type { Visit } from '@/types';

type PrintMode = 'card' | 'handover' | 'both';

export default function GuestCardPage() {
  const { visitId } = useParams<{ visitId: string }>();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [printMode, setPrintMode] = useState<PrintMode>('card');
  const navigate = useNavigate();

  useEffect(() => {
    if (!visitId) return;
    (async () => {
      try {
        const v = await getVisit(visitId);
        setVisit(v);
        const stored = localStorage.getItem('bt_photo_' + visitId);
        if (stored) setPhoto(stored);
        try {
          const all = await listHandovers({ limit: 100 });
          setHandovers(all.filter((h) => h.visitId === visitId));
        } catch {
          // ignore
        }
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, [visitId]);

  const handlePrint = (mode: PrintMode) => {
    setPrintMode(mode);
    setTimeout(() => {
      document.body.setAttribute('data-print-mode', mode);
      window.print();
    }, 100);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-red-200 dark:border-red-800 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Link to="/kiosk" className="text-brand-600 hover:underline">
            Kembali ke Kiosk
          </Link>
        </div>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="text-slate-500">Memuat...</div>
      </div>
    );
  }

  const queueNumber = visit.queue?.number ?? '-';
  const hasHandover = handovers.length > 0;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="no-print bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center mb-6">
          <div className="text-4xl mb-2">OK</div>
          <h1 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-1">
            Pendaftaran Berhasil
          </h1>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Nomor antrean Anda: <strong className="text-2xl">{queueNumber}</strong>
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
            Silakan menuju bagian yang dituju atau tunggu dipanggil.
          </p>
          {hasHandover && (
            <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800">
              <div className="text-xs text-emerald-700 dark:text-emerald-300">
                Plus {handovers.length} bukti terima siap dicetak
              </div>
            </div>
          )}
        </div>

        {/* Preview kartu tamu */}
        <div
          className={
            'bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden mb-4 ' +
            (printMode === 'handover' ? 'print-hide' : '')
          }
        >
          <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2 text-xs text-slate-500 text-center no-print">
            Kartu Tamu
          </div>
          <div className="py-4 px-2">
            <GuestCard visit={visit} photo={photo} />
          </div>
        </div>

        {/* Preview handover receipt */}
        {hasHandover &&
          handovers.map((h) => (
            <div
              key={h.id}
              className={
                'bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden mb-4 ' +
                (printMode === 'card' ? 'print-hide' : '')
              }
            >
              <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-xs text-amber-700 dark:text-amber-300 text-center no-print">
                Bukti Terima {h.code}
              </div>
              <div className="py-4 px-2">
                <HandoverReceipt
                  handover={h}
                  guestName={visit.guest?.fullName ?? ''}
                  guestCompany={visit.guest?.company}
                  queueNumber={queueNumber}
                />
              </div>
            </div>
          ))}

        {/* Actions */}
        <div className="no-print space-y-3">
          {hasHandover ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handlePrint('card')}
                  className="py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
                >
                  Cetak Kartu
                </button>
                <button
                  onClick={() => handlePrint('handover')}
                  className="py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
                >
                  Cetak Bukti
                </button>
              </div>
              <button
                onClick={() => handlePrint('both')}
                className="w-full py-3 bg-slate-700 hover:bg-slate-800 text-white font-medium rounded-xl transition"
              >
                Cetak Semua
              </button>
            </>
          ) : (
            <button
              onClick={() => handlePrint('card')}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition"
            >
              Cetak Kartu
            </button>
          )}

          <Link
            to="/kiosk"
            className="block w-full py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition text-center"
          >
            Daftarkan Tamu Lain
          </Link>

          <button
            onClick={() => navigate('/admin')}
            className="w-full py-2 text-sm text-slate-500 hover:text-brand-600"
          >
            Buka Admin Panel
          </button>
        </div>

        <p className="no-print text-center text-xs text-slate-400 mt-4">
          Dicetak pada {new Date().toLocaleString('id-ID')}
        </p>
      </div>
    </div>
  );
}