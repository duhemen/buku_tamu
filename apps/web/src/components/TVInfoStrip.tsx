import { useEffect, useState } from 'react';
import {
  ActiveAnnouncement,
  getActiveAnnouncements,
} from '@/services/announcement.service';
import {
  PublicOfficer,
  getPublicOfficersToday,
} from '@/services/officer.service';

export default function TVInfoStrip() {
  const [announcements, setAnnouncements] = useState<ActiveAnnouncement[]>([]);
  const [officers, setOfficers] = useState<PublicOfficer[]>([]);

  const load = async () => {
    try {
      const [ann, off] = await Promise.all([
        getActiveAnnouncements(),
        getPublicOfficersToday(),
      ]);
      setAnnouncements(ann);
      setOfficers(off);
    } catch (e) {
      console.error('TV Info error:', e);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  const hasAnnouncements = announcements.length > 0;
  const hasOfficers = officers.length > 0;

  if (!hasAnnouncements && !hasOfficers) return null;

  return (
    <div className="grid grid-cols-2 gap-6 mt-6">
      {/* Agenda Panel */}
      {hasAnnouncements && (
        <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-900/20 to-orange-900/10 backdrop-blur p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">📢</span>
            <span className="text-sm font-bold uppercase tracking-wider text-rose-300">
              Agenda Hari Ini
            </span>
            <span className="ml-auto text-xs text-white/50">
              {announcements.length} agenda
            </span>
          </div>
          <div className="space-y-2 max-h-48 overflow-hidden">
            {announcements.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 text-sm border-l-2 border-rose-500 pl-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">
                    {a.title}
                  </div>
                  <div className="text-xs text-white/60 flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                    {(a.startTime || a.endTime) && (
                      <span>
                        ⏰ {a.startTime ?? '-'}-{a.endTime ?? '-'}
                      </span>
                    )}
                    {a.location && <span>📍 {a.location}</span>}
                    {a.isToday && (
                      <span className="text-rose-300 font-bold">HARI INI</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {announcements.length > 3 && (
              <div className="text-center text-xs text-white/40 pt-1">
                +{announcements.length - 3} agenda lagi
              </div>
            )}
          </div>
        </div>
      )}

      {/* Officers Panel */}
      {hasOfficers && (
        <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-900/20 to-blue-900/10 backdrop-blur p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">⭐</span>
            <span className="text-sm font-bold uppercase tracking-wider text-sky-300">
              Status Petugas
            </span>
            <span className="ml-auto text-xs text-white/50">
              {officers.length} petugas
            </span>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-hidden">
            {officers.slice(0, 6).map((o) => {
              const statusDot =
                o.status === 'AVAILABLE'
                  ? 'bg-emerald-500'
                  : o.status === 'BUSY'
                  ? 'bg-amber-500'
                  : o.status === 'ABSENT'
                  ? 'bg-rose-500'
                  : 'bg-slate-400';
              const statusLabel =
                o.status === 'AVAILABLE'
                  ? 'Tersedia'
                  : o.status === 'BUSY'
                  ? 'Sibuk'
                  : o.status === 'ABSENT'
                  ? 'Tidak Ada'
                  : 'Belum';
              const statusColor =
                o.status === 'AVAILABLE'
                  ? 'text-emerald-300'
                  : o.status === 'BUSY'
                  ? 'text-amber-300'
                  : o.status === 'ABSENT'
                  ? 'text-rose-300'
                  : 'text-slate-400';
              return (
                <div key={o.id} className="flex items-center gap-2 text-sm">
                  <span
                    className={
                      'w-2 h-2 rounded-full flex-shrink-0 ' +
                      statusDot +
                      (o.status === 'AVAILABLE' ? ' animate-pulse' : '')
                    }
                  />
                  <span className="font-semibold text-white truncate">
                    {o.position}
                  </span>
                  <span className="text-white/40 text-xs truncate">
                    {o.name}
                  </span>
                  <span className={'ml-auto text-xs font-bold ' + statusColor}>
                    {statusLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}