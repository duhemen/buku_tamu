import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import type { Handover } from '@/types';

interface Props {
  handover: Handover;
  guestName: string;
  guestCompany?: string | null;
  queueNumber: string;
}

const TYPE_LABEL: Record<string, string> = {
  SURAT: 'Surat / Dokumen',
  JAMINAN_TENDER: 'Jaminan Tender / Lelang',
  PAKET: 'Paket / Barang',
  DOKUMEN: 'Dokumen',
  LAINNYA: 'Lainnya',
};

export default function HandoverReceipt({
  handover,
  guestName,
  guestCompany,
  queueNumber,
}: Props) {
  const qrRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (qrRef.current) {
      const payload = JSON.stringify({
        t: 'handover',
        c: handover.code,
        v: handover.visitId,
      });
      QRCode.toCanvas(qrRef.current, payload, {
        width: 100,
        margin: 1,
      }).catch(console.error);
    }
  }, [handover.code, handover.visitId]);

  const receivedAt = new Date(handover.receivedAt);

  return (
    <div
      id="handover-receipt"
      className="bg-white text-black mx-auto"
      style={{ width: '80mm', padding: '4mm', fontFamily: 'Inter, sans-serif' }}
    >
      <div className="text-center border-b border-dashed border-black pb-2 mb-3">
        <div className="font-bold text-sm">BUKTI TERIMA</div>
        <div className="text-[10px]">Buku Tamu Digital</div>
      </div>

      <div className="text-center my-3">
        <div className="text-[10px] uppercase tracking-wider">Kode Bukti</div>
        <div className="text-xl font-bold tracking-wider my-1">{handover.code}</div>
      </div>

      <div className="text-[10px] leading-tight space-y-1 mb-3">
        <Row label="Tanggal" value={receivedAt.toLocaleDateString('id-ID')} />
        <Row
          label="Jam"
          value={receivedAt.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        />
        <Row label="Antrean" value={queueNumber} />
      </div>

      <div className="border-t border-dashed border-black pt-2 mb-3 text-[10px] leading-tight space-y-1">
        <Row label="Nama" value={guestName} bold />
        {guestCompany && <Row label="Instansi" value={guestCompany} />}
      </div>

      <div className="border-t border-dashed border-black pt-2 mb-3 text-[10px] leading-tight space-y-1">
        <Row label="Jenis" value={TYPE_LABEL[handover.type] ?? handover.type} bold />
        {handover.referenceNo && (
          <Row label="No. Ref" value={handover.referenceNo} />
        )}
        <div className="mt-1">
          <div className="text-gray-600 mb-0.5">Deskripsi:</div>
          <div className="border border-gray-300 rounded p-1.5 text-[9px] min-h-[10mm]">
            {handover.description}
          </div>
        </div>
        {handover.recipient && (
          <Row label="Penerima" value={handover.recipient} />
        )}
        {handover.notes && (
          <div className="mt-1">
            <div className="text-gray-600">Catatan:</div>
            <div className="text-[9px] italic">{handover.notes}</div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-dashed border-black pt-2 my-2">
        <canvas ref={qrRef} className="w-[18mm] h-[18mm]" />
        <div className="text-[8px] text-right leading-tight">
          <div>Status: {handover.status}</div>
          <div className="mt-1 italic">Simpan sebagai bukti</div>
        </div>
      </div>

      <div className="border-t border-dashed border-black pt-2 mt-2 text-[8px]">
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="text-center">
            <div className="border-t border-black pt-1 mt-6">Penerima</div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-1 mt-6">Pengirim</div>
          </div>
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