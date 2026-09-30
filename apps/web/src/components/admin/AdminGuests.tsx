import { useEffect, useState } from 'react';
import {
  listGuests,
  updateGuest,
  deleteGuest,
  UpdateGuestPayload,
} from '@/services/guest.service';
import type { Guest } from '@/types';

export default function AdminGuests() {
  const [items, setItems] = useState<Guest[]>([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);

  const pageSize = 20;

  const load = async () => {
    setLoading(true);
    try {
      const r = await listGuests(q, page, pageSize);
      setItems(r.items);
      setTotal(r.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page]);

  const handleDelete = async (g: Guest) => {
    if (!confirm('Hapus tamu "' + g.fullName + '"? Tindakan ini tidak bisa dibatalkan.')) return;
    try {
      await deleteGuest(g.id);
      load();
    } catch (e) {
      alert('Gagal hapus: ' + (e as Error).message);
    }
  };

  const handleExportExcel = () => {
    if (items.length === 0) return alert('Tidak ada data untuk diexport.');

    const headers = ['No', 'Nama', 'Instansi', 'Alamat', 'NIK', 'HP', 'Email', 'Terdaftar'];
    const rows = items.map((g, i) => [
      i + 1,
      g.fullName,
      g.company ?? '',
      g.address ?? '',
      g.nik ?? '',
      g.phone ?? '',
      g.email ?? '',
      new Date(g.createdAt).toLocaleString('id-ID'),
    ]);

    const esc = (s: unknown) =>
      String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const html =
      '<html xmlns:x="urn:schemas-microsoft-com:office:excel">' +
      '<head><meta charset="UTF-8"><style>' +
      'table{border-collapse:collapse;font-family:Arial,sans-serif;font-size:12px}' +
      'th{background:#1a56f5;color:#fff;padding:8px;border:1px solid #ddd;text-align:left}' +
      'td{padding:6px 8px;border:1px solid #eee}' +
      '</style></head><body>' +
      '<h3>Data Tamu - ' + new Date().toLocaleDateString('id-ID') + '</h3>' +
      '<table><thead><tr>' +
      headers.map((h) => '<th>' + esc(h) + '</th>').join('') +
      '</tr></thead><tbody>' +
      rows
        .map(
          (r) =>
            '<tr>' +
            r.map((c) => '<td>' + esc(c) + '</td>').join('') +
            '</tr>'
        )
        .join('') +
      '</tbody></table></body></html>';

    const blob = new Blob(['\ufeff' + html], {
      type: 'application/vnd.ms-excel;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data-tamu-' + new Date().toISOString().slice(0, 10) + '.xls';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    if (items.length === 0) return alert('Tidak ada data untuk diexport.');
    const headers = ['Nama', 'Instansi', 'Alamat', 'NIK', 'HP', 'Email', 'Terdaftar'];
    const rows = items.map((g) => [
      g.fullName,
      g.company ?? '',
      g.address ?? '',
      g.nik ?? '',
      g.phone ?? '',
      g.email ?? '',
      new Date(g.createdAt).toLocaleString('id-ID'),
    ]);
    const csv =
      '\uFEFF' +
      [headers, ...rows]
        .map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(','))
        .join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tamu-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Cari nama atau instansi..."
          className="flex-1 min-w-[240px] px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          onClick={handleExportExcel}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
        >
          Export Excel
        </button>
        <button
          onClick={handleExportCsv}
          className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Instansi</th>
                <th className="px-4 py-3 text-left">NIK</th>
                <th className="px-4 py-3 text-left">HP</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Terdaftar</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Memuat...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    Belum ada data
                  </td>
                </tr>
              ) : (
                items.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{g.fullName}</td>
                    <td className="px-4 py-3 text-slate-600">{g.company ?? '-'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {g.nik ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{g.phone ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{g.email ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(g.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditing(g)}
                          className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(g)}
                          className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Total: {total} - Halaman {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded text-sm"
            >
              Sebelumnya
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded text-sm"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      {editing && (
        <EditModal
          guest={editing}
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

function EditModal({
  guest,
  onClose,
  onSaved,
}: {
  guest: Guest;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<UpdateGuestPayload>({
    fullName: guest.fullName,
    company: guest.company ?? '',
    address: guest.address ?? '',
    nik: guest.nik ?? '',
    phone: guest.phone ?? '',
    email: guest.email ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateGuest(guest.id, form);
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h3 className="font-bold text-lg text-slate-800 mb-4">Edit Tamu</h3>
        <div className="space-y-3">
          <Field label="Nama">
            <input
              className={inputClass}
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </Field>
          <Field label="Instansi">
            <input
              className={inputClass}
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </Field>
          <Field label="Alamat">
            <input
              className={inputClass}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Field>
          <Field label="NIK">
            <input
              className={inputClass}
              value={form.nik}
              onChange={(e) => setForm({ ...form, nik: e.target.value })}
            />
          </Field>
          <Field label="HP">
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <input
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
        </div>
        {error && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>
        )}
        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm"
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  );
}