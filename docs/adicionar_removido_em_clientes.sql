-- Migração para adicionar a coluna removido_em na tabela clientes (Soft Delete)
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS removido_em TIMESTAMPTZ DEFAULT NULL;
