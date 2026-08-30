/**
 * FL Agenda — Tela de Criação de Comanda
 * Fiel a: docs/design/Comanda/create_comanda.png e DESIGN.md
 *
 * Renderiza a view de comanda aberta a partir dos dados
 * de um agendamento confirmado.
 */

interface ComandaServicoItem {
  nome: string;
  profissional: string;
  preco: number;
  comissaoProfissional: number; // percentual
  comissaoEstudio: number;      // percentual
}

interface CriarComandaData {
  clienteNome: string;
  profissionalNome: string;
  servico: string;
  horarioInicio: string;
  horarioFim: string;
  agendamentoId: string;
  comandaId: string;
  comandaNumero: string;
}

/* ── Preços mock por serviço ─────────────────────────────── */
const PRECOS_SERVICOS: Record<string, number> = {
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

class CriarComandaView {
  private container: HTMLElement | null = null;
  private onVoltar: () => void;
  private onFinalizar: (agendamentoId: string) => void;
  private onCancelarExcluir: (agendamentoId: string) => void;
  private comandaId: string = '';
  private agendamentoId: string = '';
  private servicos: ComandaServicoItem[] = [];
  // Pagamento: máximo 2 formas (RN doc produto 4.3)
  private formasPagamento: string[] = ['pix_1'];

  constructor(
    onVoltar: () => void,
    onFinalizar: (agendamentoId: string) => void,
    onCancelarExcluir: (agendamentoId: string) => void,
  ) {
    this.onVoltar = onVoltar;
    this.onFinalizar = onFinalizar;
    this.onCancelarExcluir = onCancelarExcluir;
  }

  /* ────────────────────────────────────────────────────────────
     API Pública
     ──────────────────────────────────────────────────────────── */

  public render(data: CriarComandaData): void {
    this.comandaId = data.comandaNumero;
    this.agendamentoId = data.agendamentoId;
    const preco = PRECOS_SERVICOS[data.servico] ?? 250;
    this.servicos = [{
      nome: data.servico,
      profissional: data.profissionalNome,
      preco,
      comissaoProfissional: 60,
      comissaoEstudio: 40,
    }];

    this.montarHTML(data);
    this.bindEvents();
  }

  public destroy(): void {
    this.container?.remove();
    this.container = null;
  }

  /* ────────────────────────────────────────────────────────────
     Cálculos
     ──────────────────────────────────────────────────────────── */

  private calcularSubtotal(): number {
    return this.servicos.reduce((acc, s) => acc + s.preco, 0);
  }

  private formatarMoeda(valor: number): string {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
  }

  /* ────────────────────────────────────────────────────────────
     Renderização
     ──────────────────────────────────────────────────────────── */

  private montarHTML(data: CriarComandaData): void {
    // Esconde a agenda-view
    const agendaView = document.getElementById('agenda-view');
    if (agendaView) agendaView.style.display = 'none';

    // Remove container anterior se existir
    this.destroy();

    const subtotal = this.calcularSubtotal();
    const descontos = 0;
    const total = subtotal - descontos;

    // Monta os cards de serviço
    const servicosHTML = this.servicos.map(s => this.buildServicoCard(s)).join('');

    // Monta as comissões
    const comissoesHTML = this.servicos.map(s => this.buildComissoes(s)).join('');

    const view = document.createElement('main');
    view.className = 'comanda-view';
    view.id = 'comanda-view';

    view.innerHTML = `
      <div class="comanda-view__content">
        <!-- Coluna Principal -->
        <div class="comanda-main">

          <!-- Busca de cliente -->
          <label class="comanda-search" for="comanda-search-input">
            <svg class="comanda-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input class="comanda-search__input" id="comanda-search-input" type="text" placeholder="Buscar cliente..." autocomplete="off" />
          </label>

          <!-- Botão Voltar -->
          <button class="comanda-back" id="comanda-btn-voltar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            VOLTAR
          </button>

          <!-- Cabeçalho -->
          <div class="comanda-header">
            <div class="comanda-header__info">
              <div class="comanda-header__meta">
                <span class="comanda-header__badge">COMANDA EM ABERTO ${this.comandaId}</span>
                <span class="comanda-header__vip">VIP GOLD</span>
              </div>
              <h1 class="comanda-header__client-name">${data.clienteNome}</h1>
            </div>
            <div class="comanda-header__actions">
              <button class="comanda-header__btn" id="comanda-btn-imprimir">Imprimir Via</button>
              <button class="comanda-header__btn" id="comanda-btn-rascunho">Salvar Rascunho</button>
            </div>
          </div>

          <!-- Serviços Adicionados -->
          <section class="comanda-servicos">
            <div class="comanda-servicos__header">
              <h2 class="comanda-servicos__title">Serviços Adicionados</h2>
              <span class="comanda-servicos__count" id="comanda-servicos-count">${this.servicos.length} ${this.servicos.length === 1 ? 'Item' : 'Itens'}</span>
            </div>

            <div id="comanda-servicos-list">
              ${servicosHTML}
            </div>

            <button class="comanda-add-servico" id="comanda-btn-add-servico">
              <svg class="comanda-add-servico__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              <span class="comanda-add-servico__text">Adicionar Serviço</span>
            </button>
          </section>

          <!-- Detalhamento de Comissões -->
          <section class="comanda-comissoes">
            <h3 class="comanda-comissoes__title">Detalhamento de Comissões</h3>
            <div id="comanda-comissoes-list">
              ${comissoesHTML}
            </div>
          </section>

        </div>

        <!-- Coluna Lateral (Resumo) -->
        <aside class="comanda-sidebar">
          <!-- Resumo de Valores -->
          <div class="comanda-resumo">
            <span class="comanda-resumo__title">Resumo de Valores</span>

            <div class="comanda-resumo__row">
              <span class="comanda-resumo__label">Subtotal</span>
              <span class="comanda-resumo__value" id="comanda-subtotal">${this.formatarMoeda(subtotal)}</span>
            </div>

            <div class="comanda-resumo__row">
              <span class="comanda-resumo__label">Descontos</span>
              <span class="comanda-resumo__value comanda-resumo__value--green" id="comanda-descontos">${this.formatarMoeda(descontos)}</span>
            </div>

            <button class="comanda-resumo__cupom" id="comanda-btn-cupom">
              Cupom Aplicado
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
            </button>

            <div class="comanda-resumo__total-row">
              <span class="comanda-resumo__total-label">Total</span>
              <span class="comanda-resumo__total-value" id="comanda-total">${this.formatarMoeda(total)}</span>
            </div>
          </div>

          <!-- Forma de Pagamento -->
          <div class="comanda-pagamento-section">
            <span class="comanda-pagamento__title">Forma de Pagamento</span>
            <p class="comanda-pagamento__hint">Selecione até 2 formas de pagamento</p>
            <div class="comanda-pagamento__grid">
              <button class="comanda-pagamento__option comanda-pagamento__option--active" data-pagamento="pix_1" id="pag-pix1">
                <span class="comanda-pagamento__option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                </span>
                <span class="comanda-pagamento__option-label">PIX Bricia</span>
              </button>

              <button class="comanda-pagamento__option" data-pagamento="pix_2" id="pag-pix2">
                <span class="comanda-pagamento__option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                </span>
                <span class="comanda-pagamento__option-label">PIX Flavia</span>
              </button>

              <button class="comanda-pagamento__option" data-pagamento="credito" id="pag-credito">
                <span class="comanda-pagamento__option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </span>
                <span class="comanda-pagamento__option-label">Crédito</span>
              </button>

              <button class="comanda-pagamento__option" data-pagamento="debito" id="pag-debito">
                <span class="comanda-pagamento__option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </span>
                <span class="comanda-pagamento__option-label">Débito</span>
              </button>

              <button class="comanda-pagamento__option comanda-pagamento__option--full" data-pagamento="dinheiro" id="pag-dinheiro">
                <span class="comanda-pagamento__option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                  </svg>
                </span>
                <span class="comanda-pagamento__option-label">Dinheiro</span>
              </button>
            </div>

            <!-- Divisão de valores entre 2 formas (aparece quando 2 são selecionadas) -->
            <div class="comanda-pagamento__divisao" id="comanda-pagamento-divisao" style="display:none">
              <div class="comanda-pagamento__divisao-row">
                <label class="comanda-pagamento__divisao-label" id="divisao-label-1">Forma 1</label>
                <div class="comanda-pagamento__divisao-input-wrap">
                  <span class="comanda-pagamento__divisao-prefix">R$</span>
                  <input type="number" class="comanda-pagamento__divisao-input" id="divisao-valor-1" min="0" step="0.01" placeholder="0,00" />
                </div>
              </div>
              <div class="comanda-pagamento__divisao-sep">+</div>
              <div class="comanda-pagamento__divisao-row">
                <label class="comanda-pagamento__divisao-label" id="divisao-label-2">Forma 2</label>
                <div class="comanda-pagamento__divisao-input-wrap">
                  <span class="comanda-pagamento__divisao-prefix">R$</span>
                  <input type="number" class="comanda-pagamento__divisao-input" id="divisao-valor-2" min="0" step="0.01" placeholder="0,00" />
                </div>
              </div>
              <div class="comanda-pagamento__divisao-info" id="divisao-info">Total: R$ 0,00</div>
            </div>
          </div>

          <!-- Finalizar -->
          <button class="comanda-btn-finalizar" id="comanda-btn-finalizar">
            FINALIZAR COMANDA
          </button>

          <!-- Cancelar / Excluir -->
          <div class="comanda-cancel-links">
            <button class="comanda-cancel-link" id="comanda-btn-cancelar">Cancelar</button>
            <span class="comanda-cancel-separator">/</span>
            <button class="comanda-cancel-link" id="comanda-btn-excluir">Excluir</button>
          </div>
        </aside>
      </div>
    `;

    // Insere a view no #app
    const app = document.getElementById('app');
    if (app) {
      app.appendChild(view);
    }

    this.container = view;

    // Marca a sidebar como Comandas ativa
    const navItems = document.querySelectorAll<HTMLButtonElement>('.sidebar__nav-item[data-route]');
    navItems.forEach(n => n.classList.remove('sidebar__nav-item--active'));
    const navComandas = document.getElementById('nav-comandas');
    if (navComandas) {
      navComandas.classList.add('sidebar__nav-item--active');
    }
  }

  /* ────────────────────────────────────────────────────────────
     Builders de HTML
     ──────────────────────────────────────────────────────────── */

  private buildServicoCard(s: ComandaServicoItem): string {
    const comissaoProf = (s.preco * s.comissaoProfissional / 100);
    const comissaoEst = (s.preco * s.comissaoEstudio / 100);

    return `
      <div class="comanda-servico-card">
        <div class="comanda-servico-card__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>
        <div class="comanda-servico-card__info">
          <div class="comanda-servico-card__nome">${s.nome}</div>
          <div class="comanda-servico-card__profissional">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            ${s.profissional}
          </div>
        </div>
        <div class="comanda-servico-card__valores">
          <div class="comanda-servico-card__preco">${this.formatarMoeda(s.preco)}</div>
          <div class="comanda-servico-card__comissao">PROFISSIONAL (${s.comissaoProfissional}%): ${this.formatarMoeda(comissaoProf)}</div>
          <div class="comanda-servico-card__comissao">ESPAÇO (${s.comissaoEstudio}%): ${this.formatarMoeda(comissaoEst)}</div>
        </div>
      </div>
    `;
  }

  private buildComissoes(s: ComandaServicoItem): string {
    const comissaoProf = (s.preco * s.comissaoProfissional / 100);
    const comissaoEst = (s.preco * s.comissaoEstudio / 100);

    return `
      <div class="comanda-comissao-row">
        <div class="comanda-comissao-row__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div class="comanda-comissao-row__info">
          <div class="comanda-comissao-row__label">Profissional (${s.comissaoProfissional}%)</div>
          <div class="comanda-comissao-row__sub">${s.profissional}</div>
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
          <div class="comanda-comissao-row__label">Estúdio (${s.comissaoEstudio}%)</div>
          <div class="comanda-comissao-row__sub">Taxa de Espaço</div>
        </div>
        <span class="comanda-comissao-row__valor">${this.formatarMoeda(comissaoEst)}</span>
      </div>
    `;
  }

  /* ────────────────────────────────────────────────────────────
     Eventos
     ──────────────────────────────────────────────────────────── */

  private bindEvents(): void {
    if (!this.container) return;

    // Voltar
    const btnVoltar = this.container.querySelector('#comanda-btn-voltar');
    btnVoltar?.addEventListener('click', () => {
      this.voltarParaAgenda();
    });

    // Cancelar / Excluir — chama callback + volta
    const btnCancelar = this.container.querySelector('#comanda-btn-cancelar');
    btnCancelar?.addEventListener('click', () => {
      this.onCancelarExcluir(this.agendamentoId);
      this.voltarParaAgenda();
    });

    const btnExcluir = this.container.querySelector('#comanda-btn-excluir');
    btnExcluir?.addEventListener('click', () => {
      this.onCancelarExcluir(this.agendamentoId);
      this.voltarParaAgenda();
    });

    // Finalizar Comanda — chama callback + volta
    const btnFinalizar = this.container.querySelector('#comanda-btn-finalizar');
    btnFinalizar?.addEventListener('click', () => {
      this.onFinalizar(this.agendamentoId);
      console.log('[Comanda] Comanda finalizada:', this.comandaId);
      this.voltarParaAgenda();
    });

    // Forma de pagamento — até 2 formas (RN doc produto 4.3)
    const pagOptions = this.container.querySelectorAll<HTMLButtonElement>('.comanda-pagamento__option');
    const total = this.calcularSubtotal();

    const atualizarDivisao = () => {
      const divisaoEl = this.container!.querySelector('#comanda-pagamento-divisao') as HTMLElement;
      const label1 = this.container!.querySelector('#divisao-label-1') as HTMLElement;
      const label2 = this.container!.querySelector('#divisao-label-2') as HTMLElement;
      const input1 = this.container!.querySelector('#divisao-valor-1') as HTMLInputElement;
      const input2 = this.container!.querySelector('#divisao-valor-2') as HTMLInputElement;
      const info   = this.container!.querySelector('#divisao-info') as HTMLElement;

      if (this.formasPagamento.length === 2) {
        divisaoEl.style.display = '';
        // Nomes legíveis por key
        const nomes: Record<string, string> = {
          pix_1: 'PIX Bricia', pix_2: 'PIX Flavia',
          credito: 'Crédito', debito: 'Débito', dinheiro: 'Dinheiro',
        };
        label1.textContent = nomes[this.formasPagamento[0]] || this.formasPagamento[0];
        label2.textContent = nomes[this.formasPagamento[1]] || this.formasPagamento[1];

        // Padrão 50/50
        if (!input1.value && !input2.value) {
          const metade = (total / 2).toFixed(2);
          input1.value = metade;
          input2.value = metade;
        }

        // Sincroniza: ao alterar input1, recalcula input2
        const sincronizar1 = () => {
          const v1 = parseFloat(input1.value) || 0;
          const v2 = Math.max(0, total - v1);
          input2.value = v2.toFixed(2);
          const soma = v1 + v2;
          const ok = Math.abs(soma - total) < 0.01;
          info.textContent = `Total: R$ ${soma.toFixed(2).replace('.', ',')}${ok ? '' : ' ⚠ Ajuste os valores'}`;
          info.style.color = ok ? 'var(--on-surface-variant)' : 'var(--error)';
        };
        const sincronizar2 = () => {
          const v2 = parseFloat(input2.value) || 0;
          const v1 = Math.max(0, total - v2);
          input1.value = v1.toFixed(2);
          const soma = v1 + v2;
          const ok = Math.abs(soma - total) < 0.01;
          info.textContent = `Total: R$ ${soma.toFixed(2).replace('.', ',')}${ok ? '' : ' ⚠ Ajuste os valores'}`;
          info.style.color = ok ? 'var(--on-surface-variant)' : 'var(--error)';
        };

        // Remove listeners antigos antes de adicionar
        input1.replaceWith(input1.cloneNode(true));
        input2.replaceWith(input2.cloneNode(true));
        const i1 = this.container!.querySelector('#divisao-valor-1') as HTMLInputElement;
        const i2 = this.container!.querySelector('#divisao-valor-2') as HTMLInputElement;
        i1.value = (total / 2).toFixed(2);
        i2.value = (total / 2).toFixed(2);
        i1.addEventListener('input', sincronizar1);
        i2.addEventListener('input', sincronizar2);

        info.textContent = `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
        info.style.color = 'var(--on-surface-variant)';
      } else {
        divisaoEl.style.display = 'none';
      }
    };

    pagOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        const key = opt.dataset.pagamento || '';
        const idx = this.formasPagamento.indexOf(key);

        if (idx >= 0) {
          // Já selecionada — desseleciona (desde que reste 1)
          if (this.formasPagamento.length > 1) {
            this.formasPagamento.splice(idx, 1);
            opt.classList.remove('comanda-pagamento__option--active');
          }
        } else {
          if (this.formasPagamento.length < 2) {
            // Adiciona
            this.formasPagamento.push(key);
            opt.classList.add('comanda-pagamento__option--active');
          } else {
            // Já tem 2: substitui a primeira
            const primeiro = this.formasPagamento.shift()!;
            this.formasPagamento.push(key);
            pagOptions.forEach(o => {
              if (o.dataset.pagamento === primeiro) o.classList.remove('comanda-pagamento__option--active');
            });
            opt.classList.add('comanda-pagamento__option--active');
          }
        }

        console.log('[Comanda] Formas de pagamento:', this.formasPagamento);
        atualizarDivisao();
      });
    });

    // Adicionar serviço (placeholder)
    const btnAddServico = this.container.querySelector('#comanda-btn-add-servico');
    btnAddServico?.addEventListener('click', () => {
      console.log('[Comanda] Adicionar serviço (placeholder)');
    });

    // Imprimir Via (placeholder)
    const btnImprimir = this.container.querySelector('#comanda-btn-imprimir');
    btnImprimir?.addEventListener('click', () => {
      console.log('[Comanda] Imprimir via (placeholder)');
    });

    // Salvar Rascunho (placeholder)
    const btnRascunho = this.container.querySelector('#comanda-btn-rascunho');
    btnRascunho?.addEventListener('click', () => {
      console.log('[Comanda] Salvar rascunho (placeholder)');
    });
  }

  private voltarParaAgenda(): void {
    this.destroy();
    const agendaView = document.getElementById('agenda-view');
    if (agendaView) agendaView.style.display = '';

    // Restaura sidebar para Agenda
    const navItems = document.querySelectorAll<HTMLButtonElement>('.sidebar__nav-item[data-route]');
    navItems.forEach(n => n.classList.remove('sidebar__nav-item--active'));
    const navAgenda = document.getElementById('nav-agenda');
    if (navAgenda) {
      navAgenda.classList.add('sidebar__nav-item--active');
    }

    this.onVoltar();
  }
}
