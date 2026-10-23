export function formatAppointmentDate(iso: string): { dayLabel: string; timeLabel: string } {
  const date = new Date(iso);
  const dayLabel = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(date);
  const timeLabel = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
  return { dayLabel, timeLabel };
}

export function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

// "AAAA-MM-DD[THH:mm...]" -> "DD/MM", sem passar por Date (evita virar o dia por fuso).
export function formatShortDate(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split('-');
  return ano && mes && dia ? `${dia}/${mes}` : '';
}
