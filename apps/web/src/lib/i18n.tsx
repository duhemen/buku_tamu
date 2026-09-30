import { createContext, useContext, ReactNode } from 'react';
import { useUIStore, Lang } from '@/stores/theme.store';

type Dict = Record<string, string>;

const id: Dict = {
  'app.name': 'Buku Tamu Digital',
  'nav.home': 'Beranda',
  'nav.dashboard': 'Dashboard',
  'nav.kiosk': 'Kiosk',
  'nav.login': 'Masuk',
  'nav.logout': 'Keluar',
  'nav.verify': 'Verifikasi',
  'nav.admin': 'Admin',
  'home.title': 'Selamat Datang',
  'home.subtitle': 'Sistem Buku Tamu Digital Terintegrasi',
  'home.kiosk.title': 'Kiosk Tamu',
  'home.kiosk.desc': 'Daftar kunjungan, ambil nomor antrean, dan cetak kartu tamu.',
  'home.dashboard.title': 'Dashboard Publik',
  'home.dashboard.desc': 'Statistik kunjungan hari ini, tanpa data sensitif.',
  'home.login.title': 'Login Petugas',
  'home.login.desc': 'Untuk resepsionis, admin, dan security.',
  'login.title': 'Login Petugas',
  'login.subtitle': 'Masuk untuk mengelola buku tamu',
  'login.email': 'Email',
  'login.password': 'Password',
  'login.submit': 'Masuk',
  'login.processing': 'Memproses...',
  'login.back': 'Kembali ke beranda',
  'dashboard.title': 'Dashboard Publik',
  'dashboard.subtitle': 'Statistik kunjungan hari ini - Data sensitif disembunyikan',
  'dashboard.totalToday': 'Total Hari Ini',
  'dashboard.waiting': 'Menunggu',
  'dashboard.inProgress': 'Diproses',
  'dashboard.done': 'Selesai',
  'dashboard.hourly': 'Kunjungan Per Jam',
  'dashboard.destination': 'Tujuan Kunjungan',
  'dashboard.list': 'Daftar Tamu Hari Ini',
  'dashboard.noData': 'Belum ada data',
  'dashboard.noVisits': 'Belum ada tamu hari ini',
  'dashboard.privacy': 'NIK, nomor HP, dan email sudah disensor untuk melindungi privasi tamu.',
  'dashboard.updated': 'Update terakhir',
  'common.loading': 'Memuat...',
  'common.cancel': 'Batal',
  'common.save': 'Simpan',
  'common.edit': 'Edit',
  'common.delete': 'Hapus',
  'common.search': 'Cari...',
  'common.status': 'Status',
  'status.WAITING': 'Menunggu',
  'status.IN_PROGRESS': 'Diproses',
  'status.DONE': 'Selesai',
  'status.CANCELED': 'Batal',
  'status.CALLED': 'Dipanggil',
  'status.SERVED': 'Dilayani',
};

const en: Dict = {
  'app.name': 'Digital Guest Book',
  'nav.home': 'Home',
  'nav.dashboard': 'Dashboard',
  'nav.kiosk': 'Kiosk',
  'nav.login': 'Sign In',
  'nav.logout': 'Sign Out',
  'nav.verify': 'Verify',
  'nav.admin': 'Admin',
  'home.title': 'Welcome',
  'home.subtitle': 'Integrated Digital Guest Book System',
  'home.kiosk.title': 'Guest Kiosk',
  'home.kiosk.desc': 'Register your visit, take a queue number, and print a guest card.',
  'home.dashboard.title': 'Public Dashboard',
  'home.dashboard.desc': 'Today visits statistics, no sensitive data.',
  'home.login.title': 'Staff Login',
  'home.login.desc': 'For receptionists, admins, and security.',
  'login.title': 'Staff Login',
  'login.subtitle': 'Sign in to manage the guest book',
  'login.email': 'Email',
  'login.password': 'Password',
  'login.submit': 'Sign In',
  'login.processing': 'Processing...',
  'login.back': 'Back to home',
  'dashboard.title': 'Public Dashboard',
  'dashboard.subtitle': 'Today visits statistics - Sensitive data hidden',
  'dashboard.totalToday': 'Total Today',
  'dashboard.waiting': 'Waiting',
  'dashboard.inProgress': 'In Progress',
  'dashboard.done': 'Done',
  'dashboard.hourly': 'Visits Per Hour',
  'dashboard.destination': 'Visit Destinations',
  'dashboard.list': 'Today Guest List',
  'dashboard.noData': 'No data yet',
  'dashboard.noVisits': 'No guests today',
  'dashboard.privacy': 'NIK, phone numbers, and emails are masked to protect guest privacy.',
  'dashboard.updated': 'Last update',
  'common.loading': 'Loading...',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.search': 'Search...',
  'common.status': 'Status',
  'status.WAITING': 'Waiting',
  'status.IN_PROGRESS': 'In Progress',
  'status.DONE': 'Done',
  'status.CANCELED': 'Canceled',
  'status.CALLED': 'Called',
  'status.SERVED': 'Served',
};

const translations: Record<Lang, Dict> = { id, en };

interface I18nContextValue {
  t: (key: string) => string;
  lang: Lang;
}

const I18nContext = createContext<I18nContextValue>({
  t: (k) => k,
  lang: 'id',
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const lang = useUIStore((s) => s.lang);
  const t = (key: string) => translations[lang][key] ?? translations.id[key] ?? key;
  return <I18nContext.Provider value={{ t, lang }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}