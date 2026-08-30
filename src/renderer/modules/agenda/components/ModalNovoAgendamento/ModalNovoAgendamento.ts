/**
 * FL Agenda — Modal Novo Agendamento (Controller & Componente)
 * Fiel a: docs/design/Agenda/screen_add_agenda.png e DESIGN.md
 */

interface NovoAgendamentoFormData {
  clienteNome: string;
  servico: string;
  profissionalId: string;
  data: string;
  horarioInicio: string;
  horarioFim: string;
  observacoes?: string;
}

interface ModalNovoAgendamentoOptions {
  profissionais: Array<{ id: string; nome: string; especialidade: string }>;
  servicos?: Array<{ id: string; nome: string; duracaoMinutos: number }>;
  onConfirm: (dados: NovoAgendamentoFormData) => void;
}

const SERVICOS_DEFAULT = [
  { id: 'srv-1', nome: 'Coloração + Tratamento', duracaoMinutos: 90 },
  { id: 'srv-2', nome: 'Corte e Escova', duracaoMinutos: 45 },
  { id: 'srv-3', nome: 'Barba Design', duracaoMinutos: 30 },
  { id: 'srv-4', nome: 'Massagem Relaxante', duracaoMinutos: 60 },
  { id: 'srv-5', nome: 'Drenagem Linfática', duracaoMinutos: 45 },
  { id: 'srv-6', nome: 'Shiatsu 60min', duracaoMinutos: 60 },
  { id: 'srv-7', nome: 'Limpeza de Pele Profunda', duracaoMinutos: 60 },
  { id: 'srv-8', nome: 'Design de Sobrancelhas', duracaoMinutos: 30 },
];

const CLIENTES_MOCK = [
  { nome: 'Mariana Silva', telefone: '(11) 98765-4321' },
  { nome: 'Beatriz Costa', telefone: '(11) 97654-3210' },
  { nome: 'Ana Paula', telefone: '(11) 96543-2109' },
  { nome: 'Ricardo Alves', telefone: '(11) 95432-1098' },
  { nome: 'Carla Dias', telefone: '(11) 94321-0987' },
  { nome: 'Julia Mendes', telefone: '(11) 93210-9876' },
  { nome: 'Lucas Ferreira', telefone: '(11) 92109-8765' },
  { nome: 'Camila Rocha', telefone: '(11) 91098-7654' },
];

class ModalNovoAgendamento {
  private overlay: HTMLElement | null = null;
  private form: HTMLFormElement | null = null;
  private inputCliente: HTMLInputElement | null = null;
  private selectServico: HTMLSelectElement | null = null;
  private selectProfissional: HTMLSelectElement | null = null;
  private inputData: HTMLInputElement | null = null;
  private inputHorario: HTMLInputElement | null = null;
  private textareaObs: HTMLTextAreaElement | null = null;
  private autocompleteList: HTMLUListElement | null = null;
  private options: ModalNovoAgendamentoOptions;

  constructor(options: ModalNovoAgendamentoOptions) {
    this.options = options;
    this.renderModalDOM();
    this.bindEvents();
  }

