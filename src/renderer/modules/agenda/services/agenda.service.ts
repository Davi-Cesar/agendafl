import { supabase } from '@shared/supabase/client';
import {
  AgendamentoSchema,
  CriarAgendamentoDTO,
  AtualizarAgendamentoDTO,
  type Agendamento,
  type Profissional,
  type ServicoItem,
  type CriarAgendamentoInput,
  type AtualizarAgendamentoInput,
} from '../schemas/agendamento.schema';

export async function buscarProfissionais(dataStr?: string): Promise<Profissional[]> {
  const { data, error } = await supabase
    .from('profissionais')
    .select('id, nome, especialidade')
    .eq('status', 'ativo')
    .or('especialidade.neq.__removido__,especialidade.is.null')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao buscar profissionais:', error);
    throw new Error(`Erro ao buscar profissionais: ${error.message}`);
  }

  const resultado: Profissional[] = (data ?? []).map((p) => ({
    id: p.id,
    nome: p.nome,
    especialidade: p.especialidade || '',
  }));

  // Se uma data for informada, garante que profissionais inativos que possuem atendimentos
  // registrados nessa data continuem visíveis na grade para histórico e conferência
  if (dataStr) {
    try {
      const { data: ags } = await supabase
        .from('agendamentos')
        .select('profissional_id, profissionais (id, nome, especialidade)')
        .eq('data', dataStr);

      (ags ?? []).forEach((row: any) => {
        const p = row.profissionais;
        if (p && !resultado.some((item) => item.id === p.id)) {
          resultado.push({
            id: p.id,
            nome: `${p.nome} (Inativo)`,
            especialidade: p.especialidade === '__removido__' ? '' : (p.especialidade || ''),
          });
        }
      });
    } catch (e) {
      console.warn('Aviso ao carregar profissionais históricos do dia:', e);
    }
  }

  return resultado;
}

export async function buscarHorariosEExcecoesDosProfissionais(): Promise<{
  horariosMap: Record<string, any[]>;
  excecoesMap: Record<string, any[]>;
}> {
  const [resHorarios, resExcecoes] = await Promise.all([
    supabase.from('profissionais_horarios').select('*'),
    supabase.from('profissionais_excecoes').select('*'),
  ]);

  const horariosMap: Record<string, any[]> = {};
  (resHorarios.data || []).forEach((h: any) => {
    const profId = h.profissional_id;
    if (!horariosMap[profId]) horariosMap[profId] = [];
    horariosMap[profId].push({
      diaSemana: Number(h.dia_semana),
      ativo: Boolean(h.ativo),
      manhaInicio: h.manha_inicio?.slice(0, 5) || '08:00',
      manhaFim: h.manha_fim?.slice(0, 5) || '11:00',
      tardeInicio: h.tarde_inicio?.slice(0, 5) || '13:30',
      tardeFim: h.tarde_fim?.slice(0, 5) || '17:00',
      intervaloAlmoco: `${h.manha_fim?.slice(0, 5) || '11:00'} - ${h.tarde_inicio?.slice(0, 5) || '13:30'}`,
    });
  });

  const excecoesMap: Record<string, any[]> = {};
  (resExcecoes.data || []).forEach((e: any) => {
    const profId = e.profissional_id;
    if (!excecoesMap[profId]) excecoesMap[profId] = [];
    excecoesMap[profId].push({
      id: e.id,
      data: e.data,
      inicio: e.horario_inicio?.slice(0, 5) || e.inicio || '08:00',
      fim: e.horario_fim?.slice(0, 5) || e.fim || '12:00',
      tipo: e.tipo || 'atendimento_extra',
      motivo: e.motivo || '',
    });
  });

  return { horariosMap, excecoesMap };
}

export async function buscarClientes(): Promise<Array<{ id: string; nome: string; telefone: string }>> {
  const { data, error } = await supabase
    .from('clientes')
    .select('id, nome, telefone')
    .is('removido_em', null)
    .eq('status', 'ativo');

  if (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }

  return data ?? [];
}

