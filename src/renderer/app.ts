/**
 * FL Agenda — Tela de Agenda (Vanilla TypeScript/JS)
 * Lógica de renderização da grade de profissionais × horários.
 *
 * Dados: mock estático que espelha fielmente o mockup screen_agenda.png.
 * Integração Supabase: será adicionada nas actions do Zustand Store
 * conforme a arquitetura Vertical Slice definida em docs/arquitetura.md.
 */

/* ────────────────────────────────────────────────────────────────
   1. TIPOS
   ──────────────────────────────────────────────────────────────── */

type StatusAgendamento = 'agendado' | 'em_atendimento' | 'concluido' | 'faltou';

interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
}

interface Agendamento {
  id: string;
  profissionalId: string;
  clienteNome: string;
  servico: string;
  horarioInicio: string;   // "HH:MM"
  horarioFim: string;      // "HH:MM"
  status: StatusAgendamento;
  countdown?: string;      // ex: "Faltam 15min" — apenas em_atendimento
}

/* ────────────────────────────────────────────────────────────────
   2. DADOS MOCK (espelham screen_agenda.png)
   ──────────────────────────────────────────────────────────────── */

const PROFISSIONAIS: Profissional[] = [
  { id: 'alex',   nome: 'Alex Rivera',   especialidade: 'Senior Stylist'  },
  { id: 'jordan', nome: 'Jordan Smith',  especialidade: 'Therapist'       },
  { id: 'elena',  nome: 'Elena Rossi',   especialidade: 'Esteticista'     },
  { id: 'marco',  nome: 'Marco V.',      especialidade: 'Colorist'        },
  { id: 'sofia',  nome: 'Sofia L.',      especialidade: 'Master Barber'   },
];

const AGENDAMENTOS: Agendamento[] = [
  // Elena — atendimento com Mariana Silva (08:00 - 09:30, em atendimento)
  {
    id: 'apt-1',
    profissionalId: 'elena',
    clienteNome: 'Mariana Silva',
    servico: 'Coloração + Tratamento',
    horarioInicio: '08:00',
    horarioFim: '09:30',
    status: 'em_atendimento',
    countdown: 'Faltam 15min',
  },
  // Marco — Beatriz Costa (08:30 - 09:30, agendado)
  {
    id: 'apt-2',
    profissionalId: 'marco',
    clienteNome: 'Beatriz Costa',
    servico: 'Massagem Relaxante',
    horarioInicio: '08:30',
    horarioFim: '09:30',
    status: 'concluido',
  },
  // Marco — Ana Paula (09:30 - 10:00, concluido)
  {
    id: 'apt-3',
    profissionalId: 'marco',
    clienteNome: 'Ana Paula',
    servico: 'Drenagem',
    horarioInicio: '09:30',
    horarioFim: '10:00',
    status: 'concluido',
  },
  // Elena — Ricardo Alves (10:00 - 10:30, agendado/futuro — tracejado)
  {
    id: 'apt-4',
    profissionalId: 'elena',
    clienteNome: 'Ricardo Alves',
    servico: 'Barba Design',
    horarioInicio: '10:00',
    horarioFim: '10:30',
    status: 'agendado',
  },
  // Marco — Carla Dias (10:00 - 11:00, em atendimento 60min)
  {
    id: 'apt-5',
    profissionalId: 'marco',
    clienteNome: 'Carla Dias',
    servico: 'Shiatsu 60min',
    horarioInicio: '10:00',
    horarioFim: '11:00',
    status: 'em_atendimento',
  },
  // Elena — Julia Mendes (08:00 - 08:30, sobreposição no cabeçalho — corte feminino)
  {
    id: 'apt-6',
    profissionalId: 'elena',
    clienteNome: 'Julia Mendes',
    servico: 'Corte Feminino',
    horarioInicio: '08:00',
    horarioFim: '08:30',
    status: 'concluido',
  },
];

/* ────────────────────────────────────────────────────────────────
   3. CONFIGURAÇÃO DA GRADE
   ──────────────────────────────────────────────────────────────── */

const GRADE_INICIO = '08:00';   // Hora de início exibida
const GRADE_FIM    = '19:00';   // Hora de fim exibida
const SLOT_MIN     = 30;        // Minutos por slot (altura = --slot-height)

/** Converte "HH:MM" → minutos totais desde 00:00 */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Gera array de slots de horário */
function gerarSlots(inicio: string, fim: string, passo: number): string[] {
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

const SLOTS = gerarSlots(GRADE_INICIO, GRADE_FIM, SLOT_MIN);

/** Retorna o offset em pixels e a altura em pixels de um agendamento */
function calcGeometry(inicio: string, fim: string): { top: number; height: number } {
  const slotHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--slot-height') || '56'
  );
  const gradeMinutos = toMinutes(GRADE_INICIO);
  const top    = ((toMinutes(inicio) - gradeMinutos) / SLOT_MIN) * slotHeight;
  const height = ((toMinutes(fim)   - toMinutes(inicio)) / SLOT_MIN) * slotHeight;
  return { top, height };
}

