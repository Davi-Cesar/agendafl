# Modelagem do Banco de Dados — FL Agenda (Supabase / PostgreSQL)

> Documento normativo para estrutura, relacionamentos, tipos e DDL do banco de dados no Supabase.  
> Criado em: 2026-08-09

---

## 1. Visão Geral

O banco de dados do **FL Agenda** foi projetado para operar no **Supabase (PostgreSQL)**, atendendo integralmente às regras de negócio e requisitos funcionais descritos em `docs/fl_agenda_documento_produto_v2.1 (1).md` e `docs/Regras_de_Negocio_Agenda.md`.

### Principais Características
- **Modelo Relacional Consistente:** Integridade referencial estrita com Chaves Estrangeiras (FK).
- **Chaves Primárias UUID:** Utilização de `uuid_generate_v4()` ou `gen_random_uuid()` para todas as entidades principais.
- **Histórico e Auditoria:** Tracking temporal em todas as tabelas (`created_at`, `updated_at`).
- **Performance de Leitura:** Índices otimizados para busca de clientes por nome/telefone, agendamentos por data/profissional e comandas por caixa.
- **Cálculo Automático de Comissões:** Snapshot do percentual de comissão do profissional no momento do lançamento do item da comanda.

---

## 2. Diagrama Entidade-Relacionamento (ERD)

```mermaid
erDiagram
    clientes ||--o{ agendamentos : "possui"
    clientes ||--o{ comandas : "registra"
    
    profissionais ||--o{ agendamentos : "atende"
    profissionais ||--o{ profissionais_horarios : "configura"
    profissionais ||--o{ profissionais_excecoes : "registra"
    profissionais ||--o{ comanda_itens : "executa"
    profissionais }|--|{ profissionais_servicos : "habilitado"
    
    categorias_servicos ||--o{ servicos : "agrupa"
    servicos }|--|{ profissionais_servicos : "executado_por"
    servicos ||--o{ agendamentos : "agendado"
    servicos ||--o{ comanda_itens : "incluido"
    
    agendamentos ||--o| comandas : "gera"
    
    caixas ||--o{ comandas : "consolida"
    comandas ||--t{ comanda_itens : "contem"
    comandas ||--t{ comanda_pagamentos : "recebe"

    clientes {
        uuid id PK
        string nome
        string telefone
        date data_nascimento
        string cpf
        text observacoes
        string status
    }

    profissionais {
        uuid id PK
        string nome
        string especialidade
        string email
        string telefone
        string cpf
        numeric comissao_percentual
        string status
    }

    profissionais_horarios {
        uuid id PK
        uuid profissional_id FK
        int dia_semana
        boolean ativo
        time manha_inicio
        time manha_fim
        time tarde_inicio
        time tarde_fim
    }

    servicos {
        uuid id PK
        uuid categoria_id FK
        string nome
        numeric preco_padrao
        int duracao_minutos
        boolean ativo
    }

    agendamentos {
        uuid id PK
        uuid cliente_id FK
        uuid profissional_id FK
        uuid servico_id FK
        date data
        time horario_inicio
        time horario_fim
        string status
    }

    caixas {
        uuid id PK
        string status
        numeric saldo_inicial
        numeric saldo_final_dinheiro
        numeric saldo_final_pix
        numeric saldo_final_cartao_credito
        numeric saldo_final_cartao_debito
        numeric total_comissoes
        numeric valor_liquido
        timestamp aberto_em
        timestamp fechado_em
    }

    comandas {
        uuid id PK
        bigserial numero_sequencial
        uuid cliente_id FK
        uuid agendamento_id FK
        uuid caixa_id FK
        string status
        numeric subtotal
        numeric desconto
        numeric valor_total
    }

    comanda_itens {
        uuid id PK
        uuid comanda_id FK
        uuid servico_id FK
        uuid profissional_id FK
        numeric preco_unitario
        int quantidade
        numeric comissao_percentual
        numeric valor_comissao
    }

    comanda_pagamentos {
        uuid id PK
        uuid comanda_id FK
        string forma_pagamento
        numeric valor
        string detalhe_conta
    }
```

---

## 3. Enums e Tipos Customizados

