import { supabase } from '@shared/supabase/client';
import type { Profissional, ProfissionalHorario, ExcecaoHorario, TipoExcecaoHorario } from '../schemas/profissional.schema';
import type { ServicoOption } from '../types/profissionais.types';

export async function buscarProfissionais(): Promise<Profissional[]> {
  const { data, error } = await supabase
    .from('profissionais')
    .select('*')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao buscar profissionais no Supabase:', error);
    return [];
  }

  return (data || []).map((p: any) => ({
    id: p.id,
    nome: p.nome,
    especialidade: p.especialidade || '',
    email: p.email || '',
    telefone: p.telefone || '',
    cpf: p.cpf || '',
    dataNascimento: p.data_nascimento || '',
    comissaoPercentual: 60, // Sempre 60% por regra de negócio
    status: p.status || 'ativo',
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }));
}

export async function buscarServicosDoProfissional(profissionalId: string): Promise<ServicoOption[]> {
  const { data, error } = await supabase
    .from('profissionais_servicos')
    .select('servico_id, servicos(id, nome, duracao, preco_padrao)')
    .eq('profissional_id', profissionalId);

  if (error) {
    console.error('Erro ao buscar serviços do profissional:', error);
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.servicos?.id || item.servico_id,
    nome: item.servicos?.nome || 'Serviço',
    duracaoMinutos: item.servicos?.duracao,
    precoPadrao: item.servicos?.preco_padrao != null ? Number(item.servicos.preco_padrao) : undefined,
  }));
}

export async function buscarExcecoesDoProfissional(profissionalId: string): Promise<ExcecaoHorario[]> {
  const { data, error } = await supabase
    .from('profissionais_excecoes')
    .select('*')
    .eq('profissional_id', profissionalId);

  if (error || !data) {
    return [];
  }

  return data.map((e: any) => ({
    id: e.id,
    profissionalId: e.profissional_id,
    data: e.data,
    inicio: e.horario_inicio?.slice(0, 5) || e.inicio || '08:00',
    fim: e.horario_fim?.slice(0, 5) || e.fim || '12:00',
    tipo: (e.tipo === 'indisponibilidade' ? 'indisponibilidade' : e.tipo) || 'atendimento_extra',
    motivo: e.motivo || '',
  }));
}

export async function buscarHorariosDoProfissional(profissionalId: string): Promise<ProfissionalHorario[]> {
  const [resHorarios, excecoesList] = await Promise.all([
    supabase
      .from('profissionais_horarios')
      .select('*')
      .eq('profissional_id', profissionalId)
      .order('dia_semana', { ascending: true }),
    buscarExcecoesDoProfissional(profissionalId),
  ]);

  const data = resHorarios.data || [];
  const mapHorarios = new Map<number, any>();
  data.forEach((h: any) => mapHorarios.set(Number(h.dia_semana), h));

  // Todos os 7 dias da semana (0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb)
  const todosDias = [0, 1, 2, 3, 4, 5, 6];

  return todosDias.map((diaNum) => {
    const h = mapHorarios.get(diaNum);
    const isDomingo = diaNum === 0;

    // Filtrar exceções vinculadas ao dia da semana correspondente
    const excDoDia = excecoesList.filter((e) => {
      if (!e.data) return false;
      const partes = e.data.split('-');
      if (partes.length === 3) {
        const d = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
        return d.getDay() === diaNum;
      }
      return false;
    });

    if (!h) {
      return {
        profissionalId,
        diaSemana: diaNum,
        ativo: !isDomingo, // Domingo desligado por padrão
        manhaInicio: '08:00',
        manhaFim: '11:00',
        tardeInicio: '13:30',
        tardeFim: '17:00',
        intervaloAlmoco: '11:00 - 13:30',
        excecoes: excDoDia,
      };
    }

    const excecoesCombinadas = Array.isArray(h.excecoes) ? h.excecoes : [];
    // Unir exceções sem duplicar por id
    const setIds = new Set(excecoesCombinadas.map((e: any) => e.id));
    excDoDia.forEach((e) => {
      if (!setIds.has(e.id)) excecoesCombinadas.push(e);
    });

    return {
      id: h.id,
      profissionalId: h.profissional_id,
      diaSemana: diaNum,
      ativo: Boolean(h.ativo),
      manhaInicio: h.manha_inicio?.slice(0, 5) || '08:00',
      manhaFim: h.manha_fim?.slice(0, 5) || '11:00',
      tardeInicio: h.tarde_inicio?.slice(0, 5) || '13:30',
      tardeFim: h.tarde_fim?.slice(0, 5) || '17:00',
      intervaloAlmoco: h.intervalo_almoco || '11:00 - 13:30',
      excecoes: excecoesCombinadas,
    };
  });
}

