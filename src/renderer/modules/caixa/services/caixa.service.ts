import { supabase } from '@shared/supabase/client';
import type {
  Caixa,
  TransacaoCaixa,
  ComissaoProfissional,
  CaixaTotalPix,
  RelatorioDetalhadoItem,
} from '../schemas/caixa.schema';
import type { TotaisMeiosPagamento, DetalhesCaixaFechado } from '../types/caixa.types';

export async function buscarCaixaAtivo(): Promise<Caixa | null> {
  const { data, error } = await supabase
    .from('caixas')
    .select('*')
    .eq('status', 'aberto')
    .order('aberto_em', { ascending: false })
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar caixa ativo do Supabase:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    status: data.status,
    saldoInicial: Number(data.saldo_inicial ?? data.fundo_caixa_inicial ?? 0),
    saldoFinalDinheiro: data.saldo_final_dinheiro != null ? Number(data.saldo_final_dinheiro) : undefined,
    saldoFinalPix: data.saldo_final_pix != null ? Number(data.saldo_final_pix) : undefined,
    saldoFinalCartaoCredito: data.saldo_final_cartao_credito != null ? Number(data.saldo_final_cartao_credito) : undefined,
    saldoFinalCartaoDebito: data.saldo_final_cartao_debito != null ? Number(data.saldo_final_cartao_debito) : undefined,
    totalComissoes: data.total_comissoes != null ? Number(data.total_comissoes) : undefined,
    valorLiquido: data.valor_liquido != null ? Number(data.valor_liquido) : undefined,
    totalGeral: data.total_geral != null ? Number(data.total_geral) : undefined,
    abertoEm: data.aberto_em,
    fechadoEm: data.fechado_em || undefined,
    observacoes: data.observacoes || undefined,
  };
}

export async function abrirCaixaNoSupabase(saldoInicial: number): Promise<Caixa> {
  // 1. Checagem prévia no client
  const caixaExistente = await buscarCaixaAtivo();
  if (caixaExistente) {
    throw new Error('Já existe um caixa aberto no momento. Não é possível abrir mais de um caixa simultaneamente.');
  }

  const agora = new Date().toISOString();
  const payload = {
    status: 'aberto',
    saldo_inicial: saldoInicial,
    aberto_em: agora,
  };

  const { data, error } = await supabase
    .from('caixas')
    .insert(payload)
    .select()
    .single();

  if (error || !data) {
    console.error('Erro ao abrir caixa no Supabase:', error);
    if (error?.code === '23505') {
      throw new Error('Já existe um caixa aberto registrado no sistema.');
    }
    throw new Error(`Erro ao abrir caixa: ${error?.message || 'Falha ao registrar abertura'}`);
  }

  return {
    id: data.id,
    status: data.status,
    saldoInicial: Number(data.saldo_inicial ?? data.fundo_caixa_inicial ?? 0),
    abertoEm: data.aberto_em,
  };
}

export async function fecharCaixaNoSupabase(
  caixaId: string,
  observacoes?: string
): Promise<void> {
  // Chamada estritamente atômica da RPC fechar_caixa_atomico
  // SEM fallback de atualizações manuais no client
  const { data, error } = await supabase.rpc('fechar_caixa_atomico', {
    p_caixa_id: caixaId,
    p_observacoes: observacoes || null,
  });

  if (error) {
    console.error('Erro ao executar RPC fechar_caixa_atomico:', error);
    throw new Error(`Erro ao fechar caixa no banco de dados: ${error.message}`);
  }

  if (!data) {
    throw new Error('Retorno inválido ao fechar o caixa no banco de dados.');
  }
}

