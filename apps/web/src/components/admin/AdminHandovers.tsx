import { useEffect, useState } from 'react';
import {
  listHandovers,
  updateHandoverStatus,
  Handover,
  HandoverStatus,
} from '@/services/handover.service';
import { formatDateTime } from '@/utils/format';

const TYPE_LABEL: Record<string, string> = {
  SURAT: 'Surat / Dokumen',
  JAMINAN_TENDER: 'Jaminan Tender',
  PAKET: 'Paket / Barang',
  DOKUMEN: 'Dokumen',
  LAINNYA: 'Lainnya',
};

const STATUS_LABEL: Record<HandoverStatus, string> = {
  RECEIVED: 'Diterima',
  IN_PROGRESS: 'Diproses',
  COMPLETED: 'Selesai',
  RETURNED: 'Dikembalikan',
};

const STATUS_COLOR: Record<HandoverStatus, string> = {
  RECEIVED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  COMPLETED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  RETURNED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export default function AdminHandovers() {
  const [items, setItems] = useState<Handover[]>([]);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await listHandovers({ status: status || undefined, limit: 100 });
      setItems(r);
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

  const handleStatus = async (h: Handover, newStatus: HandoverStatus) => {
    if (!confirm('Ubah status ' + h.code + ' menjadi "' + STATUS_LABEL[newStatus] + '"?')) return;
    try {
      await updateHandoverStatus(h.id, newStatus);
      load();
    } catch (e) {
      alert('Gagal: ' + (e as Error).message);
    }
  };

  const stats = {
    total: items.length,
    received: items.filter((h) => h.status === 'RECEIVED').length,
    inProgress: items.filter((h) => h.status === 'IN_PROGRESS').length,
    completed: items.filter((h) => h.status === 'COMPLETED').length,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <MiniStat label="Total" value={stats.total} color="brand" />
        <MiniStat label="Diterima" value={stats.received} color="amber" />
        <MiniStat label="Diproses" value={stats.inProgress} color="blue" />
        <MiniStat label="Selesai" value={stats.completed} color="emerald" />
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'RECEIVED', 'IN_PROGRESS', 'COMPLETED', 'RETURNED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={
              'px-3 py-1.5 text-sm rounded-lg font-medium transition ' +
              (status === s
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800')
            }
          >
            {s === '' ? 'Semua' : STATUS_LABEL[s as HandoverStatus]}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Kode</th>
                <th className="px-4 py-3 text-left">Jenis</th>
                <th className="px-4 py-3 text-left">Pengirim</th>
                <th className="px-4 py-3 text-left">Deskripsi</th>
                <th className="px-4 py-3 text-left">Penerima</th>
                <th className="px-4 py-3 text-left">Diterima</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Memuat...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="text-4xl mb-2 opacity-40">--</div>
                    <div className="text-slate-400 text-sm">
                      Belum ada serah terima
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-brand-600 dark:text-brand-400 text-xs tracking-wider">
                        {h.code}
                      </div>
                      {h.referenceNo && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {h.referenceNo}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {TYPE_LABEL[h.type] ?? h.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {h.visit?.guest.fullName ?? '-'}
                      </div>
                      {h.visit?.guest.company && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {h.visit.guest.company}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs max-w-xs">
                      <div className="truncate">{h.description}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                      {h.recipient ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                      {formatDateTime(h.receivedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          'inline-block px-2 py-1 rounded-md text-xs font-medium ' +
                          (STATUS_COLOR[h.status] ?? 'bg-slate-100 text-slate-600')
                        }
                      >
                        {STATUS_LABEL[h.status] ?? h.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {h.status === 'RECEIVED' && (
                          <button
                            onClick={() => handleStatus(h, 'IN_PROGRESS')}
                            className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded"
                          >
                            Proses
                          </button>
                        )}
                        {h.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleStatus(h, 'COMPLETED')}
                            className="px-2 py-1 text-xs bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded"
                          >
                            Selesai
                          </button>
                        )}
                        {h.status === 'COMPLETED' && (
                          <button
                            onClick={() => handleStatus(h, 'RETURNED')}
                            className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded"
                          >
                            Kembalikan
                          </button>
                        )}
                        {h.status === 'RETURNED' && (
                          <span className="text-xs text-slate-400 italic">-</span>
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

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'brand' | 'amber' | 'blue' | 'emerald';
}) {
  const colorMap = {
    brand: 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  };
  return (
    <div className={'rounded-xl border p-3 ' + colorMap[color]}>
      <div className="text-xs font-medium uppercase tracking-wider opacity-80">
        {label}
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}