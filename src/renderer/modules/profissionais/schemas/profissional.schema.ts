import { z } from 'zod';

export const ProfissionalStatusSchema = z.enum(['ativo', 'inativo']);
export type ProfissionalStatus = z.infer<typeof ProfissionalStatusSchema>;

export const TipoExcecaoHorarioSchema = z.enum(['atendimento_extra', 'indisponibilidade', 'bloqueio']);
export type TipoExcecaoHorario = z.infer<typeof TipoExcecaoHorarioSchema>;

export const ExcecaoHorarioSchema = z.object({
  id: z.string(),
  profissionalId: z.string().optional(),
  data: z.string(), // YYYY-MM-DD
  inicio: z.string(), // HH:mm
  fim: z.string(), // HH:mm
  tipo: TipoExcecaoHorarioSchema,
  motivo: z.string().optional().nullable(),
});

export type ExcecaoHorario = z.infer<typeof ExcecaoHorarioSchema>;

export const CriarExcecaoHorarioDTOSchema = z.object({
  profissionalId: z.string().min(1, 'Selecione um profissional'),
  data: z.string().min(1, 'A data específica é obrigatória'),
  inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Horário de início inválido (HH:MM)'),
  fim: z.string().regex(/^\d{2}:\d{2}$/, 'Horário de fim inválido (HH:MM)'),
  tipo: TipoExcecaoHorarioSchema.default('atendimento_extra'),
  motivo: z.string().optional(),
}).refine((data) => {
  const [hI, mI] = data.inicio.split(':').map(Number);
  const [hF, mF] = data.fim.split(':').map(Number);
  return hF * 60 + mF > hI * 60 + mI;
}, {
  message: 'O horário de fim deve ser posterior ao horário de início.',
  path: ['fim'],
});

export type CriarExcecaoHorarioDTO = z.infer<typeof CriarExcecaoHorarioDTOSchema>;

export const ProfissionalSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  especialidade: z.string().optional().nullable(),
  email: z.string().email('E-mail inválido').optional().nullable().or(z.literal('')),
  telefone: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  dataNascimento: z.string().optional().nullable(),
  comissaoPercentual: z.number().default(60),
  status: ProfissionalStatusSchema.default('ativo'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Profissional = z.infer<typeof ProfissionalSchema>;

export const CriarProfissionalDTOSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  especialidade: z.string().optional().nullable(),
  email: z.string().email('E-mail inválido').optional().nullable().or(z.literal('')),
  telefone: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  dataNascimento: z.string().optional().nullable(),
  comissaoPercentual: z.number().min(0).max(100).default(60),
  status: ProfissionalStatusSchema.default('ativo'),
});

export type CriarProfissionalDTO = z.infer<typeof CriarProfissionalDTOSchema>;

export const ProfissionalHorarioSchema = z.object({
  id: z.string().optional(),
  profissionalId: z.string().uuid(),
  diaSemana: z.number().min(0).max(6), // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
  ativo: z.boolean().default(true),
  manhaInicio: z.string().default('08:00'),
  manhaFim: z.string().default('11:00'),
  tardeInicio: z.string().default('13:30'),
  tardeFim: z.string().default('17:00'),
  intervaloAlmoco: z.string().optional().default('11:00 - 13:30'),
  excecoes: z.array(ExcecaoHorarioSchema).optional().default([]),
});

export type ProfissionalHorario = z.infer<typeof ProfissionalHorarioSchema>;

export const ProfissionalServicoSchema = z.object({
  profissionalId: z.string().uuid(),
  servicoId: z.string().uuid(),
  servicoNome: z.string().optional(),
});

export type ProfissionalServico = z.infer<typeof ProfissionalServicoSchema>;
