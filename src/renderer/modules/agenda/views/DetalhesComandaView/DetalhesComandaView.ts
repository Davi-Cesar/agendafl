/**
 * FL Agenda — Tela de Detalhes de Comanda (Read-Only)
 * Arquitetura: Vertical Slice — módulo agenda/views
 * Design: DESIGN.md, tokens.css (Matte Luxury Interface)
 * Regras: RN-17 a RN-28 (Regras_de_Negocio_Agenda.md)
 *
 * Exibida quando o usuário clica em "Ver Comanda" no modal de
 * agendamento de um atendimento que já possui comanda vinculada.
 */

interface DetalhesComandaViewData {
  comandaId: string;
  comandaNumero: string;    // ex: "#4821"
  clienteNome: string;
  profissionalNome: string;
  servico: string;
  horarioInicio: string;
  horarioFim: string;
  status: string;           // status do agendamento vinculado
  comandaStatus: string;    // 'rascunho' | 'finalizada' | 'cancelada'
}

/* ── Preços mock — mesmo mapa do CriarComandaView ─────────── */
const PRECOS_DETALHES: Record<string, number> = {
  'Coloração + Tratamento': 520,
  'Corte e Escova': 180,
  'Barba Design': 80,
  'Massagem Relaxante': 280,
  'Drenagem Linfática': 220,
  'Drenagem': 220,
  'Shiatsu 60min': 320,
  'Limpeza de Pele Profunda': 350,
  'Limpeza de Pele Deep Gold': 450,
  'Design de Sobrancelhas': 90,
  'Corte Feminino': 150,
};

class DetalhesComandaView {
  private container: HTMLElement | null = null;
  private onVoltar: () => void;

  constructor(onVoltar: () => void) {
    this.onVoltar = onVoltar;
  }

  /* ────────────────────────────────────────────────────────────
     API Pública
     ──────────────────────────────────────────────────────────── */

  public render(data: DetalhesComandaViewData): void {
    this.montarHTML(data);
    this.bindEvents();
  }

  public destroy(): void {
    this.container?.remove();
    this.container = null;
  }

  /* ────────────────────────────────────────────────────────────
     Helpers
     ──────────────────────────────────────────────────────────── */

  private formatarMoeda(valor: number): string {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
  }

  private getStatusLabel(status: string): string {
    switch (status) {
      case 'em_atendimento': return 'EM ATENDIMENTO';
      case 'concluido':      return 'CONCLUÍDA';
      case 'agendado':       return 'ABERTA';
      default:               return status.toUpperCase();
    }
  }

  private getStatusClass(status: string): string {
    switch (status) {
      case 'em_atendimento': return 'detalhes-comanda__status--atendimento';
      case 'concluido':      return 'detalhes-comanda__status--concluida';
      default:               return 'detalhes-comanda__status--aberta';
    }
  }

  /* ────────────────────────────────────────────────────────────
     Renderização
     ──────────────────────────────────────────────────────────── */

