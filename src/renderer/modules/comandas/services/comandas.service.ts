import { supabase } from '@shared/supabase/client';
import type { ComandaListItem } from '../schemas/comanda.schema';

export async function buscarComandas(): Promise<ComandaListItem[]> {
  const { data, error } = await supabase
    .from('comandas')
    .select(`
      id,
      numero_sequencial,
      status,
      subtotal,
      desconto,
      valor_total,
      created_at,
      finalizada_em,
      clientes (nome),
      agendamentos (
        id,
        horario_inicio,
        horario_fim,
        profissionais (nome),
        servicos (nome)
      ),
      comanda_itens (
        id,
        preco_unitario,
        quantidade,
        profissionais (nome),
        servicos (nome)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar comandas do Supabase:', error);
    return [];
  }

  return (data ?? []).map((c: any) => {
    const apt = Array.isArray(c.agendamentos) ? c.agendamentos[0] : c.agendamentos;
    const emItens = Array.isArray(c.comanda_itens) && c.comanda_itens.length > 0 ? c.comanda_itens[0] : null;

    const clienteNome = c.clientes?.nome || 'Cliente';
    const servicoNome = apt?.servicos?.nome || emItens?.servicos?.nome || 'Atendimento';
    const profissionalNome = apt?.profissionais?.nome || emItens?.profissionais?.nome || 'Profissional';
    const hInicio = (apt?.horario_inicio || '08:00').slice(0, 5);
    const hFim = (apt?.horario_fim || '09:00').slice(0, 5);

    const numFormatado = String(c.numero_sequencial || 1).padStart(4, '0');

    return {
      agendamentoId: apt?.id || '',
      clienteNome,
      comandaId: c.id,
      comandaNumero: `#${numFormatado}`,
      comandaStatus: c.status === 'aberta' ? 'rascunho' : c.status,
      horarioInicio: hInicio,
      horarioFim: hFim,
      valor: Number(c.valor_total || 0),
      profissionalNome,
      servico: servicoNome,
    };
  });
}

export async function buscarComandasFinalizadas(): Promise<ComandaListItem[]> {
  const todas = await buscarComandas();
  return todas.filter((c) => c.comandaStatus === 'finalizada');
}

export interface SalvarComandaPayload {
  agendamentoId?: string;
  clienteId?: string;
  clienteNome?: string;
  subtotal: number;
  desconto: number;
  valorTotal: number;
  itens?: Array<{
    id?: string;
    servicoId?: string;
    profissionalId?: string;
    descricao: string;
    profissional: string;
    quantidade: number;
    valorUnitario: number;
    desconto?: {
      tipo: 'percentual' | 'valor_fixo';
      valor: number;
      origem: 'aniversario' | 'manual';
    } | null;
  }>;
  pagamentos?: Array<{
    forma: string;
    valor: number;
    detalheConta?: string;
  }>;
}