/* ────────────────────────────────────────────────────────────────
   4. RENDERIZAÇÃO DO CABEÇALHO DE PROFISSIONAIS
   ──────────────────────────────────────────────────────────────── */

function renderProfHeader(filtro: string): void {
  const container = document.getElementById('prof-header-scroll')!;
  container.innerHTML = '';

  const profFiltrados = PROFISSIONAIS.filter(p =>
    p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    p.especialidade.toLowerCase().includes(filtro.toLowerCase())
  );

  profFiltrados.forEach(prof => {
    const col = document.createElement('div');
    col.className = 'agenda-prof-col';
    col.dataset.profId = prof.id;
    col.innerHTML = `
      <span class="agenda-prof-col__name">${prof.nome}</span>
      <span class="agenda-prof-col__role">${prof.especialidade}</span>
    `;
    container.appendChild(col);
  });
}

/* ────────────────────────────────────────────────────────────────
   5. RENDERIZAÇÃO DA COLUNA DE HORÁRIOS
   ──────────────────────────────────────────────────────────────── */

function renderTimecol(): void {
  const container = document.getElementById('agenda-timecol')!;

  // Preserva a linha de hora atual
  const nowLine = document.getElementById('now-line')!;
  container.innerHTML = '';
  container.appendChild(nowLine);

  SLOTS.forEach(slot => {
    const div = document.createElement('div');
    div.className = 'agenda-timecol__slot';
    div.innerHTML = `<span class="agenda-timecol__label">${slot}</span>`;
    container.appendChild(div);
  });
}

/* ────────────────────────────────────────────────────────────────
   6. RENDERIZAÇÃO DAS COLUNAS DE AGENDAMENTOS
   ──────────────────────────────────────────────────────────────── */

function buildCardHTML(apt: Agendamento): string {
  const isEmAtendimento = apt.status === 'em_atendimento';
  const statusClass = `appt-card--${apt.status}`;

  const statusLabel = isEmAtendimento
    ? `<div class="appt-card__status-label">
         <span class="appt-card__status-dot"></span>
         EM ATENDIMENTO
       </div>`
    : '';

  const timeLabel = isEmAtendimento
    ? ''  // no mockup cards "em atendimento" não repetem faixa de hora no topo
    : `<div class="appt-card__time">${apt.horarioInicio} - ${apt.horarioFim}</div>`;

  const countdown = apt.countdown
    ? `<div class="appt-card__countdown">${apt.countdown}</div>`
    : '';

  return `
    ${statusLabel}
    ${timeLabel}
    <div class="appt-card__client">${apt.clienteNome}</div>
    <div class="appt-card__service">${apt.servico}</div>
    ${countdown}
  `;
}