```sql
CREATE TYPE enum_status_cliente AS ENUM ('ativo', 'inativo');
CREATE TYPE enum_status_profissional AS ENUM ('ativo', 'inativo');
CREATE TYPE enum_status_agendamento AS ENUM ('agendado', 'em_atendimento', 'concluido', 'faltou', 'cancelado');
CREATE TYPE enum_status_caixa AS ENUM ('aberto', 'fechado');
CREATE TYPE enum_status_comanda AS ENUM ('aberta', 'rascunho', 'finalizada', 'cancelada');
CREATE TYPE enum_forma_pagamento AS ENUM ('dinheiro', 'pix', 'cartao_credito', 'cartao_debito');
CREATE TYPE enum_tipo_excecao AS ENUM ('folga', 'bloqueio', 'horario_especial');
```

---

## 4. Dicionário de Dados

### 4.1 Tabela `clientes`
Armazena o cadastro completo dos clientes do estabelecimento.

| Coluna | Tipo | Nulidade | Descrição |
|---|---|---|---|
| `id` | `UUID` | **NOT NULL** (PK) | Identificador único (`gen_random_uuid()`) |
| `nome` | `TEXT` | **NOT NULL** | Nome completo do cliente (usado nas buscas) |
| `telefone` | `TEXT` | **NOT NULL** | Telefone / WhatsApp para contato e aniversariantes |
| `data_nascimento` | `DATE` | NULL | Data de nascimento (base para aniversariantes) |
| `cpf` | `TEXT` | NULL (UNIQUE) | CPF do cliente (opcional) |
| `observacoes` | `TEXT` | NULL | Notas e preferências livres (exibido na comanda) |
| `status` | `enum_status_cliente` | **NOT NULL** | Default `'ativo'` |
| `created_at` | `TIMESTAMPTZ` | **NOT NULL** | Data/hora de criação |
| `updated_at` | `TIMESTAMPTZ` | **NOT NULL** | Data/hora da última atualização |

---

### 4.2 Tabela `profissionais`
Armazena a equipe de colaboradores do salão (9 a 15 profissionais ativos).

| Coluna | Tipo | Nulidade | Descrição |
|---|---|---|---|
| `id` | `UUID` | **NOT NULL** (PK) | Identificador único |
| `nome` | `TEXT` | **NOT NULL** | Nome do profissional (exibido como coluna na agenda) |
| `especialidade` | `TEXT` | NULL | Cargo/Especialidade (ex: "Senior Stylist", "Colorist") |
| `email` | `TEXT` | NULL | E-mail de contato interno |
| `telefone` | `TEXT` | NULL | Telefone / WhatsApp de contato interno |
| `cpf` | `TEXT` | NULL | CPF do colaborador |
| `data_nascimento` | `DATE` | NULL | Data de nascimento |
| `comissao_percentual` | `NUMERIC(5,2)` | **NOT NULL** | % padrão de comissão (ex: `50.00` para 50%) |
| `status` | `enum_status_profissional`| **NOT NULL** | Default `'ativo'` (inativo oculta da agenda) |
| `created_at` | `TIMESTAMPTZ` | **NOT NULL** | Registro no sistema |
| `updated_at` | `TIMESTAMPTZ` | **NOT NULL** | Atualização |

---

### 4.3 Tabela `profissionais_horarios`
Configuração da jornada de trabalho padrão por dia da semana (Seg a Sáb).

| Coluna | Tipo | Nulidade | Descrição |
|---|---|---|---|
| `id` | `UUID` | **NOT NULL** (PK) | Identificador único |
| `profissional_id` | `UUID` | **NOT NULL** (FK) | Referência a `profissionais.id` |
| `dia_semana` | `SMALLINT` | **NOT NULL** | `0` (Dom) a `6` (Sáb) |
| `ativo` | `BOOLEAN` | **NOT NULL** | Default `TRUE` (se atende neste dia) |
| `manha_inicio` | `TIME` | NULL | Horário início turno manhã (ex: `08:00`) |
| `manha_fim` | `TIME` | NULL | Horário fim turno manhã (ex: `12:00`) |
| `tarde_inicio` | `TIME` | NULL | Horário início turno tarde (ex: `13:30`) |
| `tarde_fim` | `TIME` | NULL | Horário fim turno tarde (ex: `18:30`) |

