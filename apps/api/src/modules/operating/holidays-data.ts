/**
 * Preset hari libur nasional Indonesia.
 * Sumber: SKB 3 Menteri (perkiraan).
 * Admin bisa edit/tambah/hapus via Admin Panel.
 *
 * Catatan: Beberapa tanggal bersifat perkiraan (terutama libur keagamaan).
 * Update tahunan disarankan.
 */

export interface HolidayPreset {
  date: string; // format YYYY-MM-DD
  name: string;
}

export const HOLIDAYS_2026: HolidayPreset[] = [
  { date: '2026-01-01', name: 'Tahun Baru Masehi' },
  { date: '2026-01-16', name: 'Isra Mikraj Nabi Muhammad SAW' },
  { date: '2026-02-17', name: 'Tahun Baru Imlek 2577' },
  { date: '2026-03-19', name: 'Hari Suci Nyepi (Tahun Baru Saka)' },
  { date: '2026-03-20', name: 'Awal Ramadan 1447 H' },
  { date: '2026-04-03', name: 'Wafat Isa Al-Masih' },
  { date: '2026-04-05', name: 'Kebangkitan Isa Al-Masih' },
  { date: '2026-04-10', name: 'Hari Raya Idul Fitri 1447 H' },
  { date: '2026-04-11', name: 'Hari Raya Idul Fitri 1447 H (Hari Kedua)' },
  { date: '2026-05-01', name: 'Hari Buruh Internasional' },
  { date: '2026-05-14', name: 'Kenaikan Isa Al-Masih' },
  { date: '2026-05-27', name: 'Hari Raya Waisak 2570 BE' },
  { date: '2026-06-01', name: 'Hari Lahir Pancasila' },
  { date: '2026-06-27', name: 'Hari Raya Idul Adha 1447 H' },
  { date: '2026-07-07', name: 'Tahun Baru Islam 1448 H' },
  { date: '2026-08-17', name: 'Hari Kemerdekaan RI' },
  { date: '2026-09-15', name: 'Maulid Nabi Muhammad SAW' },
  { date: '2026-12-25', name: 'Hari Raya Natal' },
];

export const HOLIDAYS_2025: HolidayPreset[] = [
  { date: '2025-01-01', name: 'Tahun Baru Masehi' },
  { date: '2025-01-27', name: 'Isra Mikraj Nabi Muhammad SAW' },
  { date: '2025-01-29', name: 'Tahun Baru Imlek 2576' },
  { date: '2025-03-14', name: 'Hari Suci Nyepi' },
  { date: '2025-03-31', name: 'Hari Raya Idul Fitri 1446 H' },
  { date: '2025-04-01', name: 'Hari Raya Idul Fitri 1446 H' },
  { date: '2025-04-18', name: 'Wafat Isa Al-Masih' },
  { date: '2025-05-01', name: 'Hari Buruh Internasional' },
  { date: '2025-05-12', name: 'Hari Raya Waisak 2569 BE' },
  { date: '2025-05-29', name: 'Kenaikan Isa Al-Masih' },
  { date: '2025-06-01', name: 'Hari Lahir Pancasila' },
  { date: '2025-06-06', name: 'Hari Raya Idul Adha 1446 H' },
  { date: '2025-06-27', name: 'Tahun Baru Islam 1447 H' },
  { date: '2025-08-17', name: 'Hari Kemerdekaan RI' },
  { date: '2025-09-05', name: 'Maulid Nabi Muhammad SAW' },
  { date: '2025-12-25', name: 'Hari Raya Natal' },
];

export function getHolidaysByYear(year: number): HolidayPreset[] {
  if (year === 2026) return HOLIDAYS_2026;
  if (year === 2025) return HOLIDAYS_2025;
  return [];
}