  private montarHTML(data: DetalhesComandaViewData): void {
    // Esconde agenda-view
    const agendaView = document.getElementById('agenda-view');
    if (agendaView) agendaView.style.display = 'none';

    // Remove container anterior
    this.destroy();

    const preco = PRECOS_DETALHES[data.servico] ?? 250;
    const comissaoProf = preco * 0.60;
    const comissaoEst  = preco * 0.40;
    const descontos    = 0;
    const total        = preco - descontos;

    const statusLabel = this.getStatusLabel(data.status);
    const statusClass = this.getStatusClass(data.status);
    const comandaLabel = data.comandaStatus === 'finalizada'
      ? `COMANDA FINALIZADA ${data.comandaNumero}`
      : `COMANDA EM ABERTO ${data.comandaNumero}`;

    const view = document.createElement('main');
    view.className = 'comanda-view detalhes-comanda';
    view.id = 'detalhes-comanda-view';

    view.innerHTML = `
      <div class="comanda-view__content">

        <!-- Coluna Principal -->
        <div class="comanda-main">

          <!-- Busca (visual — read-only neste contexto) -->
          <div class="comanda-search comanda-search--readonly">
            <svg class="comanda-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span class="comanda-search__input comanda-search__readonly-text">${data.clienteNome}</span>
          </div>

          <!-- Botão Voltar -->
          <button class="comanda-back" id="detalhes-comanda-btn-voltar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            VOLTAR
          </button>

          <!-- Cabeçalho RN-17, RN-18, RN-19 -->
          <div class="comanda-header">
            <div class="comanda-header__info">
              <div class="comanda-header__meta">
                <span class="comanda-header__badge">${comandaLabel}</span>
                <span class="detalhes-comanda__status ${statusClass}">${statusLabel}</span>
                <span class="comanda-header__vip">VIP GOLD</span>
              </div>
              <h1 class="comanda-header__client-name">${data.clienteNome}</h1>
              <div class="detalhes-comanda__horario">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                ${data.horarioInicio} – ${data.horarioFim} &nbsp;·&nbsp; ${data.profissionalNome}
              </div>
            </div>
            <!-- RN-20: Imprimir Via (read-only context — disponível) -->
            <div class="comanda-header__actions">
              <button class="comanda-header__btn" id="detalhes-comanda-btn-imprimir">Imprimir Via</button>
            </div>
          </div>

          <!-- RN-21: Serviços Adicionados -->
          <section class="comanda-servicos">
            <div class="comanda-servicos__header">
              <h2 class="comanda-servicos__title">Serviços Adicionados</h2>
              <span class="comanda-servicos__count">1 Item</span>
            </div>

            <!-- Card de serviço — read-only -->
            <div class="comanda-servico-card comanda-servico-card--readonly">
              <div class="comanda-servico-card__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <div class="comanda-servico-card__info">
                <div class="comanda-servico-card__nome">${data.servico}</div>
                <div class="comanda-servico-card__profissional">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  ${data.profissionalNome}
                </div>
              </div>
              <div class="comanda-servico-card__valores">
                <div class="comanda-servico-card__preco">${this.formatarMoeda(preco)}</div>
                <div class="comanda-servico-card__comissao">PROFISSIONAL (60%): ${this.formatarMoeda(comissaoProf)}</div>
                <div class="comanda-servico-card__comissao">ESPAÇO (40%): ${this.formatarMoeda(comissaoEst)}</div>
              </div>
            </div>
          </section>

          <!-- RN-23: Histórico Rápido do Cliente -->
          <section class="detalhes-comanda__historico">
            <h3 class="detalhes-comanda__historico-title">Histórico Rápido</h3>
            <div class="detalhes-comanda__historico-list">
              ${this.buildHistoricoMock()}
            </div>
          </section>

          <!-- Detalhamento de Comissões -->
          <section class="comanda-comissoes">
            <h3 class="comanda-comissoes__title">Detalhamento de Comissões</h3>
            <div class="comanda-comissao-row">
              <div class="comanda-comissao-row__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="comanda-comissao-row__info">
                <div class="comanda-comissao-row__label">Profissional (60%)</div>
                <div class="comanda-comissao-row__sub">${data.profissionalNome}</div>
              </div>
              <span class="comanda-comissao-row__valor">${this.formatarMoeda(comissaoProf)}</span>
            </div>
            <div class="comanda-comissao-row">
              <div class="comanda-comissao-row__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18"/>
                  <path d="M9 21V9"/>
                </svg>
              </div>
              <div class="comanda-comissao-row__info">
                <div class="comanda-comissao-row__label">Estúdio (40%)</div>
                <div class="comanda-comissao-row__sub">Taxa de Espaço</div>
              </div>
              <span class="comanda-comissao-row__valor">${this.formatarMoeda(comissaoEst)}</span>
            </div>
          </section>

        </div>

        <!-- Coluna Lateral — Resumo (read-only) -->
        <aside class="comanda-sidebar">

          <!-- RN-24: Resumo de Valores -->
          <div class="comanda-resumo">
            <span class="comanda-resumo__title">Resumo de Valores</span>

            <div class="comanda-resumo__row">
              <span class="comanda-resumo__label">Subtotal</span>
              <span class="comanda-resumo__value">${this.formatarMoeda(preco)}</span>
            </div>

            <div class="comanda-resumo__row">
              <span class="comanda-resumo__label">Descontos</span>
              <span class="comanda-resumo__value comanda-resumo__value--green">${this.formatarMoeda(descontos)}</span>
            </div>

            <div class="comanda-resumo__total-row">
              <span class="comanda-resumo__total-label">Total</span>
              <span class="comanda-resumo__total-value">${this.formatarMoeda(total)}</span>
            </div>
          </div>

          <!-- RN-26: Forma de Pagamento registrada (read-only visual) -->
          <div class="detalhes-comanda__pagamento-registrado">
            <span class="comanda-pagamento__title">Forma de Pagamento</span>
            <div class="detalhes-comanda__pagamento-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              PIX Bricia
            </div>
          </div>

          <!-- Ação principal: Imprimir ou Fechar -->
          <button class="comanda-btn-finalizar detalhes-comanda__btn-fechar" id="detalhes-comanda-btn-fechar">
            FECHAR DETALHES
          </button>

        </aside>
      </div>
    `;

    const app = document.getElementById('app');
    if (app) app.appendChild(view);
    this.container = view;

    // Ativa ícone Comandas na sidebar
    const navItems = document.querySelectorAll<HTMLButtonElement>('.sidebar__nav-item[data-route]');
    navItems.forEach(n => n.classList.remove('sidebar__nav-item--active'));
    document.getElementById('nav-comandas')?.classList.add('sidebar__nav-item--active');
  }

