import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import AnimatedNumber from '@/components/AnimatedNumber';
import {
  getSummary,
  getHourlyChart,
  getWeeklyChart,
  getDestinationChart,
  getPurposeChart,
  getPublicVisits,
  getRecentVisits,
  getHandoverSummary,
  HandoverSummary,
} from '@/services/dashboard.service';
import type {
  DashboardSummary,
  HourlyPoint,
  WeeklyPoint,
  DestinationPoint,
  PurposePoint,
  PublicVisit,
  RecentVisit,
} from '@/types';
import { formatTime, statusLabel, statusColor } from '@/utils/format';

const PIE_COLORS = ['#3179ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];
const PIE_COLORS_2 = ['#8b5cf6', '#f97316', '#06b6d4', '#ec4899', '#14b8a6', '#eab308', '#ef4444', '#3b82f6'];

export default function DashboardPublicPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [hourly, setHourly] = useState<HourlyPoint[]>([]);
  const [weekly, setWeekly] = useState<WeeklyPoint[]>([]);
  const [destinations, setDestinations] = useState<DestinationPoint[]>([]);
  const [purposes, setPurposes] = useState<PurposePoint[]>([]);
  const [visits, setVisits] = useState<PublicVisit[]>([]);
  const [recent, setRecent] = useState<RecentVisit[]>([]);
  const [handover, setHandover] = useState<HandoverSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  const load = async () => {
    try {
      const [s, h, w, d, p, v, r, ho] = await Promise.all([
        getSummary(),
        getHourlyChart(),
        getWeeklyChart(),
        getDestinationChart(),
        getPurposeChart(),
        getPublicVisits(),
        getRecentVisits(),
      ]);
      setSummary(s);
      setHourly(h);
      setWeekly(w);
      setDestinations(d);
      setPurposes(p);
      setVisits(v);
      setRecent(r);
      setHandover(ho);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearInterval(t);
      clearInterval(tick);
    };
  }, []);

  const dateStr = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-brand-950/30 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-medium mb-3">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              LIVE
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Dashboard Publik
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Statistik kunjungan - Data sensitif disembunyikan
            </p>
          </div>
          <div className="text-right animate-fade-up">
            <div className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {dateStr}
            </div>
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">
              {timeStr}
            </div>
          </div>
        </div>

        {loading ? (
          <SkeletonDashboard />
        ) : (
          <>
            {/* Periode Cards */}
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <PeriodCard
                  label="Hari Ini"
                  value={summary.today}
                  icon="T"
                  gradient="from-brand-500 to-brand-700"
                />
                <PeriodCard
                  label="Minggu Ini"
                  value={summary.week}
                  icon="W"
                  gradient="from-violet-500 to-purple-700"
                />
                <PeriodCard
                  label="Bulan Ini"
                  value={summary.month}
                  icon="M"
                  gradient="from-amber-500 to-orange-600"
                />
                <PeriodCard
                  label="Tahun Ini"
                  value={summary.year}
                  icon="Y"
                  gradient="from-emerald-500 to-teal-600"
                />
              </div>
            )}

            {/* Status Cards */}
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <SmallStat
                  label="Sedang Di Dalam"
                  value={summary.inside}
                  color="indigo"
                  pulse={summary.inside > 0}
                />
                <SmallStat label="Menunggu" value={summary.waiting} color="amber" />
                <SmallStat label="Diproses" value={summary.inProgress} color="blue" />
                <SmallStat label="Selesai" value={summary.done} color="emerald" />
              </div>
            )}

            {/* Chart Row 1: Hourly + Weekly */}
            <div className="grid lg:grid-cols-3 gap-5 mb-6">
              <Card
                title="Kunjungan Per Jam"
                subtitle="Distribusi hari ini"
                className="lg:col-span-2"
              >
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourly} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradHourly" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3179ff" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#3179ff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" vertical={false} />
                      <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#3179ff"
                        strokeWidth={3}
                        fill="url(#gradHourly)"
                        name="Tamu"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Minggu Ini" subtitle="Tren 7 hari">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekly} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" vertical={false} />
                      <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(49, 121, 255, 0.08)' }} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Tamu" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Chart Row 2: Destination + Purpose */}
            <div className="grid lg:grid-cols-2 gap-5 mb-8">
              <Card title="Tujuan Kunjungan" subtitle="Top divisi bulan ini">
                <div className="h-72">
                  {destinations.length === 0 ? (
                    <EmptyChart />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={destinations}
                          dataKey="count"
                          nameKey="destination"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={95}
                          paddingAngle={3}
                        >
                          {destinations.map((_, i) => (
                            <Cell
                              key={i}
                              fill={PIE_COLORS[i % PIE_COLORS.length]}
                              stroke="white"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {destinations.slice(0, 6).map((d, i) => (
                    <div key={d.destination} className="flex items-center gap-2 text-xs">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="text-slate-600 dark:text-slate-400 truncate flex-1">
                        {d.destination}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {d.count}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Perihal / Keperluan" subtitle="Top keperluan bulan ini">
                <div className="h-72">
                  {purposes.length === 0 ? (
                    <EmptyChart />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={purposes}
                          dataKey="count"
                          nameKey="purpose"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={95}
                          paddingAngle={3}
                        >
                          {purposes.map((_, i) => (
                            <Cell
                              key={i}
                              fill={PIE_COLORS_2[i % PIE_COLORS_2.length]}
                              stroke="white"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {purposes.slice(0, 6).map((p, i) => (
                    <div key={p.purpose} className="flex items-center gap-2 text-xs">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PIE_COLORS_2[i % PIE_COLORS_2.length] }}
                      />
                      <span className="text-slate-600 dark:text-slate-400 truncate flex-1">
                        {p.purpose}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {p.count}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Recent + Tabel */}
            <div className="grid lg:grid-cols-3 gap-5">
              {/* Recent Activity */}
              <Card title="Aktivitas Terbaru" subtitle="6 tamu terakhir">
                <div className="space-y-2.5">
                  {recent.length === 0 ? (
                    <div className="text-slate-400 text-sm text-center py-6">
                      Belum ada aktivitas
                    </div>
                  ) : (
                    recent.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {r.queueNumber}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                            {r.guestName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {r.destination}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs text-slate-400">
                            {formatTime(r.checkInAt)}
                          </div>
                          <span
                            className={
                              'inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ' +
                              (statusColor[r.status] ?? 'bg-slate-100 text-slate-600')
                            }
                          >
                            {statusLabel[r.status]}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Tabel */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-800 dark:text-slate-100">
                      Daftar Tamu Hari Ini
                    </h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      Data ter-mask untuk publik
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-medium">
                    {visits.length} tamu
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/60 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                        <th className="px-4 py-3 text-left font-medium">No</th>
                        <th className="px-4 py-3 text-left font-medium">Antrean</th>
                        <th className="px-4 py-3 text-left font-medium">Nama</th>
                        <th className="px-4 py-3 text-left font-medium">Tujuan</th>
                        <th className="px-4 py-3 text-left font-medium">Kontak</th>
                        <th className="px-4 py-3 text-left font-medium">Jam</th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {visits.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center">
                            <div className="text-4xl mb-2 opacity-40">--</div>
                            <div className="text-slate-400 text-sm">
                              Belum ada tamu hari ini
                            </div>
                          </td>
                        </tr>
                      ) : (
                        visits.map((v, i) => (
                          <tr
                            key={v.id}
                            className="hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-colors"
                          >
                            <td className="px-4 py-3 text-slate-400 text-xs">{i + 1}</td>
                            <td className="px-4 py-3">
                              <span className="inline-block px-2.5 py-1 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 text-white text-xs font-bold tracking-wider">
                                {v.queueNumber}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-800 dark:text-slate-200">
                                {v.guestName}
                              </div>
                              {v.company && (
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {v.company}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                              {v.destination}
                            </td>
                            <td className="px-4 py-3 text-slate-400 font-mono text-[10px]">
                              <div>{v.nik}</div>
                              <div className="text-slate-300 dark:text-slate-500">
                                {v.phone}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs tabular-nums">
                              {formatTime(v.checkInAt)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={
                                  'inline-block px-2.5 py-1 rounded-lg text-xs font-medium ' +
                                  (statusColor[v.status] ?? 'bg-slate-100 text-slate-600')
                                }
                              >
                                {statusLabel[v.status] ?? v.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <span>Note:</span>
                  <span>
                    NIK, nomor HP, dan email sudah disensor untuk melindungi
                    privasi tamu.
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const tooltipStyle: React.CSSProperties = {
  borderRadius: 12,
  border: 'none',
  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
  padding: '8px 12px',
  fontSize: 12,
};

function PeriodCard({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: number;
  icon: string;
  gradient: string;
}) {
  return (
    <div
      className={
        'relative overflow-hidden rounded-2xl bg-gradient-to-br ' +
        gradient +
        ' p-5 text-white shadow-lg transition-transform hover:scale-[1.02]'
      }
    >
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-white/5" />
      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-medium opacity-90 uppercase tracking-wider">
            {label}
          </span>
          <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold">
            {icon}
          </span>
        </div>
        <AnimatedNumber
          value={value}
          className="text-4xl font-bold tabular-nums block"
        />
      </div>
    </div>
  );
}

function SmallStat({
  label,
  value,
  color,
  pulse,
}: {
  label: string;
  value: number;
  color: 'indigo' | 'amber' | 'blue' | 'emerald';
  pulse?: boolean;
}) {
  const colorMap = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300',
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
  };
  return (
    <div
      className={
        'rounded-2xl border p-4 flex items-center gap-3 transition-all ' +
        colorMap[color] +
        (pulse ? ' animate-pulse-slow' : '')
      }
    >
      <div className="flex-1">
        <div className="text-xs font-medium opacity-80 uppercase tracking-wider mb-1">
          {label}
        </div>
        <AnimatedNumber value={value} className="text-2xl font-bold tabular-nums" />
      </div>
      {pulse && value > 0 && (
        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
      )}
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow ' +
        className
      }
    >
      <div className="mb-4">
        <h2 className="font-bold text-slate-800 dark:text-slate-100">{title}</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
      <div className="text-4xl mb-2">--</div>
      <div className="text-sm">Belum ada data</div>
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"
          />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse"
          />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-80 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    </div>
  );
}