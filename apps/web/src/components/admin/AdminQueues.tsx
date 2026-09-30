import { useEffect, useState } from 'react';
import { listTodayQueues, callQueue, serveQueue, QueueWithVisit } from '@/services/queue.service';
import { formatTime, statusLabel, statusColor } from '@/utils/format';

export default function AdminQueues() {
  const [items, setItems] = useState<QueueWithVisit[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await listTodayQueues();
      setItems(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  const handleCall = async (id: string) => {
    try {
      await callQueue(id);
      load();
    } catch (e) {
      alert('Gagal: ' + (e as Error).message);
    }
  };

  const handleServe = async (id: string) => {
    try {
      await serveQueue(id);
      load();
    } catch (e) {
      alert('Gagal: ' + (e as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800">Antrean Hari Ini</h3>
          <span className="text-xs text-slate-400">{items.length} antrean</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">Memuat...</div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            Belum ada antrean hari ini
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((q) => (
              <div
                key={q.id}
                className={
                  'p-4 rounded-xl border-2 transition ' +
                  (q.status === 'CALLED'
                    ? 'border-brand-500 bg-brand-50'
                    : q.status === 'SERVED'
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-slate-200 bg-white')
                }
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-3xl font-bold text-slate-800">{q.number}</div>
                  <span
                    className={
                      'text-xs font-medium px-2 py-1 rounded ' +
                      (statusColor[q.status] ?? 'bg-slate-100 text-slate-600')
                    }
                  >
                    {statusLabel[q.status] ?? q.status}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-700 mb-0.5">
                  {q.visit?.guest?.fullName ?? '-'}
                </div>
                <div className="text-xs text-slate-500 mb-3">
                  {q.visit?.guest?.company ?? '-'}
                </div>
                <div className="flex gap-2">
                  {q.status === 'WAITING' && (
                    <button
                      onClick={() => handleCall(q.id)}
                      className="flex-1 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-medium"
                    >
                      📢 Panggil
                    </button>
                  )}
                  {q.status === 'CALLED' && (
                    <button
                      onClick={() => handleServe(q.id)}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium"
                    >
                      ✓ Selesai
                    </button>
                  )}
                  {q.status === 'SERVED' && (
                    <div className="flex-1 py-1.5 text-xs text-emerald-700 text-center">
                      ✓ Sudah dilayani
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}