export async function buscarDadosDoCaixa(
  caixaId: string,
  caixaObj: Caixa
): Promise<{
  transacoes: TransacaoCaixa[];
  comissoes: ComissaoProfissional[];
  totais: TotaisMeiosPagamento;
  totaisPix: CaixaTotalPix[];
}> {
  // 1. Auto-associa comandas finalizadas recentes sem caixa_id (criadas hoje)
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    await supabase
      .from('comandas')
      .update({ caixa_id: caixaId })
      .is('caixa_id', null)
      .eq('status', 'finalizada')
      .gte('finalizada_em', hoje.toISOString());
  } catch (errAuto) {
    console.warn('Tentativa de associar comandas órfãs ao caixa:', errAuto);
  }

  // 2. Busca comandas finalizadas vinculadas a ESTE caixa_id
  const { data: comandas, error: errComandas } = await supabase
    .from('comandas')
    .select(`
      id,
      numero_sequencial,
      valor_total,
      created_at,
      finalizada_em,
      clientes (nome),
      agendamentos (
        horario_inicio,
        servicos (nome),
        profissionais (id, nome)
      ),
      comanda_itens (
        id,
        preco_unitario,
        quantidade,
        valor_comissao,
        profissional_id,
        profissionais (id, nome),
        servicos (nome)
      ),
      comanda_pagamentos (
        id,
        forma_pagamento,
        valor,
        detalhe_conta
      )
    `)
    .eq('caixa_id', caixaId)
    .eq('status', 'finalizada')
    .order('finalizada_em', { ascending: false });

  if (errComandas) {
    console.error('Erro ao buscar comandas do caixa:', errComandas);
  }

  const listComandas = comandas || [];

  let dinheiroTotal = 0;
  let pixBriciaTotal = 0;
  let pixBriciaQtd = 0;
  let pixFlaviaTotal = 0;
  let pixFlaviaQtd = 0;
  let cartaoCreditoTotal = 0;
  let cartaoDebitoTotal = 0;

  const transacoes: TransacaoCaixa[] = [];
  const mapComissoes = new Map<string, { nome: string; quantidade: number; total: number }>();
  const mapPixAccounts = new Map<string, { total: number; quantidade: number }>();

  listComandas.forEach((c: any) => {
    const clienteNome = c.clientes?.nome || 'Cliente';
    const apt = Array.isArray(c.agendamentos) ? c.agendamentos[0] : c.agendamentos;
    const primeiroItem = Array.isArray(c.comanda_itens) && c.comanda_itens.length > 0 ? c.comanda_itens[0] : null;
    const servicoNome = apt?.servicos?.nome || primeiroItem?.servicos?.nome || 'Atendimento';
    const profNomePadrao = primeiroItem?.profissionais?.nome || apt?.profissionais?.nome || 'Profissional';

    const rawHorario = c.finalizada_em || c.created_at || new Date().toISOString();
    const dataObj = new Date(rawHorario);
    const horarioFormatado = isNaN(dataObj.getTime())
      ? '12:00'
      : dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Processa pagamentos
    const pagamentos = Array.isArray(c.comanda_pagamentos) ? c.comanda_pagamentos : [];
    pagamentos.forEach((pg: any) => {
      const val = Number(pg.valor || 0);
      const forma = pg.forma_pagamento;
      const detalheRaw = pg.detalhe_conta || '';
      const detalhe = detalheRaw.toLowerCase();

      let metodoStr = 'OUTRO';

      if (forma === 'dinheiro') {
        dinheiroTotal += val;
        metodoStr = 'DINHEIRO';
      } else if (forma === 'cartao_credito') {
        cartaoCreditoTotal += val;
        metodoStr = 'CARTÃO CRÉDITO';
      } else if (forma === 'cartao_debito') {
        cartaoDebitoTotal += val;
        metodoStr = 'CARTÃO DÉBITO';
      } else if (forma === 'pix') {
        const nomeContaPix = detalheRaw.trim() || 'PIX Geral';
        const existPix = mapPixAccounts.get(nomeContaPix) || { total: 0, quantidade: 0 };
        existPix.total += val;
        existPix.quantidade += 1;
        mapPixAccounts.set(nomeContaPix, existPix);

        if (detalhe.includes('flavia')) {
          pixFlaviaTotal += val;
          pixFlaviaQtd += 1;
          metodoStr = 'PIX FLAVIA';
        } else {
          pixBriciaTotal += val;
          pixBriciaQtd += 1;
          metodoStr = 'PIX BRICIA';
        }
      }

      transacoes.push({
        id: pg.id || `${c.id}-${Math.random()}`,
        horario: horarioFormatado,
        clienteNome,
        servicoNome,
        metodo: metodoStr,
        valor: val,
        profissionalNome: profNomePadrao,
      });
    });

    // Fallback caso comanda_pagamentos esteja vazio mas a comanda possua valor_total
    if (pagamentos.length === 0 && Number(c.valor_total || 0) > 0) {
      const val = Number(c.valor_total);
      dinheiroTotal += val;
      transacoes.push({
        id: `comanda-${c.id}`,
        horario: horarioFormatado,
        clienteNome,
        servicoNome,
        metodo: 'DINHEIRO',
        valor: val,
        profissionalNome: profNomePadrao,
      });
    }

    // Processa comissões
    const itens = Array.isArray(c.comanda_itens) ? c.comanda_itens : [];
    itens.forEach((it: any) => {
      const profId = it.profissional_id || it.profissionais?.id;
      if (!profId) return;
      const profNome = it.profissionais?.nome || 'Profissional';
      const qtd = Number(it.quantidade || 1);

      const valUnit = Number(it.preco_unitario || 0);
      const comissaoCalc = it.valor_comissao != null ? Number(it.valor_comissao) : valUnit * qtd * 0.6; // 60% fixo

      const exist = mapComissoes.get(profId) || { nome: profNome, quantidade: 0, total: 0 };
      exist.quantidade += qtd;
      exist.total += comissaoCalc;
      mapComissoes.set(profId, exist);
    });

    // Fallback caso comanda_itens esteja vazio mas a comanda tenha agendamento com profissional
    if (itens.length === 0 && Number(c.valor_total || 0) > 0 && (apt?.profissionais?.id || apt?.profissionais?.nome)) {
      const profId = apt.profissionais.id || apt.profissionais.nome;
      const profNome = apt.profissionais.nome || 'Profissional';
      const val = Number(c.valor_total);
      const comissaoCalc = val * 0.6; // 60% por regra de negócio

      const exist = mapComissoes.get(profId) || { nome: profNome, quantidade: 0, total: 0 };
      exist.quantidade += 1;
      exist.total += comissaoCalc;
      mapComissoes.set(profId, exist);
    }
  });

  const comissoes: ComissaoProfissional[] = Array.from(mapComissoes.entries()).map(([profId, item]) => ({
    profissionalId: profId,
    profissionalNome: item.nome,
    quantidadeServicos: item.quantidade,
    totalComissao: item.total,
  }));

  const totaisPix: CaixaTotalPix[] = Array.from(mapPixAccounts.entries()).map(([nome, item]) => ({
    nomeConta: nome,
    total: item.total,
    quantidade: item.quantidade,
  }));

  const totais: TotaisMeiosPagamento = {
    fundoCaixa: caixaObj.saldoInicial,
    dinheiro: dinheiroTotal,
    dinheiroVariacaoStr: 'Caixa aberto',
    pixBricia: pixBriciaTotal,
    pixBriciaQtd: pixBriciaQtd,
    pixFlavia: pixFlaviaTotal,
    pixFlaviaQtd: pixFlaviaQtd,
    cartaoCredito: cartaoCreditoTotal,
    cartaoDebito: cartaoDebitoTotal,
  };

  return { transacoes, comissoes, totais, totaisPix };
}

