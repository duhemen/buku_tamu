import { useEffect, useRef, useState } from 'react';

interface TVData {
  current: {
    number: string;
    guestName: string;
    company?: string | null;
    destination: string;
    calledAt?: string | null;
  } | null;
  waiting: { number: string; guestName: string; destination: string }[];
  stats: { total: number; waiting: number; called: number; served: number };
  updatedAt: string;
}

export default function TVQueuePage() {
  const [data, setData] = useState<TVData | null>(null);
  const [now, setNow] = useState(new Date());
  const lastCalledRef = useRef<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard/tv');
      if (!res.ok) return;
      const json: TVData = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 5000);
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearInterval(t);
      clearInterval(tick);
    };
  }, []);

  useEffect(() => {
    if (!data?.current) return;
    const num = data.current.number;
    if (lastCalledRef.current === num) return;
    lastCalledRef.current = num;
    playChime();
    speak('Nomor antrean ' + num + ', silakan menuju ' + data.current.destination);
  }, [data?.current]);

  const playChime = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(880, ctx.currentTime);
      o.frequency.setValueAtTime(1320, ctx.currentTime + 0.15);
      g.gain.setValueAtTime(0.15, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      o.start();
      o.stop(ctx.currentTime + 0.4);
    } catch {}
  };

  const speak = (text: string) => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'id-ID';
      u.rate = 0.9;
      u.pitch = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {}
  };

  const dateStr = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900 text-white overflow-hidden">
      <div className="flex items-center justify-between px-12 py-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-2xl font-bold">
            BT
          </div>
          <div>
            <div className="text-2xl font-bold">Antrean Buku Tamu</div>
            <div className="text-sm text-white/60">Sistem Buku Tamu Digital</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-semibold capitalize">{dateStr}</div>
          <div className="text-4xl font-bold tabular-nums tracking-wider">{timeStr}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 p-12 h-[calc(100vh-120px)]">
        <div className="col-span-2 flex flex-col">
          <div className="text-lg uppercase tracking-[0.3em] text-white/60 mb-4">
            Nomor Dipanggil
          </div>
          {data?.current ? (
            <div className="flex-1 rounded-3xl bg-white/5 backdrop-blur border-2 border-white/20 p-12 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-transparent animate-pulse" />
              <div className="relative">
                <div className="text-[12rem] font-black leading-none tracking-wider text-white drop-shadow-2xl">
                  {data.current.number}
                </div>
                <div className="text-4xl font-bold text-center mt-6">
                  {data.current.guestName}
                </div>
                {data.current.company && (
                  <div className="text-xl text-center text-white/70 mt-2">
                    {data.current.company}
                  </div>
                )}
                <div className="text-2xl text-center mt-6 px-8 py-3 rounded-full bg-brand-500/30 backdrop-blur inline-block mx-auto">
                  Tujuan: <span className="font-bold">{data.current.destination}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 rounded-3xl bg-white/5 backdrop-blur border-2 border-dashed border-white/20 flex flex-col items-center justify-center">
              <div className="text-6xl mb-4 opacity-40">...</div>
              <div className="text-3xl text-white/50">Menunggu panggilan</div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-4 mt-6">
            <StatBox label="Total" value={data?.stats.total ?? 0} />
            <StatBox label="Menunggu" value={data?.stats.waiting ?? 0} accent="amber" />
            <StatBox label="Dipanggil" value={data?.stats.called ?? 0} accent="blue" />
            <StatBox label="Selesai" value={data?.stats.served ?? 0} accent="emerald" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="text-lg uppercase tracking-[0.3em] text-white/60 mb-4">
            Antrean Menunggu
          </div>
          <div className="flex-1 rounded-3xl bg-white/5 backdrop-blur border border-white/10 p-6 overflow-hidden">
            {!data || data.waiting.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/40">
                <div className="text-5xl mb-3">--</div>
                <div className="text-lg">Tidak ada antrean</div>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto h-full pr-2">
                {data.waiting.slice(0, 8).map((q, i) => (
                  <div
                    key={q.number}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-500/30 flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </div>
                    <div className="text-3xl font-bold tracking-wider">{q.number}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{q.guestName}</div>
                      <div className="text-xs text-white/50 truncate">{q.destination}</div>
                    </div>
                  </div>
                ))}
                {data.waiting.length > 8 && (
                  <div className="text-center text-white/40 text-sm pt-2">
                    +{data.waiting.length - 8} antrean lagi
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-3 right-6 text-xs text-white/30">
        Auto-refresh 5 detik - Update terakhir: {data ? new Date(data.updatedAt).toLocaleTimeString('id-ID') : '-'}
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: 'amber' | 'blue' | 'emerald';
}) {
  const colorMap = {
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
  };
  const cls = accent ? 'bg-gradient-to-br ' + colorMap[accent] : 'bg-white/5 border-white/10';
  return (
    <div className={'rounded-2xl border p-4 ' + cls}>
      <div className="text-xs uppercase tracking-wider text-white/60">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}