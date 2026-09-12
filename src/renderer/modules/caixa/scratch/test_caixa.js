const url = 'https://jwtvrbifxeaudizamunl.supabase.co/rest/v1/';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3dHZyYmlmeGVhdWRpemFtdW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODM0NzgsImV4cCI6MjEwMTg1OTQ3OH0.D1S4YxbvcXDvZ0_Pdc0kR6vkBmXvdpZ8ID3zKaW7TbA';

const headers = {
  apikey: key,
  Authorization: 'Bearer ' + key,
  'Content-Type': 'application/json',
};

async function runVerification() {
  console.log('=== INICIANDO VERIFICAÇÃO AUTOMATIZADA DO MÓDULO CAIXA (REST) ===\n');

  // 1. Checar se existe caixa aberto atualmente
  const resAbertos = await fetch(`${url}caixas?select=*&status=eq.aberto`, { headers });
  const caixasAbertos = await resAbertos.json();
  console.log('[1] Caixas com status="aberto":', Array.isArray(caixasAbertos) ? caixasAbertos.length : caixasAbertos);

  // 2. Testar unicidade de caixa aberto se houver um aberto
  if (Array.isArray(caixasAbertos) && caixasAbertos.length > 0) {
    console.log('[2] Testando bloqueio de caixa duplicado via API...');
    const resDup = await fetch(`${url}caixas`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify({ status: 'aberto', saldo_inicial: 1000, fundo_caixa_inicial: 1000 }),
    });
    const dupBody = await resDup.json();

    if (resDup.status >= 400) {
      console.log('✅ BLOQUEADO COM SUCESSO PELO BANCO (Status', resDup.status, '):', dupBody.message || dupBody.details || dupBody);
    } else {
      console.error('❌ ATENÇÃO: Segundo caixa foi aceito. Aplicar o índice único idx_caixas_unico_aberto no SQL Editor.');
    }
  }

  // 3. Testar RPC de fechamento atômico em caixa inválido (espera-se 400 ou 404/exceção)
  console.log('\n[3] Testando chamada da RPC fechar_caixa_atomico em caixa inexistente...');
  const resRpc = await fetch(`${url}rpc/fechar_caixa_atomico`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      p_caixa_id: '00000000-0000-0000-0000-000000000000',
      p_observacoes: 'Teste falha'
    })
  });
  const rpcBody = await resRpc.json();

  if (resRpc.status >= 400) {
    console.log('✅ RPC RETORNOU ERRO / EXCEÇÃO (Sem fallback): Status', resRpc.status, rpcBody.message || rpcBody);
  } else {
    console.log('Result RPC:', rpcBody);
  }

  // 4. Buscar histórico de caixas fechados
  console.log('\n[4] Consultando caixas fechados (Histórico Caixas Anteriores)...');
  const resFechados = await fetch(`${url}caixas?select=*&status=eq.fechado&order=fechado_em.desc`, { headers });
  const historico = await resFechados.json();

  console.log('Caixas fechados encontrados no banco:', Array.isArray(historico) ? historico.length : historico);
  if (Array.isArray(historico) && historico.length > 0) {
    const ultimo = historico[0];
    console.log('Último caixa fechado no histórico:', {
      id: ultimo.id,
      saldo_inicial: ultimo.saldo_inicial,
      total_dinheiro: ultimo.saldo_final_dinheiro,
      total_pix: ultimo.saldo_final_pix,
      total_cartao_credito: ultimo.saldo_final_cartao_credito,
      total_cartao_debito: ultimo.saldo_final_cartao_debito,
      total_comissoes: ultimo.total_comissoes,
      valor_liquido: ultimo.valor_liquido,
      fechado_em: ultimo.fechado_em
    });
  }

  console.log('\n=== VERIFICAÇÃO CONCLUÍDA ===');
}

runVerification().catch(console.error);
