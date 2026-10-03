import { useEffect, useState } from 'react';
import {
  listOperatingHours,
  updateOperatingHours,
  listHolidays,
  createHoliday,
  deleteHoliday,
  listOverrides,
  createOverride,
  deleteOverride,
  getPublicOperatingStatus,
  OperatingHours,
  Holiday,
  TimeOverride,
  OperatingStatusResult,
  DayOfWeek,
  DAY_LABEL,
} from '@/services/operating.service';

type Tab = 'hours' | 'holidays' | 'overrides';

export default function AdminOperating() {
  const [tab, setTab] = useState<Tab>('hours');

  return (
    <div className="space-y-4">
      {/* Status Sekarang */}
      <StatusBanner />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <TabButton active={tab === 'hours'} onClick={() => setTab('hours')}>
          Jam Kerja
        </TabButton>
        <TabButton active={tab === 'holidays'} onClick={() => setTab('holidays')}>
          Hari Libur
        </TabButton>
        <TabButton active={tab === 'overrides'} onClick={() => setTab('overrides')}>
          Override
        </TabButton>
      </div>

      {tab === 'hours' && <HoursTab />}
      {tab === 'holidays' && <HolidaysTab />}
      {tab === 'overrides' && <OverridesTab />}
    </div>
  );
}

