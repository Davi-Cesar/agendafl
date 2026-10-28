import { supabase } from '@shared/supabase/client';
import type { Cliente, HistoricoClienteItem } from '../schemas/cliente.schema';
import { formatarCelular, formatarCPF, formatarDataBR, apenasDigitos } from '@shared/lib/formatters';

export async function buscarClientes(
  busca: string = '',
  pagina: number = 1,
  limite: number = 10
): Promise<{ clientes: Cliente[]; total: number }> {
  let query = supabase
    .from('clientes')
    .select('*', { count: 'exact' })
    .is('removido_em', null);

  if (busca.trim()) {
    const term = `%${busca.trim()}%`;
    query = query.or(`nome.ilike.${term},cpf.ilike.${term},telefone.ilike.${term}`);
  }

  const offset = (pagina - 1) * limite;
  query = query.order('nome', { ascending: true }).range(offset, offset + limite - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('Erro ao buscar clientes no Supabase:', error);
    return { clientes: [], total: 0 };
  }

  const clientes: Cliente[] = (data || []).map((c: any) => ({
    id: c.id,
    nome: c.nome || '',
    telefone: c.telefone || '',
    dataNascimento: c.data_nascimento || null,
    cpf: c.cpf || null,
    observacoes: c.observacoes || null,
    status: c.status || 'ativo',
    cupomAniversarioUsadoEm: c.cupom_aniversario_usado_em || null,
    removidoEm: c.removido_em || null,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }));

  return { clientes, total: count ?? clientes.length };
}

