-- SQL: Reinício da Numeração de Comandas para Produção
-- Execute este comando no SQL Editor do Supabase para que a primeira comanda de amanhã comece em #0001:

ALTER SEQUENCE IF EXISTS comandas_numero_sequencial_seq RESTART WITH 1;

-- (Opcional) Se também desejar limpar os agendamentos antigos de teste da grade:
-- DELETE FROM agendamentos;
