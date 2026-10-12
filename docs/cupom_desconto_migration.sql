-- Migration SQL: Cupons e Descontos por Item (RN-Cupom & Desconto Manual)
-- Data: 2026-10-02

-- 1. Coluna de auditoria para controle de uso anual do cupom de aniversário na tabela clientes
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS cupom_aniversario_usado_em TIMESTAMPTZ DEFAULT NULL;

-- 2. Colunas de desconto por item na tabela comanda_itens
ALTER TABLE comanda_itens 
ADD COLUMN IF NOT EXISTS desconto_tipo TEXT 
  CHECK (desconto_tipo IS NULL OR desconto_tipo IN ('percentual', 'valor_fixo')),
ADD COLUMN IF NOT EXISTS desconto_valor NUMERIC(10,2) 
  CHECK (desconto_valor IS NULL OR desconto_valor >= 0),
ADD COLUMN IF NOT EXISTS desconto_origem TEXT 
  CHECK (desconto_origem IS NULL OR desconto_origem IN ('aniversario', 'manual'));

COMMENT ON COLUMN clientes.cupom_aniversario_usado_em IS 'Data/hora do último encerramento de comanda com cupom de aniversário (uso anual)';
COMMENT ON COLUMN comanda_itens.desconto_tipo IS 'Tipo do desconto: percentual (%) ou valor_fixo (R$)';
COMMENT ON COLUMN comanda_itens.desconto_valor IS 'Valor nominal do desconto aplicado';
COMMENT ON COLUMN comanda_itens.desconto_origem IS 'Origem do desconto: aniversario (automático 10%) ou manual (avulso)';