  /**
   * Renderiza a estrutura HTML do modal no body
   */
  private renderModalDOM(): void {
    const existing = document.getElementById('modal-novo-agendamento-overlay');
    if (existing) {
      existing.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'modal-novo-agendamento-overlay';
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'modal-novo-agendamento-title');

    const servicos = this.options.servicos || SERVICOS_DEFAULT;
    const optionsServicos = servicos
      .map(s => `<option value="${s.nome}">${s.nome}</option>`)
      .join('');

    const optionsProfissionais = this.options.profissionais
      .map(p => `<option value="${p.id}">${p.nome} — ${p.especialidade}</option>`)
      .join('');

    // Data de hoje padrão YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    overlay.innerHTML = `
      <div class="modal-card">
        <!-- Header -->
        <div class="modal-card__header">
          <h2 class="modal-card__title" id="modal-novo-agendamento-title">Novo Agendamento</h2>
          <button type="button" class="modal-card__close" id="modal-btn-close" aria-label="Fechar modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Form Body -->
        <form class="modal-card__form" id="modal-agendamento-form" autocomplete="off">
          
          <!-- CLIENTE -->
          <div class="modal-field" id="field-cliente">
            <label class="modal-field__label" for="modal-input-cliente">Cliente</label>
            <div class="modal-input-icon-wrapper">
              <svg class="modal-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                class="modal-input"
                id="modal-input-cliente"
                name="cliente"
                type="text"
                placeholder="Buscar cliente por nome ou telefone..."
                required
              />
            </div>
            <ul class="modal-autocomplete-list" id="modal-autocomplete-list"></ul>
            <span class="modal-field__error">Por favor, informe o nome do cliente</span>
          </div>

          <!-- SERVIÇO & PROFISSIONAL (2 colunas) -->
          <div class="modal-grid-2col">
            <div class="modal-field" id="field-servico">
              <label class="modal-field__label" for="modal-select-servico">Serviço</label>
              <select class="modal-select" id="modal-select-servico" name="servico" required>
                <option value="" disabled selected>Selecione o serviço</option>
                ${optionsServicos}
              </select>
              <span class="modal-field__error">Selecione um serviço</span>
            </div>

            <div class="modal-field" id="field-profissional">
              <label class="modal-field__label" for="modal-select-profissional">Profissional</label>
              <select class="modal-select" id="modal-select-profissional" name="profissional" required>
                <option value="" disabled selected>Selecione o profissional</option>
                ${optionsProfissionais}
              </select>
              <span class="modal-field__error">Selecione um profissional</span>
            </div>
          </div>

          <!-- DATA & HORÁRIO (2 colunas) -->
          <div class="modal-grid-2col">
            <div class="modal-field" id="field-data">
              <label class="modal-field__label" for="modal-input-data">Data</label>
              <div class="modal-input-icon-right">
                <input
                  class="modal-input"
                  id="modal-input-data"
                  name="data"
                  type="date"
                  value="${today}"
                  required
                />
              </div>
              <span class="modal-field__error">Informe a data</span>
            </div>

            <div class="modal-field" id="field-horario">
              <label class="modal-field__label" for="modal-input-horario">Horário</label>
              <div class="modal-input-icon-right">
                <input
                  class="modal-input"
                  id="modal-input-horario"
                  name="horario"
                  type="time"
                  step="1800"
                  value="09:00"
                  required
                />
              </div>
              <span class="modal-field__error">Informe o horário</span>
            </div>
          </div>

          <!-- OBSERVAÇÕES (OPCIONAL) -->
          <div class="modal-field" id="field-obs">
            <label class="modal-field__label" for="modal-textarea-obs">Observações (Opcional)</label>
            <textarea
              class="modal-textarea"
              id="modal-textarea-obs"
              name="observacoes"
              placeholder="Adicione notas sobre o agendamento, preferências do cliente, etc..."
            ></textarea>
          </div>

        </form>

        <!-- Footer Actions -->
        <div class="modal-card__footer">
          <button type="button" class="modal-btn-secondary" id="modal-btn-cancelar">Cancelar</button>
          <button type="submit" form="modal-agendamento-form" class="modal-btn-primary" id="modal-btn-confirmar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Confirmar Agendamento
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    this.overlay = overlay;
    this.form = overlay.querySelector<HTMLFormElement>('#modal-agendamento-form');
    this.inputCliente = overlay.querySelector<HTMLInputElement>('#modal-input-cliente');
    this.selectServico = overlay.querySelector<HTMLSelectElement>('#modal-select-servico');
    this.selectProfissional = overlay.querySelector<HTMLSelectElement>('#modal-select-profissional');
    this.inputData = overlay.querySelector<HTMLInputElement>('#modal-input-data');
    this.inputHorario = overlay.querySelector<HTMLInputElement>('#modal-input-horario');
    this.textareaObs = overlay.querySelector<HTMLTextAreaElement>('#modal-textarea-obs');
    this.autocompleteList = overlay.querySelector<HTMLUListElement>('#modal-autocomplete-list');
  }