> **Constraint:** `UNIQUE (profissional_id, dia_semana)`

---

### 4.4 Tabela `profissionais_excecoes`
Ajustes pontuais (folgas, feriados, entradas/saídas fora do padrão).

| Coluna | Tipo | Nulidade | Descrição |
|---|---|---|---|
| `id` | `UUID` | **NOT NULL** (PK) | Identificador único |
| `profissional_id` | `UUID` | **NOT NULL** (FK) | Referência a `profissionais.id` |
| `data` | `DATE` | **NOT NULL** | Data da exceção |
| `tipo` | `enum_tipo_excecao` | **NOT NULL** | `'folga'`, `'bloqueio'` ou `'horario_especial'` |
| `inicio` | `TIME` | NULL | Horário início (null se for dia inteiro) |
| `fim` | `TIME` | NULL | Horário fim (null se for dia inteiro) |
| `motivo` | `TEXT` | NULL | Descrição da exceção |

---

### 4.5 Tabela `categorias_servicos`
Agrupamento do catálogo de serviços (Cabelo, Estética, Unhas, etc).

| Coluna | Tipo | Nulidade | Descrição |
|---|---|---|---|
| `id` | `UUID` | **NOT NULL** (PK) | Identificador único |
| `nome` | `TEXT` | **NOT NULL** | Nome da categoria |
| `created_at` | `TIMESTAMPTZ` | **NOT NULL** | Criação |

---

### 4.6 Tabela `servicos`
Catálogo de serviços oferecidos pelo estabelecimento.

| Coluna | Tipo | Nulidade | Descrição |
|---|---|---|---|
| `id` | `UUID` | **NOT NULL** (PK) | Identificador único |
| `categoria_id` | `UUID` | NULL (FK) | Referência a `categorias_servicos.id` |
| `nome` | `TEXT` | **NOT NULL** | Nome do serviço (ex: "Manicure simples", "Shiatsu") |
| `preco_padrao` | `NUMERIC(10,2)`| **NOT NULL** | Valor base do serviço |
| `duracao_minutos` | `INTEGER` | **NOT NULL** | Duração em minutos (define altura do card na agenda) |
| `ativo` | `BOOLEAN` | **NOT NULL** | Default `TRUE` |
| `created_at` | `TIMESTAMPTZ` | **NOT NULL** | Criação |

---

### 4.7 Tabela `profissionais_servicos` (Pivô N:N)
Mapeia quais serviços cada profissional está habilitado a executar.

| Coluna | Tipo | Nulidade | Descrição |
|---|---|---|---|
| `profissional_id` | `UUID` | **NOT NULL** (FK) | Referência a `profissionais.id` |
| `servico_id` | `UUID` | **NOT NULL** (FK) | Referência a `servicos.id` |

> **Constraint:** `PRIMARY KEY (profissional_id, servico_id)`

---

### 4.8 Tabela `agendamentos`
Registro dos compromissos na grade horizontal do calendário.

| Coluna | Tipo | Nulidade | Descrição |
|---|---|---|---|
| `id` | `UUID` | **NOT NULL** (PK) | Identificador único |
| `cliente_id` | `UUID` | **NOT NULL** (FK) | Referência a `clientes.id` |
| `profissional_id` | `UUID` | **NOT NULL** (FK) | Referência a `profissionais.id` |
| `servico_id` | `UUID` | **NOT NULL** (FK) | Referência a `servicos.id` |
| `data` | `DATE` | **NOT NULL** | Data do agendamento |
| `horario_inicio` | `TIME` | **NOT NULL** | Horário de início (ex: `10:00`) |
| `horario_fim` | `TIME` | **NOT NULL** | Horário de término (calculado via duração) |
| `status` | `enum_status_agendamento` | **NOT NULL** | Default `'agendado'` |
| `observacoes` | `TEXT` | NULL | Observações do agendamento |
| `created_at` | `TIMESTAMPTZ` | **NOT NULL** | Criação |
| `updated_at` | `TIMESTAMPTZ` | **NOT NULL** | Atualização |

---

### 4.9 Tabela `caixas`
Registro dos caixas diários e fechamento financeiro.