-- 3. Função RPC Atômica para Finalização de Comanda com Validação de Cupom
CREATE OR REPLACE FUNCTION finalizar_comanda_atomica(
  p_payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cliente_id UUID;
  v_cliente RECORD;
  v_comanda_id UUID;
  v_numero_seq INT;
  v_comanda_numero TEXT;
  v_possui_cupom_aniversario BOOLEAN := FALSE;
  v_qtd_cupom_aniversario INT := 0;
  v_ano_atual INT := EXTRACT(YEAR FROM NOW() AT TIME ZONE 'America/Recife')::INT;
  v_mes_atual INT := EXTRACT(MONTH FROM NOW() AT TIME ZONE 'America/Recife')::INT;
  v_item JSONB;
  v_pg JSONB;
  v_subtotal NUMERIC(10,2);
  v_desconto_total NUMERIC(10,2);
  v_valor_total NUMERIC(10,2);
  v_item_valor_bruto NUMERIC(10,2);
  v_item_desconto_valor NUMERIC(10,2);
  v_item_valor_liquido NUMERIC(10,2);
  v_desc_tipo TEXT;
  v_desc_origem TEXT;
  v_desc_val NUMERIC(10,2);
  v_pct_comissao NUMERIC(5,2);
  v_val_comissao NUMERIC(10,2);
BEGIN
  v_cliente_id := (p_payload->>'cliente_id')::UUID;
  v_subtotal := COALESCE((p_payload->>'subtotal')::NUMERIC, 0.00);
  v_desconto_total := COALESCE((p_payload->>'desconto')::NUMERIC, 0.00);
  v_valor_total := COALESCE((p_payload->>'valor_total')::NUMERIC, 0.00);

  -- 1. Bloqueia o registro do cliente (FOR UPDATE) para prevenir concorrência no cupom de aniversário
  SELECT * INTO v_cliente
  FROM clientes
  WHERE id = v_cliente_id AND (removido_em IS NULL)
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cliente com ID % não encontrado ou inativo.', v_cliente_id;
  END IF;

  -- 2. Inspeção dos itens da comanda
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_payload->'itens')
  LOOP
    v_desc_origem := v_item->>'desconto_origem';
    IF v_desc_origem = 'aniversario' THEN
      v_qtd_cupom_aniversario := v_qtd_cupom_aniversario + 1;
      v_possui_cupom_aniversario := TRUE;
    END IF;
  END LOOP;

  -- Regra: No máximo UM item com cupom de aniversário por comanda
  IF v_qtd_cupom_aniversario > 1 THEN
    RAISE EXCEPTION 'O cupom de aniversário só pode ser aplicado em um único serviço por comanda.';
  END IF;

  -- Validação atômica de elegibilidade do cupom de aniversário
  IF v_possui_cupom_aniversario THEN
    -- a) Cliente deve ter data de nascimento cadastrada
    IF v_cliente.data_nascimento IS NULL OR TRIM(v_cliente.data_nascimento::TEXT) = '' THEN
      RAISE EXCEPTION 'Cliente não possui data de nascimento cadastrada para utilizar o cupom de aniversário.';
    END IF;

    -- b) Mês atual deve ser o mês de nascimento do cliente
    IF EXTRACT(MONTH FROM v_cliente.data_nascimento::DATE) != v_mes_atual THEN
      RAISE EXCEPTION 'Cliente não é aniversariante do mês atual.';
    END IF;

    -- c) Uso único por ANO
    IF v_cliente.cupom_aniversario_usado_em IS NOT NULL AND 
       EXTRACT(YEAR FROM v_cliente.cupom_aniversario_usado_em AT TIME ZONE 'America/Recife')::INT = v_ano_atual THEN
      RAISE EXCEPTION 'O cupom de aniversário deste cliente já foi utilizado no ano de %.', v_ano_atual;
    END IF;
  END IF;

  -- 3. Inserção do cabeçalho da Comanda
  INSERT INTO comandas (
    cliente_id,
    agendamento_id,
    caixa_id,
    status,
    subtotal,
    desconto,
    valor_total,
    finalizada_em
  ) VALUES (
    v_cliente_id,
    NULLIF(p_payload->>'agendamento_id', '')::UUID,
    NULLIF(p_payload->>'caixa_id', '')::UUID,
    'finalizada',
    v_subtotal,
    v_desconto_total,
    v_valor_total,
    NOW()
  )
  RETURNING id, numero_sequencial INTO v_comanda_id, v_numero_seq;

  v_comanda_numero := '#' || LPAD(v_numero_seq::TEXT, 4, '0');

  -- 4. Inserção dos Itens da Comanda com Desconto e Comissão sobre Valor Líquido (Opção B)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_payload->'itens')
  LOOP
    v_desc_tipo := v_item->>'desconto_tipo';
    v_desc_origem := v_item->>'desconto_origem';
    v_desc_val := NULLIF(v_item->>'desconto_valor', '')::NUMERIC;
    v_pct_comissao := COALESCE((v_item->>'comissao_percentual')::NUMERIC, 50.0);
    
    v_item_valor_bruto := (v_item->>'valor_unitario')::NUMERIC * (v_item->>'quantidade')::INT;
    
    -- Calcula o desconto efetivo do item
    IF v_desc_tipo = 'percentual' AND v_desc_val IS NOT NULL THEN
      v_item_desconto_valor := v_item_valor_bruto * (LEAST(100.0, v_desc_val) / 100.0);
    ELSIF v_desc_tipo = 'valor_fixo' AND v_desc_val IS NOT NULL THEN
      v_item_desconto_valor := LEAST(v_item_valor_bruto, v_desc_val);
    ELSE
      v_item_desconto_valor := 0.00;
    END IF;

    -- Valor Líquido (travado no mínimo em 0.00)
    v_item_valor_liquido := GREATEST(0.00, v_item_valor_bruto - v_item_desconto_valor);

    -- Opção B: Comissão calculada sobre o valor líquido
    v_val_comissao := v_item_valor_liquido * (v_pct_comissao / 100.0);

    INSERT INTO comanda_itens (
      comanda_id,
      servico_id,
      profissional_id,
      preco_unitario,
      quantidade,
      comissao_percentual,
      valor_comissao,
      desconto_tipo,
      desconto_valor,
      desconto_origem
    ) VALUES (
      v_comanda_id,
      (v_item->>'servico_id')::UUID,
      (v_item->>'profissional_id')::UUID,
      (v_item->>'valor_unitario')::NUMERIC,
      (v_item->>'quantidade')::INT,
      v_pct_comissao,
      v_val_comissao,
      v_desc_tipo,
      v_desc_val,
      v_desc_origem
    );
  END LOOP;

  -- 5. Inserção dos Pagamentos
  FOR v_pg IN SELECT * FROM jsonb_array_elements(p_payload->'pagamentos')
  LOOP
    INSERT INTO comanda_pagamentos (
      comanda_id,
      forma_pagamento,
      valor,
      detalhe_conta
    ) VALUES (
      v_comanda_id,
      (v_pg->>'forma_pagamento')::enum_forma_pagamento,
      (v_pg->>'valor')::NUMERIC,
      NULLIF(v_pg->>'detalhe_conta', '')
    );
  END LOOP;

  -- 6. Se utilizou cupom de aniversário, marca a auditoria no cliente
  IF v_possui_cupom_aniversario THEN
    UPDATE clientes
    SET cupom_aniversario_usado_em = NOW(),
        updated_at = NOW()
    WHERE id = v_cliente_id;
  END IF;

  -- 7. Se houver agendamento associado, marca como concluído
  IF NULLIF(p_payload->>'agendamento_id', '') IS NOT NULL THEN
    UPDATE agendamentos
    SET status = 'concluido',
        updated_at = NOW()
    WHERE id = (p_payload->>'agendamento_id')::UUID;
  END IF;

  RETURN jsonb_build_object(
    'sucesso', true,
    'comanda_id', v_comanda_id,
    'comanda_numero', v_comanda_numero
  );
END;
$$;