  /**
   * Vincula eventos de clique, autocomplete, submit e teclado
   */
  private bindEvents(): void {
    if (!this.overlay || !this.form) return;

    // Fechar ao clicar no X ou Cancelar
    const btnClose = this.overlay.querySelector('#modal-btn-close');
    const btnCancelar = this.overlay.querySelector('#modal-btn-cancelar');

    btnClose?.addEventListener('click', () => this.close());
    btnCancelar?.addEventListener('click', () => this.close());

    // Fechar ao clicar no backdrop escuro
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Fechar ao pressionar ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay?.classList.contains('modal-overlay--open')) {
        this.close();
      }
    });

    // Autocomplete de clientes
    if (this.inputCliente && this.autocompleteList) {
      this.inputCliente.addEventListener('input', () => {
        const query = this.inputCliente?.value.trim().toLowerCase() || '';
        if (query.length < 1) {
          this.hideAutocomplete();
          return;
        }

        const matches = CLIENTES_MOCK.filter(
          c => c.nome.toLowerCase().includes(query) || c.telefone.includes(query)
        );

        if (matches.length === 0) {
          this.hideAutocomplete();
          return;
        }

        this.renderAutocomplete(matches);
      });

      // Fechar autocomplete ao clicar fora
      document.addEventListener('click', (e) => {
        if (!this.inputCliente?.contains(e.target as Node) && !this.autocompleteList?.contains(e.target as Node)) {
          this.hideAutocomplete();
        }
      });
    }

    // Submit do formulário
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  private renderAutocomplete(items: Array<{ nome: string; telefone: string }>): void {
    if (!this.autocompleteList) return;
    this.autocompleteList.innerHTML = items
      .map(
        item => `
          <li class="modal-autocomplete-item" data-nome="${item.nome}">
            <span>${item.nome}</span>
            <span class="modal-autocomplete-item__phone">${item.telefone}</span>
          </li>
        `
      )
      .join('');
    this.autocompleteList.classList.add('modal-autocomplete-list--visible');

    const listItems = this.autocompleteList.querySelectorAll<HTMLLIElement>('.modal-autocomplete-item');
    listItems.forEach(li => {
      li.addEventListener('click', () => {
        const nome = li.dataset.nome || '';
        if (this.inputCliente) {
          this.inputCliente.value = nome;
        }
        this.hideAutocomplete();
        this.selectServico?.focus();
      });
    });
  }

  private hideAutocomplete(): void {
    this.autocompleteList?.classList.remove('modal-autocomplete-list--visible');
    if (this.autocompleteList) {
      this.autocompleteList.innerHTML = '';
    }
  }

  /**
   * Valida e submete o formulário
   */
  private handleSubmit(): void {
    const cliente = this.inputCliente?.value.trim() || '';
    const servico = this.selectServico?.value || '';
    const profissional = this.selectProfissional?.value || '';
    const data = this.inputData?.value || '';
    const horarioInicio = this.inputHorario?.value || '';
    const obs = this.textareaObs?.value.trim() || '';

    let isValid = true;

    // Validação básica
    if (!cliente) {
      this.markInvalid('field-cliente', true);
      isValid = false;
    } else {
      this.markInvalid('field-cliente', false);
    }

    if (!servico) {
      this.markInvalid('field-servico', true);
      isValid = false;
    } else {
      this.markInvalid('field-servico', false);
    }

    if (!profissional) {
      this.markInvalid('field-profissional', true);
      isValid = false;
    } else {
      this.markInvalid('field-profissional', false);
    }

    if (!data) {
      this.markInvalid('field-data', true);
      isValid = false;
    } else {
      this.markInvalid('field-data', false);
    }

    if (!horarioInicio) {
      this.markInvalid('field-horario', true);
      isValid = false;
    } else {
      this.markInvalid('field-horario', false);
    }

    if (!isValid) return;

    // Calcular horário de fim baseado na duração estimada do serviço
    const servicos = this.options.servicos || SERVICOS_DEFAULT;
    const servicoObj = servicos.find(s => s.nome === servico);
    const duracao = servicoObj ? servicoObj.duracaoMinutos : 60;
    const horarioFim = this.calcularHorarioFim(horarioInicio, duracao);

    const formData: NovoAgendamentoFormData = {
      clienteNome: cliente,
      servico,
      profissionalId: profissional,
      data,
      horarioInicio,
      horarioFim,
      observacoes: obs || undefined,
    };

    this.options.onConfirm(formData);
    this.close();
  }

  private markInvalid(fieldId: string, isInvalid: boolean): void {
    const el = document.getElementById(fieldId);
    if (!el) return;
    if (isInvalid) {
      el.classList.add('modal-field--invalid');
    } else {
      el.classList.remove('modal-field--invalid');
    }
  }

  private calcularHorarioFim(inicio: string, duracaoMinutos: number): string {
    const [h, m] = inicio.split(':').map(Number);
    const totalMin = h * 60 + m + duracaoMinutos;
    const fimH = Math.floor(totalMin / 60) % 24;
    const fimM = totalMin % 60;
    return `${String(fimH).padStart(2, '0')}:${String(fimM).padStart(2, '0')}`;
  }

  /**
   * Abre o modal com opção de pré-preencher profissional e horário
   */
  public open(prefill?: { profissionalId?: string; horario?: string; data?: string }): void {
    this.resetForm();

    if (prefill) {
      if (prefill.profissionalId && this.selectProfissional) {
        this.selectProfissional.value = prefill.profissionalId;
      }
      if (prefill.horario && this.inputHorario) {
        this.inputHorario.value = prefill.horario;
      }
      if (prefill.data && this.inputData) {
        this.inputData.value = prefill.data;
      }
    }

    this.overlay?.classList.add('modal-overlay--open');
    setTimeout(() => {
      this.inputCliente?.focus();
    }, 100);
  }

  /**
   * Fecha o modal
   */
  public close(): void {
    this.overlay?.classList.remove('modal-overlay--open');
    this.hideAutocomplete();
    this.resetErrors();
  }

  private resetForm(): void {
    this.form?.reset();
    if (this.inputData) {
      this.inputData.value = new Date().toISOString().split('T')[0];
    }
    if (this.inputHorario) {
      this.inputHorario.value = '09:00';
    }
    this.resetErrors();
  }

  private resetErrors(): void {
    const invalidFields = this.overlay?.querySelectorAll('.modal-field--invalid');
    invalidFields?.forEach(f => f.classList.remove('modal-field--invalid'));
  }
}