| Coluna | Tipo | Nulidade | Descrição |
|---|---|---|---|
| `id` | `UUID` | **NOT NULL** (PK) | Identificador único |
| `status` | `enum_status_caixa` | **NOT NULL** | Default `'aberto'` |
| `saldo_inicial` | `NUMERIC(10,2)`| **NOT NULL** | Fundo de caixa (troco inicial) |
| `saldo_final_dinheiro` | `NUMERIC(10,2)`| NULL | Consolidado em espécie no fechamento |
| `saldo_final_pix` | `NUMERIC(10,2)`| NULL | Consolidado em PIX no fechamento |
| `saldo_final_cartao_credito`| `NUMERIC(10,2)`| NULL | Consolidado em Cartão de Crédito |
| `saldo_final_cartao_debito` | `NUMERIC(10,2)`| NULL | Consolidado em Cartão de Débito |
| `total_comissoes` | `NUMERIC(10,2)`| NULL | Soma das comissões geradas no período |
| `valor_liquido` | `NUMERIC(10,2)`| NULL | Saldo líquido do estabelecimento |
| `aberto_em` | `TIMESTAMPTZ` | **NOT NULL** | Data/hora de abertura |
| `fechado_em` | `TIMESTAMPTZ` | NULL | Data/hora do encerramento |
| `observacoes` | `TEXT` | NULL | Notas de fechamento |

---

### 4.10 Tabela `comandas`
Comanda de atendimento e fechamento de vendas.

| Coluna | Tipo | Nulidade | Descrição |
|---|---|---|---|
| `id` | `UUID` | **NOT NULL** (PK) | Identificador único |
| `numero_sequencial` | `BIGSERIAL` | **NOT NULL** | Número visível (ex: `#8843`) |
| `cliente_id` | `UUID` | **NOT NULL** (FK) | Referência a `clientes.id` |
| `agendamento_id` | `UUID` | NULL (FK) | Referência opcional ao agendamento de origem |
| `caixa_id` | `UUID` | NULL (FK) | Vinculado ao caixa ativo no momento da finalização |
| `status` | `enum_status_comanda` | **NOT NULL** | Default `'aberta'` |
| `subtotal` | `NUMERIC(10,2)`| **NOT NULL** | Soma bruta dos itens |
| `desconto` | `NUMERIC(10,2)`| **NOT NULL** | Valor de desconto aplicado (default `0.00`) |
| `valor_total` | `NUMERIC(10,2)`| **NOT NULL** | Total líquido (`subtotal - desconto`) |
| `cupom_codigo` | `TEXT` | NULL | Código do cupom aplicado |
| `created_at` | `TIMESTAMPTZ` | **NOT NULL** | Criação da comanda |
| `finalizada_em` | `TIMESTAMPTZ` | NULL | Data/hora de encerramento do atendimento |

---

### 4.11 Tabela `comanda_itens`
Lançamento de serviços dentro de uma comanda.

| Coluna | Tipo | Nulidade | Descrição |
|---|---|---|---|
| `id` | `UUID` | **NOT NULL** (PK) | Identificador único |
| `comanda_id` | `UUID` | **NOT NULL** (FK) | Referência a `comandas.id` (ON DELETE CASCADE) |
| `servico_id` | `UUID` | **NOT NULL** (FK) | Referência a `servicos.id` |
| `profissional_id` | `UUID` | **NOT NULL** (FK) | Profissional que executou o serviço |
| `preco_unitario` | `NUMERIC(10,2)`| **NOT NULL** | Preço cobrado pelo serviço |
| `quantidade` | `INTEGER` | **NOT NULL** | Default `1` |
| `comissao_percentual` | `NUMERIC(5,2)`| **NOT NULL** | Snapshot da comissão do profissional |
| `valor_comissao` | `NUMERIC(10,2)`| **NOT NULL** | Valor monetário (`preco * qtd * %comissao`) |
| `created_at` | `TIMESTAMPTZ` | **NOT NULL** | Lançamento |

---

### 4.12 Tabela `comanda_pagamentos`
Registro das formas de pagamento utilizadas para quitar a comanda (suporta divisão em 2 formas).

