-- Migração para permitir cadastrar novos clientes com CPF de clientes que foram removidos (Soft Delete)
-- Substitui a constraint global por um índice Único Parcial que ignora clientes removidos (removido_em IS NOT NULL)

ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_cpf_key;
DROP INDEX IF EXISTS idx_clientes_cpf_ativo;

CREATE UNIQUE INDEX IF NOT EXISTS idx_clientes_cpf_ativo 
ON clientes (cpf) 
WHERE removido_em IS NULL AND cpf IS NOT NULL AND cpf != '';
