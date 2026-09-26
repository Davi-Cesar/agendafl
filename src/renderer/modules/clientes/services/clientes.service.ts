import { supabase } from '@shared/supabase/client';
import type { Cliente } from '../schemas/cliente.schema';
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
    removidoEm: c.removido_em || null,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }));

  return { clientes, total: count ?? clientes.length };
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