  /* ────────────────────────────────────────────────────────────
     Histórico mock (RN-23)
     ──────────────────────────────────────────────────────────── */

  private buildHistoricoMock(): string {
    const items = [
      { data: '14 OUT 2024', servico: 'Corte e Escova', valor: 180 },
      { data: '02 SET 2024', servico: 'Coloração Premium', valor: 520 },
      { data: '18 AGO 2024', servico: 'Limpeza de Pele', valor: 350 },
    ];

    return items.map(item => `
      <div class="detalhes-comanda__historico-item">
        <div class="detalhes-comanda__historico-item-left">
          <span class="detalhes-comanda__historico-data">${item.data}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span class="detalhes-comanda__historico-servico">${item.servico}</span>
        </div>
        <span class="detalhes-comanda__historico-valor">${this.formatarMoeda(item.valor)}</span>
      </div>
    `).join('');
  }

  /* ────────────────────────────────────────────────────────────
     Eventos
     ──────────────────────────────────────────────────────────── */

  private bindEvents(): void {
    if (!this.container) return;

    const voltar = () => {
      this.destroy();
      const agendaView = document.getElementById('agenda-view');
      if (agendaView) agendaView.style.display = '';

      const navItems = document.querySelectorAll<HTMLButtonElement>('.sidebar__nav-item[data-route]');
      navItems.forEach(n => n.classList.remove('sidebar__nav-item--active'));
      document.getElementById('nav-agenda')?.classList.add('sidebar__nav-item--active');

      this.onVoltar();
    };

    this.container.querySelector('#detalhes-comanda-btn-voltar')?.addEventListener('click', voltar);
    this.container.querySelector('#detalhes-comanda-btn-fechar')?.addEventListener('click', voltar);

    this.container.querySelector('#detalhes-comanda-btn-imprimir')?.addEventListener('click', () => {
      console.log('[DetalhesComanda] Imprimir via (placeholder)');
    });
  }
}