export async function buscarServicos(): Promise<ServicoItem[]> {
  const { data, error } = await supabase
    .from('servicos')
    .select('id, nome, duracao_minutos')
    .eq('ativo', true);

  if (error) {
    console.error('Erro ao buscar serviços:', error);
    return [];
  }

  return (data ?? []).map((s) => ({
    id: s.id,
    nome: s.nome,
    duracaoMinutos: s.duracao_minutos,
  }));
}

export async function buscarServicosPorProfissional(profissionalId: string): Promise<ServicoItem[]> {
  if (!profissionalId) return [];

  const { data, error } = await supabase
    .from('profissionais_servicos')
    .select('servico_id, servicos!inner(id, nome, duracao_minutos, ativo)')
    .eq('profissional_id', profissionalId)
    .eq('servicos.ativo', true);

  if (error) {
    console.error('Erro ao buscar serviços do profissional:', error);
    return [];
  }

  return (data ?? [])
    .map((item: any) => ({
      id: item.servicos?.id || item.servico_id,
      nome: item.servicos?.nome || 'Serviço',
      duracaoMinutos: Number(item.servicos?.duracao_minutos || 30),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome));
}

export function parseMetadataObservacoes(rawObs: unknown): {
  customStatus?: string;
  comandaIdTag?: string;
  comandaNumeroTag?: string;
  obsLimpa?: string;
} {
  let texto = typeof rawObs === 'string' ? rawObs : '';
  let customStatus: string | undefined;
  let comandaIdTag: string | undefined;
  let comandaNumeroTag: string | undefined;

  // Extrai tags no início da string (ex: [STATUS:xxx] ou [COMANDA:uuid:#0001])
  let mudou = true;
  while (mudou) {
    mudou = false;
    const statusMatch = texto.match(/^\[STATUS:([^\]]+)\]\s*(.*)$/s);
    if (statusMatch) {
      customStatus = statusMatch[1];
      texto = statusMatch[2] || '';
      mudou = true;
    }
    const cmdMatch = texto.match(/^\[COMANDA:([^:\]]+):([^\]]+)\]\s*(.*)$/s);
    if (cmdMatch) {
      comandaIdTag = cmdMatch[1];
      comandaNumeroTag = cmdMatch[2];
      texto = cmdMatch[3] || '';
      mudou = true;
    }
  }

  return {
    customStatus,
    comandaIdTag,
    comandaNumeroTag,
    obsLimpa: texto.trim() ? texto.trim() : undefined,
  };
}

