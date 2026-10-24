const pad = (n: number) => String(n).padStart(2, '0');

// "2026-10-22T14:00:00" -> "14h" / "14h30", sem passar por Date (evita virar o dia por fuso).
export function formatHourShort(iso: string): string {
  const [h = '', m = '00'] = iso.slice(11, 16).split(':');
  if (!h) return '';
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

export function localIsoNow(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

export function firstName(full?: string | null): string {
  return full?.trim().split(/\s+/)[0] ?? '';
}
