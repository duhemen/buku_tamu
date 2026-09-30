export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const statusLabel: Record<string, string> = {
  WAITING: 'Menunggu',
  IN_PROGRESS: 'Diproses',
  DONE: 'Selesai',
  CANCELED: 'Batal',
};

export const statusColor: Record<string, string> = {
  WAITING: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  DONE: 'bg-emerald-100 text-emerald-800',
  CANCELED: 'bg-slate-100 text-slate-600',
};