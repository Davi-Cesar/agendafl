import { z } from 'zod';

export const StatusCaixaSchema = z.enum(['aberto', 'fechado']);

// TODO AUDITORIA DE USUÁRIOS:
// Quando a funcionalidade de login for implementada, adicionar:
// abertoPor: z.string().optional(),
// fechadoPor: z.string().optional(),
export const CaixaSchema = z.object({
  id: z.string(),
  status: StatusCaixaSchema,
  saldoInicial: z.number(),
  saldoFinalDinheiro: z.number().optional(),
  saldoFinalPix: z.number().optional(),
  saldoFinalCartaoCredito: z.number().optional(),
  saldoFinalCartaoDebito: z.number().optional(),
  totalComissoes: z.number().optional(),
  valorLiquido: z.number().optional(),
  totalGeral: z.number().optional(),
  abertoEm: z.string(),
  fechadoEm: z.string().optional(),
  observacoes: z.string().optional(),
});

export const TransacaoCaixaSchema = z.object({
  id: z.string(),
  horario: z.string(),
  clienteNome: z.string(),
  servicoNome: z.string(),
  metodo: z.string(),
  valor: z.number(),
  profissionalNome: z.string().optional(),
});

export const ComissaoProfissionalSchema = z.object({
  profissionalId: z.string(),
  profissionalNome: z.string(),
  quantidadeServicos: z.number(),
  totalComissao: z.number(),
});

export const CaixaTotalPixSchema = z.object({
  id: z.string().optional(),
  caixaId: z.string().optional(),
  nomeConta: z.string(),
  total: z.number(),
  quantidade: z.number(),
});

export const AbrirCaixaDTO = z.object({
  saldoInicial: z.number().min(0, 'O valor inicial deve ser maior ou igual a zero'),
});

export const FecharCaixaDTO = z.object({
  observacoes: z.string().optional(),
});

export const RelatorioDetalhadoItemSchema = z.object({
  comandaId: z.string(),
  comandaNumero: z.string(),
  clienteNome: z.string(),
  servicoNome: z.string(),
  profissionalNome: z.string(),
  formaPagamento: z.string(),
  detalheConta: z.string().optional(),
  valor: z.number(),
  horario: z.string(),
});

export type StatusCaixa = z.infer<typeof StatusCaixaSchema>;
export type Caixa = z.infer<typeof CaixaSchema>;
export type TransacaoCaixa = z.infer<typeof TransacaoCaixaSchema>;
export type ComissaoProfissional = z.infer<typeof ComissaoProfissionalSchema>;
export type CaixaTotalPix = z.infer<typeof CaixaTotalPixSchema>;
export type AbrirCaixaInput = z.infer<typeof AbrirCaixaDTO>;
export type FecharCaixaInput = z.infer<typeof FecharCaixaDTO>;
export type RelatorioDetalhadoItem = z.infer<typeof RelatorioDetalhadoItemSchema>;
