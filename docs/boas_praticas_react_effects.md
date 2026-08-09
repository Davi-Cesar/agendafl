# Boas Práticas — Evitando Effects Desnecessários e Gerenciamento de Estado

> Guia normativo baseado no artigo oficial do React (*"You Might Not Need an Effect"*), adaptado para a arquitetura do projeto **FL Agenda**.

---

## 1. Visão Geral

Effects (`useEffect`) são uma **escotilha de escape (escape hatch)** do paradigma reativo. Eles servem para **sincronizar** um componente com sistemas externos ao React (como APIs do navegador, conexões de rede, subscrições de eventos nativos do Electron ou widgets terceiros).

Para a maioria das necessidades de renderização, cálculo e resposta a ações do usuário no FL Agenda, **você NÃO precisa de um Effect**.

---

## 2. As Duas Regras de Ouro

1. **Transformações de dados para renderização NÃO precisam de Effect.**  
   Se um valor pode ser calculado a partir das `props` ou do `state` existente, calcule-o **diretamente durante a renderização**.

2. **Ações disparadas pelo usuário pertencem a Handlers de Evento, NÃO a Effects.**  
   Se um código deve rodar porque o usuário clicou em um botão, digitou algo ou submeteu um formulário, coloque essa lógica no **Event Handler** correspondente.

---

## 3. Anti-Padrões Comuns vs. Soluções Recomendadas

### 3.1 Atualizar Estado com Base em Props ou Outro Estado (Dados Derivados)

❌ **Anti-padrão (Ruim):**
```typescript
// NUNCA FAÇA ISSO: gera re-renders desnecessários e estado redundante
function ListaClientes({ clientes, filtro }: Props) {
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);

  useEffect(() => {
    setClientesFiltrados(clientes.filter(c => c.nome.includes(filtro)));
  }, [clientes, filtro]);

  return <div>{/* ... */}</div>;
}
```

✅ **Boa Prática (Correto):**
```typescript
// Calcule diretamente durante a renderização. Rápido, limpo e sem re-renders extras.
function ListaClientes({ clientes, filtro }: Props) {
  const clientesFiltrados = clientes.filter(c => c.nome.includes(filtro));

  return <div>{/* ... */}</div>;
}
```

> **Otimização de Performance:** Se o cálculo for computacionalmente pesado (ex: filtrar milhares de agendamentos), use `useMemo`:
> ```typescript
> const clientesFiltrados = useMemo(() => {
>   return filtrarClientesComplexo(clientes, filtro);
> }, [clientes, filtro]);
> ```

---

### 3.2 Resetar Todo o Estado Quando uma Prop ou Seleção Muda

❌ **Anti-padrão (Ruim):**
```typescript
// NUNCA FAÇA ISSO: o estado fica desatualizado até o Effect rodar após o re-render
function DetalheProfissional({ profissionalId }: Props) {
  const [observacao, setObservacao] = useState<string>('');

  useEffect(() => {
    setObservacao(''); // reseta nota ao mudar de profissional
  }, [profissionalId]);

  return <textarea value={observacao} onChange={e => setObservacao(e.target.value)} />;
}
```

✅ **Boa Prática (Correto):**
Use a propriedade `key` do React no nível do componente pai para forçar a recriação limpa do componente com estado inicial novo:
```typescript
// No componente pai:
<DetalheProfissional key={profissionalSelecionadoId} profissionalId={profissionalSelecionadoId} />
```

---

### 3.3 Reagir a Eventos do Usuário dentro de Effects

❌ **Anti-padrão (Ruim):**
```typescript
// NUNCA FAÇA ISSO: criar estado booleano intermediário só para acionar um Effect
function ModalAgendamento() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isSubmitting) {
      salvarAgendamentoNoSupabase().then(() => setIsSubmitting(false));
    }
  }, [isSubmitting]);

  const handleSubmit = () => setIsSubmitting(true);
}
```

✅ **Boa Prática (Correto):**
```typescript
// Envie a requisição/action diretamente dentro do handler do evento
function ModalAgendamento() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await useAgendaStore.getState().criarAgendamento(formData);
      toast.success('Agendamento criado com sucesso!');
    } catch (err) {
      toast.error('Erro ao salvar agendamento.');
    }
  };
}
```

---

### 3.4 Encadeamento de Effects (Efeito Dominó)

❌ **Anti-padrão (Ruim):**
```typescript
// NUNCA FAÇA ISSO: gera múltiplos ciclos de render em cascata
useEffect(() => {
  if (dataSelecionada) setProfissional(null);
}, [dataSelecionada]);

useEffect(() => {
  if (profissional === null) setHorariosDisponiveis([]);
}, [profissional]);
```