export async function salvarProfissionalNoSupabase(dados: Partial<Profissional>): Promise<Profissional> {
  const payload: any = {
    nome: dados.nome,
    especialidade: dados.especialidade || null,
    email: dados.email || null,
    telefone: dados.telefone || null,
    cpf: dados.cpf || null,
    data_nascimento: dados.dataNascimento || null,
    comissao_percentual: 60, // Sempre 60%
    status: dados.status || 'ativo',
  };

  let query;
  if (dados.id) {
    query = supabase.from('profissionais').update(payload).eq('id', dados.id).select().single();
  } else {
    query = supabase.from('profissionais').insert(payload).select().single();
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error('Erro ao salvar profissional:', error);
    throw new Error(`Erro ao salvar profissional: ${error?.message || 'Falha na operação'}`);
  }

  return {
    id: data.id,
    nome: data.nome,
    especialidade: data.especialidade || '',
    email: data.email || '',
    telefone: data.telefone || '',
    cpf: data.cpf || '',
    dataNascimento: data.data_nascimento || '',
    comissaoPercentual: 60,
    status: data.status || 'ativo',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function alterarStatusProfissional(id: string, novoStatus: 'ativo' | 'inativo'): Promise<void> {
  const { error } = await supabase
    .from('profissionais')
    .update({ status: novoStatus })
    .eq('id', id);

  if (error) {
    console.error('Erro ao alterar status do profissional:', error);
    throw new Error(`Erro ao alterar status: ${error.message}`);
  }
}

export async function excluirProfissionalNoSupabase(id: string): Promise<void> {
  const { error } = await supabase
    .from('profissionais')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir profissional:', error);
    await alterarStatusProfissional(id, 'inativo');
  }
}

export async function salvarHorariosDoProfissional(
  profissionalId: string,
  horarios: ProfissionalHorario[]
): Promise<void> {
  const payloadHorarios = horarios.map((h) => ({
    profissional_id: profissionalId,
    dia_semana: h.diaSemana,
    ativo: h.ativo,
    manha_inicio: h.manhaInicio,
    manha_fim: h.manhaFim,
    tarde_inicio: h.tardeInicio,
    tarde_fim: h.tardeFim,
    intervalo_almoco: h.intervaloAlmoco || '11:00 - 13:30',
  }));

  const { error: errH } = await supabase
    .from('profissionais_horarios')
    .upsert(payloadHorarios, { onConflict: 'profissional_id,dia_semana' });

  if (errH) {
    console.warn('Upsert de horários falhou ou tabela não existe:', errH);
  }

  // Tentar salvar exceções na tabela profissionais_excecoes se disponível
  try {
    const todasExcecoes: any[] = [];
    horarios.forEach((h) => {
      (h.excecoes || []).forEach((e) => {
        if (e.data) {
          todasExcecoes.push({
            id: e.id && e.id.length > 20 ? e.id : undefined,
            profissional_id: profissionalId,
            data: e.data,
            horario_inicio: e.inicio,
            horario_fim: e.fim,
            tipo: e.tipo,
            motivo: e.motivo || null,
          });
        }
      });
    });

    if (todasExcecoes.length > 0) {
      await supabase.from('profissionais_excecoes').upsert(todasExcecoes);
    }
  } catch (errEx) {
    console.warn('Falha ao salvar exceções no Supabase:', errEx);
  }
}

export async function salvarServicosDoProfissional(
  profissionalId: string,
  servicoIds: string[]
): Promise<void> {
  await supabase.from('profissionais_servicos').delete().eq('profissional_id', profissionalId);

  if (servicoIds.length > 0) {
    const payload = servicoIds.map((servico_id) => ({
      profissional_id: profissionalId,
      servico_id,
    }));
    await supabase.from('profissionais_servicos').insert(payload);
  }
}

export async function buscarTodosServicos(): Promise<ServicoOption[]> {
  const { data, error } = await supabase
    .from('servicos')
    .select('id, nome, duracao, preco_padrao')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao buscar catálogo de serviços:', error);
    return [];
  }

  return (data || []).map((s: any) => ({
    id: s.id,
    nome: s.nome,
    duracaoMinutos: s.duracao,
    precoPadrao: s.preco_padrao != null ? Number(s.preco_padrao) : undefined,
  }));
}

export async function adicionarExcecaoDiretaNoSupabase(
  profissionalId: string,
  excecao: { data: string; inicio: string; fim: string; tipo: TipoExcecaoHorario; motivo?: string }
): Promise<ExcecaoHorario> {
  const payload: any = {
    profissional_id: profissionalId,
    data: excecao.data,
    horario_inicio: excecao.inicio,
    horario_fim: excecao.fim,
    tipo: excecao.tipo,
    motivo: excecao.motivo || null,
  };

  const { data, error } = await supabase
    .from('profissionais_excecoes')
    .insert(payload)
    .select()
    .single();

  if (error || !data) {
    console.warn('Inserção de exceção direta falhou no Supabase (usando fallback local):', error);
    return {
      id: Math.random().toString(36).substring(2, 9),
      profissionalId,
      data: excecao.data,
      inicio: excecao.inicio,
      fim: excecao.fim,
      tipo: excecao.tipo,
      motivo: excecao.motivo || '',
    };
  }

  return {
    id: data.id,
    profissionalId: data.profissional_id,
    data: data.data,
    inicio: data.horario_inicio?.slice(0, 5) || excecao.inicio,
    fim: data.horario_fim?.slice(0, 5) || excecao.fim,
    tipo: data.tipo,
    motivo: data.motivo || '',
  };
}