export async function finalizarComandaNoSupabase(
  payload: SalvarComandaPayload
): Promise<{ comandaId: string; comandaNumero: string }> {
  // 1. Resolve cliente_id
  let resolvedClienteId = payload.clienteId;
  const isClienteUuid = resolvedClienteId && /^[0-9a-fA-F-]{36}$/.test(resolvedClienteId);

  if (!isClienteUuid) {
    const nomeBusca = payload.clienteNome || 'Cliente';
    const { data: clienteExist } = await supabase
      .from('clientes')
      .select('id')
      .ilike('nome', nomeBusca)
      .maybeSingle();

    if (clienteExist) {
      resolvedClienteId = clienteExist.id;
    } else {
      const { data: novoCliente, error: errCli } = await supabase
        .from('clientes')
        .insert({ nome: nomeBusca, telefone: '(11) 90000-0000' })
        .select()
        .single();
      if (errCli || !novoCliente) {
        console.error('Erro ao criar cliente para comanda:', errCli);
        throw new Error('Erro ao registrar cliente para a comanda');
      }
      resolvedClienteId = novoCliente.id;
    }
  }

  // 2. Resolve agendamento_id se for UUID válido
  const isAgendamentoUuid = payload.agendamentoId && /^[0-9a-fA-F-]{36}$/.test(payload.agendamentoId);
  const resolvedAgendamentoId = isAgendamentoUuid ? payload.agendamentoId : null;

  // 2.5 Busca o caixa ativo (se houver) para vincular à comanda
  const { data: caixaAtivo } = await supabase
    .from('caixas')
    .select('id')
    .eq('status', 'aberto')
    .order('aberto_em', { ascending: false })
    .maybeSingle();

  // 3. Resolve servicos e profissionais para os itens
  const [{ data: listaServicos }, { data: listaProfissionais }] = await Promise.all([
    supabase.from('servicos').select('id, nome').eq('ativo', true),
    supabase.from('profissionais').select('id, nome').eq('status', 'ativo'),
  ]);

  const itensResolvidos = (payload.itens || []).map((item) => {
    const srv = (listaServicos || []).find(
      (s) => s.nome.toLowerCase() === item.descricao.toLowerCase()
    );
    const prof = (listaProfissionais || []).find(
      (p) => p.nome.toLowerCase() === item.profissional.toLowerCase()
    );

    const servicoId = item.servicoId || srv?.id || (listaServicos && listaServicos[0]?.id) || '00000000-0000-0000-0000-000000000000';
    const profissionalId = item.profissionalId || prof?.id || (listaProfissionais && listaProfissionais[0]?.id) || '00000000-0000-0000-0000-000000000000';

    return {
      servico_id: servicoId,
      profissional_id: profissionalId,
      valor_unitario: item.valorUnitario,
      quantidade: item.quantidade,
      comissao_percentual: 60.0,
      desconto_tipo: item.desconto?.tipo || null,
      desconto_valor: item.desconto?.valor || null,
      desconto_origem: item.desconto?.origem || null,
    };
  });

  const pagamentosResolvidos = (payload.pagamentos || []).map((pg) => {
    let formaPg: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' = 'pix';
    let detalheConta: string | undefined = undefined;

    switch (pg.forma) {
      case 'pix_bricia':
        formaPg = 'pix';
        detalheConta = 'PIX Bricia';
        break;
      case 'pix_flavia':
        formaPg = 'pix';
        detalheConta = 'PIX Flavia';
        break;
      case 'credito':
        formaPg = 'cartao_credito';
        break;
      case 'debito':
        formaPg = 'cartao_debito';
        break;
      case 'dinheiro':
        formaPg = 'dinheiro';
        break;
      default:
        formaPg = 'pix';
    }

    return {
      forma_pagamento: formaPg,
      valor: pg.valor,
      detalhe_conta: detalheConta || null,
    };
  });

  // 4. Executa a finalização atômica via RPC no Supabase
  const rpcPayload = {
    cliente_id: resolvedClienteId,
    agendamento_id: resolvedAgendamentoId,
    caixa_id: caixaAtivo?.id || null,
    subtotal: payload.subtotal,
    desconto: payload.desconto,
    valor_total: payload.valorTotal,
    itens: itensResolvidos,
    pagamentos: pagamentosResolvidos,
  };

  const { data: rpcData, error: rpcError } = await supabase.rpc('finalizar_comanda_atomica', {
    p_payload: rpcPayload,
  });

  if (!rpcError && rpcData?.sucesso) {
    return {
      comandaId: rpcData.comanda_id,
      comandaNumero: rpcData.comanda_numero,
    };
  }

  // Se o erro for de regra de negócio (ex: cupom já utilizado, não é aniversariante), relança o erro
  if (rpcError && !rpcError.message.includes('does not exist') && rpcError.code !== '42883') {
    console.error('Erro na RPC finalizar_comanda_atomica:', rpcError);
    throw new Error(rpcError.message);
  }

  // 5. Fallback para inserção direta caso a migration da RPC ainda não tenha sido rodada no banco
  console.warn('RPC finalizar_comanda_atomica não encontrada no banco. Aplicando persistência direta com fallback:', rpcError?.message);

  const { data: novaComanda, error: errComanda } = await supabase
    .from('comandas')
    .insert({
      cliente_id: resolvedClienteId,
      agendamento_id: resolvedAgendamentoId,
      caixa_id: caixaAtivo?.id || null,
      status: 'finalizada',
      subtotal: payload.subtotal,
      desconto: payload.desconto,
      valor_total: payload.valorTotal,
      finalizada_em: new Date().toISOString(),
    })
    .select('id, numero_sequencial')
    .single();

  if (errComanda || !novaComanda) {
    console.error('Erro ao salvar comanda no Supabase:', errComanda);
    throw new Error(`Erro ao salvar comanda no Supabase: ${errComanda?.message}`);
  }

  const comandaId = novaComanda.id;
  const numFormatado = String(novaComanda.numero_sequencial || 1).padStart(4, '0');
  const comandaNumero = `#${numFormatado}`;

  if (itensResolvidos.length > 0) {
    const itensParaInserir = itensResolvidos.map((it) => {
      const valBruto = it.valor_unitario * it.quantidade;
      let descVal = 0;
      if (it.desconto_tipo === 'percentual' && it.desconto_valor) {
        descVal = valBruto * (it.desconto_valor / 100);
      } else if (it.desconto_tipo === 'valor_fixo' && it.desconto_valor) {
        descVal = Math.min(valBruto, it.desconto_valor);
      }
      const valLiquido = Math.max(0, valBruto - descVal);
      // Opção B: comissão calculada sobre o valor líquido
      const valComissao = valLiquido * (it.comissao_percentual / 100);

      return {
        comanda_id: comandaId,
        servico_id: it.servico_id,
        profissional_id: it.profissional_id,
        preco_unitario: it.valor_unitario,
        quantidade: it.quantidade,
        comissao_percentual: it.comissao_percentual,
        valor_comissao: valComissao,
        desconto_tipo: it.desconto_tipo,
        desconto_valor: it.desconto_valor,
        desconto_origem: it.desconto_origem,
      };
    });

    let { error: errItens } = await supabase.from('comanda_itens').insert(itensParaInserir);
    if (errItens && (errItens.message?.includes('desconto_tipo') || errItens.code === '42703')) {
      console.warn('Colunas de desconto ausentes na tabela comanda_itens no Supabase. Inserindo itens no formato legado (sem colunas de desconto)...');
      const itensLegado = itensParaInserir.map(({ desconto_tipo, desconto_valor, desconto_origem, ...resto }) => resto);
      const resRetry = await supabase.from('comanda_itens').insert(itensLegado);
      errItens = resRetry.error;
    }

    if (errItens) {
      console.error('Erro ao salvar itens da comanda:', errItens);
    }
  }

  if (pagamentosResolvidos.length > 0) {
    const pagamentosParaInserir = pagamentosResolvidos.map((pg) => ({
      comanda_id: comandaId,
      forma_pagamento: pg.forma_pagamento,
      valor: pg.valor,
      detalhe_conta: pg.detalhe_conta,
    }));

    const { error: errPg } = await supabase.from('comanda_pagamentos').insert(pagamentosParaInserir);
    if (errPg) {
      console.error('Erro ao salvar pagamentos da comanda:', errPg);
    }
  }

  // Se algum item usou cupom de aniversário, marca a data de uso no cliente
  const usouAniversario = itensResolvidos.some((i) => i.desconto_origem === 'aniversario');
  if (usouAniversario && resolvedClienteId) {
    try {
      await supabase
        .from('clientes')
        .update({ cupom_aniversario_usado_em: new Date().toISOString() })
        .eq('id', resolvedClienteId);
    } catch (e) {
      console.warn('Não foi possível gravar cupom_aniversario_usado_em (coluna pode não existir ainda):', e);
    }
  }

  if (resolvedAgendamentoId) {
    await supabase
      .from('agendamentos')
      .update({ status: 'concluido' })
      .eq('id', resolvedAgendamentoId);
  }

  return { comandaId, comandaNumero };
}

