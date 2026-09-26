import { z } from 'zod';

export const CategoriaServicoSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(2, 'Nome da categoria é obrigatório'),
  createdAt: z.string().optional(),
});

export type CategoriaServico = z.infer<typeof CategoriaServicoSchema>;

export const ServicoSchema = z.object({
  id: z.string().uuid(),
  categoriaId: z.string().uuid().optional().nullable(),
  categoriaNome: z.string().optional().nullable(),
  nome: z.string().min(2, 'Nome do serviço deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional().nullable(),
  precoPadrao: z.number().min(0, 'Preço padrão deve ser maior ou igual a zero'),
  duracaoMinutos: z.number().positive('Duração deve ser um valor positivo em minutos'),
  ativo: z.boolean().default(true),
  profissionaisIds: z.array(z.string().uuid()).default([]),
  profissionaisNomes: z.array(z.string()).default([]),
  createdAt: z.string().optional(),
});

export type Servico = z.infer<typeof ServicoSchema>;

export const CriarServicoDTOSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(2, 'Nome do serviço é obrigatório'),
  descricao: z.string().optional().nullable(),
  categoriaId: z.string().uuid().optional().nullable(),
  precoPadrao: z.number().min(0, 'Preço inválido'),
  duracaoMinutos: z.number().positive('Duração deve ser maior que 0'),
  profissionaisIds: z.array(z.string().uuid()).default([]),
  ativo: z.boolean().default(true),
});

export type CriarServicoDTO = z.infer<typeof CriarServicoDTOSchema>;
