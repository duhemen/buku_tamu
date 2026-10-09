import { useEffect, useState } from 'react';
import {
  ActiveAnnouncement,
  getActiveAnnouncements,
  CATEGORY_LABEL,
  CATEGORY_COLOR,
} from '@/services/announcement.service';

export default function AnnouncementsPanel() {
  const [items, setItems] = useState<ActiveAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const list = await getActiveAnnouncements();
      setItems(list);
    } catch (e) {
      console.error('Announcements error:', e);
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
        <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-sm text-amber-700 dark:text-amber-300">
        Gagal memuat agenda: {error}
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30 rounded-2xl border-2 border-rose-200 dark:border-rose-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-rose-200 dark:border-rose-800 bg-white/50 dark:bg-black/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📢</span>
          <span className="font-bold text-rose-800 dark:text-rose-200">
            Agenda Hari Ini
          </span>
        </div>
        <span className="text-xs text-rose-600 dark:text-rose-400">
          {items.length} agenda
        </span>
      </div>

      <div className="p-4 space-y-3">
        {items.map((a) => (
          <AnnouncementItem key={a.id} announcement={a} />
        ))}
      </div>
    </div>
  );
}

function AnnouncementItem({ announcement }: { announcement: ActiveAnnouncement }) {
  const a = announcement;
  const cat = a.category ?? 'LAINNYA';
  const catColor = CATEGORY_COLOR[cat] ?? CATEGORY_COLOR.LAINNYA;
  const catLabel = CATEGORY_LABEL[cat] ?? cat;

  const start = new Date(a.startDate).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
  });
  const end = a.endDate
    ? new Date(a.endDate).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
      })
    : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span
          className={
            'inline-block px-2 py-0.5 text-xs font-medium rounded-md border ' + catColor
          }
        >
          {catLabel}
        </span>
        {a.isToday && a.isMultiDay && (
          <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-md bg-rose-500 text-white">
            HARI TERAKHIR
          </span>
        )}
        {a.isToday && !a.isMultiDay && (
          <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-md bg-rose-500 text-white animate-pulse">
            HARI INI
          </span>
        )}
      </div>

      <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1 text-base">
        {a.title}
      </h4>

      {a.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          {a.description}
        </p>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-1">
          📅 {a.isMultiDay ? `${start} - ${end}` : start}
        </span>
        {(a.startTime || a.endTime) && (
          <span className="flex items-center gap-1">
            ⏰ {a.startTime ?? '-'} - {a.endTime ?? '-'}
          </span>
        )}
        {a.location && (
          <span className="flex items-center gap-1">📍 {a.location}</span>
        )}
        {a.referenceNo && (
          <span className="flex items-center gap-1 font-mono">
            📄 {a.referenceNo}
          </span>
        )}
      </div>
    </div>
  );
}