export async function buscarAgendamentosDoDia(dataStr: string): Promise<Agendamento[]> {
  const { data, error } = await supabase
    .from('agendamentos')
    .select(`
      id,
      profissional_id,
      cliente_id,
      servico_id,
      data,
      horario_inicio,
      horario_fim,
      status,
      observacoes,
      clientes (nome),
      servicos (nome, preco_padrao),
      comandas (
        id,
        numero_sequencial,
        status,
        valor_total
      )
    `)
    .eq('data', dataStr);

  if (error) {
    console.error('Erro ao buscar agendamentos do dia:', error);
    throw new Error(`Erro ao carregar agendamentos: ${error.message}`);
  }

  return (data ?? []).map((row: any) => {
    const hInicio = (row.horario_inicio || '08:00').slice(0, 5);
    const hFim = (row.horario_fim || '09:00').slice(0, 5);
    const clienteNome = row.clientes?.nome || 'Cliente';
    const servicoNome = row.servicos?.nome || 'Serviço';

    const cmdList = Array.isArray(row.comandas) ? row.comandas : row.comandas ? [row.comandas] : [];
    const cmd = cmdList.length > 0 ? cmdList[0] : null;

    const { customStatus, comandaIdTag, comandaNumeroTag, obsLimpa } = parseMetadataObservacoes(row.observacoes);

    const comandaId = cmd?.id || comandaIdTag || undefined;
    const comandaNumero = cmd
      ? `#${String(cmd.numero_sequencial || 1).padStart(4, '0')}`
      : comandaNumeroTag || undefined;
    const comandaStatus = cmd
      ? (cmd.status === 'aberta' ? 'rascunho' : cmd.status)
      : comandaIdTag
      ? 'finalizada'
      : undefined;

    // Preserva o valor individual do serviço agendado para não misturar com o total unificado da comanda
    const valor =
      row.servicos?.preco_padrao != null
        ? Number(row.servicos.preco_padrao)
        : cmd?.valor_total != null
        ? Number(cmd.valor_total)
        : undefined;

    const statusBase = row.status === 'cancelado' ? 'faltou' : row.status;
    const statusEfetivo =
      statusBase === 'agendado' && customStatus
        ? customStatus
        : statusBase;

    return AgendamentoSchema.parse({
      id: row.id,
      profissionalId: row.profissional_id,
      clienteId: row.cliente_id || undefined,
      clienteNome,
      servicoId: row.servico_id || undefined,
      servico: servicoNome,
      valor,
      data: row.data,
      horarioInicio: hInicio,
      horarioFim: hFim,
      status: statusEfetivo,
      countdown: statusEfetivo === 'em_atendimento' ? 'Faltam 15min' : undefined,
      comandaId,
      comandaNumero,
      comandaStatus,
      observacoes: obsLimpa,
    });
  });
}

export async function salvarNovoAgendamento(input: CriarAgendamentoInput): Promise<Agendamento> {
  const valid = CriarAgendamentoDTO.parse(input);
  const nomeClienteLimpo = valid.clienteNome.trim();

  let clienteId = nomeClienteLimpo;
  const isUuid = /^[0-9a-fA-F-]{36}$/.test(nomeClienteLimpo);

  if (!isUuid) {
    const { data: clientesEncontrados } = await supabase
      .from('clientes')
      .select('id')
      .ilike('nome', nomeClienteLimpo)
      .is('removido_em', null)
      .limit(1);

    if (clientesEncontrados && clientesEncontrados.length > 0) {
      clienteId = clientesEncontrados[0].id;
    } else {
      const { data: novoCliente, error: errCli } = await supabase
        .from('clientes')
        .insert({ nome: nomeClienteLimpo, telefone: '(11) 90000-0000' })
        .select()
        .single();
      if (errCli || !novoCliente) throw new Error('Erro ao registrar cliente');
      clienteId = novoCliente.id;
    }
  }

  let servicoId = valid.servico;
  const isServicoUuid = /^[0-9a-fA-F-]{36}$/.test(valid.servico);
  if (!isServicoUuid) {
    const { data: srvEncontrados } = await supabase
      .from('servicos')
      .select('id')
      .ilike('nome', valid.servico.trim())
      .limit(1);
    if (srvEncontrados && srvEncontrados.length > 0) servicoId = srvEncontrados[0].id;
  }

  const payload = {
    cliente_id: clienteId,
    profissional_id: valid.profissionalId,
    servico_id: servicoId,
    data: valid.data,
    horario_inicio: `${valid.horarioInicio}:00`,
    horario_fim: `${valid.horarioFim}:00`,
    status: 'agendado',
    observacoes: valid.observacoes?.trim() || null,
  };

  const { data, error } = await supabase.from('agendamentos').insert(payload).select().single();

  if (error || !data) {
    console.error('Erro ao salvar agendamento no Supabase:', error);
    throw new Error(`Erro ao salvar no Supabase: ${error?.message}`);
  }

  return AgendamentoSchema.parse({
    id: data.id,
    profissionalId: data.profissional_id,
    clienteId: data.cliente_id || undefined,
    clienteNome: nomeClienteLimpo,
    servicoId: data.servico_id || undefined,
    servico: valid.servico,
    data: data.data,
    horarioInicio: valid.horarioInicio,
    horarioFim: valid.horarioFim,
    status: 'agendado',
    observacoes: data.observacoes || undefined,
  });
}

