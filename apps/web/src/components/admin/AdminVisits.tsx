import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listVisits, checkOut } from '@/services/visit.service';
import type { Visit } from '@/types';
import { formatDateTime, statusLabel, statusColor } from '@/utils/format';

export default function AdminVisits() {
  const [items, setItems] = useState<Visit[]>([]);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await listVisits({ status: status || undefined, pageSize: 50 });
      setItems(r.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleCheckOut = async (v: Visit) => {
    if (!confirm('Check-out tamu ' + (v.guest?.fullName ?? '') + '?')) return;
    try {
      await checkOut(v.id);
      load();
    } catch (e) {
      alert('Gagal: ' + (e as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {['', 'WAITING', 'IN_PROGRESS', 'DONE'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={
              'px-3 py-1.5 text-sm rounded-lg font-medium transition ' +
              (status === s
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50')
            }
          >
            {s === '' ? 'Semua' : statusLabel[s]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Antrean</th>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Tujuan</th>
                <th className="px-4 py-3 text-left">Keperluan</th>
                <th className="px-4 py-3 text-left">Masuk</th>
                <th className="px-4 py-3 text-left">Keluar</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Memuat...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Belum ada kunjungan
                  </td>
                </tr>
              ) : (
                items.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-brand-600">
                      {v.queue?.number ?? '-'}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {v.guest?.fullName ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{v.destination}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{v.purpose}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {formatDateTime(v.checkInAt)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {v.checkOutAt ? formatDateTime(v.checkOutAt) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          'inline-block px-2 py-1 rounded-md text-xs font-medium ' +
                          (statusColor[v.status] ?? 'bg-slate-100 text-slate-600')
                        }
                      >
                        {statusLabel[v.status] ?? v.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          to={'/kartu/' + v.id}
                          className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded"
                        >
                          Kartu
                        </Link>
                        {v.status !== 'DONE' && (
                          <button
                            onClick={() => handleCheckOut(v)}
                            className="px-2 py-1 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded"
                          >
                            Check-out
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}