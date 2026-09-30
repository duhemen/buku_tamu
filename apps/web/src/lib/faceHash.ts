/**
 * Hitung average hash (aHash) 256-bit dari data URL gambar.
 * Return 64-char hex string (256 bit).
 */
export async function computeFaceHash(dataUrl: string): Promise<string> {
  const img = await loadImage(dataUrl);
  const SIZE = 16;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas tidak tersedia');
  ctx.drawImage(img, 0, 0, SIZE, SIZE);
  const data = ctx.getImageData(0, 0, SIZE, SIZE).data;

  const gray = new Array(SIZE * SIZE);
  let sum = 0;
  for (let i = 0; i < SIZE * SIZE; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const v = (r * 0.299 + g * 0.587 + b * 0.114) | 0;
    gray[i] = v;
    sum += v;
  }
  const avg = sum / (SIZE * SIZE);

  // 256 bit -> 64 hex char
  let hex = '';
  for (let i = 0; i < 256; i += 4) {
    let nibble = 0;
    for (let j = 0; j < 4; j++) {
      nibble = (nibble << 1) | (gray[i + j] > avg ? 1 : 0);
    }
    hex += nibble.toString(16);
  }
  return hex;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Gagal memuat gambar'));
    img.src = src;
  });
}