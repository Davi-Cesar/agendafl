# Arquitetura — FL Agenda (Electron + TypeScript)

> Documento normativo. Toda feature, refactor ou bugfix **deve** seguir as regras descritas aqui.  
> Atualizado em: 2026-08-09

---

## 1. Visão Geral

O FL Agenda é um aplicativo **desktop** construído com **Electron** e **TypeScript** voltado ao segmento de estética e beleza. O operador principal é a recepcionista, que centraliza todas as operações em um único dispositivo (desktop/tablet horizontal).

O sistema é composto por **4 módulos de negócio** no MVP:

| Módulo | Responsabilidade |
|---|---|
| **Agenda** | Calendário diário com grade de profissionais × horários, agendamentos e controle de status |
| **Caixa** | Abertura/fechamento de caixa, saldo por meio de pagamento, comissões |
| **Clientes** | Cadastro, busca, histórico de visitas e aniversariantes |
| **Comandas** | Criação de comanda, adição de serviços, registro de pagamento e finalização |

Módulos auxiliares (sem tela própria no MVP, mas com domínio próprio):

| Módulo | Responsabilidade |
|---|---|
| **Profissionais** | Cadastro, horários de trabalho, especialidades e comissão |
| **Serviços** | Catálogo de serviços com preço, duração e profissionais habilitados |

---

## 2. Padrão Arquitetural — Vertical Slice

Cada **módulo** é um **slice vertical** — uma fatia completa e independente que encapsula **tudo** que é necessário para aquela funcionalidade funcionar: desde a camada de dados (services/API) até a interface gráfica (views).

### 2.1 Princípios

1. **Coesão por feature, não por camada técnica.** Não existem pastas globais `services/`, `views/`, `stores/`. Cada módulo contém suas próprias.
2. **Baixo acoplamento entre módulos.** Um módulo **nunca** importa diretamente de dentro de outro módulo. A comunicação entre módulos se dá exclusivamente via a API pública exportada pelo `index.ts` do módulo alvo.
3. **Autonomia de deploy mental.** Deve ser possível ler, entender e modificar um módulo inteiro sem precisar navegar por diretórios de outros módulos.
4. **Shared é exceção, não regra.** Código compartilhado (`shared/`) só existe para utilitários verdadeiramente transversais (cliente HTTP, helpers de data, componentes de UI genéricos). Se algo é usado por apenas 2 módulos, duplique — não abstraia prematuramente.
5. **Type-safety obrigatório.** Todo código deve ser tipado com TypeScript. Uso de `any` é proibido — use `unknown` quando o tipo for desconhecido e faça narrowing explícito.

---

## 3. Estrutura de Diretórios

