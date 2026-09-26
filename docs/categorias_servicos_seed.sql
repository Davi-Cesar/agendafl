-- Migração, RLS e Seed Data: Categorias de Serviços (RN / Seed Data)

-- 1. Garantir que a coluna categoria_id exista na tabela servicos (FK para categorias_servicos)
ALTER TABLE servicos ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES categorias_servicos(id) ON DELETE SET NULL;

-- 2. Adicionar constraint UNIQUE no nome da categoria
ALTER TABLE categorias_servicos DROP CONSTRAINT IF EXISTS uk_categorias_servicos_nome;
ALTER TABLE categorias_servicos ADD CONSTRAINT uk_categorias_servicos_nome UNIQUE (nome);

-- 3. Habilitar RLS e criar política de acesso total para a tabela categorias_servicos
ALTER TABLE categorias_servicos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total categorias_servicos" ON categorias_servicos;
CREATE POLICY "Acesso total categorias_servicos" ON categorias_servicos FOR ALL USING (true) WITH CHECK (true);

-- 4. Inserir as 8 categorias padrão caso não existam (Seed Data)
INSERT INTO categorias_servicos (nome) VALUES
  ('Manicure'),
  ('Podologia'),
  ('Maquiagem'),
  ('Cabelo'),
  ('Terapia'),
  ('Estética Facial'),
  ('Estética Corporal'),
  ('Estética Avançada')
ON CONFLICT (nome) DO NOTHING;