export async function buscarClientePorIdNoSupabase(id: string): Promise<Cliente | null> {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    nome: data.nome || '',
    telefone: data.telefone || '',
    dataNascimento: data.data_nascimento || null,
    cpf: data.cpf || null,
    observacoes: data.observacoes || null,
    status: data.status || 'ativo',
    cupomAniversarioUsadoEm: data.cupom_aniversario_usado_em || null,
    removidoEm: data.removido_em || null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function buscarAniversariantes(dataStr: string): Promise<Cliente[]> {
  // dataStr no formato YYYY-MM-DD
  const partes = dataStr.split('-');
  if (partes.length !== 3) return [];

  const mm = partes[1];
  const dd = partes[2];

  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .is('removido_em', null)
    .order('nome', { ascending: true });

  if (error || !data) {
    console.error('Erro ao buscar aniversariantes no Supabase:', error);
    return [];
  }

  // Filtrar por Mês e Dia da data_nascimento (e ignorar clientes inativos)
  const aniversariantes = data
    .filter((c: any) => {
      if (c.status === 'inativo') return false;
      if (!c.data_nascimento) return false;
      const dPartes = c.data_nascimento.split('-');
      if (dPartes.length < 3) return false;
      return dPartes[1] === mm && dPartes[2] === dd;
    })
    .map((c: any) => ({
      id: c.id,
      nome: c.nome || '',
      telefone: c.telefone || '',
      dataNascimento: c.data_nascimento || null,
      cpf: c.cpf || null,
      observacoes: c.observacoes || null,
      status: c.status || 'ativo',
      removidoEm: c.removido_em || null,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));

  return aniversariantes;
}

export async function salvarClienteNoSupabase(dados: Partial<Cliente>): Promise<Cliente> {
  const cpfCru = dados.cpf ? apenasDigitos(dados.cpf) : null;

  // Pre-check para CPF duplicado em clientes não removidos (removido_em IS NULL)
  if (cpfCru) {
    let checkQuery = supabase
      .from('clientes')
      .select('id, nome')
      .or(`cpf.eq.${cpfCru},cpf.eq.${formatarCPF(cpfCru)}`)
      .is('removido_em', null);

    if (dados.id) {
      checkQuery = checkQuery.neq('id', dados.id);
    }

    const { data: clienteDuplicado } = await checkQuery.maybeSingle();
    if (clienteDuplicado) {
      throw new Error(`Este CPF já está cadastrado para o cliente "${clienteDuplicado.nome}".`);
    }
  }

  const payload: any = {
    nome: dados.nome,
    telefone: dados.telefone,
    data_nascimento: dados.dataNascimento || null,
    cpf: cpfCru || null,
    observacoes: dados.observacoes || null,
    status: dados.status || 'ativo',
  };

  let query;
  if (dados.id) {
    query = supabase.from('clientes').update(payload).eq('id', dados.id).select().single();
  } else {
    query = supabase.from('clientes').insert(payload).select().single();
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error('Erro ao salvar cliente no Supabase:', error);
    let msg = error?.message || 'Falha na operação';
    if (error?.code === '23505' || msg.includes('clientes_cpf_key') || msg.includes('unique constraint')) {
      msg = 'Já existe um cliente cadastrado com este CPF.';
    }
    throw new Error(msg.startsWith('Erro') ? msg : `Erro ao salvar cliente: ${msg}`);
  }

  return {
    id: data.id,
    nome: data.nome,
    telefone: data.telefone || '',
    dataNascimento: data.data_nascimento || null,
    cpf: data.cpf || null,
    observacoes: data.observacoes || null,
    status: data.status || 'ativo',
    cupomAniversarioUsadoEm: data.cupom_aniversario_usado_em || null,
    removidoEm: data.removido_em || null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function excluirClienteNoSupabase(id: string): Promise<void> {
  // Tentar executar via RPC atômica no Supabase
  const { error: rpcError } = await supabase.rpc('remover_cliente_atomico', { p_cliente_id: id });

  if (!rpcError) {
    return;
  }

  console.warn('RPC remover_cliente_atomico não disponível ou falhou. Aplicando remoção direta:', rpcError.message);

  const agoraIso = new Date().toISOString();

  // a) Soft delete: UPDATE clientes SET removido_em = now() (sem alterar o campo status)
  const { error } = await supabase
    .from('clientes')
    .update({ removido_em: agoraIso })
    .eq('id', id);

  if (error) {
    console.error('Erro ao remover cliente no Supabase:', error);
    throw new Error(`Erro ao remover cliente: ${error.message}`);
  }

  // b) Excluir agendamentos futuros não realizados desse cliente (hard delete)
  const agora = new Date();
  const hojeStr = agora.toISOString().split('T')[0];
  const horaAtualStr = agora.toTimeString().slice(0, 5);

  // Excluir agendamentos em datas futuras
  await supabase
    .from('agendamentos')
    .delete()
    .eq('cliente_id', id)
    .in('status', ['agendado', 'em_atendimento'])
    .gt('data', hojeStr);

  // Excluir agendamentos hoje a partir do horário atual
  await supabase
    .from('agendamentos')
    .delete()
    .eq('cliente_id', id)
    .in('status', ['agendado', 'em_atendimento'])
    .eq('data', hojeStr)
    .gte('horario_inicio', horaAtualStr);
}

export function exportarClientesCSV(clientes: Cliente[], nomeArquivo: string = 'clientes_export.csv'): void {
  if (!clientes || clientes.length === 0) return;

  const cabecalho = ['ID', 'Nome', 'Telefone', 'Data Nascimento', 'CPF', 'Status'];
  const linhas = clientes.map((c) => [
    c.id,
    `"${c.nome.replace(/"/g, '""')}"`,
    `"${formatarCelular(c.telefone)}"`,
    formatarDataBR(c.dataNascimento),
    c.cpf ? `"${formatarCPF(c.cpf)}"` : '',
    c.status,
  ]);

  const conteudoCSV = [cabecalho.join(','), ...linhas.map((l) => l.join(','))].join('\n');
  const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', nomeArquivo);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function extrairDataHoraISO(isoStr?: string | null): { data: string; horario: string } {
  if (!isoStr) {
    const agora = new Date();
    const yyyy = agora.getFullYear();
    const mm = String(agora.getMonth() + 1).padStart(2, '0');
    const dd = String(agora.getDate()).padStart(2, '0');
    return { data: `${yyyy}-${mm}-${dd}`, horario: '12:00' };
  }
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) {
    return { data: isoStr.slice(0, 10), horario: '12:00' };
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const horario = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return { data: `${yyyy}-${mm}-${dd}`, horario };
}

export async function buscarHistoricoAtendimentos(clienteId?: string): Promise<HistoricoClienteItem[]> {
  let queryComandas = supabase
    .from('comandas')
    .select(`
      id,
      cliente_id,
      agendamento_id,
      numero_sequencial,
      status,
      valor_total,
      created_at,
      finalizada_em,
      clientes (id, nome),
      agendamentos (
        id,
        data,
        horario_inicio,
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
    .eq('status', 'finalizada')
    .order('created_at', { ascending: false });

  let queryAgendamentos = supabase
    .from('agendamentos')
    .select(`
      id,
      cliente_id,
      data,
      horario_inicio,
      status,
      clientes (id, nome),
      profissionais (nome),
      servicos (nome, preco_padrao)
    `)
    .in('status', ['concluido', 'em_atendimento', 'agendado'])
    .order('data', { ascending: false });

  if (clienteId) {
    queryComandas = queryComandas.eq('cliente_id', clienteId);
    queryAgendamentos = queryAgendamentos.eq('cliente_id', clienteId);
  }

  const [{ data: comandasData, error: errCmd }, { data: agendamentosData, error: errApt }] =
    await Promise.all([queryComandas, queryAgendamentos]);

  if (errCmd) {
    console.error('Erro ao buscar histórico de comandas:', errCmd);
  }
  if (errApt) {
    console.error('Erro ao buscar histórico de agendamentos:', errApt);
  }

  const agendamentosComComanda = new Set<string>();
  const resultado: HistoricoClienteItem[] = [];

  (comandasData || []).forEach((c: any) => {
    const apt = Array.isArray(c.agendamentos) ? c.agendamentos[0] : c.agendamentos;
    const agendamentoId = c.agendamento_id || apt?.id;
    if (agendamentoId) {
      agendamentosComComanda.add(agendamentoId);
    }

    const fallbackDt = extrairDataHoraISO(c.finalizada_em || c.created_at);
    const dataAtendimento = apt?.data || fallbackDt.data;
    const horarioAtendimento = apt?.horario_inicio ? apt.horario_inicio.slice(0, 5) : fallbackDt.horario;

    const clienteNome = c.clientes?.nome || 'Cliente';
    const comandaNumero = `#${String(c.numero_sequencial || 1).padStart(4, '0')}`;
    const itens = Array.isArray(c.comanda_itens) ? c.comanda_itens : [];

    if (itens.length > 0) {
      itens.forEach((it: any, idx: number) => {
        const servicoNome = it.servicos?.nome || apt?.servicos?.nome || 'Atendimento';
        const profissionalNome = it.profissionais?.nome || apt?.profissionais?.nome || 'Profissional';
        const valorItem = Number(it.preco_unitario || 0) * Number(it.quantidade || 1);

        resultado.push({
          id: `cmd-item-${it.id || `${c.id}-${idx}`}`,
          clienteId: c.cliente_id || '',
          clienteNome,
          servicoNome,
          profissionalNome,
          data: dataAtendimento,
          horario: horarioAtendimento,
          valor: valorItem,
          comandaNumero,
          status: 'concluido',
        });
      });
    } else {
      resultado.push({
        id: `cmd-${c.id}`,
        clienteId: c.cliente_id || '',
        clienteNome,
        servicoNome: apt?.servicos?.nome || 'Atendimento',
        profissionalNome: apt?.profissionais?.nome || 'Profissional',
        data: dataAtendimento,
        horario: horarioAtendimento,
        valor: Number(c.valor_total || 0),
        comandaNumero,
        status: 'concluido',
      });
    }
  });

  (agendamentosData || []).forEach((a: any) => {
    if (agendamentosComComanda.has(a.id)) return;

    const statusNorm: 'concluido' | 'em_atendimento' | 'agendado' =
      a.status === 'em_atendimento'
        ? 'em_atendimento'
        : a.status === 'agendado'
        ? 'agendado'
        : 'concluido';

    resultado.push({
      id: `apt-${a.id}`,
      clienteId: a.cliente_id || '',
      clienteNome: a.clientes?.nome || 'Cliente',
      servicoNome: a.servicos?.nome || 'Serviço',
      profissionalNome: a.profissionais?.nome || 'Profissional',
      data: a.data || extrairDataHoraISO(null).data,
      horario: a.horario_inicio ? a.horario_inicio.slice(0, 5) : '08:00',
      valor: Number(a.servicos?.preco_padrao || 0),
      comandaNumero: undefined,
      status: statusNorm,
    });
  });

  resultado.sort((a, b) => {
    const cmpData = b.data.localeCompare(a.data);
    if (cmpData !== 0) return cmpData;
    return (b.horario || '').localeCompare(a.horario || '');
  });

  return resultado;
}

export async function buscarNomesProfissionais(): Promise<string[]> {
  const { data, error } = await supabase
    .from('profissionais')
    .select('nome')
    .eq('status', 'ativo')
    .or('especialidade.neq.__removido__,especialidade.is.null')
    .order('nome', { ascending: true });

  if (error || !data) return [];
  return data.map((p: any) => p.nome).filter(Boolean);
}
