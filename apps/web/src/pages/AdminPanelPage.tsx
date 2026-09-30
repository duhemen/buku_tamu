import { useState } from 'react';
import AdminGuests from '@/components/admin/AdminGuests';
import AdminVisits from '@/components/admin/AdminVisits';
import AdminQueues from '@/components/admin/AdminQueues';
import AdminHandovers from '@/components/admin/AdminHandovers';

type Tab = 'queues' | 'visits' | 'guests' | 'handovers';

export default function AdminPanelPage() {
  const [tab, setTab] = useState<Tab>('queues');

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'queues', label: 'Antrean', icon: 'A' },
    { key: 'visits', label: 'Kunjungan', icon: 'K' },
    { key: 'handovers', label: 'Serah Terima', icon: 'T' },
    { key: 'guests', label: 'Data Tamu', icon: 'G' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          Admin Panel
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kelola antrean, kunjungan, serah terima, dan data tamu
        </p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              'px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition whitespace-nowrap ' +
              (tab === t.key
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200')
            }
          >
            <span className="mr-1.5 font-bold">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'queues' && <AdminQueues />}
      {tab === 'visits' && <AdminVisits />}
      {tab === 'handovers' && <AdminHandovers />}
      {tab === 'guests' && <AdminGuests />}
    </div>
  );
}