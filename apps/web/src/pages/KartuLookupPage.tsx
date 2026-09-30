import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function KartuLookupPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/verify/' + encodeURIComponent(code.trim().toUpperCase()));
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Kode tidak ditemukan');
        return;
      }
      if (data.visitId) {
        navigate('/kartu/' + data.visitId);
      } else {
        setError('Kode valid tapi data kartu tidak tersedia');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-600 text-white flex items-center justify-center text-3xl mb-4 font-bold">
          KC
        </div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          Cari Kartu / Bukti Terima
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Masukkan kode antrean atau kode bukti terima
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="A-001 atau TT-20260930-001"
          className="w-full px-4 py-4 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-mono text-lg text-center tracking-wider"
          autoFocus
        />

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-xl font-medium text-lg transition"
        >
          {loading ? 'Mencari...' : 'Buka Kartu'}
        </button>
      </form>

      {error && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
          <div className="text-red-700 dark:text-red-400 text-sm">{error}</div>
        </div>
      )}

      <div className="mt-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Contoh Kode:
        </div>
        <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <li>
            <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
              A-001
            </span>{' '}
            - Nomor antrean tamu
          </li>
          <li>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
              TT-20260930-001
            </span>{' '}
            - Kode bukti terima
          </li>
        </ul>
      </div>

      <div className="text-center mt-8">
        <Link
          to="/"
          className="text-brand-600 dark:text-brand-400 hover:underline text-sm"
        >
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}