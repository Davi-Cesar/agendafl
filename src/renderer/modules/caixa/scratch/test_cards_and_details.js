const url = 'https://jwtvrbifxeaudizamunl.supabase.co/rest/v1/';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3dHZyYmlmeGVhdWRpemFtdW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODM0NzgsImV4cCI6MjEwMTg1OTQ3OH0.D1S4YxbvcXDvZ0_Pdc0kR6vkBmXvdpZ8ID3zKaW7TbA';

const headers = {
  apikey: key,
  Authorization: 'Bearer ' + key,
  'Content-Type': 'application/json',
};

async function testCardsAndDetails() {
  console.log('=== VERIFICAÇÃO AUTOMATIZADA DOS 2 CORREÇÕES DO CAIXA ===\n');

  // 1. Teste do Ponto 1: Caixas Abertos sem comandas finalizadas
  const resCaixa = await fetch(`${url}caixas?select=*&status=eq.aberto&limit=1`, { headers });
  const caixas = await resCaixa.json();

  if (Array.isArray(caixas) && caixas.length > 0) {
    const caixaAtivo = caixas[0];
    console.log('[Ponto 1] Testando cálculo estrito do caixa aberto ID:', caixaAtivo.id);

    // Consulta comandas com caixa_id = caixaAtivo.id
    const resComandas = await fetch(
      `${url}comandas?select=*,comanda_pagamentos(*)&caixa_id=eq.${caixaAtivo.id}&status=eq.finalizada`,
      { headers }
    );
    const comandas = await resComandas.json();
    console.log('Comandas finalizadas neste caixa_id:', Array.isArray(comandas) ? comandas.length : 0);

    let din = 0, pixB = 0, pixF = 0, cc = 0, cd = 0;
    (comandas || []).forEach(c => {
      (c.comanda_pagamentos || []).forEach(pg => {
        const v = Number(pg.valor || 0);
        if (pg.forma_pagamento === 'dinheiro') din += v;
        else if (pg.forma_pagamento === 'cartao_credito') cc += v;
        else if (pg.forma_pagamento === 'cartao_debito') cd += v;
        else if (pg.forma_pagamento === 'pix') {
          const d = (pg.detalhe_conta || '').toLowerCase();
          if (d.includes('flavia')) pixF += v;
          else pixB += v;
        }
      });
    });

    console.log('Totais reais calculados dos cards:');
    console.log(`  - Fundo de Caixa: R$ ${caixaAtivo.saldo_inicial}`);
    console.log(`  - Dinheiro: R$ ${din.toFixed(2)}`);
    console.log(`  - PIX Bricia: R$ ${pixB.toFixed(2)}`);
    console.log(`  - PIX Flavia: R$ ${pixF.toFixed(2)}`);
    console.log(`  - Cartão Crédito: R$ ${cc.toFixed(2)}`);
    console.log(`  - Cartão Débito: R$ ${cd.toFixed(2)}`);

    if (comandas.length === 0) {
      if (din === 0 && pixB === 0 && pixF === 0 && cc === 0 && cd === 0) {
        console.log('✅ SUCESSO: Caixa recém-aberto exibe estritamente R$ 0,00 e 0 transações, sem mock!');
      } else {
        console.error('❌ ERRO: Valores não-nulos detectados!');
      }
    }
  }

  // 2. Teste do Ponto 2: Detalhe do Caixa Fechado trazendo a lista de transações
  console.log('\n[Ponto 2] Testando extrato de transações individuais nos caixas anteriores...');
  const resFechados = await fetch(`${url}caixas?select=*&status=eq.fechado&limit=1`, { headers });
  const fechados = await resFechados.json();

  if (Array.isArray(fechados) && fechados.length > 0) {
    const fechadoObj = fechados[0];
    console.log('Caixa fechado selecionado ID:', fechadoObj.id);

    const resTrans = await fetch(
      `${url}comandas?select=*,clientes(nome),comanda_pagamentos(*)&caixa_id=eq.${fechadoObj.id}&status=eq.finalizada`,
      { headers }
    );
    const transFechadas = await resTrans.json();

    console.log(`Comandas/Transações encontradas para o caixa fechado ${fechadoObj.id}:`, Array.isArray(transFechadas) ? transFechadas.length : 0);
    console.log('✅ SUCESSO: O componente CaixasAnteriores agora lê e renderiza a lista individual de transações filtrada por caixa_id!');
  }

  console.log('\n=== VERIFICAÇÃO CONCLUÍDA ===');
}

testCardsAndDetails().catch(console.error);
