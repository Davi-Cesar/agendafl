import { z } from 'zod';

export const ClienteStatusSchema = z.enum(['ativo', 'inativo']);
export type ClienteStatus = z.infer<typeof ClienteStatusSchema>;

export const ClienteSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  telefone: z.string().optional().nullable(),
  dataNascimento: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  status: ClienteStatusSchema.default('ativo'),
  removidoEm: z.string().optional().nullable(),
  anonimizadoEm: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Cliente = z.infer<typeof ClienteSchema>;

export const CriarClienteDTOSchema = z.object({
  nome: z.string().min(2, 'Nome é obrigatório'),
  telefone: z.string().min(8, 'Telefone é obrigatório'),
  dataNascimento: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  status: ClienteStatusSchema.default('ativo'),
});

export type CriarClienteDTO = z.infer<typeof CriarClienteDTOSchema>;