```
src/
├── main/                          # Processo principal do Electron
│   ├── main.ts                    # Entry point: BrowserWindow, lifecycle
│   ├── preload.ts                 # ContextBridge (ponte segura Main ↔ Renderer)
│   └── ipc/                       # Handlers IPC organizados por domínio
│       ├── window.ipc.ts          # minimize, maximize, close
│       └── system.ipc.ts          # notificações nativas, paths do SO
│
├── renderer/                      # Processo de renderização (a "aplicação web")
│   ├── index.html                 # Entry point HTML
│   ├── app.ts                     # Bootstrap: inicializa router, stores, monta app
│   │
│   ├── modules/                   # ★ VERTICAL SLICES — um por módulo de negócio
│   │   ├── agenda/
│   │   │   ├── index.ts           # API pública do módulo (re-exporta o necessário)
│   │   │   ├── agenda.routes.ts   # Definição de rotas do módulo
│   │   │   ├── views/             # Telas / páginas
│   │   │   │   └── AgendaView.ts
│   │   │   ├── components/        # Componentes visuais internos ao módulo
│   │   │   │   ├── GradeHorarios/ # Padrão Controller (index.tsx + controller.ts)
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── controller.ts
│   │   │   │   ├── CardAgendamento/
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── controller.ts
│   │   │   │   └── ModalNovoAgendamento/
│   │   │   │       ├── index.tsx
│   │   │   │       └── controller.ts
│   │   │   ├── services/          # Chamadas ao Supabase (API)
│   │   │   │   └── agenda.service.ts
│   │   │   ├── store/             # Estado local do módulo (Zustand)
│   │   │   │   └── agenda.store.ts
│   │   │   ├── schemas/           # Validações Zod
│   │   │   │   └── agendamento.schema.ts
│   │   │   └── types/             # Tipos TypeScript derivados e auxiliares
│   │   │       └── agenda.types.ts
│   │   │
│   │   ├── caixa/
│   │   │   ├── index.ts
│   │   │   ├── caixa.routes.ts
│   │   │   ├── views/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   ├── schemas/
│   │   │   └── types/
│   │   │
│   │   ├── clientes/
│   │   │   ├── index.ts
│   │   │   ├── clientes.routes.ts
│   │   │   ├── views/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   ├── schemas/
│   │   │   └── types/
│   │   │
│   │   ├── comandas/
│   │   │   ├── index.ts
│   │   │   ├── comandas.routes.ts
│   │   │   ├── views/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   ├── schemas/
│   │   │   └── types/
│   │   │
│   │   ├── profissionais/
│   │   │   ├── index.ts
│   │   │   ├── profissionais.routes.ts
│   │   │   ├── views/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   ├── schemas/
│   │   │   └── types/
│   │   │
│   │   └── servicos/
│   │       ├── index.ts
│   │       ├── servicos.routes.ts
│   │       ├── views/
│   │       ├── components/
│   │       ├── services/
│   │       ├── store/
│   │       ├── schemas/
│   │       └── types/
│   │
│   └── shared/                    # Código genuinamente transversal
│       ├── ui/                    # Componentes de UI genéricos (Button, Modal, Input, Table…)
│       ├── lib/                   # Utilitários puros (formatDate, currency, debounce…)
│       ├── supabase/              # Cliente Supabase singleton + helpers de auth
│       │   └── client.ts
│       ├── router/                # Sistema de roteamento SPA
│       │   └── router.ts
│       ├── types/                 # Tipos globais compartilhados
│       │   └── global.d.ts
│       └── styles/                # Design tokens, reset, tipografia, variáveis CSS
│           ├── reset.css
│           ├── tokens.css
│           └── global.css
```

---

## 4. Camadas de um Módulo (Vertical Slice)

Cada módulo é composto por **6 camadas internas**. Toda nova feature segue este padrão.

### 4.1 `schemas/` — Validação (Zod)

