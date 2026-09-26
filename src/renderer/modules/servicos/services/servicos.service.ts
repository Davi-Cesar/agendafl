import { supabase } from '@shared/supabase/client';
import type { Servico, CategoriaServico, CriarServicoDTO } from '../schemas/servico.schema';
import type { ProfissionalResumo } from '../types/servicos.types';

export async function buscarServicos(
  busca: string = '',
  categoriaId: string | null = null,
  pagina: number = 1,
  limite: number = 10
): Promise<{ servicos: Servico[]; total: number }> {
  let query = supabase
    .from('servicos')
    .select(`
      id,
      categoria_id,
      nome,
      preco_padrao,
      duracao_minutos,
      ativo,
      created_at,
      categorias_servicos (
        id,
        nome
      ),
      profissionais_servicos (
        profissional_id,
        profissionais (
          id,
          nome
        )
      )
    `, { count: 'exact' });

  if (busca.trim()) {
    const term = `%${busca.trim()}%`;
    query = query.or(`nome.ilike.${term}`);
  }

  if (categoriaId) {
    query = query.eq('categoria_id', categoriaId);
  }

  const offset = (pagina - 1) * limite;
  query = query.order('nome', { ascending: true }).range(offset, offset + limite - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('Erro ao buscar serviços no Supabase:', error);
    return { servicos: [], total: 0 };
  }

  const servicos: Servico[] = (data || []).map((s: any) => {
    const catNome = s.categorias_servicos?.nome || null;
    const profsRel = Array.isArray(s.profissionais_servicos) ? s.profissionais_servicos : [];
    
    const profsIds: string[] = [];
    const profsNomes: string[] = [];

    profsRel.forEach((ps: any) => {
      if (ps.profissionais && ps.profissionais.id) {
        profsIds.push(ps.profissionais.id);
        profsNomes.push(ps.profissionais.nome);
      } else if (ps.profissional_id) {
        profsIds.push(ps.profissional_id);
      }
    });

    return {
      id: s.id,
      categoriaId: s.categoria_id || null,
      categoriaNome: catNome,
      nome: s.nome || '',
      descricao: s.descricao || null,
      precoPadrao: Number(s.preco_padrao) || 0,
      duracaoMinutos: Number(s.duracao_minutos) || 30,
      ativo: s.ativo ?? true,
      profissionaisIds: profsIds,
      profissionaisNomes: profsNomes,
      createdAt: s.created_at,
    };
  });

  return { servicos, total: count ?? servicos.length };
}

export async function buscarCategorias(): Promise<CategoriaServico[]> {
  const { data, error } = await supabase
    .from('categorias_servicos')
    .select('id, nome, created_at')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao buscar categorias no Supabase:', error);
    return [];
  }

  return (data || []).map((c: any) => ({
    id: c.id,
    nome: c.nome || '',
    createdAt: c.created_at,
  }));
}

export async function criarCategoria(nome: string): Promise<CategoriaServico> {
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) {
    throw new Error('Nome da categoria é obrigatório.');
  }

  // Pre-check se a categoria já existe (case-insensitive)
  const { data: categoriaExistente } = await supabase
    .from('categorias_servicos')
    .select('id, nome, created_at')
    .ilike('nome', nomeLimpo)
    .maybeSingle();

  if (categoriaExistente) {
    return {
      id: categoriaExistente.id,
      nome: categoriaExistente.nome,
      createdAt: categoriaExistente.created_at,
    };
  }

  const { data, error } = await supabase
    .from('categorias_servicos')
    .insert({ nome: nomeLimpo })
    .select()
    .single();

  if (error || !data) {
    console.error('Erro ao criar categoria no Supabase:', error);
    let msg = error?.message || 'Falha ao criar categoria';
    if (error?.code === '23505' || msg.includes('unique constraint') || msg.includes('uk_categorias_servicos_nome')) {
      msg = `A categoria "${nomeLimpo}" já está cadastrada.`;
    }
    throw new Error(msg);
  }

  return {
    id: data.id,
    nome: data.nome,
    createdAt: data.created_at,
  };
}

export async function buscarProfissionaisDisponiveis(): Promise<ProfissionalResumo[]> {
  const { data, error } = await supabase
    .from('profissionais')
    .select('id, nome')
    .eq('status', 'ativo')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao buscar profissionais disponíveis:', error);
    return [];
  }

  return (data || []).map((p: any) => ({
    id: p.id,
    nome: p.nome || '',
  }));
}

export async function salvarServicoNoSupabase(dados: CriarServicoDTO): Promise<Servico> {
  const payload: any = {
    nome: dados.nome,
    categoria_id: dados.categoriaId || null,
    preco_padrao: dados.precoPadrao,
    duracao_minutos: dados.duracaoMinutos,
    ativo: dados.ativo ?? true,
  };

  if (dados.descricao) {
    payload.descricao = dados.descricao;
  }

  let query;
  if (dados.id) {
    query = supabase.from('servicos').update(payload).eq('id', dados.id).select().single();
  } else {
    query = supabase.from('servicos').insert(payload).select().single();
  }

  const { data: servicoSalvo, error } = await query;

  if (error || !servicoSalvo) {
    console.error('Erro ao salvar serviço no Supabase:', error);
    throw new Error(`Erro ao salvar serviço: ${error?.message || 'Falha na operação'}`);
  }

  // Sincronizar tabela pivô profissionais_servicos
  if (dados.profissionaisIds) {
    // Remover associações existentes
    await supabase
      .from('profissionais_servicos')
      .delete()
      .eq('servico_id', servicoSalvo.id);

    // Inserir novas associações
    if (dados.profissionaisIds.length > 0) {
      const novapivo = dados.profissionaisIds.map((profId) => ({
        servico_id: servicoSalvo.id,
        profissional_id: profId,
      }));

      const { error: errPivo } = await supabase.from('profissionais_servicos').insert(novapivo);
      if (errPivo) {
        console.error('Erro ao vincular profissionais ao serviço:', errPivo);
      }
    }
  }

  // Re-buscar serviço atualizado com JOINs
  const { servicos } = await buscarServicos(servicoSalvo.nome, null, 1, 1);
  return servicos[0] || {
    id: servicoSalvo.id,
    categoriaId: servicoSalvo.categoria_id,
    categoriaNome: null,
    nome: servicoSalvo.nome,
    descricao: servicoSalvo.descricao || null,
    precoPadrao: Number(servicoSalvo.preco_padrao),
    duracaoMinutos: Number(servicoSalvo.duracao_minutos),
    ativo: servicoSalvo.ativo,
    profissionaisIds: dados.profissionaisIds || [],
    profissionaisNomes: [],
    createdAt: servicoSalvo.created_at,
  };
}

export async function excluirServicoNoSupabase(id: string): Promise<void> {
  // Desativa o serviço (soft delete via ativo = false)
  const { error } = await supabase
    .from('servicos')
    .update({ ativo: false })
    .eq('id', id);

  if (error) {
    console.error('Erro ao desativar serviço no Supabase:', error);
    throw new Error(`Erro ao excluir serviço: ${error.message}`);
  }
}
