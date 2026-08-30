/**
 * FL Agenda — Modal de Detalhes do Agendamento
 * Fiel a: docs/design/Agenda/confirmation_agenda.png e DESIGN.md
 *
 * Exibe informações do agendamento e permite confirmar início
 * do atendimento ou cancelar o agendamento.
 */

interface DetalhesAgendamentoData {
  id: string;
  clienteNome: string;
  servico: string;
  horarioInicio: string;
  horarioFim: string;
  status: 'agendado' | 'em_atendimento' | 'concluido' | 'faltou';
  profissionalNome: string;
  countdown?: string;
  comandaId?: string;     // ID interno da comanda vinculada
  comandaNumero?: string; // Número legível ex: "#4821"
  comandaStatus?: 'rascunho' | 'finalizada' | 'cancelada';
}

interface ModalDetalhesAgendamentoOptions {
  onConfirmar: (agendamentoId: string, novoStatus: string) => void;
  onCancelar: (agendamentoId: string) => void;
  onAbrirComanda: (data: DetalhesAgendamentoData) => void;
  onVerComanda: (comandaId: string, comandaNumero: string, comandaStatus: string) => void;
}

class ModalDetalhesAgendamento {
  private overlay: HTMLElement | null = null;
  private options: ModalDetalhesAgendamentoOptions;
  private currentData: DetalhesAgendamentoData | null = null;

  constructor(options: ModalDetalhesAgendamentoOptions) {
    this.options = options;
    this.renderModalDOM();
    this.bindBaseEvents();
  }

  /* ────────────────────────────────────────────────────────────
     Renderização do DOM
     ──────────────────────────────────────────────────────────── */