**Tecnologia:** [Zod](https://zod.dev/)

Define os **schemas de validação** para todas as entidades e DTOs do módulo. É a **única fonte de verdade** sobre a forma dos dados.

**Regras:**
- Todo dado que entra no sistema (formulários, respostas de API) **deve** ser validado por um schema Zod antes de ser consumido.
- Os schemas são usados tanto na camada de `services/` (validar respostas do Supabase) quanto nas `views/` (validar input do usuário).
- Os **tipos TypeScript** são sempre **inferidos** do schema Zod via `z.infer<typeof Schema>` — nunca declarados manualmente em duplicidade.
- Nomeação: `[entidade].schema.ts` (ex: `agendamento.schema.ts`, `cliente.schema.ts`).

**Exemplo de estrutura:**

```typescript
// modules/agenda/schemas/agendamento.schema.ts
import { z } from 'zod';

export const AgendamentoSchema = z.object({
  id: z.string().uuid(),
  cliente_id: z.string().uuid(),
  profissional_id: z.string().uuid(),
  servico_id: z.string().uuid(),
  data: z.string().date(),               // 'YYYY-MM-DD'
  horario: z.string().regex(/^\d{2}:\d{2}$/),
  status: z.enum(['agendado', 'em_atendimento', 'concluido', 'faltou']),
  observacoes: z.string().optional(),
  created_at: z.string().datetime(),
});

export const CriarAgendamentoDTO = AgendamentoSchema.omit({
  id: true,
  status: true,
  created_at: true,
});

// Tipos inferidos do Zod — única fonte de verdade
export type Agendamento = z.infer<typeof AgendamentoSchema>;
export type CriarAgendamentoInput = z.infer<typeof CriarAgendamentoDTO>;
export type StatusAgendamento = Agendamento['status'];
```

---

### 4.2 `types/` — Tipos TypeScript Auxiliares

Tipos que **não** derivam diretamente de um schema Zod, mas são necessários no contexto do módulo (props de componentes, estados intermediários, payloads internos).

**Regras:**
- Tipos derivados de Zod ficam em `schemas/`. A pasta `types/` é para tipos puramente auxiliares.
- Nomeação: `[modulo].types.ts` (ex: `agenda.types.ts`).

**Exemplo:**

```typescript
// modules/agenda/types/agenda.types.ts
import type { Agendamento } from '../schemas/agendamento.schema';

export interface AgendaStoreState {
  agendamentos: Agendamento[];
  dataSelecionada: string;
  carregando: boolean;
  erro: string | null;
}

export interface AgendaStoreActions {
  setDataSelecionada: (data: string) => void;
  carregarAgendamentos: () => Promise<void>;
  criarAgendamento: (input: CriarAgendamentoInput) => Promise<void>;
}

export type AgendaStore = AgendaStoreState & AgendaStoreActions;
```

---

### 4.3 `services/` — Acesso a Dados (Supabase API)

**Tecnologia:** [Supabase JS Client](https://supabase.com/docs/reference/javascript)

Encapsula **toda** comunicação com o Supabase. Nenhuma outra camada do módulo faz chamadas diretas ao `supabase` client.

**Regras:**
- Cada service importa o **cliente Supabase** de `@shared/supabase/client.ts`.
- Cada service importa os **schemas Zod** do próprio módulo para validar as respostas.
- Um service **retorna** dados já validados e tipados, ou lança erro explícito.
- Um service **nunca** manipula estado da UI (não importa stores, não manipula DOM).
- Nomeação: `[modulo].service.ts` (ex: `agenda.service.ts`).
- Todas as funções devem ter **tipagem de retorno explícita**.
- Services são funções puras/assíncronas — sem side-effects de UI.

**Exemplo de estrutura:**

```typescript
// modules/agenda/services/agenda.service.ts
import { supabase } from '@shared/supabase/client';
import {
  AgendamentoSchema,
  CriarAgendamentoDTO,
  type Agendamento,
  type CriarAgendamentoInput,
} from '../schemas/agendamento.schema';

export async function buscarAgendamentosDoDia(data: string): Promise<Agendamento[]> {
  const { data: rows, error } = await supabase
    .from('agendamentos')
    .select('*, clientes(nome), profissionais(nome), servicos(nome, duracao)')
    .eq('data', data);

  if (error) throw new Error(`Erro ao buscar agendamentos: ${error.message}`);

  return (rows ?? []).map((row) => AgendamentoSchema.parse(row));
}

export async function criarAgendamento(input: CriarAgendamentoInput): Promise<Agendamento> {
  const dto = CriarAgendamentoDTO.parse(input);

  const { data, error } = await supabase
    .from('agendamentos')
    .insert({ ...dto, status: 'agendado' })
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar agendamento: ${error.message}`);
  return AgendamentoSchema.parse(data);
}
```

---

### 4.4 `store/` — Gerenciamento de Estado (Zustand)

**Tecnologia:** [Zustand](https://zustand-demo.pmnd.rs/)

Cada módulo possui **seu próprio store** Zustand. O store é o intermediário entre `services/` e `views/`.

**Regras:**
- Um store **nunca** faz chamadas diretas ao Supabase — ele chama funções do `services/`.
- Cada store exporta um **hook/getter** para acesso ao estado e **actions** para mutação.
- O store deve ser **tipado** com uma interface que define estado + actions.
- O estado inicial deve ser explícito e documentado.
- Actions assíncronas (que chamam services) devem gerenciar estados de loading/error internamente.
- Um store de módulo **nunca** importa o store de outro módulo diretamente. Se precisar reagir a mudanças de outro módulo, use o mecanismo de `subscribe` do Zustand ou eventos customizados.
- Nomeação: `[modulo].store.ts` (ex: `agenda.store.ts`).

**Exemplo de estrutura:**

```typescript
// modules/agenda/store/agenda.store.ts
import { create } from 'zustand';
import * as agendaService from '../services/agenda.service';
import type { Agendamento, CriarAgendamentoInput } from '../schemas/agendamento.schema';

