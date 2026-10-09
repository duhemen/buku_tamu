import { env } from '../../config/env.js';

// ============================================================
// Config
// ============================================================
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';
const TELEGRAM_API = 'https://api.telegram.org';

// ============================================================
// Types
// ============================================================
interface TelegramResponse {
  ok: boolean;
  result?: {
    message_id: number;
    chat: { id: number };
    text: string;
  };
  description?: string;
}

// ============================================================
// Core: Send Message
// ============================================================
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options?: { markdown?: boolean }
): Promise<{ ok: boolean; messageId?: number; error?: string }> {
  if (!TELEGRAM_BOT_TOKEN) {
    return { ok: false, error: 'TELEGRAM_BOT_TOKEN belum di-set di .env' };
  }

  if (!chatId) {
    return { ok: false, error: 'Chat ID kosong' };
  }

  try {
    const url = TELEGRAM_API + '/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
    const body = {
      chat_id: chatId,
      text: text,
      parse_mode: options?.markdown ? 'MarkdownV2' : undefined,
      disable_web_page_preview: true,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as TelegramResponse;

    if (!data.ok) {
      return { ok: false, error: data.description ?? 'Telegram API error' };
    }

    return { ok: true, messageId: data.result?.message_id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ============================================================
// Test Connection
// ============================================================
export async function testTelegramConnection(): Promise<{
  ok: boolean;
  botName?: string;
  botUsername?: string;
  error?: string;
}> {
  if (!TELEGRAM_BOT_TOKEN) {
    return { ok: false, error: 'TELEGRAM_BOT_TOKEN belum di-set' };
  }

  try {
    const url = TELEGRAM_API + '/bot' + TELEGRAM_BOT_TOKEN + '/getMe';
    const res = await fetch(url);
    const data = (await res.json()) as {
      ok: boolean;
      result?: { first_name: string; username: string };
      description?: string;
    };

    if (!data.ok || !data.result) {
      return { ok: false, error: data.description ?? 'Unknown error' };
    }

    return {
      ok: true,
      botName: data.result.first_name,
      botUsername: '@' + data.result.username,
    };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ============================================================
// Notifikasi Tamu Datang
// ============================================================
export async function notifyGuestArrival(params: {
  chatId: string;
  guestName: string;
  guestCompany?: string | null;
  purpose: string;
  destination: string;
  queueNumber: string;
  hasHandover?: boolean;
  handoverType?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const lines = [
    '🔔 *TAMU DATANG*',
    '',
    '*Nama*: ' + params.guestName,
  ];

  if (params.guestCompany) {
    lines.push('*Instansi*: ' + params.guestCompany);
  }

  lines.push(
    '*Tujuan*: ' + params.destination,
    '*Keperluan*: ' + params.purpose,
    '*No. Antrean*: `' + params.queueNumber + '`'
  );

  if (params.hasHandover && params.handoverType) {
    const typeLabels: Record<string, string> = {
      SURAT: 'Surat / Dokumen',
      JAMINAN_TENDER: 'Jaminan Tender',
      PAKET: 'Paket / Barang',
      DOKUMEN: 'Dokumen',
      LAINNYA: 'Lainnya',
    };
    lines.push(
      '',
      '📎 *Serah Terima*: ' + (typeLabels[params.handoverType] ?? params.handoverType)
    );
  }

  lines.push('', '_Mohon siapkan diri menerima tamu._');

  return sendTelegramMessage(params.chatId, lines.join('\n'));
}