function renderCols(filtro: string): void {
  const container = document.getElementById('agenda-cols')!;
  container.innerHTML = '';

  const gradeAltura = SLOTS.length *
    parseInt(getComputedStyle(document.documentElement).getPropertyValue('--slot-height') || '56');

  const profFiltrados = PROFISSIONAIS.filter(p =>
    p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    p.especialidade.toLowerCase().includes(filtro.toLowerCase())
  );

  profFiltrados.forEach(prof => {
    const col = document.createElement('div');
    col.className = 'agenda-col';
    col.dataset.profId = prof.id;
    col.style.height = `${gradeAltura}px`;
    col.style.position = 'relative';

    // Slots clicáveis (células vazias)
    SLOTS.forEach((slot, i) => {
      const slotEl = document.createElement('div');
      slotEl.className = 'agenda-col__slot';
      slotEl.dataset.time = slot;
      slotEl.dataset.profId = prof.id;
      slotEl.setAttribute('aria-label', `${slot} — ${prof.nome}`);
      slotEl.addEventListener('click', () => onSlotClick(prof.id, slot));
      col.appendChild(slotEl);
    });

    // Cards de agendamento
    const aptsDoProf = AGENDAMENTOS.filter(a => a.profissionalId === prof.id);
    aptsDoProf.forEach(apt => {
      const { top, height } = calcGeometry(apt.horarioInicio, apt.horarioFim);
      const card = document.createElement('div');
      card.className = `appt-card appt-card--${apt.status}`;
      card.style.top    = `${top}px`;
      card.style.height = `${Math.max(height - 4, 28)}px`;  // -4px de gap visual
      card.dataset.aptId = apt.id;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Agendamento de ${apt.clienteNome} — ${apt.servico}`);
      card.innerHTML = buildCardHTML(apt);
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        onCardClick(apt);
      });
      col.appendChild(card);
    });

    container.appendChild(col);
  });
}

/* ────────────────────────────────────────────────────────────────
   7. LINHA DE HORA ATUAL (RN-10)
   ──────────────────────────────────────────────────────────────── */

function posicionarLinhaAtual(): void {
  const nowLine = document.getElementById('now-line');
  if (!nowLine) return;

  const agora = new Date();
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const minutosInicio = toMinutes(GRADE_INICIO);
  const minutosFim    = toMinutes(GRADE_FIM);

  if (minutosAgora < minutosInicio || minutosAgora > minutosFim) {
    nowLine.style.display = 'none';
    return;
  }

  const slotHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--slot-height') || '56'
  );
  const top = ((minutosAgora - minutosInicio) / SLOT_MIN) * slotHeight;
  nowLine.style.top    = `${top}px`;
  nowLine.style.display = 'flex';

  // Também posiciona na grade de colunas
  const agendasCols = document.getElementById('agenda-cols');
  if (agendasCols) {
    let existingLine = document.getElementById('now-line-cols');
    if (!existingLine) {
      existingLine = document.createElement('div');
      existingLine.id = 'now-line-cols';
      existingLine.style.cssText = `
        position: absolute;
        left: 0; right: 0;
        height: 1px;
        background: rgba(233,195,64,0.35);
        pointer-events: none;
        z-index: 10;
      `;
      agendasCols.style.position = 'relative';
      agendasCols.appendChild(existingLine);
    }
    existingLine.style.top = `${top}px`;
  }
}

/* ────────────────────────────────────────────────────────────────
   8. DATA FORMATADA NO CABEÇALHO (RN-04)
   ──────────────────────────────────────────────────────────────── */

function renderizarData(): void {
  const el = document.getElementById('agenda-date');
  if (!el) return;

  const hoje = new Date();
  const formatada = hoje.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  // Capitaliza a primeira letra
  el.textContent = formatada.charAt(0).toUpperCase() + formatada.slice(1);
}

/* ────────────────────────────────────────────────────────────────
   9. SINCRONIZAÇÃO DE SCROLL HORIZONTAL (cabeçalho + grade)
   ──────────────────────────────────────────────────────────────── */

function sincronizarScroll(): void {
  const headerScroll = document.getElementById('prof-header-scroll');
  const colsScroll   = document.getElementById('agenda-cols');
  if (!headerScroll || !colsScroll) return;

  colsScroll.addEventListener('scroll', () => {
    headerScroll.scrollLeft = colsScroll.scrollLeft;
  });

  headerScroll.addEventListener('scroll', () => {
    colsScroll.scrollLeft = headerScroll.scrollLeft;
  });
}

/* ────────────────────────────────────────────────────────────────
   10. BUSCA POR PROFISSIONAL (RN-06)
   ──────────────────────────────────────────────────────────────── */

function configurarBusca(): void {
  const input = document.getElementById('search-profissional') as HTMLInputElement;
  if (!input) return;

  let debounceTimer: ReturnType<typeof setTimeout>;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const filtro = input.value.trim();
      renderProfHeader(filtro);
      renderCols(filtro);
    }, 200);
  });
}

/* ────────────────────────────────────────────────────────────────
   11. NAVEGAÇÃO DO SIDEBAR (RN-01 / RN-02)
   ──────────────────────────────────────────────────────────────── */

function configurarNavegacao(): void {
  const navItems = document.querySelectorAll<HTMLButtonElement>('.sidebar__nav-item[data-route]');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('sidebar__nav-item--active'));
      item.classList.add('sidebar__nav-item--active');
      item.setAttribute('aria-current', 'page');
      // TODO: roteamento real via shared/router
      console.log('[Router] Navegar para:', item.dataset.route);
    });
  });
}

/* ────────────────────────────────────────────────────────────────
   12. HANDLERS DE INTERAÇÃO
   ──────────────────────────────────────────────────────────────── */

function onSlotClick(profissionalId: string, horario: string): void {
  // TODO: abrir ModalNovoAgendamento com profissional e horário pré-preenchidos
  console.log('[Agenda] Slot clicado:', { profissionalId, horario });
}

function onCardClick(agendamento: Agendamento): void {
  // TODO: abrir PopupAgendamento com dados do card
  console.log('[Agenda] Card clicado:', agendamento);
}

function configurarFAB(): void {
  const fab = document.getElementById('btn-novo-agendamento');
  if (!fab) return;
  fab.addEventListener('click', () => {
    // TODO: abrir ModalNovoAgendamento sem pré-seleção
    console.log('[Agenda] FAB: Novo agendamento');
  });
}

/* ────────────────────────────────────────────────────────────────
   13. BOOTSTRAP
   ──────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // Renderização inicial
  renderizarData();
  renderProfHeader('');
  renderTimecol();
  renderCols('');

  // Linha de hora atual
  posicionarLinhaAtual();
  setInterval(posicionarLinhaAtual, 30_000); // atualiza a cada 30s

  // Interações
  sincronizarScroll();
  configurarBusca();
  configurarNavegacao();
  configurarFAB();
});