// ============================================================
// Status Banner
// ============================================================
function StatusBanner() {
  const [status, setStatus] = useState<OperatingStatusResult | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const s = await getPublicOperatingStatus();
      setStatus(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  if (loading || !status) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-sm text-slate-400">
        Memuat status operasional...
      </div>
    );
  }

  const colorMap: Record<string, string> = {
    OPEN: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
    CUT_OFF: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    CLOSED: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
    HOLIDAY: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300',
    OVERRIDE: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
  };

  const iconMap: Record<string, string> = {
    OPEN: 'OK',
    CUT_OFF: '!',
    CLOSED: 'X',
    HOLIDAY: 'L',
    OVERRIDE: '*',
  };

  return (
    <div className={'rounded-xl border p-4 ' + (colorMap[status.status] ?? '')}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/60 dark:bg-black/20 flex items-center justify-center font-bold text-lg">
          {iconMap[status.status] ?? '?'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm uppercase tracking-wider">
              {status.status}
            </span>
            <span className="text-xs opacity-70">
              {new Date(status.now).toLocaleTimeString('id-ID')}
            </span>
          </div>
          {status.reason && (
            <div className="text-sm mt-0.5">{status.reason}</div>
          )}
          {status.nextOpenTime && (
            <div className="text-xs mt-1 opacity-80">
              Buka berikutnya: <strong>{status.nextOpenTime}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TAB 1: Jam Kerja
// ============================================================
function HoursTab() {
  const [hours, setHours] = useState<OperatingHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<OperatingHours | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await listOperatingHours();
      setHours(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100">
            Jam Operasional Mingguan
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Atur jam buka, cut-off registrasi, dan jam tutup
          </p>
        </div>
        <span className="text-xs text-slate-400">{hours.length} hari</span>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400 text-sm">Memuat...</div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {hours.map((h) => (
            <HoursRow
              key={h.id}
              hour={h}
              onEdit={() => setEditing(h)}
            />
          ))}
        </div>
      )}

      {editing && (
        <EditHoursModal
          hour={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function HoursRow({ hour, onEdit }: { hour: OperatingHours; onEdit: () => void }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
      <div className="w-24">
        <div className="font-medium text-slate-800 dark:text-slate-200">
          {DAY_LABEL[hour.dayOfWeek]}
        </div>
      </div>

      <div className="w-20">
        <span
          className={
            'inline-block px-2 py-0.5 rounded-md text-xs font-medium ' +
            (hour.isOpen
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300')
          }
        >
          {hour.isOpen ? 'Buka' : 'Tutup'}
        </span>
      </div>

      {hour.isOpen ? (
        <div className="flex-1 flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <span className="text-xs text-slate-400">Buka:</span>{' '}
            <strong className="text-slate-700 dark:text-slate-300">{hour.openTime}</strong>
          </div>
          <div>
            <span className="text-xs text-slate-400">Cut-off:</span>{' '}
            <strong className="text-amber-600 dark:text-amber-400">{hour.cutOffTime}</strong>
          </div>
          <div>
            <span className="text-xs text-slate-400">Tutup:</span>{' '}
            <strong className="text-slate-700 dark:text-slate-300">{hour.closeTime}</strong>
          </div>
        </div>
      ) : (
        <div className="flex-1 text-sm text-slate-400 italic">Libur</div>
      )}

      <button
        onClick={onEdit}
        className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded"
      >
        Edit
      </button>
    </div>
  );
}

function EditHoursModal({
  hour,
  onClose,
  onSaved,
}: {
  hour: OperatingHours;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    isOpen: hour.isOpen,
    openTime: hour.openTime,
    cutOffTime: hour.cutOffTime,
    closeTime: hour.closeTime,
    notes: hour.notes ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateOperatingHours(hour.dayOfWeek, {
        isOpen: form.isOpen,
        openTime: form.openTime,
        cutOffTime: form.cutOffTime,
        closeTime: form.closeTime,
        notes: form.notes || null,
      });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4">
          Edit Jam - {DAY_LABEL[hour.dayOfWeek]}
        </h3>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isOpen}
              onChange={(e) => setForm({ ...form, isOpen: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-slate-700 dark:text-slate-300">
              Hari ini buka (uncheck untuk libur)
            </span>
          </label>

          {form.isOpen && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Jam Buka
                </label>
                <input
                  type="time"
                  value={form.openTime}
                  onChange={(e) => setForm({ ...form, openTime: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Cut-off Registrasi Tamu
                </label>
                <input
                  type="time"
                  value={form.cutOffTime}
                  onChange={(e) => setForm({ ...form, cutOffTime: e.target.value })}
                  className={inputClass}
                />
                <p className="text-xs text-slate-400 mt-1">
                  Tamu tidak bisa registrasi setelah jam ini
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Jam Tutup
                </label>
                <input
                  type="time"
                  value={form.closeTime}
                  onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
                  className={inputClass}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Catatan (opsional)
            </label>
            <input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={inputClass}
              placeholder="Misal: Jum'at pulang lebih awal"
            />
          </div>
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm"
          >
            Batal
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TAB 2: Hari Libur
// ============================================================
function HolidaysTab() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await listHolidays(year);
      setHolidays(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [year]);

  const handleDelete = async (h: Holiday) => {
    if (!confirm('Hapus hari libur "' + h.name + '"?')) return;
    try {
      await deleteHoliday(h.id);
      load();
    } catch (e) {
      alert('Gagal: ' + (e as Error).message);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Hari Libur</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar hari libur nasional dan cuti bersama
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className="px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg"
          >
            {[2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowAdd(true)}
            className="px-3 py-1.5 text-xs bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium"
          >
            + Tambah
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400 text-sm">Memuat...</div>
      ) : holidays.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-3xl mb-2 opacity-40">--</div>
          <div className="text-slate-400 text-sm">
            Belum ada hari libur untuk tahun {year}
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {holidays.map((h) => (
            <div
              key={h.id}
              className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div className="w-32 font-mono text-sm text-slate-600 dark:text-slate-400">
                {new Date(h.date).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-800 dark:text-slate-200">
                  {h.name}
                </div>
                {h.notes && (
                  <div className="text-xs text-slate-400 mt-0.5">{h.notes}</div>
                )}
              </div>
              <button
                onClick={() => handleDelete(h)}
                className="px-3 py-1 text-xs bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddHolidayModal
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function AddHolidayModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    name: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!form.name.trim()) {
      setError('Nama hari libur wajib diisi');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createHoliday({
        date: form.date,
        name: form.name.trim(),
        notes: form.notes.trim() || undefined,
      });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4">
          Tambah Hari Libur
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Tanggal
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Nama Libur *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              placeholder="Misal: Cuti Bersama Idul Fitri"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Catatan (opsional)
            </label>
            <input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm"
          >
            Batal
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TAB 3: Override
// ============================================================
function OverridesTab() {
  const [overrides, setOverrides] = useState<TimeOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await listOverrides();
      setOverrides(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (o: TimeOverride) => {
    if (!confirm('Hapus override ' + o.reason + '?')) return;
    try {
      await deleteOverride(o.id);
      load();
    } catch (e) {
      alert('Gagal: ' + (e as Error).message);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100">
            Override Jam Operasional
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Buka/tutup kantor di luar jam normal (rapat besar, dll)
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-3 py-1.5 text-xs bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium"
        >
          + Buat Override
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400 text-sm">Memuat...</div>
      ) : overrides.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-3xl mb-2 opacity-40">--</div>
          <div className="text-slate-400 text-sm">Belum ada override</div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {overrides.map((o) => (
            <div
              key={o.id}
              className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div className="w-32 font-mono text-sm text-slate-600 dark:text-slate-400">
                {new Date(o.date).toLocaleDateString('id-ID')}
              </div>
              <div className="w-20">
                <span
                  className={
                    'inline-block px-2 py-0.5 rounded-md text-xs font-medium ' +
                    (o.isOpen
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300')
                  }
                >
                  {o.isOpen ? 'Buka' : 'Tutup'}
                </span>
              </div>
              <div className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                {o.reason}
              </div>
              <button
                onClick={() => handleDelete(o)}
                className="px-3 py-1 text-xs bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddOverrideModal
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function AddOverrideModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    isOpen: true,
    reason: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!form.reason.trim()) {
      setError('Alasan override wajib diisi');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createOverride({
        date: form.date,
        isOpen: form.isOpen,
        reason: form.reason.trim(),
      });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4">
          Buat Override
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Tanggal
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Aksi
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, isOpen: true })}
                className={
                  'px-3 py-2 rounded-lg text-sm font-medium border-2 transition ' +
                  (form.isOpen
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400')
                }
              >
                Buka
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, isOpen: false })}
                className={
                  'px-3 py-2 rounded-lg text-sm font-medium border-2 transition ' +
                  (!form.isOpen
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400')
                }
              >
                Tutup
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Alasan *
            </label>
            <input
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className={inputClass}
              placeholder="Misal: Rapat besar dengan tamu penting"
            />
          </div>
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm"
          >
            Batal
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Helper
// ============================================================
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        'px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition ' +
        (active
          ? 'border-brand-600 text-brand-600 dark:text-brand-400'
          : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200')
      }
    >
      {children}
    </button>
  );
}