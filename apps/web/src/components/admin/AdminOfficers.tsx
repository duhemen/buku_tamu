import { useEffect, useState } from 'react';
import {
  Officer,
  OfficerStatusType,
  listOfficers,
  createOfficer,
  updateOfficer,
  deleteOfficer,
  getDailyStatuses,
  bulkUpdateDailyStatus,
  DailyStatus,
  CreateOfficerPayload,
  UpdateOfficerPayload,
  STATUS_LABEL,
  STATUS_COLOR,
} from '@/services/officer.service';

type Tab = 'confirm' | 'manage';

interface DraftStatus {
  officerId: string;
  status: OfficerStatusType;
  note: string;
  returnAt: string;
}

export default function AdminOfficers() {
  const [tab, setTab] = useState<Tab>('confirm');

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <TabButton active={tab === 'confirm'} onClick={() => setTab('confirm')}>
          Konfirmasi Hari Ini
        </TabButton>
        <TabButton active={tab === 'manage'} onClick={() => setTab('manage')}>
          Kelola Petugas
        </TabButton>
      </div>

      {tab === 'confirm' && <ConfirmTab />}
      {tab === 'manage' && <ManageTab />}
    </div>
  );
}

// ============================================================
// TAB 1: KONFIRMASI HARIAN
// ============================================================
function ConfirmTab() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [existingStatuses, setExistingStatuses] = useState<Record<string, DailyStatus>>({});
  const [drafts, setDrafts] = useState<Record<string, DraftStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const load = async () => {
    setLoading(true);
    try {
      const [officerList, statusList] = await Promise.all([
        listOfficers(),
        getDailyStatuses(today),
      ]);

      setOfficers(officerList);

      const statusMap: Record<string, DailyStatus> = {};
      statusList.forEach((s) => {
        statusMap[s.officerId] = s;
      });
      setExistingStatuses(statusMap);

      // Initialize drafts
      const draftMap: Record<string, DraftStatus> = {};
      officerList.forEach((o) => {
        const existing = statusMap[o.id];
        draftMap[o.id] = {
          officerId: o.id,
          status: existing?.status ?? 'AVAILABLE',
          note: existing?.note ?? '',
          returnAt: existing?.returnAt ?? '',
        };
      });
      setDrafts(draftMap);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateDraft = (officerId: string, key: keyof DraftStatus, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [officerId]: { ...prev[officerId], [key]: value },
    }));
    setSuccess(false);
  };

  const saveAll = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        date: today,
        statuses: Object.values(drafts).map((d) => ({
          officerId: d.officerId,
          status: d.status,
          note: d.note || null,
          returnAt: d.returnAt || null,
        })),
      };

      const result = await bulkUpdateDailyStatus(payload);
      setSuccess(true);
      await load();
      setTimeout(() => setSuccess(false), 3000);
      console.log('[bulk-update] Result:', result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">Memuat...</div>
    );
  }

  const formattedDate = new Date(today + 'T00:00:00').toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">
              Konfirmasi Status Petugas
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“... {formattedDate}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Konfirmasi ke masing-masing petugas, lalu input status hari ini.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              {officers.length}
            </div>
            <div className="text-xs text-slate-400">petugas aktif</div>
          </div>
        </div>
      </div>

      {/* Success message */}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <span>ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“</span>
          <span>Status berhasil disimpan! Kiosk & TV akan otomatis update.</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Officer list */}
      {officers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="text-4xl mb-2 opacity-40">--</div>
          <div className="text-slate-400 text-sm">
            Belum ada petugas. Buka tab "Kelola Petugas" untuk menambah.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {officers.map((officer) => (
            <OfficerConfirmRow
              key={officer.id}
              officer={officer}
              draft={drafts[officer.id]}
              isConfirmed={!!existingStatuses[officer.id]}
              onChange={(key, value) => updateDraft(officer.id, key, value)}
            />
          ))}
        </div>
      )}

      {/* Save button */}
      {officers.length > 0 && (
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 -mx-4 mt-4">
          <button
            onClick={saveAll}
            disabled={saving}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-xl font-medium shadow-lg shadow-brand-500/30 transition"
          >
            {saving ? 'Menyimpan...' : 'Simpan Semua Status'}
          </button>
        </div>
      )}
    </div>
  );
}