✅ **Boa Prática (Correto):**
Atualize todos os estados necessários juntos no mesmo evento ou calcule o estado derivado durante a renderização:
```typescript
const handleDataChange = (novaData: string) => {
  useAgendaStore.setState({
    dataSelecionada: novaData,
    profissionalSelecionadoId: null,
    horariosDisponiveis: []
  });
};
```

---

### 3.5 Notificar Componentes Pais sobre Mudança de Estado

❌ **Anti-padrão (Ruim):**
```typescript
function ToggleCaixa({ onChange }: { onChange: (aberto: boolean) => void }) {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    onChange(aberto);
  }, [aberto, onChange]);

  const handleClick = () => setAberto(!aberto);
}
```

✅ **Boa Prática (Correto):**
Chame o callback e atualize o estado no evento que originou a alteração:
```typescript
function ToggleCaixa({ onChange }: { onChange: (aberto: boolean) => void }) {
  const [aberto, setAberto] = useState(false);

  const handleClick = () => {
    const proximoEstado = !aberto;
    setAberto(proximoEstado);
    onChange(proximoEstado);
  };
}
```

---

### 3.6 Inicialização Global da Aplicação

❌ **Anti-padrão (Ruim):**
```typescript
function App() {
  useEffect(() => {
    inicializarConexoesEEstado(); // Executa 2x no React StrictMode e em re-renders
  }, []);
}
```

✅ **Boa Prática (Correto):**
Execute inicializações globais fora da árvore de componentes (escopo de módulo) ou no ponto de entrada do app (`app.ts` / `main.ts`):
```typescript
// src/renderer/app.ts
if (typeof window !== 'undefined') {
  inicializarApp();
}
```

---

### 3.7 Data Fetching e Tratamento de Race Conditions em Effects

Quando um Effect for estritamente necessário para carregar dados com base em dependências mutáveis, **sempre previna condições de corrida (race conditions)** com uma flag de limpeza (`ignore`):

✅ **Padrão Correto:**
```typescript
useEffect(() => {
  let ignore = false;

  async function carregarDados() {
    const resultado = await clientesService.buscarPorId(clienteId);
    if (!ignore) {
      setCliente(resultado);
    }
  }

  carregarDados();

  return () => {
    ignore = true; // Cancela a atualização se clienteId mudar antes da resposta
  };
}, [clienteId]);
```

> **Nota de Arquitetura no FL Agenda:** A busca e carregamento de dados assíncronos deve preferencialmente ser delegada às **actions do Zustand Store** do módulo correspondente (`modules/*/store/*.store.ts`), mantendo os componentes de visão limpos.

---

## 4. Tabela de Decisão Rápida

| Objetivo | O que fazer: | O que EVITAR: |
|---|---|---|
| Derivar/filtrar/ordenar dados para exibição | Calcular no corpo da função de render (ou `useMemo`) | `useEffect` + `useState` redundante |
| Resetar form/componente ao mudar seleção | Passar a prop `key={<id>}` no componente pai | `useEffect` para chamar reset de estado |
| Executar requisição ou salvar dados no submit | Código assíncrono no `onSubmit` / `onClick` | `useEffect` escutando flag booleana |
| Notificar componente pai sobre uma ação | Chamar callback prop dentro do Event Handler | `useEffect` escutando estado interno |
| Sincronizar com evento nativo/Electron IPC | `useEffect` com retorno de cleanup | Lógica de subscrição síncrona no render |
| Consumir estado do Zustand | Hook de seleção (`useAgendaStore(s => s.data)`) | `useEffect` para copiar dado pro `useState` |

---

## 5. Resumo para os Desenvolvedores

1. **Pergunte a si mesmo:** *"Isso pode ser calculado durante a renderização?"* Se a resposta for sim, não use `useEffect`.
2. **Pergunte a si mesmo:** *"Isso é uma reação direta a uma ação do usuário ou uma sincronização contínua?"* Se for ação do usuário, mova para o Event Handler.
3. **Mantenha a fonte única de verdade.** Guarde no estado apenas a informação mínima bruta necessária (ex: ID selecionado), e derive o resto durante a renderização.
4. **Use a prop `key`** para redefinir o estado de sub-árvores inteiras quando uma entidade de contexto mudar.
5. **Reserve o `useEffect` para sincronizações reais com o mundo externo** (listeners de IPC do Electron, subscrições de Realtime do Supabase, etc.).
