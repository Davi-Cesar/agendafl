-- Migração SQL: Soft Delete via removido_em e RPC Atômica de Remoção de Cliente

-- 1. Adicionar coluna removido_em na tabela clientes se não existir
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS removido_em TIMESTAMPTZ DEFAULT NULL;

-- 2. Atualizar índice de unicidade do CPF para ignorar clientes removidos (removido_em IS NOT NULL)
ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_cpf_key;
DROP INDEX IF EXISTS idx_clientes_cpf_ativo;

CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_cpf_ativo 
ON clientes (cpf) 
WHERE removido_em IS NULL AND cpf IS NOT NULL AND cpf != '';

-- 3. Função RPC Atômica de Remoção de Cliente (remover_cliente_atomico)
CREATE OR REPLACE FUNCTION remover_cliente_atomico(
  p_cliente_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cliente RECORD;
  v_agendamentos_deletados INTEGER := 0;
  v_hoje_str TEXT := TO_CHAR(NOW() AT TIME ZONE 'America/Recife', 'YYYY-MM-DD');
  v_hora_str TEXT := TO_CHAR(NOW() AT TIME ZONE 'America/Recife', 'HH24:MI');
BEGIN
  -- 1. Verificar e bloquear o registro do cliente
  SELECT * INTO v_cliente
  FROM clientes
  WHERE id = p_cliente_id AND removido_em IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cliente com ID % não encontrado ou já foi removido.', p_cliente_id;
  END IF;

  -- 2. Registrar o timestamp de remoção (mantendo o status inalterado)
  UPDATE clientes
  SET removido_em = NOW(),
      updated_at = NOW()
  WHERE id = p_cliente_id;

  -- 3. Excluir agendamentos futuros não realizados (hard delete apenas do futuro)
  DELETE FROM agendamentos
  WHERE cliente_id = p_cliente_id
    AND status IN ('agendado', 'em_atendimento')
    AND (data > v_hoje_str OR (data = v_hoje_str AND horario_inicio >= v_hora_str));

  GET DIAGNOSTICS v_agendamentos_deletados = ROW_COUNT;

  RETURN jsonb_build_object(
    'sucesso', true,
    'cliente_id', p_cliente_id,
    'agendamentos_cancelados', v_agendamentos_deletados
  );
END;
$$;