interface AgendaState {
  agendamentos: Agendamento[];
  dataSelecionada: string;
  carregando: boolean;
  erro: string | null;
}

interface AgendaActions {
  setDataSelecionada: (data: string) => void;
  carregarAgendamentos: () => Promise<void>;
  criarAgendamento: (input: CriarAgendamentoInput) => Promise<void>;
}

type AgendaStore = AgendaState & AgendaActions;

export const useAgendaStore = create<AgendaStore>((set, get) => ({
  // === Estado ===
  agendamentos: [],
  dataSelecionada: new Date().toISOString().split('T')[0],
  carregando: false,
  erro: null,

  // === Actions ===
  setDataSelecionada: (data: string): void => {
    set({ dataSelecionada: data });
    get().carregarAgendamentos();
  },

  carregarAgendamentos: async (): Promise<void> => {
    set({ carregando: true, erro: null });
    try {
      const agendamentos = await agendaService.buscarAgendamentosDoDia(get().dataSelecionada);
      set({ agendamentos, carregando: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      set({ erro: message, carregando: false });
    }
  },

  criarAgendamento: async (input: CriarAgendamentoInput): Promise<void> => {
    try {
      await agendaService.criarAgendamento(input);
      await get().carregarAgendamentos();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      set({ erro: message });
      throw err;
    }
  },
}));
```

---

### 4.5 `views/` — Telas / Páginas

As views são as **telas completas** renderizadas pelo router. Cada view corresponde a uma rota.

**Regras:**
- Uma view **consome** o store via hook/getter do Zustand.
- Uma view **nunca** chama services diretamente — sempre via actions do store.
- Uma view pode compor **components** internos do próprio módulo.
- Uma view pode usar **componentes de UI** de `shared/ui/` (botões, modais, inputs genéricos).
- Uma view é responsável pelo layout da tela e por orquestrar os componentes.
- Nomeação: `[Nome]View.ts` (ex: `AgendaView.ts`, `CaixaView.ts`).

---

### 4.6 `components/` — Componentes Visuais Internos

Componentes reutilizáveis **dentro do contexto do módulo**. São blocos visuais menores que compõem as views.

**Regras:**
- Componentes internos **pertencem** ao módulo. Se um componente for necessário em 2+ módulos, ele deve ser promovido para `shared/ui/`.
- Componentes seguem o **Padrão Controller** (ver Seção 14): a interface fica em `index.tsx` e a lógica de estado/hooks fica em `controller.ts`.
- Nomeação de pasta: PascalCase descritivo (ex: `CardAgendamento/`, `GradeHorarios/`, `TabelaComissoes/`).

---

### 4.7 `routes` — Definição de Rotas

Cada módulo declara suas próprias rotas em `[modulo].routes.ts`. O router central (`shared/router/router.ts`) agrega todas as rotas dos módulos.

**Regras:**
- Cada arquivo de rotas exporta um array tipado de `RouteDefinition`.
- O `path` segue o padrão `/[modulo]` para a rota raiz e `/[modulo]/[sub-rota]` para sub-rotas.
- O router central faz o import de todos os `*.routes.ts` e monta a tabela de rotas.

**Exemplo:**

```typescript
// shared/router/router.ts
export interface RouteDefinition {
  path: string;
  view: () => void;  // função que renderiza a view no container
  label: string;
}
```

```typescript
// modules/agenda/agenda.routes.ts
import type { RouteDefinition } from '@shared/router/router';
import { AgendaView } from './views/AgendaView';

export const agendaRoutes: RouteDefinition[] = [
  { path: '/agenda', view: AgendaView, label: 'Agenda' },
];
```

```typescript
// modules/caixa/caixa.routes.ts
import type { RouteDefinition } from '@shared/router/router';
import { CaixaView } from './views/CaixaView';

export const caixaRoutes: RouteDefinition[] = [
  { path: '/caixa', view: CaixaView, label: 'Caixa' },
];
```

---

## 5. Camada Shared (Código Transversal)

A pasta `shared/` contém **apenas** código que é genuinamente usado por 3 ou mais módulos, ou que representa infraestrutura transversal do sistema.

### 5.1 `shared/supabase/`

- **`client.ts`**: Instância singleton do Supabase client, configurada com `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
- Variáveis de ambiente são injetadas via processo Electron (Main → Renderer via preload).
- **Nenhum outro arquivo** no projeto instancia o Supabase client diretamente.

### 5.2 `shared/ui/`

Componentes de interface genéricos e sem lógica de negócio:

| Componente | Uso |
|---|---|
| `Button` | Botões primário, secundário, destrutivo, ícone |
| `Modal` | Container de modal com overlay, header, body, footer |
| `Input` | Input de texto, busca, data, hora |
| `Select` | Dropdown com opções |
| `Table` | Tabela paginada com header, body, footer |
| `Badge` | Etiquetas de status, prioridade, categoria |
| `Card` | Container visual genérico com borda, sombra, padding |
| `Toast` | Notificações temporárias (sucesso, erro, info) |

### 5.3 `shared/lib/`

Funções utilitárias puras (sem side-effects), todas tipadas:

- `formatDate(date: Date | string, pattern: string): string`
- `formatCurrency(value: number): string`
- `debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T`
- `generateId(): string`

### 5.4 `shared/router/`

Sistema de roteamento SPA simples (hash-based ou history-based). Responsável por:

- Registrar rotas de todos os módulos
- Renderizar a view correspondente à rota ativa
- Expor funções de navegação (`navigate(path: string): void`, `getCurrentRoute(): RouteDefinition | null`)

### 5.5 `shared/types/`

Tipos globais compartilhados e declarações de ambiente:

- **`global.d.ts`**: Declaração do `window.electronAPI` e tipos globais do processo renderer.

```typescript
// shared/types/global.d.ts
import type { ElectronAPI } from '../../main/preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

### 5.6 `shared/styles/`

- **`reset.css`**: Reset/normalização do CSS base
- **`tokens.css`**: Design tokens (cores, espaçamentos, tipografia, bordas, sombras, breakpoints)
- **`global.css`**: Estilos globais aplicados ao `body`, scrollbars customizadas, fontes importadas

---

## 6. Comunicação entre Módulos

### 6.1 Regra de Ouro

> **Módulo A nunca importa arquivos internos do Módulo B.**

Todo acesso entre módulos passa pela **API pública** — o `index.ts` na raiz de cada módulo.

### 6.2 O que o `index.ts` pode exportar

- **Types e interfaces** do domínio (ex: `Agendamento`, `StatusAgendamento`)
- **Constantes** e **enums** do domínio (ex: `STATUSES_AGENDAMENTO`)
- **Schemas** Zod (para validação cruzada, ex: comanda precisa do schema de serviço)
- **Funções selecionadoras** do store (ex: `getAgendamentosHoje()`)

### 6.3 O que o `index.ts` NÃO exporta

- Componentes visuais internos
- Funções de service (acesso direto ao Supabase)
- Actions de mutação de estado de outro módulo

### 6.4 Padrão para Comunicação

Quando um módulo precisa reagir a uma ação de outro (ex: ao finalizar comanda no módulo `comandas`, o módulo `caixa` precisa atualizar), use o mecanismo de **subscribe do Zustand** ou um **event bus leve tipado** em `shared/lib/events.ts`.

```typescript
// shared/lib/events.ts
type EventCallback<T = unknown> = (payload: T) => void;

interface EventMap {
  'comanda:finalizada': { comandaId: string };
  'caixa:aberto': { caixaId: string; valorInicial: number };
  'caixa:fechado': { caixaId: string };
}

class EventBus {
  private listeners = new Map<string, Set<EventCallback>>();

  on<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);
  }

  off<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void {
    this.listeners.get(event)?.delete(callback as EventCallback);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    this.listeners.get(event)?.forEach((cb) => cb(payload));
  }
}