export async function buscarHistoricoCaixasFechados(): Promise<Caixa[]> {
  const { data, error } = await supabase
    .from('caixas')
    .select('*')
    .eq('status', 'fechado')
    .order('fechado_em', { ascending: false });

  if (error) {
    console.error('Erro ao buscar histórico de caixas fechados:', error);
    return [];
  }

  return (data || []).map((c: any) => ({
    id: c.id,
    status: c.status,
    saldoInicial: Number(c.saldo_inicial ?? c.fundo_caixa_inicial ?? 0),
    saldoFinalDinheiro: Number(c.saldo_final_dinheiro ?? 0),
    saldoFinalPix: Number(c.saldo_final_pix ?? 0),
    saldoFinalCartaoCredito: Number(c.saldo_final_cartao_credito ?? 0),
    saldoFinalCartaoDebito: Number(c.saldo_final_cartao_debito ?? 0),
    totalComissoes: Number(c.total_comissoes ?? 0),
    valorLiquido: Number(c.valor_liquido ?? 0),
    totalGeral: Number(c.total_geral ?? (
      Number(c.saldo_final_dinheiro || 0) +
      Number(c.saldo_final_pix || 0) +
      Number(c.saldo_final_cartao_credito || 0) +
      Number(c.saldo_final_cartao_debito || 0)
    )),
    abertoEm: c.aberto_em,
    fechadoEm: c.fechado_em,
    observacoes: c.observacoes || undefined,
  }));
}

