-- Migration SQL: Exclusão Segura e em Cascata de Profissionais no Supabase
-- Permite remover profissionais de forma definitiva sem travar nas chaves estrangeiras de comandas e agendamentos.

-- 1. Configurar foreign keys para CASCADE na tabela comanda_itens e agendamentos
ALTER TABLE comanda_itens
  DROP CONSTRAINT IF EXISTS comanda_itens_profissional_id_fkey,
  ADD CONSTRAINT comanda_itens_profissional_id_fkey
    FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE;

ALTER TABLE agendamentos
  DROP CONSTRAINT IF EXISTS agendamentos_profissional_id_fkey,
  ADD CONSTRAINT agendamentos_profissional_id_fkey
    FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE;

-- 2. Função RPC atômica que remove todos os vínculos e o profissional
CREATE OR REPLACE FUNCTION excluir_profissional_atomico(p_profissional_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM comanda_itens WHERE profissional_id = p_profissional_id;
  DELETE FROM agendamentos WHERE profissional_id = p_profissional_id;
  DELETE FROM profissionais_servicos WHERE profissional_id = p_profissional_id;
  DELETE FROM profissionais_horarios WHERE profissional_id = p_profissional_id;
  DELETE FROM profissionais_excecoes WHERE profissional_id = p_profissional_id;
  DELETE FROM profissionais WHERE id = p_profissional_id;
END;
$$;
