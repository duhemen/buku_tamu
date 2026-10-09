import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CameraScanner from '@/components/CameraScanner';
import AnnouncementsPanel from '@/components/AnnouncementsPanel';
import OfficersStatusPanel from '@/components/OfficersStatusPanel';
import OperatingClosedScreen from '@/components/OperatingClosedScreen';
import CutOffWarningBanner from '@/components/CutOffWarningBanner';
import {
  publicCheckIn,
  publicFaceMatch,
  FaceGuest,
  HandoverType,
} from '@/services/public.service';
import {
  getPublicOperatingStatus,
  OperatingStatusResult,
} from '@/services/operating.service';

interface FormState {
  fullName: string;
  company: string;
  address: string;
  nik: string;
  phone: string;
  email: string;
  purpose: string;
  destination: string;
  notes: string;
  consent: boolean;
  hasHandover: boolean;
  handoverType: HandoverType;
  handoverRefNo: string;
  handoverDescription: string;
  handoverRecipient: string;
}

const initialState: FormState = {
  fullName: '',
  company: '',
  address: '',
  nik: '',
  phone: '',
  email: '',
  purpose: '',
  destination: '',
  notes: '',
  consent: false,
  hasHandover: false,
  handoverType: 'SURAT',
  handoverRefNo: '',
  handoverDescription: '',
  handoverRecipient: '',
};

const inputClass =
  'w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm';

const HANDOVER_TYPES: { value: HandoverType; label: string; icon: string }[] = [
  { value: 'SURAT', label: 'Surat / Dokumen', icon: 'S' },
  { value: 'JAMINAN_TENDER', label: 'Jaminan Tender / Lelang', icon: 'J' },
  { value: 'PAKET', label: 'Paket / Barang', icon: 'P' },
  { value: 'DOKUMEN', label: 'Dokumen', icon: 'D' },
  { value: 'LAINNYA', label: 'Lainnya', icon: 'L' },
];

