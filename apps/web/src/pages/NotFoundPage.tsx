import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-300 mb-4">404</h1>
        <p className="text-slate-600 mb-6">Halaman tidak ditemukan.</p>
        <Link
          to="/"
          className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium"
        >
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}