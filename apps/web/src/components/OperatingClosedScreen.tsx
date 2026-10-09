import { Link } from 'react-router-dom';
import type { OperatingStatusResult } from '@/services/operating.service';

interface Props {
  status: OperatingStatusResult;
}

export default function OperatingClosedScreen({ status }: Props) {
  const config = {
    CLOSED: {
      icon: 'X',
      title: 'Kantor Sedang Tutup',
      color: 'from-rose-500 to-pink-600',
      bg: 'from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30',
      subtitle: 'Jam operasional hari ini sudah berakhir',
    },
    CUT_OFF: {
      icon: '!',
      title: 'Waktu Registrasi Berakhir',
      color: 'from-amber-500 to-orange-600',
      bg: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
      subtitle: 'Registrasi tamu sudah ditutup untuk sesi ini',
    },
    BREAK: {
      icon: '☕',
      title: 'Kantor Sedang Istirahat',
      color: 'from-sky-500 to-blue-600',
      bg: 'from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30',
      subtitle: 'Waktu ISHOMA (Istirahat, Sholat, Makan)',
    },
    HOLIDAY: {
      icon: 'L',
      title: 'Hari Ini Libur',
      color: 'from-violet-500 to-purple-600',
      bg: 'from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30',
      subtitle: 'Kantor tutup untuk hari libur',
    },
    OVERRIDE: {
      icon: 'X',
      title: 'Kantor Tutup',
      color: 'from-slate-500 to-slate-700',
      bg: 'from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
      subtitle: 'Kantor tutup berdasarkan keputusan admin',
    },
  }[status.status] ?? {
    icon: '?',
    title: 'Tidak Tersedia',
    color: 'from-slate-500 to-slate-700',
    bg: 'from-slate-50 to-slate-100',
    subtitle: '',
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bg} flex items-center justify-center p-6`}>
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div
            className={`w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br ${config.color} flex items-center justify-center text-white font-black text-4xl shadow-2xl mb-6 animate-pulse`}
          >
            {config.icon}
          </div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {config.title}
          </h1>
          {config.subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {config.subtitle}
            </p>
          )}
          {status.reason && (
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
              {status.reason}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl mb-4">
          {status.nextOpenTime && (
            <div className="text-center mb-6">
              <div className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Buka Berikutnya
              </div>
              <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                {status.nextOpenTime}
              </div>
            </div>
          )}

          {status.todaySchedule && status.todaySchedule.sessions && status.todaySchedule.sessions.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Sesi Hari Ini
              </div>
              <div className="space-y-2 text-sm">
                {status.todaySchedule.sessions.map((s) => {
                  const isCurrent =
                    status.currentSession?.sessionNumber === s.sessionNumber;
                  return (
                    <div
                      key={s.sessionNumber}
                      className={
                        'flex items-center justify-between px-3 py-2 rounded-lg ' +
                        (isCurrent
                          ? 'bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800'
                          : 'bg-slate-50 dark:bg-slate-800/50')
                      }
                    >
                      <span
                        className={
                          'font-medium ' +
                          (isCurrent
                            ? 'text-brand-700 dark:text-brand-300'
                            : 'text-slate-600 dark:text-slate-400')
                        }
                      >
                        Sesi {s.sessionNumber}
                      </span>
                      <span
                        className={
                          'font-mono text-xs ' +
                          (isCurrent
                            ? 'text-brand-700 dark:text-brand-300'
                            : 'text-slate-600 dark:text-slate-400')
                        }
                      >
                        {s.openTime} - {s.closeTime}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(!status.todaySchedule || !status.todaySchedule.sessions || status.todaySchedule.sessions.length === 0) && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Jam Operasional
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Senin - Kamis</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    08:00 - 11:00 | 13:00 - 16:00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Jum'at</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    08:30 - 11:00 | 13:30 - 16:30
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Sabtu - Minggu</span>
                  <span className="font-medium text-rose-600 dark:text-rose-400">Libur</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-center">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Untuk keadaan darurat, silakan hubungi petugas atau security
          </p>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-sm transition"
          >
            Kembali ke Beranda
          </Link>
        </div>

        <div className="text-center mt-4 text-xs text-slate-400 dark:text-slate-500">
          Waktu server: {new Date(status.now).toLocaleString('id-ID')}
        </div>
      </div>
    </div>
  );
}