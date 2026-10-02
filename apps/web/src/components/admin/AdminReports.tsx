import { useEffect, useState } from 'react';
import { getMonthlyReport, MonthlyReport } from '@/services/reports.service';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export default function AdminReports() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await getMonthlyReport(year, month);
      setData(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  const handlePrint = () => {
    window.print();
  };

  const handleGeneratePDF = async () => {
    if (!data) return;
    setError(null);
    try {
      const { generateMonthlyPDF } = await import('@/lib/pdfReport');
      await generateMonthlyPDF(data);
    } catch (e) {
      setError('Gagal generate PDF: ' + (e as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Filter Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 no-print">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Bulan
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={idx} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Tahun
            </label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={load}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium"
          >
            {loading ? 'Memuat...' : 'Muat Ulang'}
          </button>

          <div className="ml-auto flex gap-2">
            <button
              onClick={handlePrint}
              disabled={!data}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium"
            >
              Cetak / Print
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={!data || loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300 no-print">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-slate-400 no-print">
          <div className="inline-block w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-3" />
          <div className="text-sm">Memuat laporan...</div>
        </div>
      )}

      {!loading && data && <ReportView data={data} />}
    </div>
  );
}

function ReportView({ data }: { data: MonthlyReport }) {
  const { period, summary, byDay, byDestination, handoverStats, rows } = data;
  const maxDay = Math.max(...byDay.map((d) => d.count), 1);

  return (
    <div id="report-view" className="space-y-5 print-root">
      {/* Header - hanya muncul saat print */}
      <div className="hidden print:block mb-6">
        <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
          <div className="text-2xl font-bold">LAPORAN BULANAN BUKU TAMU</div>
          <div className="text-sm mt-1">Sistem Buku Tamu Digital</div>
          <div className="text-lg font-semibold mt-2">Periode: {period.label}</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Total Kunjungan" value={summary.totalVisits} color="brand" />
        <SummaryCard label="Tamu Unik" value={summary.uniqueGuests} color="emerald" />
        <SummaryCard label="Serah Terima" value={summary.totalHandovers} color="amber" />
        <SummaryCard
          label="Hari Tersibuk"
          value={summary.busiestDay.count}
          sub={summary.busiestDay.label + ', ' + summary.busiestDay.day}
          color="violet"
        />
      </div>

      {/* Status Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">
          Status Kunjungan
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <StatusBox label="Menunggu" value={summary.byStatus.WAITING} color="amber" />
          <StatusBox label="Diproses" value={summary.byStatus.IN_PROGRESS} color="blue" />
          <StatusBox label="Selesai" value={summary.byStatus.DONE} color="emerald" />
          <StatusBox label="Batal" value={summary.byStatus.CANCELED} color="slate" />
        </div>
      </div>

      {/* Chart Per Hari */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">
          Kunjungan Per Hari
        </h3>
        <div className="flex items-end gap-1 h-32">
          {byDay.map((d) => {
            const height = maxDay > 0 ? (d.count / maxDay) * 100 : 0;
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[9px] text-slate-400">{d.count > 0 ? d.count : ''}</div>
                <div
                  className={
                    'w-full rounded-t transition-all ' +
                    (d.count > 0
                      ? 'bg-gradient-to-t from-brand-600 to-brand-400'
                      : 'bg-slate-100 dark:bg-slate-800')
                  }
                  style={{ height: Math.max(height, 3) + '%', minHeight: '4px' }}
                  title={d.day + ' - ' + d.label + ': ' + d.count}
                />
                <div className="text-[8px] text-slate-400 rotate-45 origin-left">
                  {d.day}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tujuan + Handover */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">
            Top Tujuan
          </h3>
          {byDestination.length === 0 ? (
            <div className="text-center text-slate-400 text-sm py-6">Belum ada data</div>
          ) : (
            <div className="space-y-2">
              {byDestination.slice(0, 8).map((d, i) => {
                const maxDest = byDestination[0]?.count ?? 1;
                const pct = (d.count / maxDest) * 100;
                return (
                  <div key={d.destination} className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-700 dark:text-slate-300 truncate">
                        {i + 1}. {d.destination}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {d.count}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-500 to-brand-600"
                        style={{ width: pct + '%' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">
            Serah Terima per Jenis
          </h3>
          {handoverStats.length === 0 ? (
            <div className="text-center text-slate-400 text-sm py-6">
              Belum ada serah terima
            </div>
          ) : (
            <div className="space-y-2">
              {handoverStats.map((h, i) => {
                const maxHo = handoverStats[0]?.count ?? 1;
                const pct = (h.count / maxHo) * 100;
                return (
                  <div key={h.type} className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-700 dark:text-slate-300">
                        {i + 1}. {h.label}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {h.count}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
                        style={{ width: pct + '%' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tabel Detail */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">
            Detail Kunjungan
          </h3>
          <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-medium">
            {rows.length} kunjungan
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 uppercase">
              <tr>
                <th className="px-3 py-2 text-left">No</th>
                <th className="px-3 py-2 text-left">Tanggal</th>
                <th className="px-3 py-2 text-left">Antrean</th>
                <th className="px-3 py-2 text-left">Nama</th>
                <th className="px-3 py-2 text-left">Instansi</th>
                <th className="px-3 py-2 text-left">NIK</th>
                <th className="px-3 py-2 text-left">Tujuan</th>
                <th className="px-3 py-2 text-left">Keperluan</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    Belum ada data untuk periode ini
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {new Date(r.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-3 py-2 font-bold text-brand-600 dark:text-brand-400">
                      {r.queueNumber}
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">
                      {r.guestName}
                    </td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                      {r.company ?? '-'}
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-500">
                      {r.nik}
                    </td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                      {r.destination}
                    </td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {r.letterSubject ?? r.purpose}
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tanda Tangan - hanya saat print */}
      <div className="hidden print:block mt-12">
        <div className="grid grid-cols-2 gap-16">
          <div className="text-center">
            <div className="text-sm mb-20">Petugas Buku Tamu</div>
            <div className="border-t border-slate-800 pt-1 text-sm">
              (.......................................)
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm mb-20">Kepala Bagian</div>
            <div className="border-t border-slate-800 pt-1 text-sm">
              (.......................................)
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-slate-400 mt-8">
          Dicetak pada {new Date(data.generatedAt).toLocaleString('id-ID')}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number;
  sub?: string;
  color: 'brand' | 'emerald' | 'amber' | 'violet';
}) {
  const colorMap = {
    brand: 'from-brand-500 to-brand-700',
    emerald: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-600',
    violet: 'from-violet-500 to-purple-700',
  };
  return (
    <div
      className={
        'relative overflow-hidden rounded-2xl bg-gradient-to-br ' +
        colorMap[color] +
        ' p-4 text-white'
      }
    >
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
      <div className="relative">
        <div className="text-xs uppercase tracking-wider opacity-90 mb-1">{label}</div>
        <div className="text-3xl font-bold tabular-nums">{value}</div>
        {sub && <div className="text-xs opacity-80 mt-1">{sub}</div>}
      </div>
    </div>
  );
}

function StatusBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'amber' | 'blue' | 'emerald' | 'slate';
}) {
  const colorMap = {
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    slate: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };
  return (
    <div className={'rounded-xl border p-3 text-center ' + colorMap[color]}>
      <div className="text-xs font-medium mb-1">{label}</div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    WAITING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    DONE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    CANCELED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };
  const label: Record<string, string> = {
    WAITING: 'Menunggu',
    IN_PROGRESS: 'Diproses',
    DONE: 'Selesai',
    CANCELED: 'Batal',
  };
  return (
    <span
      className={
        'inline-block px-2 py-0.5 rounded-md text-[10px] font-medium ' +
        (map[status] ?? 'bg-slate-100 text-slate-600')
      }
    >
      {label[status] ?? status}
    </span>
  );
}