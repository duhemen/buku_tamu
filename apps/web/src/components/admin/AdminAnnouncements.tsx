import { useEffect, useState } from 'react';
import {
  Announcement,
  AnnouncementCategory,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  CATEGORY_LABEL,
  CATEGORY_COLOR,
} from '@/services/announcement.service';

const CATEGORIES: AnnouncementCategory[] = [
  'LELANG',
  'PEMBUKTIAN',
  'RAPAT',
  'PENGUMUMAN',
  'LAINNYA',
];

export default function AdminAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await listAnnouncements(includeInactive, categoryFilter || undefined);
      setItems(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeInactive, categoryFilter]);

  const handleDelete = async (a: Announcement) => {
    if (!confirm('Hapus agenda "' + a.title + '"?')) return;
    try {
      await deleteAnnouncement(a.id);
      load();
    } catch (e) {
      alert('Gagal: ' + (e as Error).message);
    }
  };

  const handleToggleActive = async (a: Announcement) => {
    try {
      await updateAnnouncement(a.id, { isActive: !a.isActive });
      load();
    } catch (e) {
      alert('Gagal: ' + (e as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header + Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">
              Daftar Agenda & Pengumuman
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Agenda aktif akan tampil otomatis di kiosk
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg"
            >
              <option value="">Semua Kategori</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
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
              + Tambah Agenda
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-400 text-sm">Memuat...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-2 opacity-40">--</div>
            <div className="text-slate-400 text-sm">
              Belum ada agenda. Klik "+ Tambah Agenda" untuk mulai.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((a) => (
              <AnnouncementCard
                key={a.id}
                announcement={a}
                onEdit={() => setEditing(a)}
                onToggleActive={() => handleToggleActive(a)}
                onDelete={() => handleDelete(a)}
              />
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <AnnouncementFormModal
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}

      {editing && (
        <AnnouncementFormModal
          announcement={editing}
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

function AnnouncementCard({
  announcement,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  announcement: Announcement;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const a = announcement;
  const cat = a.category ?? 'LAINNYA';
  const catColor = CATEGORY_COLOR[cat] ?? CATEGORY_COLOR.LAINNYA;
  const catLabel = CATEGORY_LABEL[cat] ?? cat;

  // Format tanggal
  const start = new Date(a.startDate).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const end = a.endDate
    ? new Date(a.endDate).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null;

  // Cek multi-day
  const startIso = new Date(a.startDate).toISOString().slice(0, 10);
  const endIso = a.endDate ? new Date(a.endDate).toISOString().slice(0, 10) : null;
  const isMultiDay = endIso && endIso !== startIso;

  // Cek hari ini
  const today = new Date().toISOString().slice(0, 10);
  const isToday = startIso === today;
  const isEndingToday = endIso === today;

  let dateRangeText = '';
  if (isMultiDay) {
    dateRangeText = `${start} - ${end}`;
  } else {
    dateRangeText = start;
  }

  return (
    <div
      className={
        'border-2 rounded-2xl p-5 transition ' +
        (a.isActive
          ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 opacity-60')
      }
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={
                'inline-block px-2.5 py-0.5 text-xs font-medium rounded-md border ' + catColor
              }
            >
              {catLabel}
            </span>
            {a.isActive ? (
              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                Aktif
              </span>
            ) : (
              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                Nonaktif
              </span>
            )}
            {a.priority > 0 && (
              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                ⭐ Prioritas {a.priority}
              </span>
            )}
            {isToday && (
              <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-md bg-rose-500 text-white animate-pulse">
                HARI INI
              </span>
            )}
            {isEndingToday && isMultiDay && (
              <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-md bg-amber-500 text-white">
                HARI TERAKHIR
              </span>
            )}
          </div>
          <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">
            {a.title}
          </h4>
          {a.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              {a.description}
            </p>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <span>📅</span>
          <span>
            {dateRangeText}
            {isMultiDay && ' (multi-hari)'}
          </span>
        </div>
        {(a.startTime || a.endTime) && (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span>⏰</span>
            <span>
              {a.startTime ?? '-'} - {a.endTime ?? '-'}
            </span>
          </div>
        )}
        {a.location && (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span>📍</span>
            <span>{a.location}</span>
          </div>
        )}
        {a.referenceNo && (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span>📄</span>
            <span className="font-mono">{a.referenceNo}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onEdit}
          className="px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded"
        >
          Edit
        </button>
        <button
          onClick={onToggleActive}
          className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded"
        >
          {a.isActive ? 'Nonaktifkan' : 'Aktifkan'}
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1.5 text-xs bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded ml-auto"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}

function AnnouncementFormModal({
  announcement,
  onClose,
  onSaved,
}: {
  announcement?: Announcement;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!announcement;

  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    title: announcement?.title ?? '',
    description: announcement?.description ?? '',
    category: announcement?.category ?? ('PENGUMUMAN' as AnnouncementCategory),
    referenceNo: announcement?.referenceNo ?? '',
    location: announcement?.location ?? '',
    startDate: announcement?.startDate
      ? new Date(announcement.startDate).toISOString().slice(0, 10)
      : today,
    endDate: announcement?.endDate
      ? new Date(announcement.endDate).toISOString().slice(0, 10)
      : '',
    startTime: announcement?.startTime ?? '',
    endTime: announcement?.endTime ?? '',
    priority: announcement?.priority ?? 0,
    isActive: announcement?.isActive ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!form.title.trim()) {
      setError('Judul wajib diisi');
      return;
    }
    if (!form.startDate) {
      setError('Tanggal mulai wajib diisi');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload: CreateAnnouncementPayload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        category: form.category,
        referenceNo: form.referenceNo.trim() || undefined,
        location: form.location.trim() || undefined,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
        priority: form.priority,
        isActive: form.isActive,
      };

      if (isEdit && announcement) {
        await updateAnnouncement(announcement.id, payload as UpdateAnnouncementPayload);
      } else {
        await createAnnouncement(payload);
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6 my-8">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4">
          {isEdit ? 'Edit Agenda' : 'Tambah Agenda'}
        </h3>

        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Judul Agenda *
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
              placeholder="Masa Penyerahan Jaminan Lelang"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Deskripsi
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass + ' resize-none'}
              rows={2}
              placeholder="Detail agenda..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Kategori
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as AnnouncementCategory })
                }
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABEL[c]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Nomor Referensi
              </label>
              <input
                value={form.referenceNo}
                onChange={(e) => setForm({ ...form, referenceNo: e.target.value })}
                className={inputClass}
                placeholder="SDA012026"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Lokasi
            </label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className={inputClass}
              placeholder="Lobby Lantai 1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Tanggal Mulai *
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Tanggal Selesai (opsional)
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className={inputClass}
              />
              <p className="text-xs text-slate-400 mt-1">
                Kosongkan jika hanya 1 hari
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Jam Mulai
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Jam Selesai
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Prioritas (0-999)
              </label>
              <input
                type="number"
                min={0}
                max={999}
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: parseInt(e.target.value, 10) || 0 })
                }
                className={inputClass}
              />
              <p className="text-xs text-slate-400 mt-1">
                Yang tinggi tampil lebih atas
              </p>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                Agenda aktif
              </label>
            </div>
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