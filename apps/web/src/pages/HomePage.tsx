import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';

export default function HomePage() {
  const { t } = useI18n();

  const cards = [
    {
      to: '/kiosk',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      title: t('home.kiosk.title'),
      desc: t('home.kiosk.desc'),
      color: 'from-brand-500 to-brand-700',
      shadow: 'shadow-brand-500/30',
    },
    {
      to: '/dashboard',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      title: t('home.dashboard.title'),
      desc: t('home.dashboard.desc'),
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/30',
    },
    {
      to: '/login',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      title: t('home.login.title'),
      desc: t('home.login.desc'),
      color: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/30',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-14 animate-fade-up">
        <div className="inline-block mb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            v1.0 - Live
          </span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-slate-800 via-brand-700 to-slate-800 dark:from-slate-100 dark:via-brand-300 dark:to-slate-100 bg-clip-text text-transparent">
          {t('home.title')}
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          {t('home.subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <Link
            key={c.to}
            to={c.to}
            className="group relative p-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-transparent hover:shadow-2xl dark:hover:shadow-brand-500/10 transition-all duration-300 overflow-hidden animate-fade-up"
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
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {c.title}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {c.desc}
              </p>
              <div className="mt-5 flex items-center text-sm font-medium text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Buka
                <svg
                  className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
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
    </div>
  );
}