import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { MonthlyReport } from '@/services/reports.service';

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 40;

const COLOR_PRIMARY = rgb(0.1, 0.34, 0.96);
const COLOR_DARK = rgb(0.06, 0.09, 0.16);
const COLOR_GRAY = rgb(0.4, 0.45, 0.5);
const COLOR_LIGHT_GRAY = rgb(0.9, 0.92, 0.95);
const COLOR_WHITE = rgb(1, 1, 1);
const COLOR_AMBER = rgb(0.96, 0.62, 0.04);
const COLOR_EMERALD = rgb(0.06, 0.72, 0.5);

const STATUS_LABEL: Record<string, string> = {
  WAITING: 'Menunggu',
  IN_PROGRESS: 'Diproses',
  DONE: 'Selesai',
  CANCELED: 'Batal',
};

export async function generateMonthlyPDF(data: MonthlyReport): Promise<void> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // ============================================================
  // PAGE 1 - Cover + Summary + Chart
  // ============================================================
  const page1 = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
  let y = A4_HEIGHT - MARGIN;

  // Header bar
  page1.drawRectangle({
    x: 0,
    y: A4_HEIGHT - 90,
    width: A4_WIDTH,
    height: 90,
    color: COLOR_PRIMARY,
  });
  page1.drawText('LAPORAN BULANAN', {
    x: MARGIN,
    y: A4_HEIGHT - 50,
    size: 22,
    font: fontBold,
    color: COLOR_WHITE,
  });
  page1.drawText('BUKU TAMU DIGITAL', {
    x: MARGIN,
    y: A4_HEIGHT - 75,
    size: 12,
    font: font,
    color: rgb(0.9, 0.95, 1),
  });
  page1.drawText(data.period.label, {
    x: A4_WIDTH - MARGIN - fontBold.widthOfTextAtSize(data.period.label, 16),
    y: A4_HEIGHT - 60,
    size: 16,
    font: fontBold,
    color: COLOR_WHITE,
  });

  y = A4_HEIGHT - 130;

  // Ringkasan Eksekutif
  page1.drawText('RINGKASAN EKSEKUTIF', {
    x: MARGIN,
    y,
    size: 13,
    font: fontBold,
    color: COLOR_DARK,
  });
  y -= 8;
  page1.drawLine({
    start: { x: MARGIN, y },
    end: { x: A4_WIDTH - MARGIN, y },
    thickness: 2,
    color: COLOR_PRIMARY,
  });
  y -= 20;

  // 4 summary cards
  const cards = [
    { label: 'Total Kunjungan', value: String(data.summary.totalVisits) },
    { label: 'Tamu Unik', value: String(data.summary.uniqueGuests) },
    { label: 'Serah Terima', value: String(data.summary.totalHandovers) },
    {
      label: 'Hari Tersibuk',
      value: data.summary.busiestDay.label + ', ' + data.summary.busiestDay.day,
    },
  ];
  const cardW = (A4_WIDTH - 2 * MARGIN - 3 * 10) / 4;
  const cardH = 60;

  cards.forEach((c, i) => {
    const x = MARGIN + i * (cardW + 10);
    page1.drawRectangle({
      x,
      y: y - cardH,
      width: cardW,
      height: cardH,
      color: COLOR_LIGHT_GRAY,
      borderColor: COLOR_PRIMARY,
      borderWidth: 1,
    });
    page1.drawText(c.label, {
      x: x + 8,
      y: y - 18,
      size: 8,
      font: font,
      color: COLOR_GRAY,
    });
    page1.drawText(c.value, {
      x: x + 8,
      y: y - 42,
      size: 16,
      font: fontBold,
      color: COLOR_PRIMARY,
    });
  });

  y -= cardH + 25;

  // Status Breakdown
  page1.drawText('STATUS KUNJUNGAN', {
    x: MARGIN,
    y,
    size: 11,
    font: fontBold,
    color: COLOR_DARK,
  });
  y -= 16;

  const statuses = [
    { label: 'Menunggu', value: data.summary.byStatus.WAITING, color: COLOR_AMBER },
    { label: 'Diproses', value: data.summary.byStatus.IN_PROGRESS, color: COLOR_PRIMARY },
    { label: 'Selesai', value: data.summary.byStatus.DONE, color: COLOR_EMERALD },
    { label: 'Batal', value: data.summary.byStatus.CANCELED, color: COLOR_GRAY },
  ];

  const statusColW = (A4_WIDTH - 2 * MARGIN) / 4;
  statuses.forEach((s, i) => {
    const x = MARGIN + i * statusColW;
    page1.drawText(s.label, {
      x,
      y,
      size: 9,
      font: font,
      color: COLOR_GRAY,
    });
    page1.drawText(String(s.value), {
      x,
      y: y - 16,
      size: 18,
      font: fontBold,
      color: s.color,
    });
  });

  y -= 50;

  // Chart per Hari
  page1.drawText('KUNJUNGAN PER HARI', {
    x: MARGIN,
    y,
    size: 11,
    font: fontBold,
    color: COLOR_DARK,
  });
  y -= 20;

  const chartH = 120;
  const chartW = A4_WIDTH - 2 * MARGIN;
  const barW = chartW / data.byDay.length;
  const maxDay = Math.max(...data.byDay.map((d) => d.count), 1);

  // Baseline
  page1.drawLine({
    start: { x: MARGIN, y: y - chartH },
    end: { x: MARGIN + chartW, y: y - chartH },
    thickness: 0.5,
    color: COLOR_LIGHT_GRAY,
  });

  data.byDay.forEach((d, i) => {
    const barHeight = (d.count / maxDay) * chartH;
    const x = MARGIN + i * barW + barW * 0.15;
    const w = barW * 0.7;
    if (d.count > 0) {
      page1.drawRectangle({
        x,
        y: y - chartH,
        width: w,
        height: Math.max(barHeight, 2),
        color: COLOR_PRIMARY,
      });
      page1.drawText(String(d.count), {
        x: x + w / 2 - font.widthOfTextAtSize(String(d.count), 7) / 2,
        y: y - chartH + barHeight + 2,
        size: 7,
        font: fontBold,
        color: COLOR_PRIMARY,
      });
    }
    // Label tanggal di bawah (hanya ganjil)
    if (i % 2 === 0) {
      page1.drawText(d.day, {
        x: x + w / 2 - 4,
        y: y - chartH - 10,
        size: 6,
        font: font,
        color: COLOR_GRAY,
      });
    }
  });

  y -= chartH + 25;

  // Top Tujuan
  page1.drawText('TOP TUJUAN', {
    x: MARGIN,
    y,
    size: 11,
    font: fontBold,
    color: COLOR_DARK,
  });
  y -= 16;

  data.byDestination.slice(0, 6).forEach((d) => {
    const maxDest = data.byDestination[0]?.count ?? 1;
    const barW2 = (d.count / maxDest) * 200;
    page1.drawText(d.destination.substring(0, 35), {
      x: MARGIN,
      y,
      size: 9,
      font: font,
      color: COLOR_DARK,
    });
    page1.drawRectangle({
      x: MARGIN + 210,
      y: y - 2,
      width: barW2,
      height: 8,
      color: COLOR_PRIMARY,
    });
    page1.drawText(String(d.count), {
      x: MARGIN + 210 + barW2 + 5,
      y,
      size: 9,
      font: fontBold,
      color: COLOR_PRIMARY,
    });
    y -= 14;
  });

  // ============================================================
  // PAGE 2+ - Tabel Detail
  // ============================================================
  let page = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
  y = A4_HEIGHT - MARGIN;

  // Header kecil di setiap halaman tabel
  page.drawRectangle({
    x: 0,
    y: A4_HEIGHT - 50,
    width: A4_WIDTH,
    height: 50,
    color: COLOR_PRIMARY,
  });
  page.drawText('DETAIL KUNJUNGAN - ' + data.period.label, {
    x: MARGIN,
    y: A4_HEIGHT - 30,
    size: 12,
    font: fontBold,
    color: COLOR_WHITE,
  });

  y = A4_HEIGHT - 70;

  // Table header
  const cols = [
    { key: 'no', label: 'No', x: MARGIN, w: 22 },
    { key: 'date', label: 'Tanggal', x: MARGIN + 22, w: 55 },
    { key: 'queue', label: 'Antrean', x: MARGIN + 77, w: 42 },
    { key: 'nama', label: 'Nama', x: MARGIN + 119, w: 95 },
    { key: 'inst', label: 'Instansi', x: MARGIN + 214, w: 85 },
    { key: 'tujuan', label: 'Tujuan', x: MARGIN + 299, w: 80 },
    { key: 'keperluan', label: 'Keperluan', x: MARGIN + 379, w: 90 },
    { key: 'status', label: 'Status', x: MARGIN + 469, w: 46 },
  ];

  // Draw header
  page.drawRectangle({
    x: MARGIN,
    y: y - 14,
    width: A4_WIDTH - 2 * MARGIN,
    height: 16,
    color: COLOR_LIGHT_GRAY,
  });
  cols.forEach((c) => {
    page.drawText(c.label, {
      x: c.x + 2,
      y: y - 10,
      size: 7,
      font: fontBold,
      color: COLOR_DARK,
    });
  });
  y -= 18;

  const rowH = 14;

  for (const r of data.rows) {
    if (y < MARGIN + 40) {
      page = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
      y = A4_HEIGHT - MARGIN;
      page.drawRectangle({
        x: MARGIN,
        y: y - 14,
        width: A4_WIDTH - 2 * MARGIN,
        height: 16,
        color: COLOR_LIGHT_GRAY,
      });
      cols.forEach((c) => {
        page.drawText(c.label, {
          x: c.x + 2,
          y: y - 10,
          size: 7,
          font: fontBold,
          color: COLOR_DARK,
        });
      });
      y -= 18;
    }

    const idx = data.rows.indexOf(r) + 1;
    const rowData: Record<string, string> = {
      no: String(idx),
      date: new Date(r.date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      }),
      queue: r.queueNumber,
      nama: r.guestName.substring(0, 20),
      inst: (r.company ?? '-').substring(0, 18),
      tujuan: r.destination.substring(0, 16),
      keperluan: (r.letterSubject ?? r.purpose).substring(0, 20),
      status: STATUS_LABEL[r.status] ?? r.status,
    };

    cols.forEach((c) => {
      page.drawText(rowData[c.key] ?? '', {
        x: c.x + 2,
        y: y - 8,
        size: 7,
        font: font,
        color: COLOR_DARK,
      });
    });

    page.drawLine({
      start: { x: MARGIN, y: y - 12 },
      end: { x: A4_WIDTH - MARGIN, y: y - 12 },
      thickness: 0.3,
      color: COLOR_LIGHT_GRAY,
    });
    y -= rowH;
  }

  // ============================================================
  // Last page - Tanda tangan
  // ============================================================
  if (y < MARGIN + 120) {
    page = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
    y = A4_HEIGHT - MARGIN - 50;
  } else {
    y -= 30;
  }

  page.drawText('Tanda Tangan', {
    x: MARGIN,
    y,
    size: 11,
    font: fontBold,
    color: COLOR_DARK,
  });
  y -= 60;

  const sigW = (A4_WIDTH - 2 * MARGIN - 40) / 2;
  page.drawText('Petugas Buku Tamu', {
    x: MARGIN + sigW / 2 - 40,
    y,
    size: 10,
    font: font,
    color: COLOR_DARK,
  });
  page.drawText('Kepala Bagian', {
    x: MARGIN + sigW + 40 + sigW / 2 - 35,
    y,
    size: 10,
    font: font,
    color: COLOR_DARK,
  });

  y -= 70;
  page.drawLine({
    start: { x: MARGIN + 20, y },
    end: { x: MARGIN + 20 + sigW - 40, y },
    thickness: 0.5,
    color: COLOR_DARK,
  });
  page.drawLine({
    start: { x: MARGIN + sigW + 60, y },
    end: { x: A4_WIDTH - MARGIN - 20, y },
    thickness: 0.5,
    color: COLOR_DARK,
  });

  // Footer
  const footY = MARGIN - 15;
  page.drawText(
    'Dicetak: ' + new Date(data.generatedAt).toLocaleString('id-ID'),
    {
      x: MARGIN,
      y: footY,
      size: 7,
      font: font,
      color: COLOR_GRAY,
    }
  );
  page.drawText('Buku Tamu Digital', {
    x: A4_WIDTH - MARGIN - font.widthOfTextAtSize('Buku Tamu Digital', 7),
    y: footY,
    size: 7,
    font: font,
    color: COLOR_GRAY,
  });

  // ============================================================
  // SAVE + DOWNLOAD
  // ============================================================
  const pdfBytes = await pdf.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download =
    'Laporan-BukuTamu-' +
    data.period.year +
    '-' +
    String(data.period.month).padStart(2, '0') +
    '.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}