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
    descricao: string;
    profissional: string;
    quantidade: number;
    valorUnitario: number;
  }>;
  pagamentos?: Array<{
    forma: string;
    valor: number;
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

  // 3. Insere a comanda no Supabase
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

  // 4. Insere itens da comanda se existirem
  if (payload.itens && payload.itens.length > 0) {
    const [{ data: listaServicos }, { data: listaProfissionais }] = await Promise.all([
      supabase.from('servicos').select('id, nome').eq('ativo', true),
      supabase.from('profissionais').select('id, nome').eq('status', 'ativo'),
    ]);

    const itensParaInserir: Array<{
      comanda_id: string;
      servico_id: string;
      profissional_id: string;
      preco_unitario: number;
      quantidade: number;
      comissao_percentual: number;
      valor_comissao: number;
    }> = [];

    for (const item of payload.itens) {
      const srv = (listaServicos || []).find(
        (s) => s.nome.toLowerCase() === item.descricao.toLowerCase()
      );
      const prof = (listaProfissionais || []).find(
        (p) => p.nome.toLowerCase() === item.profissional.toLowerCase()
      );

      const servicoId = srv?.id || (listaServicos && listaServicos[0]?.id);
      const profissionalId = prof?.id || (listaProfissionais && listaProfissionais[0]?.id);

      if (servicoId && profissionalId) {
        const pctComissao = 50.0;
        const valComissao = item.valorUnitario * item.quantidade * (pctComissao / 100);

        itensParaInserir.push({
          comanda_id: comandaId,
          servico_id: servicoId,
          profissional_id: profissionalId,
          preco_unitario: item.valorUnitario,
          quantidade: item.quantidade,
          comissao_percentual: pctComissao,
          valor_comissao: valComissao,
        });
      }
    }

    if (itensParaInserir.length > 0) {
      const { error: errItens } = await supabase.from('comanda_itens').insert(itensParaInserir);
      if (errItens) {
        console.error('Erro ao salvar itens da comanda:', errItens);
      }
    }
  }

  // 5. Insere pagamentos se existirem
  if (payload.pagamentos && payload.pagamentos.length > 0) {
    const pagamentosParaInserir = payload.pagamentos.map((pg) => {
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
        comanda_id: comandaId,
        forma_pagamento: formaPg,
        valor: pg.valor,
        detalhe_conta: detalheConta,
      };
    });

    const { error: errPg } = await supabase.from('comanda_pagamentos').insert(pagamentosParaInserir);
    if (errPg) {
      console.error('Erro ao salvar pagamentos da comanda:', errPg);
    }
  }

  // 6. Atualiza o status do agendamento para 'concluido' no Supabase se houver vínculo
  if (resolvedAgendamentoId) {
    const { error: errApt } = await supabase
      .from('agendamentos')
      .update({ status: 'concluido' })
      .eq('id', resolvedAgendamentoId);

    if (errApt) {
      console.error('Erro ao atualizar agendamento para concluido:', errApt);
    }
  }

  return { comandaId, comandaNumero };
}

