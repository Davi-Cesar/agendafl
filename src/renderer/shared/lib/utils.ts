/** Formatadores de data e moeda */
export function formatDate(date: Date | string, pattern?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/** Converte "HH:MM" → minutos totais desde 00:00 */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Gera array de slots de horário */
export function gerarSlots(inicio: string, fim: string, passo: number): string[] {
  const slots: string[] = [];
  let cur = toMinutes(inicio);
  const end = toMinutes(fim);
  while (cur < end) {
    const h = String(Math.floor(cur / 60)).padStart(2, '0');
    const m = String(cur % 60).padStart(2, '0');
    slots.push(`${h}:${m}`);
    cur += passo;
  }
  return slots;
}

/** Retorna o offset em pixels e a altura em pixels de um agendamento na grade */
export function calcGeometry(
  inicio: string,
  fim: string,
  gradeInicio: string = '08:00',
  slotMin: number = 30,
  slotHeightPx: number = 56
): { top: number; height: number } {
  const gradeMinutos = toMinutes(gradeInicio);
  const top = ((toMinutes(inicio) - gradeMinutos) / slotMin) * slotHeightPx;
  const height = ((toMinutes(fim) - toMinutes(inicio)) / slotMin) * slotHeightPx;
  return { top, height };
}

/** Calcula o horário final somando minutos ao horário inicial */
export function calcularHorarioFim(inicio: string, duracaoMinutos: number): string {
  const [h, m] = inicio.split(':').map(Number);
  const totalMin = h * 60 + m + duracaoMinutos;
  const fimH = Math.floor(totalMin / 60) % 24;
  const fimM = totalMin % 60;
  return `${String(fimH).padStart(2, '0')}:${String(fimM).padStart(2, '0')}`;
}
