import { supabase } from '@shared/supabase/client';
import type { ComandaListItem } from '../schemas/comanda.schema';

export async function buscarComandas(): Promise<ComandaListItem[]> {
  const { data, error } = await supabase
    .from('comandas')
    .select(`
      id,
      numero_sequencial,
      status,
      valor_total,
      created_at,
      clientes (nome),
      agendamentos (
        id,
        horario_inicio,
        horario_fim,
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
    return {
      agendamentoId: apt?.id || '',
      clienteNome: c.clientes?.nome || 'Cliente',
      comandaId: c.id,
      comandaNumero: `#${c.numero_sequencial || '0000'}`,
      comandaStatus: c.status === 'aberta' ? 'rascunho' : c.status,
      horarioInicio: (apt?.horario_inicio || '08:00').slice(0, 5),
      horarioFim: (apt?.horario_fim || '09:00').slice(0, 5),
      valor: Number(c.valor_total || 0),
      profissionalNome: apt?.profissionais?.nome || 'Profissional',
      servico: apt?.servicos?.nome || 'Atendimento',
    };
  });
}