| Coluna | Tipo | Nulidade | Descrição |
|---|---|---|---|
| `id` | `UUID` | **NOT NULL** (PK) | Identificador único |
| `comanda_id` | `UUID` | **NOT NULL** (FK) | Referência a `comandas.id` (ON DELETE CASCADE) |
| `forma_pagamento` | `enum_forma_pagamento`| **NOT NULL** | `'dinheiro'`, `'pix'`, `'cartao_credito'`, etc. |
| `valor` | `NUMERIC(10,2)`| **NOT NULL** | Valor quitado nesta forma |
| `detalhe_conta` | `TEXT` | NULL | Detalhe (ex: "PIX Bricia", "PIX Flavia", "Crédito 2x") |
| `created_at` | `TIMESTAMPTZ` | **NOT NULL** | Registro do pagamento |

---

## 5. Índices para Otimização de Performance

```sql
-- Busca rápida de clientes por nome e telefone
CREATE INDEX idx_clientes_nome ON clientes USING ilike (nome text_pattern_ops);
CREATE INDEX idx_clientes_telefone ON clientes (telefone);
CREATE INDEX idx_clientes_aniversario ON clientes (EXTRACT(MONTH FROM data_nascimento), EXTRACT(DAY FROM data_nascimento));

-- Grade da Agenda (Filtro essencial por Data e Profissional)
CREATE INDEX idx_agendamentos_data ON agendamentos (data);
CREATE INDEX idx_agendamentos_data_profissional ON agendamentos (data, profissional_id);

-- Comandas e Caixa
CREATE INDEX idx_comandas_caixa ON comandas (caixa_id);
CREATE INDEX idx_comandas_cliente ON comandas (cliente_id);
CREATE INDEX idx_comanda_itens_comanda ON comanda_itens (comanda_id);
CREATE INDEX idx_comanda_itens_profissional ON comanda_itens (profissional_id);
CREATE INDEX idx_comanda_pagamentos_comanda ON comanda_pagamentos (comanda_id);
```

---

## 6. Triggers e Funções Automatizadas

### 6.1 Atualização Automática de `updated_at`
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_profissionais_updated_at BEFORE UPDATE ON profissionais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_agendamentos_updated_at BEFORE UPDATE ON agendamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 6.2 Cálculo Automático da Comissão no Item da Comanda
```sql
CREATE OR REPLACE FUNCTION fn_calcular_comissao_item()
RETURNS TRIGGER AS $$
DECLARE
  v_percentual NUMERIC(5,2);
BEGIN
  -- Se o % não foi informado manualmente, busca o % cadastrado no profissional
  IF NEW.comissao_percentual IS NULL THEN
    SELECT comissao_percentual INTO v_percentual FROM profissionais WHERE id = NEW.profissional_id;
    NEW.comissao_percentual := COALESCE(v_percentual, 0.00);
  END IF;
  
  -- Calcula o valor monetário da comissão
  NEW.valor_comissao := ROUND((NEW.preco_unitario * NEW.quantidade * (NEW.comissao_percentual / 100.00)), 2);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calcular_comissao_item
BEFORE INSERT OR UPDATE ON comanda_itens
FOR EACH ROW EXECUTE FUNCTION fn_calcular_comissao_item();
```

---

## 7. Script DDL Completo (SQL para Execução no Supabase Editor)

