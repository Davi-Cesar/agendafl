import { z } from 'zod';

export const FormaPagamentoEnum = z.enum([
  'pix_bricia',
  'pix_flavia',
  'credito',
  'debito',
  'dinheiro',
]);

export type FormaPagamentoTipo = z.infer<typeof FormaPagamentoEnum>;

export const ComandaItemSchema = z.object({
  id: z.string(),
  descricao: z.string(),
  profissional: z.string(),
  quantidade: z.number().min(1),
  valorUnitario: z.number().min(0),
});

export type ComandaItem = z.infer<typeof ComandaItemSchema>;

export const ComandaPagamentoSchema = z.object({
  forma: FormaPagamentoEnum,
  valor: z.number().positive(),
  detalheConta: z.string().optional(),
});

export type ComandaPagamentoInput = z.infer<typeof ComandaPagamentoSchema>;

export const ComandaListItemSchema = z.object({
  agendamentoId: z.string(),
  clienteNome: z.string(),
  comandaId: z.string(),
  comandaNumero: z.string(),
  comandaStatus: z.enum(['rascunho', 'finalizada', 'cancelada']),
  horarioInicio: z.string(),
  horarioFim: z.string(),
  valor: z.number(),
  profissionalNome: z.string(),
  servico: z.string(),
});

export type ComandaListItem = z.infer<typeof ComandaListItemSchema>;

export const ComandaDetalhesSchema = z.object({
  id: z.string(),
  agendamentoId: z.string().optional(),
  numeroSequencial: z.string(),
  clienteNome: z.string(),
  horarioInicio: z.string(),
  horarioFim: z.string(),
  status: z.enum(['rascunho', 'finalizada', 'cancelada']),
  itens: z.array(ComandaItemSchema),
  subtotal: z.number(),
  desconto: z.number(),
  valorTotal: z.number(),
  pagamentos: z.array(ComandaPagamentoSchema),
  created_at: z.string().optional(),
  finalizada_em: z.string().optional(),
});

export type ComandaDetalhes = z.infer<typeof ComandaDetalhesSchema>;
