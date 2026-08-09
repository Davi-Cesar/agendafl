# FL Agenda — Documento de Produto v2.1 (Definitivo)

**Segmento:** Estética e Beleza | **Dispositivo:** Desktop/Tablet | **Operador:** Recepcionista

---

## 1. Contexto de Uso

| Parâmetro | Definição |
|---|---|
| Operador principal | Recepcionista centraliza todas as operações |
| Controle de acesso | Acesso único — sem login individual ou permissões por usuário |
| Profissionais ativos | 9 a 15 profissionais (impacta o layout da agenda) |
| Agendamento online | Não existe — todo agendamento passa pela recepção |
| Dispositivo principal | Desktop / Tablet (design horizontal) |
| Gestão de estoque | Não — somente serviços, sem produtos para revenda |

---

## 2. Módulos — MVP

Os quatro módulos abaixo compõem o escopo do primeiro lançamento:

- Agenda (Calendário)
- Caixa / Financeiro
- Cadastro de Clientes
- Comanda de Atendimento

---

## 3. Agenda

### 3.1 Visão Geral

Tela central do sistema. Exibe o dia atual por padrão, com grade horizontal onde cada coluna é um profissional e cada linha um horário do dia.

### 3.2 Layout da Grade

| Elemento | Descrição |
|---|---|
| Visão padrão | Apenas o dia atual |
| Colunas | Um profissional por coluna — 9 a 15 colunas com scroll horizontal |
| Linhas | Horários do dia em intervalos de 30 minutos (configurável) |
| Navegação de data | Botões ← Dia anterior / Dia seguinte → + seletor de data |
| Exibição de profissionais | Sempre todos visíveis — sem filtro, scroll horizontal para navegar |
| Célula disponível | Clicável — abre modal de novo agendamento |
| Célula fechada | Exibe trava + opção "Abrir exceção" |

### 3.3 Card de Agendamento

Cada agendamento exibe na célula da grade:

- Nome do cliente
- Serviço agendado
- Duração visual (altura proporcional ao tempo do serviço)

**Status e controle:**

| Status | Como muda |
|---|---|
| Agendado | Estado inicial ao criar o agendamento |
| Em atendimento | Sistema sugere automaticamente ao chegar no horário — recepcionista confirma |
| Concluído | Sistema sugere ao passar o horário — recepcionista confirma |
| Faltou | Recepcionista seleciona manualmente quando o cliente não comparece |

> ✅ **Definido:** a recepcionista confirma o status manualmente, mas o sistema faz sugestão automática baseada no horário.

### 3.4 Ao Clicar num Agendamento Existente

Independente do status, clicar no card abre um **popup** com:

- Dados do agendamento (cliente, serviço, profissional, horário)
- Botão **"Abrir Comanda"** — atalho direto para criar a comanda daquele atendimento
- Opção de editar ou cancelar o agendamento

> ✅ **Definido:** não abre a comanda automaticamente — exibe card com dados + botão "Abrir Comanda".

### 3.5 Modal de Novo Agendamento

Acionado ao clicar em célula disponível:

- **Passo 1:** Buscar cliente pelo nome (ou cadastrar novo rapidamente)
- **Passo 2:** Selecionar serviço
- **Passo 3:** Confirmar profissional + horário (pré-preenchidos pelo clique)

---

## 4. Comanda

### 4.1 Criação

A comanda é criada manualmente: a recepcionista busca o cliente pelo nome. Pode também ser iniciada pelo botão **"Abrir Comanda"** no popup de agendamento da agenda.

### 4.2 Itens da Comanda

- Adicionar serviços (sem produtos — estoque fora do MVP)
- Selecionar profissional responsável por cada serviço
- Total calculado automaticamente

### 4.3 Registro de Pagamento

> O pagamento é apenas para **registro/cadastro** — sem integração com maquininha ou gateway real.

| Modo | Descrição |
|---|---|
| Forma única | Dinheiro, PIX ou Cartão |
| Divisão em duas formas | Ex: parte em dinheiro + parte em PIX |

### 4.4 Histórico do Cliente (dentro da Comanda)

