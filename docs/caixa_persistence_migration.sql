-- Migration SQL: Persistência do Módulo Caixa (RN-29 a RN-36)
-- Data: 2026-09-10

-- TODO AUDITORIA DE USUÁRIOS:
-- Quando a funcionalidade de login/autenticação for implementada, adicionar as seguintes colunas para rastreamento:
-- ALTER TABLE caixas ADD COLUMN IF NOT EXISTS aberto_por UUID REFERENCES usuarios(id);
-- ALTER TABLE caixas ADD COLUMN IF NOT EXISTS fechado_por UUID REFERENCES usuarios(id);

-- 1. Coluna total_geral na tabela caixas (faturamento bruto)
ALTER TABLE caixas ADD COLUMN IF NOT EXISTS total_geral NUMERIC(10,2) DEFAULT 0.00;

-- 2. Índice único parcial na tabela caixas (RN-29 / Unicidade no Banco)
CREATE UNIQUE INDEX IF NOT EXISTS idx_caixas_unico_aberto ON caixas (status) WHERE status = 'aberto';

-- 3. Tabela comissoes_caixa (Snapshot de Comissões do Fechamento — RN-35)
CREATE TABLE IF NOT EXISTS comissoes_caixa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caixa_id UUID NOT NULL REFERENCES caixas(id) ON DELETE CASCADE,
  profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  quantidade_servicos INTEGER NOT NULL DEFAULT 0,
  total_comissao NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS para comissoes_caixa
ALTER TABLE comissoes_caixa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total comissoes_caixa" ON comissoes_caixa;
CREATE POLICY "Acesso total comissoes_caixa" ON comissoes_caixa FOR ALL USING (true) WITH CHECK (true);

-- 4. Tabela caixa_totais_pix (Snapshot por Conta PIX — RN-32)
CREATE TABLE IF NOT EXISTS caixa_totais_pix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caixa_id UUID NOT NULL REFERENCES caixas(id) ON DELETE CASCADE,
  nome_conta TEXT NOT NULL,
  total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  quantidade INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS para caixa_totais_pix
ALTER TABLE caixa_totais_pix ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total caixa_totais_pix" ON caixa_totais_pix;
CREATE POLICY "Acesso total caixa_totais_pix" ON caixa_totais_pix FOR ALL USING (true) WITH CHECK (true);

