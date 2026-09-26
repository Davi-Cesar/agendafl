-- Migração para adicionar o valor 'removido' ao ENUM enum_status_cliente no Supabase/PostgreSQL

ALTER TYPE enum_status_cliente ADD VALUE IF NOT EXISTS 'removido';
