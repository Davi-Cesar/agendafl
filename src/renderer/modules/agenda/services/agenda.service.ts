import { supabase } from '@shared/supabase/client';
import {
  AgendamentoSchema,
  CriarAgendamentoDTO,
  type Agendamento,
  type Profissional,
  type ServicoItem,
  type CriarAgendamentoInput,
} from '../schemas/agendamento.schema';

export async function buscarProfissionais(): Promise<Profissional[]> {
  const { data, error } = await supabase
    .from('profissionais')
    .select('id, nome, especialidade')
    .eq('status', 'ativo');

  if (error) {
    console.error('Erro ao buscar profissionais:', error);
    throw new Error(`Erro ao buscar profissionais: ${error.message}`);
  }

  return (data ?? []).map((p) => ({
    id: p.id,
    nome: p.nome,
    especialidade: p.especialidade || '',
  }));
}

export async function buscarClientes(): Promise<Array<{ id: string; nome: string; telefone: string }>> {
  const { data, error } = await supabase
    .from('clientes')
    .select('id, nome, telefone')
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
      servicos (nome)
    `)
    .eq('data', dataStr);

  if (error) {
    console.error('Erro ao buscar agendamentos do dia:', error);
    throw new Error(`Erro ao carregar agendamentos: ${error.message}`);
  }

  return (data ?? []).map((row: any) => {
    // Normaliza formato HH:MM (remove segundos do TIME do Postgres ex "08:00:00" -> "08:00")
    const hInicio = (row.horario_inicio || '08:00').slice(0, 5);
    const hFim = (row.horario_fim || '09:00').slice(0, 5);
    const clienteNome = row.clientes?.nome || 'Cliente';
    const servicoNome = row.servicos?.nome || 'Serviço';

    return AgendamentoSchema.parse({
      id: row.id,
      profissionalId: row.profissional_id,
      clienteNome,
      servico: servicoNome,
      data: row.data,
      horarioInicio: hInicio,
      horarioFim: hFim,
      status: row.status === 'cancelado' ? 'faltou' : row.status,
      countdown: row.status === 'em_atendimento' ? 'Faltam 15min' : undefined,
      observacoes: row.observacoes || undefined,
    });
  });
}

export async function salvarNovoAgendamento(input: CriarAgendamentoInput): Promise<Agendamento> {
  const valid = CriarAgendamentoDTO.parse(input);

  // Busca ou cria cliente se não existir UUID
  let clienteId = valid.clienteNome;
  const isUuid = /^[0-9a-fA-F-]{36}$/.test(valid.clienteNome);

  if (!isUuid) {
    const { data: clienteExist } = await supabase
      .from('clientes')
      .select('id')
      .ilike('nome', valid.clienteNome)
      .maybeSingle();

    if (clienteExist) {
      clienteId = clienteExist.id;
    } else {
      const { data: novoCliente, error: errCli } = await supabase
        .from('clientes')
        .insert({ nome: valid.clienteNome, telefone: '(11) 90000-0000' })
        .select()
        .single();
      if (errCli || !novoCliente) throw new Error('Erro ao registrar cliente');
      clienteId = novoCliente.id;
    }
  }

  // Busca ID do serviço por nome
  let servicoId = valid.servico;
  const isServicoUuid = /^[0-9a-fA-F-]{36}$/.test(valid.servico);
  if (!isServicoUuid) {
    const { data: srvExist } = await supabase
      .from('servicos')
      .select('id')
      .ilike('nome', valid.servico)
      .maybeSingle();
    if (srvExist) servicoId = srvExist.id;
  }

  const payload = {
    cliente_id: clienteId,
    profissional_id: valid.profissionalId,
    servico_id: servicoId,
    data: valid.data,
    horario_inicio: `${valid.horarioInicio}:00`,
    horario_fim: `${valid.horarioFim}:00`,
    status: 'agendado',
    observacoes: valid.observacoes,
  };

  const { data, error } = await supabase.from('agendamentos').insert(payload).select().single();

  if (error || !data) {
    console.error('Erro ao salvar agendamento no Supabase:', error);
    throw new Error(`Erro ao salvar no Supabase: ${error?.message}`);
  }

  return AgendamentoSchema.parse({
    id: data.id,
    profissionalId: data.profissional_id,
    clienteNome: valid.clienteNome,
    servico: valid.servico,
    data: data.data,
    horarioInicio: valid.horarioInicio,
    horarioFim: valid.horarioFim,
    status: 'agendado',
    observacoes: data.observacoes || undefined,
  });
}

export async function atualizarStatusAgendamentoNoSupabase(
  id: string,
  novoStatus: string
): Promise<void> {
  const { error } = await supabase
    .from('agendamentos')
    .update({ status: novoStatus })
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar status no Supabase:', error);
    throw new Error(error.message);
  }
}

export async function excluirAgendamentoNoSupabase(id: string): Promise<void> {
  const { error } = await supabase.from('agendamentos').delete().eq('id', id);
  if (error) {
    console.error('Erro ao excluir agendamento no Supabase:', error);
    throw new Error(error.message);
  }
}