export async function buscarDetalhesCaixaFechado(
  caixaId: string
): Promise<DetalhesCaixaFechado | null> {
  const [
    { data: caixaData, error: errCaixa },
    { data: comandasData, error: errComandas },
    { data: comissoesData, error: errCom },
    { data: pixData, error: errPix },
  ] = await Promise.all([
    supabase.from('caixas').select('*').eq('id', caixaId).single(),
    supabase
      .from('comandas')
      .select(`
        id,
        numero_sequencial,
        valor_total,
        created_at,
        finalizada_em,
        clientes (nome),
        agendamentos (
          horario_inicio,
          servicos (nome),
          profissionais (id, nome)
        ),
        comanda_itens (
          id,
          preco_unitario,
          quantidade,
          valor_comissao,
          profissional_id,
          profissionais (id, nome),
          servicos (nome)
        ),
        comanda_pagamentos (
          id,
          forma_pagamento,
          valor,
          detalhe_conta
        )
      `)
      .eq('caixa_id', caixaId)
      .eq('status', 'finalizada')
      .order('finalizada_em', { ascending: false }),
    supabase
      .from('comissoes_caixa')
      .select(`
        id,
        profissional_id,
        quantidade_servicos,
        total_comissao,
        profissionais (nome)
      `)
      .eq('caixa_id', caixaId),
    supabase
      .from('caixa_totais_pix')
      .select('*')
      .eq('caixa_id', caixaId),
  ]);

  if (errCaixa || !caixaData) {
    console.error('Erro ao buscar detalhes do caixa fechado:', errCaixa);
    return null;
  }

  const caixa: Caixa = {
    id: caixaData.id,
    status: caixaData.status,
    saldoInicial: Number(caixaData.saldo_inicial ?? caixaData.fundo_caixa_inicial ?? 0),
    saldoFinalDinheiro: Number(caixaData.saldo_final_dinheiro ?? 0),
    saldoFinalPix: Number(caixaData.saldo_final_pix ?? 0),
    saldoFinalCartaoCredito: Number(caixaData.saldo_final_cartao_credito ?? 0),
    saldoFinalCartaoDebito: Number(caixaData.saldo_final_cartao_debito ?? 0),
    totalComissoes: Number(caixaData.total_comissoes ?? 0),
    valorLiquido: Number(caixaData.valor_liquido ?? 0),
    totalGeral: Number(caixaData.total_geral ?? (
      Number(caixaData.saldo_final_dinheiro || 0) +
      Number(caixaData.saldo_final_pix || 0) +
      Number(caixaData.saldo_final_cartao_credito || 0) +
      Number(caixaData.saldo_final_cartao_debito || 0)
    )),
    abertoEm: caixaData.aberto_em,
    fechadoEm: caixaData.fechado_em,
    observacoes: caixaData.observacoes || undefined,
  };

  // Mapeia lista individual de transações do caixa fechado (Ponto 2)
  const transacoes: TransacaoCaixa[] = [];
  (comandasData || []).forEach((c: any) => {
    const clienteNome = c.clientes?.nome || 'Cliente';
    const apt = Array.isArray(c.agendamentos) ? c.agendamentos[0] : c.agendamentos;
    const primeiroItem = Array.isArray(c.comanda_itens) && c.comanda_itens.length > 0 ? c.comanda_itens[0] : null;
    const servicoNome = apt?.servicos?.nome || primeiroItem?.servicos?.nome || 'Atendimento';
    const profNomePadrao = primeiroItem?.profissionais?.nome || apt?.profissionais?.nome || 'Profissional';

    const rawHorario = c.finalizada_em || c.created_at || new Date().toISOString();
    const dataObj = new Date(rawHorario);
    const horarioFormatado = isNaN(dataObj.getTime())
      ? '12:00'
      : dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const pagamentos = Array.isArray(c.comanda_pagamentos) ? c.comanda_pagamentos : [];
    pagamentos.forEach((pg: any) => {
      const val = Number(pg.valor || 0);
      const forma = pg.forma_pagamento;
      const detalheRaw = (pg.detalhe_conta || '').toLowerCase();

      let metodoStr = 'OUTRO';
      if (forma === 'dinheiro') metodoStr = 'DINHEIRO';
      else if (forma === 'cartao_credito') metodoStr = 'CARTÃO CRÉDITO';
      else if (forma === 'cartao_debito') metodoStr = 'CARTÃO DÉBITO';
      else if (forma === 'pix') {
        metodoStr = detalheRaw.includes('flavia') ? 'PIX FLAVIA' : 'PIX BRICIA';
      }

      transacoes.push({
        id: pg.id || `${c.id}-${Math.random()}`,
        horario: horarioFormatado,
        clienteNome,
        servicoNome,
        metodo: metodoStr,
        valor: val,
        profissionalNome: profNomePadrao,
      });
    });

    if (pagamentos.length === 0 && Number(c.valor_total || 0) > 0) {
      transacoes.push({
        id: `comanda-${c.id}`,
        horario: horarioFormatado,
        clienteNome,
        servicoNome,
        metodo: 'DINHEIRO',
        valor: Number(c.valor_total),
        profissionalNome: profNomePadrao,
      });
    }
  });

  const comissoes: ComissaoProfissional[] = (comissoesData || []).map((c: any) => ({
    profissionalId: c.profissional_id,
    profissionalNome: c.profissionais?.nome || 'Profissional',
    quantidadeServicos: Number(c.quantidade_servicos || 0),
    totalComissao: Number(c.total_comissao || 0),
  }));

  const totaisPix: CaixaTotalPix[] = (pixData || []).map((p: any) => ({
    id: p.id,
    caixaId: p.caixa_id,
    nomeConta: p.nome_conta,
    total: Number(p.total || 0),
    quantidade: Number(p.quantidade || 0),
  }));

  return { caixa, transacoes, comissoes, totaisPix };
}