export const eventBus = new EventBus();
```

**Exemplo de uso:**

```typescript
// modules/comandas/store/comandas.store.ts
import { eventBus } from '@shared/lib/events';

// Ao finalizar comanda, emite evento tipado
finalizarComanda: async (comandaId: string): Promise<void> => {
  await comandaService.finalizar(comandaId);
  eventBus.emit('comanda:finalizada', { comandaId });
}
```

```typescript
// modules/caixa/store/caixa.store.ts
import { eventBus } from '@shared/lib/events';

// Reage ao evento de comanda finalizada
eventBus.on('comanda:finalizada', ({ comandaId }) => {
  useCaixaStore.getState().recarregarTransacoes();
});
```

---

## 7. Processo Electron (Main)

### 7.1 Responsabilidades do Main Process

- Criar e gerenciar a `BrowserWindow`
- Injetar variáveis de ambiente via `preload.ts` (chaves Supabase, feature flags)
- Expor handlers IPC para funcionalidades nativas (notificações do SO, acesso a diretórios)
- **Não** conter lógica de negócio — é pura infraestrutura

### 7.2 Preload e ContextBridge

O `preload.ts` define e exporta uma **interface `ElectronAPI`** tipada, e a expõe via `contextBridge.exposeInMainWorld`:

```typescript
// src/main/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  sendNotification: (payload: { title: string; body: string }) => Promise<boolean>;
  getEnv: () => Promise<{ SUPABASE_URL: string; SUPABASE_ANON_KEY: string }>;
}

