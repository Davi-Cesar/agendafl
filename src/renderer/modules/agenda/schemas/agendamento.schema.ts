import { z } from 'zod';

export const StatusAgendamentoSchema = z.enum(['agendado', 'em_atendimento', 'concluido', 'faltou']);
export const StatusComandaSchema = z.enum(['rascunho', 'finalizada', 'cancelada']);

export const ProfissionalSchema = z.object({
  id: z.string(),
  nome: z.string(),
  especialidade: z.string(),
});

export const ServicoItemSchema = z.object({
  id: z.string(),
  nome: z.string(),
  duracaoMinutos: z.number(),
});

export const AgendamentoSchema = z.object({
  id: z.string(),
  profissionalId: z.string(),
  clienteId: z.string().optional(),
  clienteNome: z.string().min(1, 'Nome do cliente é obrigatório'),
  servicoId: z.string().optional(),
  servico: z.string().min(1, 'Serviço é obrigatório'),
  valor: z.number().optional(),
  data: z.string().optional(),
  horarioInicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM inválido'),
  horarioFim: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM inválido'),
  status: StatusAgendamentoSchema,
  countdown: z.string().optional(),
  comandaId: z.string().optional(),
  comandaNumero: z.string().optional(),
  comandaStatus: StatusComandaSchema.optional(),
  observacoes: z.string().optional(),
});

export const CriarAgendamentoDTO = z.object({
  clienteNome: z.string().min(1, 'Nome do cliente é obrigatório'),
  servico: z.string().min(1, 'Selecione um serviço'),
  profissionalId: z.string().min(1, 'Selecione um profissional'),
  data: z.string().min(1, 'Informe a data'),
  horarioInicio: z.string().regex(/^\d{2}:\d{2}$/, 'Informe o horário no formato HH:MM'),
  horarioFim: z.string().regex(/^\d{2}:\d{2}$/, 'Informe o horário no formato HH:MM'),
  observacoes: z.string().optional(),
});

export type StatusAgendamento = z.infer<typeof StatusAgendamentoSchema>;
export type StatusComanda = z.infer<typeof StatusComandaSchema>;
export type Profissional = z.infer<typeof ProfissionalSchema>;
export type ServicoItem = z.infer<typeof ServicoItemSchema>;
export type Agendamento = z.infer<typeof AgendamentoSchema>;
export type CriarAgendamentoInput = z.infer<typeof CriarAgendamentoDTO>;
