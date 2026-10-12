import { z } from 'zod';

export const FormaPagamentoEnum = z.enum([
  'pix_bricia',
  'pix_flavia',
  'credito',
  'debito',
  'dinheiro',
]);

export type FormaPagamentoTipo = z.infer<typeof FormaPagamentoEnum>;

export const DescontoTipoSchema = z.enum(['percentual', 'valor_fixo']);
export type DescontoTipo = z.infer<typeof DescontoTipoSchema>;

export const DescontoOrigemSchema = z.enum(['aniversario', 'manual']);
export type DescontoOrigem = z.infer<typeof DescontoOrigemSchema>;

export const DescontoItemSchema = z.object({
  tipo: DescontoTipoSchema,
  valor: z.number().min(0, 'Valor de desconto deve ser maior ou igual a zero'),
  origem: DescontoOrigemSchema,
});
export type DescontoItem = z.infer<typeof DescontoItemSchema>;

export const ComandaItemSchema = z.object({
  id: z.string(),
  servicoId: z.string().optional(),
  profissionalId: z.string().optional(),
  descricao: z.string(),
  profissional: z.string(),
  quantidade: z.number().min(1),
  valorUnitario: z.number().min(0),
  desconto: DescontoItemSchema.optional().nullable(),
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
