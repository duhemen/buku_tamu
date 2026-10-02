import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';

export default function HomePage() {
  const { t } = useI18n();

  const cards = [
    {
      to: '/tv',
      icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      title: 'TV Antrean Live',
      desc: 'Panggilan antrean real-time dengan suara. Untuk ditampilkan di layar TV lobi.',
      color: 'from-rose-500 to-pink-600',
      shadow: 'shadow-rose-500/30',
    },
    {
      to: '/kiosk',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      title: 'Kiosk Tamu',
      desc: 'Daftar kunjungan, ambil nomor antrean, dan cetak kartu tamu.',
      color: 'from-brand-500 to-brand-700',
      shadow: 'shadow-brand-500/30',
    },
    {
      to: '/verify',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      title: 'Verifikasi',
      desc: 'Scan QR kartu tamu atau masukkan kode untuk cek data kunjungan.',
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/30',
    },
    {
      to: '/dashboard',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      title: 'Dashboard Publik',
      desc: 'Statistik kunjungan hari ini dengan grafik. Tanpa data sensitif.',
      color: 'from-violet-500 to-purple-600',
      shadow: 'shadow-violet-500/30',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-14 animate-fade-up">
        <div className="inline-block mb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            Selamat Datang
          </span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-slate-800 via-brand-700 to-slate-800 dark:from-slate-100 dark:via-brand-300 dark:to-slate-100 bg-clip-text text-transparent">
          Buku Tamu Digital
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Sistem Buku Tamu Digital Terintegrasi
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c, i) => (
          <Link
            key={c.to}
            to={c.to}
            className="group relative p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-transparent hover:shadow-2xl dark:hover:shadow-brand-500/10 transition-all duration-300 overflow-hidden animate-fade-up"
            style={{ animationDelay: (i * 80) + 'ms', animationFillMode: 'both' }}
          >
            <div
              className={
                'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ' +
                c.color +
                ' bg-opacity-5'
              }
            />

            <div className="relative">
              <div
                className={
                  'w-14 h-14 rounded-2xl bg-gradient-to-br ' +
                  c.color +
                  ' shadow-lg ' +
                  c.shadow +
                  ' flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300'
                }
              >
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={c.icon} />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {c.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {c.desc}
              </p>
              <div className="mt-4 flex items-center text-xs font-medium text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Buka
                <svg
                  className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-14 text-center text-xs text-slate-400 dark:text-slate-500">
        Sistem internal - hubungi administrator untuk info lebih lanjut.
      </div>
    </div>
  );
}