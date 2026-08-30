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

type StatusComanda = 'rascunho' | 'finalizada' | 'cancelada';

interface Agendamento {
  id: string;
  profissionalId: string;
  clienteNome: string;
  servico: string;
  horarioInicio: string;   // "HH:MM"
  horarioFim: string;      // "HH:MM"
  status: StatusAgendamento;
  countdown?: string;      // ex: "Faltam 15min" — apenas em_atendimento
  comandaId?: string;      // ID da comanda vinculada (quando criada)
  comandaNumero?: string;  // Número legível ex: "#4821"
  comandaStatus?: StatusComanda; // Status da comanda vinculada
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
   12. HANDLERS DE INTERAÇÃO & MODAL
   ──────────────────────────────────────────────────────────────── */

let modalNovoAgendamento: ModalNovoAgendamento | null = null;
let modalDetalhesAgendamento: ModalDetalhesAgendamento | null = null;

function onSlotClick(profissionalId: string, horario: string): void {
  console.log('[Agenda] Slot clicado:', { profissionalId, horario });
  modalNovoAgendamento?.open({ profissionalId, horario });
}

function onCardClick(agendamento: Agendamento): void {
  // Busca o nome do profissional para exibir no modal
  const prof = PROFISSIONAIS.find(p => p.id === agendamento.profissionalId);
  const profissionalNome = prof ? prof.nome : 'Profissional';

  modalDetalhesAgendamento?.open({
    id: agendamento.id,
    clienteNome: agendamento.clienteNome,
    servico: agendamento.servico,
    horarioInicio: agendamento.horarioInicio,
    horarioFim: agendamento.horarioFim,
    status: agendamento.status,
    profissionalNome,
    countdown: agendamento.countdown,
    comandaId: agendamento.comandaId,
    comandaNumero: agendamento.comandaNumero,
    comandaStatus: agendamento.comandaStatus,
  });
}

function configurarFAB(): void {
  const fab = document.getElementById('btn-novo-agendamento');
  if (!fab) return;
  fab.addEventListener('click', () => {
    modalNovoAgendamento?.open();
  });
}

function inicializarModalNovoAgendamento(): void {
  modalNovoAgendamento = new ModalNovoAgendamento({
    profissionais: PROFISSIONAIS,
    onConfirm: (dados: NovoAgendamentoFormData) => {
      const novoAgendamento: Agendamento = {
        id: `apt-${Date.now()}`,
        profissionalId: dados.profissionalId,
        clienteNome: dados.clienteNome,
        servico: dados.servico,
        horarioInicio: dados.horarioInicio,
        horarioFim: dados.horarioFim,
        status: 'agendado',
      };
      AGENDAMENTOS.push(novoAgendamento);

      const searchInput = document.getElementById('search-profissional') as HTMLInputElement | null;
      const filtro = searchInput ? searchInput.value.trim() : '';
      renderCols(filtro);
      console.log('[Agenda] Novo agendamento criado com sucesso:', novoAgendamento);
    },
  });
}

function inicializarModalDetalhesAgendamento(): void {
  modalDetalhesAgendamento = new ModalDetalhesAgendamento({
    onConfirmar: (agendamentoId: string, novoStatus: string) => {
      // Atualiza o status do agendamento no array local
      const apt = AGENDAMENTOS.find(a => a.id === agendamentoId);
      if (apt) {
        apt.status = novoStatus as StatusAgendamento;
        // Remove countdown se mudou de status
        if (novoStatus !== 'em_atendimento') {
          apt.countdown = undefined;
        }
      }

      // Re-renderiza a grade
      const searchInput = document.getElementById('search-profissional') as HTMLInputElement | null;
      const filtro = searchInput ? searchInput.value.trim() : '';
      renderCols(filtro);
      console.log('[Agenda] Status do agendamento atualizado:', agendamentoId, '→', novoStatus);
    },
    onCancelar: (agendamentoId: string) => {
      // Remove o agendamento do array local
      const idx = AGENDAMENTOS.findIndex(a => a.id === agendamentoId);
      if (idx !== -1) {
        AGENDAMENTOS.splice(idx, 1);
      }

      // Re-renderiza a grade
      const searchInput = document.getElementById('search-profissional') as HTMLInputElement | null;
      const filtro = searchInput ? searchInput.value.trim() : '';
      renderCols(filtro);
      console.log('[Agenda] Agendamento cancelado:', agendamentoId);
    },
    onAbrirComanda: (data: DetalhesAgendamentoData) => {
      abrirComanda(data);
    },
    onVerComanda: (comandaId: string, comandaNumero: string, comandaStatus: string) => {
      if (comandaStatus === 'rascunho') {
        // Rascunho → reabrir CriarComandaView (editável)
        const apt = AGENDAMENTOS.find(a => a.comandaId === comandaId);
        if (!apt) return;
        const prof = PROFISSIONAIS.find(p => p.id === apt.profissionalId);
        reabrirComandaRascunho(apt, prof ? prof.nome : 'Profissional', comandaId, comandaNumero);
      } else {
        // Finalizada → abrir DetalhesComandaView (read-only)
        abrirDetalhesComanda(comandaId, comandaNumero);
      }
    },
  });
}

/* ────────────────────────────────────────────────────────────────
   12b. NAVEGAÇÃO PARA TELA DE COMANDA
   ──────────────────────────────────────────────────────────────── */

let criarComandaView: CriarComandaView | null = null;

function voltarParaAgendaCallback(): void {
  const searchInput = document.getElementById('search-profissional') as HTMLInputElement | null;
  const filtro = searchInput ? searchInput.value.trim() : '';
  renderProfHeader(filtro);
  renderCols(filtro);
  posicionarLinhaAtual();
  criarComandaView = null;
}

function abrirComanda(data: DetalhesAgendamentoData): void {
  // Gera número da comanda e vincula ao agendamento
  const numero = `#${Math.floor(1000 + Math.random() * 9000)}`;
  const comandaId = `cmd-${Date.now()}`;

  // Persiste vínculo no agendamento para acesso posterior
  const apt = AGENDAMENTOS.find(a => a.id === data.id);
  if (apt) {
    apt.comandaId = comandaId;
    apt.comandaNumero = numero;
    apt.comandaStatus = 'rascunho';
  }

  criarComandaView = new CriarComandaView(
    voltarParaAgendaCallback,
    // onFinalizar
    (agendamentoId: string) => {
      const a = AGENDAMENTOS.find(x => x.id === agendamentoId);
      if (a) a.comandaStatus = 'finalizada';
      console.log('[Agenda] Comanda finalizada para agendamento:', agendamentoId);
    },
    // onCancelarExcluir
    (agendamentoId: string) => {
      const a = AGENDAMENTOS.find(x => x.id === agendamentoId);
      if (a) a.comandaStatus = 'cancelada';
      console.log('[Agenda] Comanda cancelada para agendamento:', agendamentoId);
    },
  );

  criarComandaView.render({
    clienteNome: data.clienteNome,
    profissionalNome: data.profissionalNome,
    servico: data.servico,
    horarioInicio: data.horarioInicio,
    horarioFim: data.horarioFim,
    agendamentoId: data.id,
    comandaId,
    comandaNumero: numero,
  });

  console.log('[Agenda] Comanda aberta para:', data.clienteNome, numero);
}

function reabrirComandaRascunho(apt: Agendamento, profissionalNome: string, comandaId: string, comandaNumero: string): void {
  criarComandaView = new CriarComandaView(
    voltarParaAgendaCallback,
    (agendamentoId: string) => {
      const a = AGENDAMENTOS.find(x => x.id === agendamentoId);
      if (a) a.comandaStatus = 'finalizada';
      console.log('[Agenda] Comanda finalizada para agendamento:', agendamentoId);
    },
    (agendamentoId: string) => {
      const a = AGENDAMENTOS.find(x => x.id === agendamentoId);
      if (a) a.comandaStatus = 'cancelada';
      console.log('[Agenda] Comanda cancelada para agendamento:', agendamentoId);
    },
  );

  criarComandaView.render({
    clienteNome: apt.clienteNome,
    profissionalNome,
    servico: apt.servico,
    horarioInicio: apt.horarioInicio,
    horarioFim: apt.horarioFim,
    agendamentoId: apt.id,
    comandaId,
    comandaNumero,
  });

  console.log('[Agenda] Comanda rascunho reaberta:', comandaNumero);
}

function abrirDetalhesComanda(comandaId: string, comandaNumero: string): void {
  const apt = AGENDAMENTOS.find(a => a.comandaId === comandaId);
  if (!apt) return;

  const prof = PROFISSIONAIS.find(p => p.id === apt.profissionalId);

  const detalhesView = new DetalhesComandaView(() => {
    const searchInput = document.getElementById('search-profissional') as HTMLInputElement | null;
    const filtro = searchInput ? searchInput.value.trim() : '';
    renderProfHeader(filtro);
    renderCols(filtro);
    posicionarLinhaAtual();
  });

  detalhesView.render({
    comandaId,
    comandaNumero,
    clienteNome: apt.clienteNome,
    profissionalNome: prof ? prof.nome : 'Profissional',
    servico: apt.servico,
    horarioInicio: apt.horarioInicio,
    horarioFim: apt.horarioFim,
    status: apt.status,
    comandaStatus: apt.comandaStatus || 'finalizada',
  });

  console.log('[Agenda] Detalhes da comanda:', comandaNumero);
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

  // Modais
  inicializarModalNovoAgendamento();
  inicializarModalDetalhesAgendamento();

  // Interações
  sincronizarScroll();
  configurarBusca();
  configurarNavegacao();
  configurarFAB();
});

