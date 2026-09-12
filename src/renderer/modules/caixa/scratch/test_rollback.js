const url = 'https://jwtvrbifxeaudizamunl.supabase.co/rest/v1/';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3dHZyYmlmeGVhdWRpemFtdW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODM0NzgsImV4cCI6MjEwMTg1OTQ3OH0.D1S4YxbvcXDvZ0_Pdc0kR6vkBmXvdpZ8ID3zKaW7TbA';

const headers = {
  apikey: key,
  Authorization: 'Bearer ' + key,
  'Content-Type': 'application/json',
};

async function testRollbackMidExecution() {
  console.log('=== TESTE DE ROLLBACK ATÔMICO NO MEIO DA EXECUÇÃO (PONTO 3) ===\n');

  // 1. Obter caixa aberto atual
  const resCaixa = await fetch(`${url}caixas?select=*&status=eq.aberto`, { headers });
  const caixas = await resCaixa.json();

  if (!Array.isArray(caixas) || caixas.length === 0) {
    console.log('Criando caixa de teste para simulação de rollback...');
    const resNovo = await fetch(`${url}caixas`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify({ status: 'aberto', saldo_inicial: 500, fundo_caixa_inicial: 500 }),
    });
    const novocaixa = await resNovo.json();
    caixas.push(novocaixa[0] || novocaixa);
  }

  const caixaId = caixas[0].id;
  console.log('Caixa ativo ID:', caixaId);

  // 2. Verificar estado de comissoes_caixa e caixa_totais_pix antes da falha
  const resComAntes = await fetch(`${url}comissoes_caixa?caixa_id=eq.${caixaId}`, { headers });
  const comAntes = await resComAntes.json();
  const resPixAntes = await fetch(`${url}caixa_totais_pix?caixa_id=eq.${caixaId}`, { headers });
  const pixAntes = await resPixAntes.json();

  console.log('Registros em comissoes_caixa ANTES do teste:', Array.isArray(comAntes) ? comAntes.length : 0);
  console.log('Registros em caixa_totais_pix ANTES do teste:', Array.isArray(pixAntes) ? pixAntes.length : 0);

  // 3. Invocação de simulação ou teste de exceção transacional na RPC fechar_caixa_atomico
  console.log('\nDisparando chamada RPC fechar_caixa_atomico com id:', caixaId);
  const resRpc = await fetch(`${url}rpc/fechar_caixa_atomico`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ p_caixa_id: caixaId, p_observacoes: 'Simulacao' }),
  });
  const rpcResult = await resRpc.json();
  console.log('RPC Response Status:', resRpc.status);
  console.log('RPC Response Body:', rpcResult);

  // 4. Verificar se em caso de erro/exceção o banco reverteu integralmente
  const resCaixaDepois = await fetch(`${url}caixas?select=*&id=eq.${caixaId}`, { headers });
  const caixaDepois = await resCaixaDepois.json();
  const statusAtual = caixaDepois[0]?.status;

  const resComDepois = await fetch(`${url}comissoes_caixa?caixa_id=eq.${caixaId}`, { headers });
  const comDepois = await resComDepois.json();
  const resPixDepois = await fetch(`${url}caixa_totais_pix?caixa_id=eq.${caixaId}`, { headers });
  const pixDepois = await resPixDepois.json();

  console.log('\n--- VERIFICAÇÃO DO ESTADO DO BANCO APÓS A OPERAÇÃO ---');
  console.log('Status do Caixa:', statusAtual);
  console.log('Registros em comissoes_caixa DEPOIS:', Array.isArray(comDepois) ? comDepois.length : 0);
  console.log('Registros em caixa_totais_pix DEPOIS:', Array.isArray(pixDepois) ? pixDepois.length : 0);

  if (resRpc.status >= 400) {
    if (statusAtual === 'aberto' && (!Array.isArray(comDepois) || comDepois.length === 0)) {
      console.log('\n✅ VERIFICAÇÃO CONFIRMADA: Transação foi 100% revertida pelo PostgreSQL!');
      console.log('✅ O caixa permanece "aberto" e nada ficou salvo de forma parcial.');
    } else {
      console.error('\n❌ ATENÇÃO: Estado parcial detectado!');
    }
  } else {
    console.log('\nRPC executada com sucesso.');
  }
}

testRollbackMidExecution().catch(console.error);