  private renderModalDOM(): void {
    const existing = document.getElementById('modal-detalhes-agendamento-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'modal-detalhes-agendamento-overlay';
    overlay.className = 'modal-overlay modal-detalhes';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'modal-detalhes-title');

    overlay.innerHTML = `
      <div class="modal-card">
        <!-- Header -->
        <div class="modal-card__header">
          <h2 class="modal-card__title" id="modal-detalhes-title">Confirmar Início do Atendimento</h2>
          <button type="button" class="modal-card__close" id="modal-detalhes-btn-close" aria-label="Fechar modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Status Badge -->
        <div class="modal-detalhes__status-badge" id="modal-detalhes-status-badge">
          <span class="modal-detalhes__status-dot"></span>
          <span id="modal-detalhes-status-text">SUGERIDO: EM ATENDIMENTO</span>
        </div>

        <!-- Banner de Comanda Vinculada (só aparece se houver comanda) -->
        <div class="modal-detalhes__comanda-banner" id="modal-detalhes-comanda-banner" style="display:none">
          <div class="modal-detalhes__comanda-banner-left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <div>
              <span class="modal-detalhes__comanda-label">COMANDA VINCULADA</span>
              <span class="modal-detalhes__comanda-numero" id="modal-detalhes-comanda-numero">#0000</span>
              <span class="modal-detalhes__comanda-tag" id="modal-detalhes-comanda-tag"></span>
            </div>
          </div>
          <button type="button" class="modal-detalhes__btn-ver-comanda" id="modal-detalhes-btn-ver-comanda">
            Ver Comanda
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>

        <!-- Info Card -->
        <div class="modal-detalhes__info-card" id="modal-detalhes-info-card">
          <!-- Cliente -->
          <div class="modal-detalhes__info-row">
            <span class="modal-detalhes__label">Client</span>
            <span class="modal-detalhes__value" id="modal-detalhes-cliente">—</span>
          </div>

          <!-- Serviço + Horário (grid 2col) -->
          <div class="modal-detalhes__info-row modal-detalhes__info-row--grid">
            <div class="modal-detalhes__info-cell">
              <span class="modal-detalhes__label">Service</span>
              <span class="modal-detalhes__value" id="modal-detalhes-servico">—</span>
            </div>
            <div class="modal-detalhes__info-cell">
              <span class="modal-detalhes__label">Time</span>
              <span class="modal-detalhes__value" id="modal-detalhes-horario">—</span>
            </div>
          </div>

          <!-- Profissional -->
          <div class="modal-detalhes__info-row">
            <span class="modal-detalhes__label">Professional</span>
            <span class="modal-detalhes__value modal-detalhes__value--with-icon" id="modal-detalhes-profissional">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span id="modal-detalhes-profissional-nome">—</span>
            </span>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-card__footer">
          <button type="button" class="modal-detalhes__btn-cancel" id="modal-detalhes-btn-cancelar">
            Cancelar<br>Agendamento
          </button>
          <button type="button" class="modal-detalhes__btn-confirm" id="modal-detalhes-btn-confirmar">
            Confirmar Atendimento e Abrir Comanda
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.overlay = overlay;
  }

  /* ────────────────────────────────────────────────────────────
     Eventos base (fechar modal)
     ──────────────────────────────────────────────────────────── */

  private bindBaseEvents(): void {
    if (!this.overlay) return;

    // Fechar ao clicar no X
    const btnClose = this.overlay.querySelector('#modal-detalhes-btn-close');
    btnClose?.addEventListener('click', () => this.close());

    // Fechar ao clicar no backdrop
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Fechar ao pressionar ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay?.classList.contains('modal-overlay--open')) {
        this.close();
      }
    });

    // Botão Cancelar Agendamento
    const btnCancelar = this.overlay.querySelector('#modal-detalhes-btn-cancelar');
    btnCancelar?.addEventListener('click', () => {
      if (this.currentData) {
        this.options.onCancelar(this.currentData.id);
      }
      this.close();
    });

    // Botão Ver Comanda (agora no banner interno)
    const btnVerComanda = this.overlay.querySelector('#modal-detalhes-btn-ver-comanda') as HTMLButtonElement | null;
    btnVerComanda?.addEventListener('click', () => {
      if (this.currentData?.comandaId && this.currentData?.comandaNumero) {
        this.options.onVerComanda(
          this.currentData.comandaId,
          this.currentData.comandaNumero,
          this.currentData.comandaStatus || 'rascunho',
        );
        this.close();
      }
    });

    // Botão Confirmar
    const btnConfirmar = this.overlay.querySelector('#modal-detalhes-btn-confirmar');
    btnConfirmar?.addEventListener('click', () => {
      if (this.currentData) {
        if (this.currentData.status === 'agendado') {
          // Confirma atendimento e abre comanda
          this.options.onConfirmar(this.currentData.id, 'em_atendimento');
          this.options.onAbrirComanda(this.currentData);
        } else {
          const novoStatus = this.getNextStatus(this.currentData.status);
          this.options.onConfirmar(this.currentData.id, novoStatus);
        }
      }
      this.close();
    });
  }

  /* ────────────────────────────────────────────────────────────
     Lógica de status e transições
     ──────────────────────────────────────────────────────────── */

  private getNextStatus(current: string): string {
    switch (current) {
      case 'agendado':       return 'em_atendimento';
      case 'em_atendimento': return 'concluido';
      default:               return current;
    }
  }

  private getStatusLabel(status: string): string {
    switch (status) {
      case 'agendado':       return 'SUGERIDO: EM ATENDIMENTO';
      case 'em_atendimento': return 'EM ATENDIMENTO';
      case 'concluido':      return 'CONCLUÍDO';
      case 'faltou':         return 'FALTOU';
      default:               return status.toUpperCase();
    }
  }

  private getTitleForStatus(status: string): string {
    switch (status) {
      case 'agendado':       return 'Confirmar Atendimento';
      case 'em_atendimento': return 'Finalizar Atendimento';
      case 'concluido':      return 'Atendimento Concluído';
      case 'faltou':         return 'Cliente Não Compareceu';
      default:               return 'Detalhes do Agendamento';
    }
  }

  private getConfirmButtonText(status: string): string {
    switch (status) {
      case 'agendado':       return 'Confirmar Atendimento e Abrir Comanda';
      case 'em_atendimento': return 'Finalizar Atendimento';
      default:               return 'OK';
    }
  }

  /* ────────────────────────────────────────────────────────────
     API Pública
     ──────────────────────────────────────────────────────────── */

  public open(data: DetalhesAgendamentoData): void {
    this.currentData = data;
    this.populateModal(data);
    this.overlay?.classList.add('modal-overlay--open');
  }

  public close(): void {
    this.overlay?.classList.remove('modal-overlay--open');
    this.currentData = null;
  }

  /* ────────────────────────────────────────────────────────────
     Preenche o modal com dados do agendamento
     ──────────────────────────────────────────────────────────── */

  private populateModal(data: DetalhesAgendamentoData): void {
    if (!this.overlay) return;

    // Título
    const title = this.overlay.querySelector('#modal-detalhes-title');
    if (title) title.textContent = this.getTitleForStatus(data.status);

    // Status badge
    const badge = this.overlay.querySelector('#modal-detalhes-status-badge') as HTMLElement;
    if (badge) {
      // Limpa classes de status anteriores
      badge.className = 'modal-detalhes__status-badge';
      badge.classList.add(`modal-detalhes__status-badge--${data.status}`);
    }

    const statusText = this.overlay.querySelector('#modal-detalhes-status-text');
    if (statusText) statusText.textContent = this.getStatusLabel(data.status);

    // Info: Cliente
    const cliente = this.overlay.querySelector('#modal-detalhes-cliente');
    if (cliente) cliente.textContent = data.clienteNome;

    // Info: Serviço
    const servico = this.overlay.querySelector('#modal-detalhes-servico');
    if (servico) servico.textContent = data.servico;

    // Info: Horário
    const horario = this.overlay.querySelector('#modal-detalhes-horario');
    if (horario) horario.textContent = `${data.horarioInicio} - ${data.horarioFim}`;

    // Info: Profissional
    const profNome = this.overlay.querySelector('#modal-detalhes-profissional-nome');
    if (profNome) profNome.textContent = data.profissionalNome;

    // Banner de comanda vinculada — só aparece se houver comanda CRIADA e status não cancelada
    const banner = this.overlay.querySelector('#modal-detalhes-comanda-banner') as HTMLElement;
    const bannerNumero = this.overlay.querySelector('#modal-detalhes-comanda-numero') as HTMLElement;
    const bannerTag = this.overlay.querySelector('#modal-detalhes-comanda-tag') as HTMLElement;
    if (banner) {
      const temComanda = (data.status === 'em_atendimento' || data.status === 'concluido')
        && data.comandaId && data.comandaNumero
        && data.comandaStatus !== 'cancelada';

      if (temComanda) {
        banner.style.display = '';
        if (bannerNumero) bannerNumero.textContent = data.comandaNumero!;

        // Tag de status da comanda
        if (bannerTag) {
          bannerTag.className = 'modal-detalhes__comanda-tag';
          if (data.comandaStatus === 'finalizada') {
            bannerTag.textContent = 'Finalizada';
            bannerTag.classList.add('modal-detalhes__comanda-tag--finalizada');
          } else {
            bannerTag.textContent = 'Rascunho';
            bannerTag.classList.add('modal-detalhes__comanda-tag--rascunho');
          }
        }
      } else {
        banner.style.display = 'none';
      }
    }

    // Footer btn-confirmar e btn-cancelar continuam iguais...
    const btnConfirmar = this.overlay.querySelector('#modal-detalhes-btn-confirmar') as HTMLElement;
    if (btnConfirmar) {
      btnConfirmar.textContent = this.getConfirmButtonText(data.status);
      btnConfirmar.classList.remove('modal-detalhes__btn-confirm--concluir');
      if (data.status === 'em_atendimento') {
        btnConfirmar.classList.add('modal-detalhes__btn-confirm--concluir');
      }
      if (data.status === 'concluido' || data.status === 'faltou') {
        btnConfirmar.style.display = 'none';
      } else {
        btnConfirmar.style.display = '';
      }
    }

    const btnCancelar = this.overlay.querySelector('#modal-detalhes-btn-cancelar') as HTMLElement;
    if (btnCancelar) {
      if (data.status === 'concluido' || data.status === 'faltou') {
        btnCancelar.style.display = 'none';
      } else {
        btnCancelar.style.display = '';
      }
    }
  }
}