```sql
-- 1. Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Limpar tipos antigos se existirem
DROP TYPE IF EXISTS enum_status_cliente CASCADE;
DROP TYPE IF EXISTS enum_status_profissional CASCADE;
DROP TYPE IF EXISTS enum_status_agendamento CASCADE;
DROP TYPE IF EXISTS enum_status_caixa CASCADE;
DROP TYPE IF EXISTS enum_status_comanda CASCADE;
DROP TYPE IF EXISTS enum_forma_pagamento CASCADE;
DROP TYPE IF EXISTS enum_tipo_excecao CASCADE;

-- 3. Criar Enums
CREATE TYPE enum_status_cliente AS ENUM ('ativo', 'inativo');
CREATE TYPE enum_status_profissional AS ENUM ('ativo', 'inativo');
CREATE TYPE enum_status_agendamento AS ENUM ('agendado', 'em_atendimento', 'concluido', 'faltou', 'cancelado');
CREATE TYPE enum_status_caixa AS ENUM ('aberto', 'fechado');
CREATE TYPE enum_status_comanda AS ENUM ('aberta', 'rascunho', 'finalizada', 'cancelada');
CREATE TYPE enum_forma_pagamento AS ENUM ('dinheiro', 'pix', 'cartao_credito', 'cartao_debito');
CREATE TYPE enum_tipo_excecao AS ENUM ('folga', 'bloqueio', 'horario_especial');

-- 4. Tabela: Clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  data_nascimento DATE,
  cpf TEXT UNIQUE,
  observacoes TEXT,
  status enum_status_cliente NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tabela: Profissionais
CREATE TABLE profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  especialidade TEXT,
  email TEXT,
  telefone TEXT,
  cpf TEXT,
  data_nascimento DATE,
  comissao_percentual NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  status enum_status_profissional NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Tabela: Horários dos Profissionais
CREATE TABLE profissionais_horarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  manha_inicio TIME,
  manha_fim TIME,
  tarde_inicio TIME,
  tarde_fim TIME,
  CONSTRAINT uk_profissional_dia UNIQUE (profissional_id, dia_semana)
);

-- 7. Tabela: Exceções dos Profissionais
CREATE TABLE profissionais_excecoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  tipo enum_tipo_excecao NOT NULL DEFAULT 'folga',
  inicio TIME,
  fim TIME,
  motivo TEXT
);

-- 8. Tabela: Categorias de Serviços
CREATE TABLE categorias_servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Tabela: Serviços
CREATE TABLE servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id UUID REFERENCES categorias_servicos(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  preco_padrao NUMERIC(10,2) NOT NULL CHECK (preco_padrao >= 0),
  duracao_minutos INTEGER NOT NULL CHECK (duracao_minutos > 0),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Tabela Pivô: Profissionais <-> Serviços
CREATE TABLE profissionais_servicos (
  profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE,
  servico_id UUID REFERENCES servicos(id) ON DELETE CASCADE,
  PRIMARY KEY (profissional_id, servico_id)
);

-- 11. Tabela: Agendamentos
CREATE TABLE agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE RESTRICT,
  servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE RESTRICT,
  data DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  status enum_status_agendamento NOT NULL DEFAULT 'agendado',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Tabela: Caixas
CREATE TABLE caixas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status enum_status_caixa NOT NULL DEFAULT 'aberto',
  saldo_inicial NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  saldo_final_dinheiro NUMERIC(10,2),
  saldo_final_pix NUMERIC(10,2),
  saldo_final_cartao_credito NUMERIC(10,2),
  saldo_final_cartao_debito NUMERIC(10,2),
  total_comissoes NUMERIC(10,2),
  valor_liquido NUMERIC(10,2),
  aberto_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fechado_em TIMESTAMPTZ,
  observacoes TEXT
);

-- 13. Tabela: Comandas
CREATE TABLE comandas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_sequencial BIGSERIAL NOT NULL,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  caixa_id UUID REFERENCES caixas(id) ON DELETE SET NULL,
  status enum_status_comanda NOT NULL DEFAULT 'aberta',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
  desconto NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (desconto >= 0),
  valor_total NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (valor_total >= 0),
  cupom_codigo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finalizada_em TIMESTAMPTZ
);

-- 14. Tabela: Itens da Comanda
CREATE TABLE comanda_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comanda_id UUID NOT NULL REFERENCES comandas(id) ON DELETE CASCADE,
  servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE RESTRICT,
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE RESTRICT,
  preco_unitario NUMERIC(10,2) NOT NULL CHECK (preco_unitario >= 0),
  quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  comissao_percentual NUMERIC(5,2),
  valor_comissao NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Tabela: Pagamentos da Comanda
CREATE TABLE comanda_pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comanda_id UUID NOT NULL REFERENCES comandas(id) ON DELETE CASCADE,
  forma_pagamento enum_forma_pagamento NOT NULL,
  valor NUMERIC(10,2) NOT NULL CHECK (valor > 0),
  detalhe_conta TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Configuração de RLS (Row Level Security)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE caixas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comandas ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso livre para o MVP (acesso via anon key do Supabase no Electron)
CREATE POLICY "Acesso total clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total profissionais" ON profissionais FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total servicos" ON servicos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total agendamentos" ON agendamentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total caixas" ON caixas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total comandas" ON comandas FOR ALL USING (true) WITH CHECK (true);
```
