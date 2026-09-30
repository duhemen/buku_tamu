import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/theme.store';
import { useI18n } from '@/lib/i18n';

export default function Layout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const lang = useUIStore((s) => s.lang);
  const setLang = useUIStore((s) => s.setLang);
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    'px-4 py-2 rounded-lg text-sm font-medium transition ' +
    (isActive
      ? 'bg-brand-600 text-white shadow-sm'
      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/30 group-hover:scale-105 transition-transform">
              BT
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100">
              {t('app.name')}
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <NavLink to="/" end className={linkClass}>
              {t('nav.home')}
            </NavLink>
            <NavLink to="/dashboard" className={linkClass}>
              {t('nav.dashboard')}
            </NavLink>
            <NavLink to="/verify" className={linkClass}>
              {t('nav.verify')}
            </NavLink>
            <NavLink to="/kiosk" className={linkClass}>
              {t('nav.kiosk')}
            </NavLink>

            {/* Toggle group */}
            <div className="ml-3 pl-3 border-l border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              {/* Language toggle */}
              <button
                onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
                className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center justify-center transition"
                title={lang === 'id' ? 'Switch to English' : 'Ganti ke Indonesia'}
              >
                {lang.toUpperCase()}
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition"
                title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              >
                {theme === 'dark' ? (
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-400 hidden md:inline">
                  {user.name}{' '}
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    ({user.role})
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-2 px-3 py-1.5 text-sm rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-sm shadow-brand-500/30 transition"
              >
                {t('nav.login')}
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 animate-fade-in">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-center text-sm text-slate-500 dark:text-slate-400 transition-colors">
        &copy; {new Date().getFullYear()} {t('app.name')}
      </footer>
    </div>
  );
}