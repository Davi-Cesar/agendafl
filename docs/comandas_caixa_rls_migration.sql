-- Migration SQL: Correção de Políticas RLS para comanda_itens e comanda_pagamentos
-- Garante que o Caixa e as Comissões do Dia exibam os dados de comandas e pagamentos.

-- 1. Políticas de Acesso Total (anon/authenticated) para comanda_itens
ALTER TABLE comanda_itens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total comanda_itens" ON comanda_itens;
CREATE POLICY "Acesso total comanda_itens" ON comanda_itens FOR ALL USING (true) WITH CHECK (true);

-- 2. Políticas de Acesso Total (anon/authenticated) para comanda_pagamentos
ALTER TABLE comanda_pagamentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acesso total comanda_pagamentos" ON comanda_pagamentos;
CREATE POLICY "Acesso total comanda_pagamentos" ON comanda_pagamentos FOR ALL USING (true) WITH CHECK (true);

-- 3. Vincular comandas finalizadas que ficaram sem caixa_id ao último caixa aberto
UPDATE comandas
SET caixa_id = (SELECT id FROM caixas WHERE status = 'aberto' ORDER BY aberto_em DESC LIMIT 1)
WHERE caixa_id IS NULL AND status = 'finalizada';