const STATUS_NATIVOS_DB = new Set(['agendado', 'em_atendimento', 'concluido', 'faltou']);

export async function atualizarStatusAgendamentoNoSupabase(
  id: string,
  novoStatus: string
): Promise<void> {
  const { data: atual } = await supabase
    .from('agendamentos')
    .select('observacoes')
    .eq('id', id)
    .maybeSingle();

  const { comandaIdTag, comandaNumeroTag, obsLimpa } = parseMetadataObservacoes(atual?.observacoes);
  const cmdTagPrefix =
    comandaIdTag && comandaNumeroTag ? `[COMANDA:${comandaIdTag}:${comandaNumeroTag}]` : '';

  const isNativo = STATUS_NATIVOS_DB.has(novoStatus);
  const obsComComanda = [cmdTagPrefix, obsLimpa].filter(Boolean).join(' ');

  const payload = isNativo
    ? { status: novoStatus, observacoes: obsComComanda || null }
    : {
        status: 'agendado',
        observacoes: `[STATUS:${novoStatus}]${obsComComanda ? ` ${obsComComanda}` : ''}`,
      };

  const { error } = await supabase
    .from('agendamentos')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar status no Supabase:', error);
    throw new Error(error.message);
  }
}

export async function atualizarAgendamentoNoSupabase(
  input: AtualizarAgendamentoInput
): Promise<void> {
  const valid = AtualizarAgendamentoDTO.parse(input);

  // Resolve servico_id a partir do nome selecionado
  let servicoId: string | undefined = undefined;
  const isServicoUuid = /^[0-9a-fA-F-]{36}$/.test(valid.servico);
  if (isServicoUuid) {
    servicoId = valid.servico;
  } else {
    const { data: srvEncontrados } = await supabase
      .from('servicos')
      .select('id')
      .ilike('nome', valid.servico.trim())
      .limit(1);
    if (srvEncontrados && srvEncontrados.length > 0) {
      servicoId = srvEncontrados[0].id;
    }
  }

  // Preserva metadados internos ([STATUS:...] e [COMANDA:...]) gravados em observacoes
  const { data: atual } = await supabase
    .from('agendamentos')
    .select('observacoes')
    .eq('id', valid.id)
    .maybeSingle();

  const { customStatus, comandaIdTag, comandaNumeroTag } = parseMetadataObservacoes(atual?.observacoes);
  const statusTag = customStatus ? `[STATUS:${customStatus}]` : '';
  const cmdTag = comandaIdTag && comandaNumeroTag ? `[COMANDA:${comandaIdTag}:${comandaNumeroTag}]` : '';
  const obsLimpa = valid.observacoes?.trim() || '';
  const observacoesFinal = [statusTag, cmdTag, obsLimpa].filter(Boolean).join(' ') || null;

  const updatePayload: Record<string, string | null> = {
    profissional_id: valid.profissionalId,
    horario_inicio: `${valid.horarioInicio}:00`,
    horario_fim: `${valid.horarioFim}:00`,
    observacoes: observacoesFinal,
  };
  if (servicoId) {
    updatePayload.servico_id = servicoId;
  }

  const { error } = await supabase
    .from('agendamentos')
    .update(updatePayload)
    .eq('id', valid.id);

  if (error) {
    console.error('Erro ao atualizar agendamento no Supabase:', error);
    throw new Error(`Erro ao atualizar agendamento: ${error.message}`);
  }
}

export async function excluirAgendamentoNoSupabase(id: string): Promise<void> {
  const { error } = await supabase.from('agendamentos').delete().eq('id', id);
  if (error) {
    console.error('Erro ao excluir agendamento no Supabase:', error);
    throw new Error(error.message);
  }
}
