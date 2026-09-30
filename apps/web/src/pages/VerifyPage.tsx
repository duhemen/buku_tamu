import { FormEvent, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import QRScanner from '@/components/QRScanner';

interface VerifyGuest {
  fullName: string;
  company?: string | null;
  nik: string;
  phone: string;
  email: string;
}

interface VerifyVisit {
  purpose: string;
  destination: string;
  checkInAt: string;
  checkOutAt?: string | null;
  status: string;
}

interface VerifyHandover {
  code: string;
  type: string;
  typeLabel: string;
  statusLabel: string;
  referenceNo?: string | null;
  description: string;
  recipient?: string | null;
  receivedAt: string;
  completedAt?: string | null;
  notes?: string | null;
}

interface VerifyResult {
  ok: boolean;
  kind: 'visit' | 'handover';
  queueNumber: string;
  status: string;
  guest: VerifyGuest;
  visit: VerifyVisit;
  handover: VerifyHandover | null;
  letter: {
    letterNumber?: string | null;
    subject: string;
    sender?: string | null;
    recipient?: string | null;
  } | null;
  receiptNumber: string | null;
}

const VISIT_STATUS_LABEL: Record<string, string> = {
  WAITING: 'Menunggu',
  IN_PROGRESS: 'Diproses',
  DONE: 'Selesai',
  CANCELED: 'Batal',
};

export default function VerifyPage() {
  const { code } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState(code ?? '');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const verify = async (c: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/verify/' + encodeURIComponent(c));
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Kode tidak ditemukan');
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) verify(code);
  }, [code]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    navigate('/verify/' + input.trim().toUpperCase());
  };

  const handleScan = (text: string) => {
    setShowScanner(false);
    let codeValue = text.trim();
    try {
      const parsed = JSON.parse(text);
      if (parsed && parsed.c) codeValue = String(parsed.c);
      else if (parsed && parsed.q) codeValue = String(parsed.q);
    } catch {
      // not JSON, use as-is
    }
    setInput(codeValue.toUpperCase());
    navigate('/verify/' + codeValue.toUpperCase());
  };

  const isHandover = result?.kind === 'handover';

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <div
          className={
            'w-16 h-16 mx-auto rounded-2xl text-white flex items-center justify-center text-3xl mb-4 font-bold ' +
            (isHandover ? 'bg-amber-600' : 'bg-brand-600')
          }
        >
          {isHandover ? 'TT' : 'QR'}
        </div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          Verifikasi
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Scan QR kartu tamu / bukti terima, atau masukkan kode
        </p>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowScanner(true)}
          className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-xl font-medium shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 text-lg"
        >
          <span className="text-2xl">[ ]</span>
          Scan QR dengan Kamera
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs text-slate-400 uppercase tracking-wider">atau</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
      </div>

      <form onSubmit={onSubmit} className="flex gap-2 mb-6">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          placeholder="A-001 atau TT-20260930-001"
          className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-mono text-base text-center tracking-wider"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-xl font-medium"
        >
          {loading ? '...' : 'Cari'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <div className="text-3xl mb-2">X</div>
          <div className="text-red-700 dark:text-red-400 font-medium">{error}</div>
        </div>
      )}

      {result && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div
            className={
              'px-6 py-5 text-white ' +
              (isHandover
                ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600')
            }
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider opacity-80">
                  {isHandover ? 'Kode Bukti Terima' : 'Nomor Antrean'}
                </div>
                <div className="text-3xl font-bold tracking-wider">
                  {result.queueNumber}
                </div>
              </div>
              <div className="text-5xl">OK</div>
            </div>
          </div>

          <div className="p-6 space-y-3">
            <Field label="Nama" value={result.guest.fullName} bold />
            <Field label="Instansi" value={result.guest.company ?? '-'} />
            <Field label="NIK" value={result.guest.nik} mono />
            <Field label="HP" value={result.guest.phone} mono />
            <Field label="Email" value={result.guest.email} />

            <hr className="border-slate-100 dark:border-slate-800" />
            <Field label="Tujuan" value={result.visit.destination} />
            <Field label="Keperluan" value={result.visit.purpose} />

            {isHandover && result.handover && (
              <>
                <hr className="border-slate-100 dark:border-slate-800" />
                <div className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold mb-2">
                  Detail Serah Terima
                </div>
                <Field label="Jenis" value={result.handover.typeLabel} />
                {result.handover.referenceNo && (
                  <Field label="No. Referensi" value={result.handover.referenceNo} mono />
                )}
                <Field label="Deskripsi" value={result.handover.description} />
                {result.handover.recipient && (
                  <Field label="Penerima" value={result.handover.recipient} />
                )}
                <Field
                  label="Status"
                  value={result.handover.statusLabel}
                />
                <Field
                  label="Diterima"
                  value={new Date(result.handover.receivedAt).toLocaleString('id-ID')}
                />
                {result.handover.notes && (
                  <Field label="Catatan" value={result.handover.notes} />
                )}
              </>
            )}

            {!isHandover && result.letter && (
              <>
                <hr className="border-slate-100 dark:border-slate-800" />
                <Field label="Perihal Surat" value={result.letter.subject} />
                {result.letter.letterNumber && (
                  <Field label="No. Surat" value={result.letter.letterNumber} />
                )}
              </>
            )}

            <hr className="border-slate-100 dark:border-slate-800" />
            <Field
              label="Waktu Masuk"
              value={new Date(result.visit.checkInAt).toLocaleString('id-ID')}
            />
            <Field
              label="Status Kunjungan"
              value={VISIT_STATUS_LABEL[result.visit.status] ?? result.visit.status}
            />
          </div>
        </div>
      )}

      <div className="text-center mt-8">
        <Link
          to="/"
          className="text-brand-600 dark:text-brand-400 hover:underline text-sm"
        >
          Kembali ke beranda
        </Link>
      </div>

      {showScanner && (
        <QRScanner onDetected={handleScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}

function Field({
  label,
  value,
  bold,
  mono,
}: {
  label: string;
  value: string;
  bold?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="w-32 flex-shrink-0 text-sm text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="text-slate-400">:</div>
      <div
        className={
          'flex-1 text-slate-800 dark:text-slate-200 ' +
          (bold ? 'font-bold text-lg ' : '') +
          (mono ? 'font-mono text-sm ' : '')
        }
      >
        {value}
      </div>
    </div>
  );
}