-- 5. Garantir que a coluna caixa_id exista na tabela comandas
ALTER TABLE comandas ADD COLUMN IF NOT EXISTS caixa_id UUID REFERENCES caixas(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_comandas_caixa ON comandas (caixa_id);

-- 6. RPC Atômica de Fechamento de Caixa (fechar_caixa_atomico)
CREATE OR REPLACE FUNCTION fechar_caixa_atomico(
  p_caixa_id UUID,
  p_observacoes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caixa RECORD;
  v_total_dinheiro NUMERIC(10,2) := 0.00;
  v_total_pix NUMERIC(10,2) := 0.00;
  v_total_cartao_credito NUMERIC(10,2) := 0.00;
  v_total_cartao_debito NUMERIC(10,2) := 0.00;
  v_total_comissoes NUMERIC(10,2) := 0.00;
  v_total_geral NUMERIC(10,2) := 0.00;
  v_valor_liquido NUMERIC(10,2) := 0.00;
  v_fechado_em TIMESTAMPTZ := NOW();
BEGIN
  -- 1. Bloquear o registro do caixa e verificar status
  SELECT * INTO v_caixa
  FROM caixas
  WHERE id = p_caixa_id AND status = 'aberto'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Caixa com ID % não encontrado ou já se encontra fechado.', p_caixa_id;
  END IF;

  -- 2. Calcular os totais por forma de pagamento das comandas finalizadas deste caixa
  SELECT
    COALESCE(SUM(CASE WHEN cp.forma_pagamento = 'dinheiro' THEN cp.valor ELSE 0 END), 0.00),
    COALESCE(SUM(CASE WHEN cp.forma_pagamento = 'pix' THEN cp.valor ELSE 0 END), 0.00),
    COALESCE(SUM(CASE WHEN cp.forma_pagamento = 'cartao_credito' THEN cp.valor ELSE 0 END), 0.00),
    COALESCE(SUM(CASE WHEN cp.forma_pagamento = 'cartao_debito' THEN cp.valor ELSE 0 END), 0.00)
  INTO
    v_total_dinheiro,
    v_total_pix,
    v_total_cartao_credito,
    v_total_cartao_debito
  FROM comanda_pagamentos cp
  JOIN comandas c ON c.id = cp.comanda_id
  WHERE c.caixa_id = p_caixa_id
    AND c.status = 'finalizada';

  v_total_geral := v_total_dinheiro + v_total_pix + v_total_cartao_credito + v_total_cartao_debito;

  -- 3. Inserir snapshot de contas PIX (RN-32) em caixa_totais_pix
  INSERT INTO caixa_totais_pix (caixa_id, nome_conta, total, quantidade)
  SELECT
    p_caixa_id,
    COALESCE(NULLIF(TRIM(cp.detalhe_conta), ''), 'PIX Geral') AS nome_conta,
    COALESCE(SUM(cp.valor), 0.00) AS total,
    COUNT(cp.id)::INT AS quantidade
  FROM comanda_pagamentos cp
  JOIN comandas c ON c.id = cp.comanda_id
  WHERE c.caixa_id = p_caixa_id
    AND c.status = 'finalizada'
    AND cp.forma_pagamento = 'pix'
  GROUP BY COALESCE(NULLIF(TRIM(cp.detalhe_conta), ''), 'PIX Geral');

  -- 4. Inserir snapshot de comissões (RN-35) em comissoes_caixa
  INSERT INTO comissoes_caixa (caixa_id, profissional_id, quantidade_servicos, total_comissao)
  SELECT
    p_caixa_id,
    ci.profissional_id,
    COALESCE(SUM(ci.quantidade), 0)::INT AS quantidade_servicos,
    COALESCE(SUM(ci.valor_comissao), 0.00) AS total_comissao
  FROM comanda_itens ci
  JOIN comandas c ON c.id = ci.comanda_id
  WHERE c.caixa_id = p_caixa_id
    AND c.status = 'finalizada'
  GROUP BY ci.profissional_id;

  -- Obter total de comissões geradas
  SELECT COALESCE(SUM(total_comissao), 0.00)
  INTO v_total_comissoes
  FROM comissoes_caixa
  WHERE caixa_id = p_caixa_id;

  v_valor_liquido := GREATEST(0.00, v_total_geral - v_total_comissoes);

  -- 5. Atualizar o registro do caixa para status='fechado'
  UPDATE caixas
  SET
    status = 'fechado',
    fechado_em = v_fechado_em,
    saldo_final_dinheiro = v_total_dinheiro,
    saldo_final_pix = v_total_pix,
    saldo_final_cartao_credito = v_total_cartao_credito,
    saldo_final_cartao_debito = v_total_cartao_debito,
    total_geral = v_total_geral,
    total_comissoes = v_total_comissoes,
    valor_liquido = v_valor_liquido,
    observacoes = COALESCE(p_observacoes, observacoes)
  WHERE id = p_caixa_id;

  RETURN jsonb_build_object(
    'id', p_caixa_id,
    'status', 'fechado',
    'total_dinheiro', v_total_dinheiro,
    'total_pix', v_total_pix,
    'total_cartao_credito', v_total_cartao_credito,
    'total_cartao_debito', v_total_cartao_debito,
    'total_geral', v_total_geral,
    'total_comissoes', v_total_comissoes,
    'valor_liquido', v_valor_liquido,
    'fechado_em', v_fechado_em
  );
END;
$$;