- Serviços anteriores: data, profissional e serviço realizado
- Dados cadastrais do cliente
- Campo de observações

---

## 5. Caixa / Financeiro

### 5.1 Fluxo do Caixa

| Ação | Descrição |
|---|---|
| Abrir novo caixa | Define o valor inicial (troco) — inicia do zero |
| Reabrir último caixa | Retoma o caixa fechado mais recente |
| Ver caixas fechados | Histórico de todos os caixas encerrados |
| Status visível | Badge "Aberto" / "Fechado" sempre visível na interface |

### 5.2 O que Alimenta o Caixa

- Comandas fechadas (com forma de pagamento registrada)
- Comissões dos profissionais calculadas automaticamente (% sobre serviços realizados)

### 5.3 Relatório ao Fechar o Caixa

- Total por forma de pagamento (Dinheiro / PIX / Cartão)
- Total de comissões por profissional
- Valor líquido do estabelecimento

---

## 6. Cadastro de Clientes

| Campo | Observação |
|---|---|
| Nome completo | Usado na busca da comanda e do agendamento |
| Telefone / WhatsApp | Exibido na tela de aniversariantes |
| Data de nascimento | Base para o módulo de aniversariantes |
| Observações | Campo livre — visível dentro da comanda |

**Funcionalidades:**

- Busca por nome (usada na criação de comanda e agendamento)
- Histórico completo de serviços vinculado ao perfil
- Tela de aniversariantes: lista automática do dia + filtro por outra data

---

## 7. Cadastro de Profissionais

### 7.1 Dados do Profissional

| Campo | Detalhe |
|---|---|
| Nome completo | Exibido como coluna na agenda |
| Telefone / WhatsApp | Contato interno |
| Email | Contato interno |
| CPF | Opcional |
| Data de nascimento | — |
| Status | Ativo / Inativo (inativo some da agenda) |
| Comissão (%) | Percentual sobre o valor dos serviços realizados |

### 7.2 Configuração de Horários (por dia da semana)

- Turno manhã: Das ___ Até ___
- Turno tarde: Das ___ Até ___
- Intervalo de almoço
- Pausas avulsas
- Botão (+) para horários de exceção no dia

### 7.3 Serviços Vinculados

Seleção múltipla dos serviços que o profissional está habilitado a realizar. Controla quais serviços aparecem disponíveis na agenda para cada profissional.

---

## 8. Cadastro de Serviços

| Campo | Detalhe |
|---|---|
| Nome | Ex: "Manicure simples" |
| Tipo / Categoria | Agrupamento de serviços |
| Preço padrão | Valor base do serviço |
| Duração (minutos) | Define a altura visual do card na agenda |
| Profissionais habilitados | Multi-seleção de quem executa o serviço |

---

## 9. Fluxos Principais

### Agendar
```
Agenda → Clicar célula disponível → Buscar cliente → Selecionar serviço → Confirmar profissional + horário
```

### Atender
```
Agenda → Clicar card do agendamento → Popup com dados → Botão "Abrir Comanda" → Adicionar serviços → Registrar pagamento
```

### Fechar o Caixa
```
Abrir caixa (valor inicial) → [dia de atendimentos] → Fechar caixa → Gerar relatório por forma de pagamento + comissões
```

---

## 10. Decisões de Design para o Stitch

| Decisão | Definição |
|---|---|
| Agenda: visão padrão | Dia atual |
| Agenda: profissionais | Sempre todos — scroll horizontal, sem filtro no MVP |
| Agenda: status | Sugestão automática por horário + confirmação manual da recepcionista |
| Agenda → Comanda | Card popup com dados + botão "Abrir Comanda" |
| Criação de comanda | Manual (busca por nome) ou via botão na agenda |
| Pagamento | Registro apenas — forma única ou divisão em duas formas |
| Comissão | Calculada automaticamente ao fechar comanda, consolidada no caixa |
| Sem login / permissões | Interface direta, sem tela de autenticação no MVP |
| Sem estoque / produtos | Somente serviços no catálogo da comanda |