export default function KioskPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [showCamera, setShowCamera] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [matchedGuest, setMatchedGuest] = useState<FaceGuest | null>(null);
  const [matching, setMatching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opStatus, setOpStatus] = useState<OperatingStatusResult | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const navigate = useNavigate();

  // ============================================================
  // Cek status operasional saat mount + auto-refresh 60 detik
  // ============================================================
  const checkOperatingStatus = async () => {
    try {
      const s = await getPublicOperatingStatus();
      setOpStatus(s);
    } catch (e) {
      console.error('Operating status error:', e);
      // Kalau error, jangan blokir Ã¢â‚¬â€ izinkan form muncul
      setOpStatus(null);
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkOperatingStatus();
    // Refresh tiap 30 detik (untuk countdown akurat), 60 detik normal
    const t = setInterval(checkOperatingStatus, 30000);
    return () => clearInterval(t);
  }, []);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const applyGuest = (g: FaceGuest) => {
    setForm((f) => ({
      ...f,
      fullName: g.fullName,
      company: g.company ?? '',
      address: g.address ?? '',
      nik: g.nik ?? '',
      phone: g.phone ?? '',
      email: g.email ?? '',
    }));
  };

  const handleCapture = async (dataUrl: string) => {
    setPhoto(dataUrl);
    setShowCamera(false);
    setMatching(true);
    setError(null);

    try {
      const result = await publicFaceMatch(dataUrl);
      if (result.ok && result.matched && result.guest) {
        setMatchedGuest(result.guest);
        applyGuest(result.guest);
      } else {
        setMatchedGuest(null);
      }
    } catch (e) {
      console.error('Face match error:', e);
      setMatchedGuest(null);
    } finally {
      setMatching(false);
    }
  };

  const resetFace = () => {
    setPhoto(null);
    setMatchedGuest(null);
    setShowCamera(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.consent) {
      setError('Anda harus menyetujui kebijakan privasi data.');
      return;
    }
    if (form.hasHandover && !form.handoverDescription.trim()) {
      setError('Deskripsi serah terima wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await publicCheckIn({
        guest: {
          fullName: form.fullName.trim(),
          company: form.company.trim() || undefined,
          address: form.address.trim() || undefined,
          nik: form.nik.trim() || undefined,
          phone: form.phone.trim() || undefined,
          email: form.email.trim() || undefined,
          consentAt: new Date().toISOString(),
          faceImage: !matchedGuest && photo ? photo : undefined,
          matchedGuestId: matchedGuest?.id,
        },
        visit: {
          purpose: form.purpose.trim(),
          destination: form.destination.trim(),
          notes: form.notes.trim() || undefined,
        },
        handover: form.hasHandover
          ? {
              type: form.handoverType,
              referenceNo: form.handoverRefNo.trim() || undefined,
              description: form.handoverDescription.trim(),
              recipient: form.handoverRecipient.trim() || undefined,
            }
          : null,
      });

      if (photo) {
        try {
          localStorage.setItem('bt_photo_' + result.visitId, photo);
        } catch {
          // ignore quota
        }
      }

      navigate('/kartu/' + result.visitId);
    } catch (e) {
      const err = e as Error & { statusCode?: number };
      setError(err.message);
      // Kalau ditolak karena jam operasional, refresh status
      if (err.message.includes('operating') || err.message.includes('tutup') || err.message.includes('berakhir')) {
        checkOperatingStatus();
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // Loading Screen
  // ============================================================
  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-3" />
          <div className="text-slate-500 dark:text-slate-400 text-sm">
            Memeriksa jam operasional...
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // Kalau kantor tutup - tampilkan layar khusus
  // ============================================================
  if (opStatus && !opStatus.isOpen) {
    return <OperatingClosedScreen status={opStatus} />;
  }

  // ============================================================
  // Kantor buka - tampilkan form
  // ============================================================
  const showCutOffWarning =
    opStatus?.minutesUntilCutOff !== undefined &&
    opStatus.minutesUntilCutOff <= 15 &&
    opStatus.minutesUntilCutOff > 0;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
              BT
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100">
              Kiosk Buku Tamu
            </span>
          </div>
          <Link
            to="/"
            className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400"
          >
            Kembali
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        {/* Warning Cut-off (dengan countdown + suara) */}
        {showCutOffWarning && opStatus && (
          <CutOffWarningBanner status={opStatus} />
        )}

                {/* ============================================================ */}
        {/* INFO PANEL: Agenda + Status Petugas                           */}
        {/* ============================================================ */}
        {showInfoPanel && (
          <div className="mb-6 animate-fade-up">
            {/* Toggle Button */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                Informasi Hari Ini
              </div>
              <button
                type="button"
                onClick={() => setShowInfoPanel(false)}
                className="text-xs text-slate-500 hover:text-brand-600 dark:text-slate-400 flex items-center gap-1"
              >
                Sembunyikan
                <span>▲</span>
              </button>
            </div>

            {/* Panels Grid */}
            <div className="grid lg:grid-cols-2 gap-5">
              <AnnouncementsPanel />
              <OfficersStatusPanel />
            </div>
          </div>
        )}

        {/* Show button kalau panel disembunyikan */}
        {!showInfoPanel && (
          <div className="mb-6 text-center">
            <button
              type="button"
              onClick={() => setShowInfoPanel(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition shadow-sm"
            >
              <span>📢</span>
              Lihat Info Hari Ini (Agenda + Status Petugas)
              <span>▼</span>
            </button>
          </div>
        )}
<div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">
                Foto Wajah (Opsional)
              </h3>

              {!showCamera && !photo && (
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-lg font-medium text-sm shadow-md shadow-brand-500/30"
                >
                  Aktifkan Kamera
                </button>
              )}

              {showCamera && (
                <CameraScanner
                  onCapture={handleCapture}
                  onCancel={() => setShowCamera(false)}
                />
              )}

              {matching && (
                <div className="mt-3 p-3 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-sm text-brand-700 dark:text-brand-300 text-center">
                  Mencocokkan wajah...
                </div>
              )}

              {photo && !showCamera && (
                <div className="space-y-3">
                  <img
                    src={photo}
                    alt="Foto tamu"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700"
                  />

                  {matchedGuest && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          Tamu Dikenali
                        </span>
                      </div>
                      <div className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                        {matchedGuest.fullName}
                      </div>
                      {matchedGuest.company && (
                        <div className="text-xs text-emerald-600 dark:text-emerald-400">
                          {matchedGuest.company}
                        </div>
                      )}
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        Data diisi otomatis
                      </div>
                    </div>
                  )}

                  {!matching && !matchedGuest && (
                    <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs text-amber-700 dark:text-amber-300">
                      Tamu baru. Silakan isi form di samping.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={resetFace}
                    className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm"
                  >
                    Foto Ulang
                  </button>
                </div>
              )}
            </div>

            <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl p-4 text-sm text-brand-800 dark:text-brand-300">
              <p className="font-semibold mb-1">Privasi Anda Terlindungi</p>
              <p className="text-xs leading-relaxed">
                Kami <strong>tidak menyimpan foto</strong> wajah Anda. Yang
                disimpan hanya <strong>vektor matematis</strong> (512 angka)
                yang tidak bisa direkonstruksi menjadi foto. Data terenkripsi
                dan dapat dihapus atas permintaan.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
            <Section title="Data Tamu">
              <Field label="Nama Lengkap *">
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Instansi / Perusahaan">
                <input
                  value={form.company}
                  onChange={(e) => update('company', e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Alamat">
                <input
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="NIK">
                <input
                  value={form.nik}
                  onChange={(e) => update('nik', e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Nomor HP">
                <input
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className={inputClass}
                />
              </Field>
            </Section>

            <Section title="Tujuan Kunjungan">
              <Field label="Tujuan / Divisi *">
                <input
                  required
                  value={form.destination}
                  onChange={(e) => update('destination', e.target.value)}
                  className={inputClass}
                  placeholder="Contoh: Bagian Umum"
                />
              </Field>
              <Field label="Maksud / Keperluan *">
                <input
                  required
                  value={form.purpose}
                  onChange={(e) => update('purpose', e.target.value)}
                  className={inputClass}
                  placeholder="Contoh: Menghadap Kepala Bagian"
                />
              </Field>
              <Field label="Catatan Tambahan">
                <textarea
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  className={inputClass + ' resize-none'}
                  rows={2}
                />
              </Field>
            </Section>

            <Section title="Serah Terima (Opsional)">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={form.hasHandover}
                  onChange={(e) => update('hasHandover', e.target.checked)}
                  className="w-4 h-4"
                />
                Tamu menyerahkan surat / dokumen / barang
              </label>

              {form.hasHandover && (
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                      Jenis Serah Terima *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {HANDOVER_TYPES.map((ht) => (
                        <button
                          key={ht.value}
                          type="button"
                          onClick={() => update('handoverType', ht.value)}
                          className={
                            'px-3 py-2 rounded-lg text-xs font-medium border-2 transition text-left ' +
                            (form.handoverType === ht.value
                              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400')
                          }
                        >
                          <span className="block font-bold">{ht.icon}</span>
                          <span className="block mt-0.5">{ht.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Field label="Nomor Referensi (No. Surat / No. Jaminan)">
                    <input
                      value={form.handoverRefNo}
                      onChange={(e) => update('handoverRefNo', e.target.value)}
                      className={inputClass}
                      placeholder="Contoh: 001/SK/IX/2026"
                    />
                  </Field>

                  <Field label="Deskripsi *">
                    <textarea
                      required={form.hasHandover}
                      value={form.handoverDescription}
                      onChange={(e) =>
                        update('handoverDescription', e.target.value)
                      }
                      className={inputClass + ' resize-none'}
                      rows={3}
                      placeholder="Deskripsikan dokumen/barang yang diserahkan..."
                    />
                  </Field>

                  <Field label="Penerima / Petugas">
                    <input
                      value={form.handoverRecipient}
                      onChange={(e) =>
                        update('handoverRecipient', e.target.value)
                      }
                      className={inputClass}
                      placeholder="Nama petugas penerima"
                    />
                  </Field>
                </div>
              )}
            </Section>

            <label className="flex items-start gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => update('consent', e.target.checked)}
                className="w-4 h-4 mt-0.5"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Saya menyetujui data pribadi saya (NIK, nomor HP, email) dan{' '}
                <strong>data biometrik wajah dalam bentuk vektor matematis</strong>{' '}
                yang tidak dapat direkonstruksi menjadi foto, digunakan untuk
                auto-fill kunjungan berikutnya. Data disimpan terenkripsi dan
                dapat dihapus atas permintaan.
              </span>
            </label>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setForm(initialState);
                  setPhoto(null);
                  setMatchedGuest(null);
                }}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-medium rounded-lg transition shadow-md shadow-brand-500/30"
              >
                {submitting
                  ? 'Memproses...'
                  : form.hasHandover
                  ? 'Daftar & Cetak Bukti Terima'
                  : 'Daftar & Cetak Kartu'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
      <h3 className="font-semibold text-slate-800 dark:text-slate-100">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}