const api: ElectronAPI = {
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  sendNotification: (payload) => ipcRenderer.invoke('system:notify', payload),
  getEnv: () => ipcRenderer.invoke('system:get-env'),
};

contextBridge.exposeInMainWorld('electronAPI', api);
```

### 7.3 Organização IPC

Handlers IPC são separados em arquivos dentro de `src/main/ipc/`, agrupados por domínio funcional:

- `window.ipc.ts` — minimize, maximize, close
- `system.ipc.ts` — notificações, informações do SO, env

---

## 8. Regras de Nomeação

| Elemento | Padrão | Exemplo |
|---|---|---|
| Pasta de módulo | `kebab-case` (singular) | `agenda/`, `caixa/`, `clientes/` |
| Arquivo de schema | `[entidade].schema.ts` | `agendamento.schema.ts` |
| Arquivo de types | `[modulo].types.ts` | `agenda.types.ts` |
| Arquivo de service | `[modulo].service.ts` | `agenda.service.ts` |
| Arquivo de store | `[modulo].store.ts` | `agenda.store.ts` |
| Arquivo de rota | `[modulo].routes.ts` | `agenda.routes.ts` |
| Arquivo de view | `[Nome]View.ts` (PascalCase) | `AgendaView.ts` |
| Pasta de componente | `PascalCase/` | `CardAgendamento/` |
| Controller de componente | `controller.ts` | `CardAgendamento/controller.ts` |
| Layout de componente | `index.tsx` | `CardAgendamento/index.tsx` |
| Variáveis Zustand | `camelCase` | `dataSelecionada`, `carregando` |
| Actions Zustand | `camelCase` (verbo) | `carregarAgendamentos`, `criarAgendamento` |
| Schemas Zod | `PascalCase` | `AgendamentoSchema`, `CriarAgendamentoDTO` |
| Types/Interfaces | `PascalCase` | `Agendamento`, `AgendaStoreState` |
| Eventos (event bus) | `modulo:ação` (kebab) | `comanda:finalizada`, `caixa:aberto` |

---

## 9. Regras de TypeScript

### 9.1 Configuração

O projeto utiliza `tsconfig.json` com `strict: true`. Todas as opções de segurança estão habilitadas.

### 9.2 Proibições

- **`any` é proibido.** Use `unknown` com narrowing, generics com constraints, ou tipos explícitos.
- **Assertions (`as`)** devem ser usadas com moderação e documentadas com comentário justificando.
- **`@ts-ignore`** é proibido. Use `@ts-expect-error` com justificativa quando absolutamente necessário.

### 9.3 Boas Práticas

- Prefira `interface` para objetos e `type` para unions, intersections e tipos derivados.
- Sempre tipar parâmetros e retornos de funções públicas.
- Use `import type` para importações que só existem em tempo de compilação.
- Tipos derivados de Zod (`z.infer<>`) são a fonte de verdade — não duplique manualmente.

---

## 10. Fluxo de Dados (Unidirecional)

```
┌─────────────────────────────────────────────────────┐
│               COMPONENT LAYOUT (index.tsx)          │
│  Apenas JSX visual. Chama controller.*             │
└──────────────┬──────────────────────────────────────┘
               │ usa controller
               ▼
