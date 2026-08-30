import { z } from 'zod';

export const ComandaListItemSchema = z.object({
  agendamentoId: z.string(),
  clienteNome: z.string(),
  comandaId: z.string(),
  comandaNumero: z.string(),
  comandaStatus: z.enum(['rascunho', 'finalizada', 'cancelada']),
  horarioInicio: z.string(),
  valor: z.number(),
  profissionalNome: z.string(),
  servico: z.string(),
  horarioFim: z.string(),
});

export type ComandaListItem = z.infer<typeof ComandaListItemSchema>;
