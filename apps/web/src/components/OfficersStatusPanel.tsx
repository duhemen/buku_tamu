import { useEffect, useState } from 'react';
import {
  PublicOfficer,
  getPublicOfficersToday,
  OfficerStatusType,
} from '@/services/officer.service';

interface StatusConfig {
  dot: string;
  bg: string;
  border: string;
  text: string;
  label: string;
}

const STATUS_CONFIG: Record<OfficerStatusType, StatusConfig> = {
  AVAILABLE: {
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-300',
    label: 'Tersedia',
  },
  BUSY: {
    dot: 'bg-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
    label: 'Sibuk',
  },
  ABSENT: {
    dot: 'bg-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-rose-500',
    text: 'text-rose-700 dark:text-rose-300',
    label: 'Tidak Ada',
  },
  OFFLINE: {
    dot: 'bg-slate-400',
    bg: 'bg-slate-50 dark:bg-slate-900/50',
    border: 'border-slate-300 dark:border-slate-700',
    text: 'text-slate-600 dark:text-slate-400',
    label: 'Belum Konfirmasi',
  },
};

export default function OfficersStatusPanel() {
  const [officers, setOfficers] = useState<PublicOfficer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const load = async () => {
    try {
      const list = await getPublicOfficersToday();
      setOfficers(list);
    } catch (e) {
      console.error('Officers error:', e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-3" />
        <div className="space-y-2">
          <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded" />
          <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-sm text-amber-700 dark:text-amber-300">
        Gagal memuat status petugas: {error}
      </div>
    );
  }

  if (officers.length === 0) {
    return null;
  }

  const summary = {
    available: officers.filter((o) => o.status === 'AVAILABLE').length,
    busy: officers.filter((o) => o.status === 'BUSY').length,
    absent: officers.filter((o) => o.status === 'ABSENT').length,
  };

  const displayOfficers = expanded ? officers : officers.slice(0, 5);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-brand-50 to-sky-50 dark:from-brand-950/30 dark:to-sky-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <span className="font-bold text-slate-800 dark:text-slate-100">
              Status Petugas Hari Ini
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {summary.available}
            </span>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {summary.busy}
            </span>
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {summary.absent}
            </span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {displayOfficers.map((o) => {
          const cfg = STATUS_CONFIG[o.status] ?? STATUS_CONFIG.OFFLINE;
          return (
            <div
              key={o.id}
              className={'px-5 py-3 border-l-4 ' + cfg.border + ' hover:bg-slate-50 dark:hover:bg-slate-800/50'}
            >
              <div className="flex items-start gap-3">
                <div
                  className={
                    'mt-1.5 w-2.5 h-2.5 rounded-full ' +
                    cfg.dot +
                    ' flex-shrink-0 ' +
                    (o.status === 'AVAILABLE' ? 'animate-pulse' : '')
                  }
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                      {o.position}
                    </span>
                    <span className="text-slate-400 text-xs">·</span>
                    <span className="text-slate-600 dark:text-slate-300 text-sm">
                      {o.name}
                    </span>
                    <span
                      className={
                        'inline-block px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wide ' +
                        cfg.bg +
                        ' ' +
                        cfg.text
                      }
                    >
                      {cfg.label}
                    </span>
                  </div>
                  {(o.note || o.returnAt) && (
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                      {o.note && (
                        <span className="text-slate-600 dark:text-slate-400">
                          📝 {o.note}
                        </span>
                      )}
                      {o.returnAt && (
                        <span className="text-slate-500 dark:text-slate-400">
                          🕐 Kembali: {o.returnAt}
                        </span>
                      )}
                    </div>
                  )}
                  {o.room && (
                    <div className="mt-0.5 text-xs text-slate-400">
                      📍 {o.room}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {officers.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 border-t border-slate-200 dark:border-slate-800 transition"
        >
          {expanded ? 'Sembunyikan' : `Lihat semua ${officers.length} petugas`}
        </button>
      )}
    </div>
  );
}