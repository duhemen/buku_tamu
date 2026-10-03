import { useEffect, useRef, useState } from 'react';
import type { OperatingStatusResult } from '@/services/operating.service';

interface Props {
  status: OperatingStatusResult;
}

/**
 * Banner warning saat mendekati cut-off (< 15 menit).
 * - Menampilkan countdown live (update tiap detik)
 * - Suara bell sekali saat pertama render
 * - Progress bar warna warni
 */
export default function CutOffWarningBanner({ status }: Props) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const playedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const minutesLeft = status.minutesUntilCutOff ?? 0;
  const totalMinutes = 15; // anggap window warning 15 menit

  // ============================================================
  // Suara bell (sekali saja saat komponen mount)
  // ============================================================
  const playBell = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // Chime 3 nada: 880, 1100, 1320 Hz
      [880, 1100, 1320].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, now + i * 0.15);
        g.gain.setValueAtTime(0, now + i * 0.15);
        g.gain.linearRampToValueAtTime(0.15, now + i * 0.15 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);
        o.start(now + i * 0.15);
        o.stop(now + i * 0.15 + 0.4);
      });
    } catch (e) {
      console.warn('Bell error:', e);
    }
  };

  useEffect(() => {
    if (playedRef.current) return;
    playedRef.current = true;
    playBell();
  }, []);

  // ============================================================
  // Countdown tiap detik
  // ============================================================
  useEffect(() => {
    const initialSeconds = minutesLeft * 60;
    setSecondsLeft(initialSeconds);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [minutesLeft]);

  const mm = Math.floor((secondsLeft ?? 0) / 60);
  const ss = (secondsLeft ?? 0) % 60;

  // Progress bar (dari 100% ke 0%)
  const progressPercent =
    secondsLeft !== null && minutesLeft > 0
      ? Math.max(0, Math.min(100, (secondsLeft / (minutesLeft * 60)) * 100))
      : 100;

  // Warna gradient berdasarkan sisa waktu
  const colorConfig =
    minutesLeft <= 5
      ? {
          bg: 'bg-gradient-to-r from-rose-500 to-red-600',
          border: 'border-rose-300 dark:border-rose-700',
          text: 'text-rose-800 dark:text-rose-200',
          barBg: 'bg-rose-200',
          barFill: 'bg-gradient-to-r from-rose-500 to-red-600',
          icon: 'X',
        }
      : minutesLeft <= 10
      ? {
          bg: 'bg-gradient-to-r from-orange-500 to-amber-600',
          border: 'border-orange-300 dark:border-orange-700',
          text: 'text-orange-800 dark:text-orange-200',
          barBg: 'bg-orange-200',
          barFill: 'bg-gradient-to-r from-orange-500 to-amber-600',
          icon: '!',
        }
      : {
          bg: 'bg-gradient-to-r from-amber-400 to-yellow-500',
          border: 'border-amber-300 dark:border-amber-700',
          text: 'text-amber-900 dark:text-amber-100',
          barBg: 'bg-amber-200',
          barFill: 'bg-gradient-to-r from-amber-500 to-orange-500',
          icon: '!',
        };

  return (
    <div
      className={`mb-4 rounded-2xl border-2 ${colorConfig.border} ${colorConfig.bg} p-5 text-white overflow-hidden relative animate-pulse-slow`}
    >
      <div className="relative flex items-start gap-4">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-black flex-shrink-0 animate-pulse">
          {colorConfig.icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="font-bold text-xl mb-1">
            ⚠️ Waktu Registrasi Hampir Berakhir
          </div>
          <div className="text-sm opacity-90 mb-3">
            Mohon segera lengkapi form. Setelah waktu habis, tamu tidak bisa
            lagi melakukan registrasi hari ini.
          </div>

          {/* Countdown */}
          <div className="flex items-baseline gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black tabular-nums drop-shadow-lg">
                {String(mm).padStart(2, '0')}
              </span>
              <span className="text-lg opacity-70">:</span>
              <span className="text-4xl font-black tabular-nums drop-shadow-lg">
                {String(ss).padStart(2, '0')}
              </span>
            </div>
            <span className="text-xs opacity-80">sisa waktu</span>
          </div>

          {/* Progress bar */}
          <div className={`mt-3 h-2 rounded-full ${colorConfig.barBg} overflow-hidden`}>
            <div
              className={`h-full ${colorConfig.barFill} transition-all duration-1000 ease-linear`}
              style={{ width: progressPercent + '%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}