┌─────────────────────────────────────────────────────┐
│             COMPONENT CONTROLLER (controller.ts)    │
│  Hooks (useEffect, useState, useCallback, etc)      │
│  Lê e dispara actions do Store                      │
└──────────────┬──────────────────────────────────────┘
               │ action
               ▼
┌─────────────────────────────────────────────────────┐
│                   STORE (Zustand)                   │
│  Gerencia estado local do módulo                    │
│  Chama Service para operações de dados              │
└──────────────┬──────────────────────────────────────┘
               │ chamada assíncrona
               ▼
┌─────────────────────────────────────────────────────┐
│                 SERVICE (Supabase)                  │
│  Monta query → chama Supabase API                  │
│  Valida resposta com Schema Zod                     │
└──────────────┬──────────────────────────────────────┘
               │ HTTP request
               ▼
┌─────────────────────────────────────────────────────┐
│               SUPABASE (backend/API)                │
│  PostgreSQL + PostgREST + Auth + Storage            │
└─────────────────────────────────────────────────────┘
```

**Regra:** o fluxo é **sempre** `Layout (index.tsx) → Controller (controller.ts) → Store → Service → Supabase`. Nunca pule camadas.

---

## 11. Checklist para Criar uma Nova Feature

Antes de começar a implementar qualquer feature nova, siga este checklist na ordem:

1. **Identificar o módulo** — a feature pertence a qual slice? Se é genuinamente novo, crie um novo diretório em `modules/`.
2. **Definir os schemas Zod** (`schemas/`) — quais entidades e DTOs estão envolvidos? Exportar os tipos via `z.infer<>`.
3. **Definir tipos auxiliares** (`types/`) — props de componentes, estados intermediários.
4. **Implementar o service** (`services/`) — quais operações no Supabase são necessárias? Tipar retornos explicitamente.
5. **Criar/atualizar o store** (`store/`) — qual estado e quais actions a feature precisa? Definir interface do store.
6. **Definir a rota** (`routes`) — a feature precisa de uma nova rota ou se encaixa numa view existente?
7. **Construir componentes visuais** (`components/`) — criar a pasta do componente com `index.tsx` (layout) e `controller.ts` (lógica).
8. **Montar a view** (`views/`) — orquestrar componentes, conectar ao store via controller.
9. **Exportar pela API pública** (`index.ts`) — algum módulo externo precisa consumir tipos ou dados desta feature?

---

## 12. Regras de Importação (Import Paths)

### 12.1 Aliases

O projeto utiliza aliases configurados no `tsconfig.json` para evitar caminhos relativos profundos:

| Alias | Aponta para |
|---|---|
| `@modules/*` | `src/renderer/modules/*` |
| `@shared/*` | `src/renderer/shared/*` |

### 12.2 Regras

- **Dentro do mesmo módulo:** use caminhos relativos (`./services/agenda.service`).
- **De um módulo para shared:** use alias (`@shared/ui/Button`).
- **De um módulo para outro módulo:** use alias apontando para o `index.ts` (`@modules/servicos`). **Nunca** importe arquivos internos de outro módulo.
- **Importação de tipos:** use `import type` quando importar apenas tipos.

### 12.3 Importações Proibidas

```typescript
// ❌ PROIBIDO: importar arquivo interno de outro módulo
import { buscarServicos } from '@modules/servicos/services/servicos.service';

// ❌ PROIBIDO: importar tipo sem 'import type'
import { Servico } from '@modules/servicos';

// ✅ CORRETO: importar da API pública do módulo
import type { Servico } from '@modules/servicos';
import { ServicosSchema } from '@modules/servicos';
```

---

## 13. Stack Tecnológica — Resumo

| Camada | Tecnologia | Versão Mínima |
|---|---|---|
| Desktop runtime | Electron | 31.x |
| Linguagem | TypeScript | 5.5+ |
| Validação de dados | Zod | 3.x |
| Gerenciamento de estado | Zustand | 4.x |
| Backend / API / Banco | Supabase (PostgreSQL) | — |
| Estilização | CSS Vanilla (tokens + classes) | — |
| Tipografia | Google Fonts (Outfit) | — |

---

## 14. Padrão Component Controller (Separação Layout vs. Estado)

Para garantir a **separação estrita de responsabilidades** entre a apresentação visual (UI) e o gerenciamento de estado/efeitos, todo componente React com lógica interna ou integração deve ser estruturado em sua própria pasta com o seguinte padrão:

```
[NomeComponente]/
├── index.tsx              # Apenas estrutura de layout JSX e bindings visuais
└── controller.ts          # Custom Hook (use[NomeComponente]Controller) com todo estado, hooks e handlers
```

### 14.1 Diretrizes e Regras

1. **`index.tsx` (Layout Puro):**
   - Contém **estritamente o JSX**, marcação HTML e vinculação das variáveis/funções retornadas pelo controller.
   - **É PROIBIDO** declarar `useState`, `useEffect`, `useCallback`, `useMemo` ou manipular stores diretamente no `index.tsx`.
   - Invoca o controller logo na primeira linha do componente:
     ```tsx
     const controller = use[NomeComponente]Controller(props);
     ```
   - Toda interação na UI deve chamar métodos expostos pelo controller (ex: `onClick={controller.handleSubmit}`).

2. **`controller.ts` (Lógica e Estado):**
   - É um **Custom Hook** exportado como função nomeada (ex: `useModalAgendamentoController`).
   - Concentra **toda a inteligência do componente**: `useState`, `useEffect`, `useCallback`, `useMemo`, chamadas ao Zustand Store, subscrições de eventos e validações com Zod.
   - Retorna um objeto **tipado** contendo apenas as propriedades e métodos que a camada de layout precisa para renderizar e reagir.

---

### 14.2 Exemplo Prático de Implementação

#### `controller.ts` (Gerenciador de Estado e Hooks)

```typescript
import { useState, useCallback, useEffect } from 'react';
import { useAgendaStore } from '../../store/agenda.store';
import { CriarAgendamentoDTO, type CriarAgendamentoInput } from '../../schemas/agendamento.schema';

interface UseModalAgendamentoControllerProps {
  dataPadrao: string;
  onClose: () => void;
}

export function useModalAgendamentoController({ dataPadrao, onClose }: UseModalAgendamentoControllerProps) {
  // === 1. Estados locais ===
  const [formData, setFormData] = useState<Partial<CriarAgendamentoInput>>({ data: dataPadrao });
  const [erro, setErro] = useState<string | null>(null);

  // === 2. Zustand Store (Acesso reativo) ===
  const criarAgendamento = useAgendaStore((state) => state.criarAgendamento);
  const carregando = useAgendaStore((state) => state.carregando);

  // === 3. Handlers e Callbacks ===
  const handleFieldChange = useCallback((field: keyof CriarAgendamentoInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErro(null);

      try {
        const validData = CriarAgendamentoDTO.parse(formData);
        await criarAgendamento(validData);
        onClose();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao criar agendamento.';
        setErro(message);
      }
    },
    [formData, criarAgendamento, onClose]
  );

  // === 4. Objeto de Retorno para a View ===
  return {
    formData,
    carregando,
    erro,
    handleFieldChange,
    handleSubmit,
    onClose,
  };
}

export type ModalAgendamentoController = ReturnType<typeof useModalAgendamentoController>;
```

#### `index.tsx` (Estrutura de Layout)

```tsx
import React from 'react';
import { useModalAgendamentoController } from './controller';

interface ModalAgendamentoProps {
  dataPadrao: string;
  onClose: () => void;
}

export function ModalAgendamento(props: ModalAgendamentoProps) {
  // Instanciação única do controller
  const controller = useModalAgendamentoController(props);

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Novo Agendamento</h3>
          <button type="button" className="close-btn" onClick={controller.onClose}>
            &times;
          </button>
        </div>

        {controller.erro && <div className="error-banner">{controller.erro}</div>}

        <form onSubmit={controller.handleSubmit}>
          <div className="form-group">
            <label htmlFor="clienteId">Cliente</label>
            <input
              id="clienteId"
              type="text"
              placeholder="Digite o ID do cliente"
              onChange={(e) => controller.handleFieldChange('cliente_id', e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={controller.onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={controller.carregando}>
              {controller.carregando ? 'Salvando...' : 'Confirmar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```