function OfficerConfirmRow({
  officer,
  draft,
  isConfirmed,
  onChange,
}: {
  officer: Officer;
  draft: DraftStatus;
  isConfirmed: boolean;
  onChange: (key: keyof DraftStatus, value: string) => void;
}) {
  const statusButtons: { value: OfficerStatusType; label: string; color: string }[] = [
    { value: 'AVAILABLE', label: 'Tersedia', color: 'emerald' },
    { value: 'BUSY', label: 'Sibuk', color: 'amber' },
    { value: 'ABSENT', label: 'Tidak Ada', color: 'rose' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-100">
              {officer.name}
            </span>
            {isConfirmed && (
              <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded">
                Sudah dikonfirmasi
              </span>
            )}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {officer.position}
            {officer.unit && ' Ãƒâ€šÂ· ' + officer.unit}
          </div>
        </div>
      </div>

      {/* Status buttons */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {statusButtons.map((btn) => (
          <button
            key={btn.value}
            type="button"
            onClick={() => onChange('status', btn.value)}
            className={
              'py-2.5 rounded-xl text-sm font-medium border-2 transition ' +
              (draft.status === btn.value
                ? btn.color === 'emerald'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : btn.color === 'amber'
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  : 'border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300')
            }
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Note + returnAt (conditional) */}
      {(draft.status === 'BUSY' || draft.status === 'ABSENT') && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Catatan
            </label>
            <input
              value={draft.note}
              onChange={(e) => onChange('note', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
              placeholder={draft.status === 'BUSY' ? 'Rapat di Aula' : 'Dinas luar'}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Kembali
            </label>
            <input
              value={draft.returnAt}
              onChange={(e) => onChange('returnAt', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
              placeholder={draft.status === 'BUSY' ? '13:30' : 'Besok, 08:00'}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB 2: KELOLA PETUGAS (CRUD)
// ============================================================
function ManageTab() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Officer | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await listOfficers(includeInactive);
      setOfficers(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeInactive]);

  const handleDelete = async (o: Officer) => {
    if (!confirm('Hapus petugas "' + o.name + '"? Semua status historis juga akan terhapus.'))
      return;
    try {
      await deleteOfficer(o.id);
      load();
    } catch (e) {
      alert('Gagal: ' + (e as Error).message);
    }
  };

  const handleToggleActive = async (o: Officer) => {
    try {
      await updateOfficer(o.id, { active: !o.active });
      load();
    } catch (e) {
      alert('Gagal: ' + (e as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">
              Daftar Petugas
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tambah, edit, nonaktifkan, atau hapus petugas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="w-4 h-4"
              />
              Tampilkan nonaktif
            </label>
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium"
            >
              + Tambah Petugas
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-400 text-sm">Memuat...</div>
        ) : officers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2 opacity-40">--</div>
            <div className="text-slate-400 text-sm">
              Belum ada petugas. Klik "+ Tambah Petugas" untuk mulai.
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {officers.map((o) => (
              <div
                key={o.id}
                className={
                  'flex items-center gap-3 py-3 ' +
                  (!o.active ? 'opacity-50' : '')
                }
              >
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold text-sm flex-shrink-0">
                  {o.order || 'Ãƒâ€šÂ·'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {o.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {o.position}
                    {o.unit && ' Ãƒâ€šÂ· ' + o.unit}
                    {o.room && ' Ãƒâ€šÂ· ' + o.room}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setEditing(o)}
                    className="px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(o)}
                    className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded"
                  >
                    {o.active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button
                    onClick={() => handleDelete(o)}
                    className="px-3 py-1.5 text-xs bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <OfficerFormModal
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}

      {editing && (
        <OfficerFormModal
          officer={editing}
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

function OfficerFormModal({
  officer,
  onClose,
  onSaved,
}: {
  officer?: Officer;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!officer;
  const [form, setForm] = useState<CreateOfficerPayload>({
    name: officer?.name ?? '',
    position: officer?.position ?? '',
    unit: officer?.unit ?? '',
    room: officer?.room ?? '',
    phone: officer?.phone ?? '',
    telegramChatId: officer?.telegramChatId ?? '',
    order: officer?.order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!form.name.trim() || !form.position.trim()) {
      setError('Nama dan Jabatan wajib diisi');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isEdit && officer) {
        await updateOfficer(officer.id, form as UpdateOfficerPayload);
      } else {
        await createOfficer(form);
      }
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 my-8">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4">
          {isEdit ? 'Edit Petugas' : 'Tambah Petugas'}
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Nama Lengkap & Gelar *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              placeholder="Dr. Ir. Ahmad, M.Si"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Jabatan *
            </label>
            <input
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className={inputClass}
              placeholder="Kabalai / PPK / POKJA SDA"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Unit
              </label>
              <input
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className={inputClass}
                placeholder="Pimpinan / PPK / Pokja"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Nomor Urut
              </label>
              <input
                type="number"
                value={form.order}
                onChange={(e) =>
                  setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })
                }
                className={inputClass}
                placeholder="1"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Ruangan
            </label>
            <input
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              className={inputClass}
              placeholder="Ruang Kabalai, Lt 2"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Nomor HP
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
              placeholder="0811-2233-4455"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Telegram Chat ID
            </label>
            <input
              value={form.telegramChatId}
              onChange={(e) => setForm({ ...form, telegramChatId: e.target.value })}
              className={inputClass}
              placeholder="Contoh: 1073958159"
            />
            <p className="text-xs text-slate-400 mt-1">
              Untuk notifikasi tamu. Kosongkan jika tidak perlu.
            </p>
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