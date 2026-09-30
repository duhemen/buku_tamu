import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js';
import type { Visit } from '@/types';

interface Props {
  visit: Visit;
  photo?: string | null;
}

export default function GuestCard({ visit, photo }: Props) {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const barcodeRef = useRef<HTMLCanvasElement>(null);

  const queueNumber = visit.queue?.number ?? '-';
  const guest = visit.guest;
  const letter = visit.letters?.[0];

  useEffect(() => {
    // Generate QR Code (berisi signed token sederhana untuk verifikasi)
    if (qrRef.current) {
      const payload = JSON.stringify({
        v: visit.id,
        q: queueNumber,
        t: new Date(visit.checkInAt).getTime(),
      });
      QRCode.toCanvas(qrRef.current, payload, {
        width: 120,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      }).catch(console.error);
    }

    // Generate Barcode Code128
    if (barcodeRef.current) {
      try {
        bwipjs.toCanvas(barcodeRef.current, {
          bcid: 'code128',
          text: queueNumber,
          scale: 3,
          height: 12,
          includetext: false,
          textxalign: 'center',
        });
      } catch (e) {
        console.error('Barcode error:', e);
      }
    }
  }, [visit.id, queueNumber, visit.checkInAt]);

  const checkInDate = new Date(visit.checkInAt);
  const dateStr = checkInDate.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = checkInDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      id="guest-card"
      className="bg-white text-black mx-auto"
      style={{ width: '80mm', padding: '4mm', fontFamily: 'Inter, sans-serif' }}
    >
      {/* Header */}
      <div className="text-center border-b border-dashed border-black pb-2 mb-3">
        <div className="font-bold text-sm">BUKU TAMU DIGITAL</div>
        <div className="text-[10px]">Kartu Kunjungan</div>
      </div>

      {/* Nomor Antrean - Besar */}
      <div className="text-center my-3">
        <div className="text-[10px] uppercase tracking-wider">Nomor Antrean</div>
        <div className="text-4xl font-bold tracking-wider leading-none my-1">
          {queueNumber}
        </div>
      </div>

      {/* Foto + Info */}
      <div className="flex gap-2 mb-3">
        {photo && (
          <div className="w-[20mm] h-[25mm] border border-black overflow-hidden flex-shrink-0">
            <img src={photo} alt="Foto" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 text-[10px] leading-tight space-y-1">
          <Row label="Nama" value={guest?.fullName ?? '-'} bold />
          {guest?.company && <Row label="Instansi" value={guest.company} />}
          <Row label="Tujuan" value={visit.destination} />
          <Row label="Keperluan" value={visit.purpose} />
          {letter?.subject && <Row label="Perihal" value={letter.subject} />}
        </div>
      </div>

      {/* Surat */}
      {letter && (
        <div className="border-t border-dashed border-black pt-2 mb-3 text-[10px] leading-tight">
          <div className="font-bold mb-1">Surat / Dokumen:</div>
          {letter.letterNumber && <Row label="No" value={letter.letterNumber} />}
          <Row label="Perihal" value={letter.subject} />
          {letter.sender && <Row label="Pengirim" value={letter.sender} />}
          {letter.recipient && <Row label="Penerima" value={letter.recipient} />}
        </div>
      )}

      {/* QR + Barcode */}
      <div className="flex items-center justify-between border-t border-dashed border-black pt-2 my-2">
        <canvas ref={qrRef} className="w-[20mm] h-[20mm]" />
        <div className="flex-1 flex flex-col items-center">
          <canvas ref={barcodeRef} className="max-w-full" />
          <div className="text-[8px] mt-0.5">{queueNumber}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-dashed border-black pt-2 text-[9px] leading-tight">
        <Row label="Tanggal" value={dateStr} />
        <Row label="Jam Masuk" value={timeStr} />
        <div className="mt-2 text-center text-[8px] italic">
          Simpan kartu ini selama berada di area kantor
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex gap-1">
      <span className="w-[16mm] flex-shrink-0 text-gray-600">{label}</span>
      <span className="text-gray-600">:</span>
      <span className={'flex-1 ' + (bold ? 'font-bold' : '')}>{value}</span>
    </div>
  );
}