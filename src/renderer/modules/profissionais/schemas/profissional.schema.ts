import { z } from 'zod';

export const ProfissionalStatusSchema = z.enum(['ativo', 'inativo']);
export type ProfissionalStatus = z.infer<typeof ProfissionalStatusSchema>;

export type TipoExcecaoHorario = 'atendimento_extra' | 'indisponibilidade' | 'bloqueio';

export interface ExcecaoHorario {
  id: string;
  profissionalId?: string;
  data: string; // Data específica YYYY-MM-DD
  inicio: string; // HH:mm
  fim: string; // HH:mm
  tipo: TipoExcecaoHorario; // 'atendimento_extra' | 'indisponibilidade'
  motivo?: string;
}

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
  excecoes: z.array(z.object({
    id: z.string(),
    data: z.string(),
    inicio: z.string(),
    fim: z.string(),
    tipo: z.enum(['atendimento_extra', 'indisponibilidade', 'bloqueio']).default('indisponibilidade'),
    motivo: z.string().optional(),
  })).optional().default([]),
});

export type ProfissionalHorario = z.infer<typeof ProfissionalHorarioSchema>;

export const ProfissionalServicoSchema = z.object({
  profissionalId: z.string().uuid(),
  servicoId: z.string().uuid(),
  servicoNome: z.string().optional(),
});

export type ProfissionalServico = z.infer<typeof ProfissionalServicoSchema>;
