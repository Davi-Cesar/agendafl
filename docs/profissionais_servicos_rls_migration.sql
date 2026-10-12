-- Migration SQL: Liberação de RLS para profissionais_servicos e profissionais_horarios
-- Data: 2026-10-12
-- Objetivo: Permitir que o sistema cadastre e gerencie a grade horária e os serviços de cada profissional.

-- 1. Políticas de Acesso Total para profissionais_servicos
ALTER TABLE profissionais_servicos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total profissionais_servicos" ON profissionais_servicos;
CREATE POLICY "Acesso total profissionais_servicos" ON profissionais_servicos FOR ALL USING (true) WITH CHECK (true);

-- 2. Políticas de Acesso Total para profissionais_horarios
ALTER TABLE profissionais_horarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total profissionais_horarios" ON profissionais_horarios;
CREATE POLICY "Acesso total profissionais_horarios" ON profissionais_horarios FOR ALL USING (true) WITH CHECK (true);

-- 3. Políticas de Acesso Total para profissionais_excecoes (garantia adicional para bloqueios e atendimentos extras)
ALTER TABLE profissionais_excecoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total profissionais_excecoes" ON profissionais_excecoes;
CREATE POLICY "Acesso total profissionais_excecoes" ON profissionais_excecoes FOR ALL USING (true) WITH CHECK (true);