export async function buscarExtratoDetalhadoCaixa(
  caixaId: string
): Promise<RelatorioDetalhadoItem[]> {
  const { data: comandas, error } = await supabase
    .from('comandas')
    .select(`
      id,
      numero_sequencial,
      created_at,
      finalizada_em,
      clientes (nome),
      comanda_itens (
        profissionais (nome),
        servicos (nome)
      ),
      comanda_pagamentos (
        forma_pagamento,
        valor,
        detalhe_conta
      )
    `)
    .eq('caixa_id', caixaId)
    .eq('status', 'finalizada');

  if (error) {
    console.error('Erro ao buscar extrato detalhado do caixa:', error);
    return [];
  }

  const itens: RelatorioDetalhadoItem[] = [];

  (comandas || []).forEach((c: any) => {
    const clienteNome = c.clientes?.nome || 'Cliente';
    const numFormatado = `#${String(c.numero_sequencial || 1).padStart(4, '0')}`;
    const primeiroItem = Array.isArray(c.comanda_itens) && c.comanda_itens[0] ? c.comanda_itens[0] : null;
    const servicoNome = primeiroItem?.servicos?.nome || 'Atendimento';
    const profissionalNome = primeiroItem?.profissionais?.nome || 'Profissional';

    const rawHorario = c.finalizada_em || c.created_at || new Date().toISOString();
    const dataObj = new Date(rawHorario);
    const horarioFormatado = isNaN(dataObj.getTime())
      ? '12:00'
      : dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const pagamentos = Array.isArray(c.comanda_pagamentos) ? c.comanda_pagamentos : [];
    pagamentos.forEach((pg: any) => {
      itens.push({
        comandaId: c.id,
        comandaNumero: numFormatado,
        clienteNome,
        servicoNome,
        profissionalNome,
        formaPagamento: pg.forma_pagamento,
        detalheConta: pg.detalhe_conta || undefined,
        valor: Number(pg.valor || 0),
        horario: horarioFormatado,
      });
    });
  });

  return itens;
}
