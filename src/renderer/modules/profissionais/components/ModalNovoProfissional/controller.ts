import { useState, useEffect } from 'react';
import { useProfissionaisStore } from '../../store/profissionais.store';
import { CriarProfissionalDTOSchema, type Profissional } from '../../schemas/profissional.schema';
import { formatarNomeProprio } from '@shared/lib/formatters';

export function useModalNovoProfissionalController() {
  const modalAberto = useProfissionaisStore((s) => s.modalNovoAberto);
  const profissionalParaEditar = useProfissionaisStore((s) => s.profissionalParaEditar);
  const setModalNovoAberto = useProfissionaisStore((s) => s.setModalNovoAberto);
  const salvarProfissional = useProfissionaisStore((s) => s.salvarProfissional);

  const todosServicos = useProfissionaisStore((s) => s.todosServicos);
  const categorias = useProfissionaisStore((s) => s.categorias);
  const servicosDoProfissional = useProfissionaisStore((s) => s.servicosDoProfissional);

  const [nome, setNomeState] = useState('');
  const setNome = (valor: string) => setNomeState(formatarNomeProprio(valor));
  const [especialidade, setEspecialidadeState] = useState('');
  const setEspecialidade = (valor: string) => setEspecialidadeState(formatarNomeProprio(valor));
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const comissaoPercentual = 60; // Sempre 60% por regra do negócio (não editável)
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Mapa de serviços selecionados { [servicoId]: boolean }
  const [selecionadosMap, setSelecionadosMap] = useState<Record<string, boolean>>({});
  const [mostrarDetalhesServicos, setMostrarDetalhesServicos] = useState(false);

  useEffect(() => {
    if (profissionalParaEditar) {
      setNomeState(profissionalParaEditar.nome || '');
      setEspecialidadeState(profissionalParaEditar.especialidade || '');
      setEmail(profissionalParaEditar.email || '');
      setTelefone(profissionalParaEditar.telefone || '');
      setCpf(profissionalParaEditar.cpf || '');
      setStatus(profissionalParaEditar.status || 'ativo');

      const map: Record<string, boolean> = {};
      servicosDoProfissional.forEach((s) => {
        map[s.id] = true;
      });
      setSelecionadosMap(map);
    } else {
      setNomeState('');
      setEspecialidadeState('');
      setEmail('');
      setTelefone('');
      setCpf('');
      setStatus('ativo');
      setSelecionadosMap({});
    }
    setMostrarDetalhesServicos(false);
    setErro(null);
  }, [profissionalParaEditar, modalAberto, servicosDoProfissional]);

  // Estrutura agregada de categorias com seus respectivos serviços
  const categoriasComServicos = categorias.map((cat) => {
    const servicosDaCat = todosServicos.filter((s) => s.categoriaId === cat.id);
    const totalServicos = servicosDaCat.length;
    const totalSelecionados = servicosDaCat.filter((s) => selecionadosMap[s.id]).length;
    const isTodas = totalServicos > 0 && totalSelecionados === totalServicos;
    const isParcial = totalSelecionados > 0 && totalSelecionados < totalServicos;

    return {
      id: cat.id,
      nome: cat.nome,
      servicos: servicosDaCat,
      totalServicos,
      totalSelecionados,
      isTodas,
      isParcial,
    };
  });

  // Serviços sem categoria associada
  const servicosSemCategoria = todosServicos.filter(
    (s) => !s.categoriaId || !categorias.some((c) => c.id === s.categoriaId)
  );

  const totalServicosSelecionados = Object.values(selecionadosMap).filter(Boolean).length;

  /**
   * Clicar em uma categoria: se todos estiverem marcados, desmarca todos da categoria.
   * Caso contrário (nenhum ou parcial), marca AUTOMATICAMENTE todos os serviços daquela categoria!
   */
  const toggleCategoria = (categoriaId: string) => {
    const servicosDaCat = todosServicos.filter((s) => s.categoriaId === categoriaId);
    if (servicosDaCat.length === 0) return;

    const todosJaMarcados = servicosDaCat.every((s) => selecionadosMap[s.id]);

    setSelecionadosMap((prev) => {
      const next = { ...prev };
      servicosDaCat.forEach((s) => {
        next[s.id] = !todosJaMarcados;
      });
      return next;
    });
  };

  /**
   * Alterna um serviço individual específico
   */
  const toggleServico = (servicoId: string) => {
    setSelecionadosMap((prev) => ({
      ...prev,
      [servicoId]: !prev[servicoId],
    }));
  };

  /**
   * Seleciona todos os serviços de todas as categorias
   */
  const selecionarTodos = () => {
    const next: Record<string, boolean> = {};
    todosServicos.forEach((s) => {
      next[s.id] = true;
    });
    setSelecionadosMap(next);
  };

  /**
   * Limpa todas as seleções de serviços
   */
  const limparSelecao = () => {
    setSelecionadosMap({});
  };

  const handleFechar = () => {
    setModalNovoAberto(false);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();

    const parseResult = CriarProfissionalDTOSchema.safeParse({
      nome: nome.trim(),
      especialidade: especialidade.trim() || null,
      email: email.trim() || null,
      telefone: telefone.trim() || null,
      cpf: cpf.trim() || null,
      comissaoPercentual: 60,
      status,
    });

    if (!parseResult.success) {
      setErro(parseResult.error.issues[0]?.message || 'Dados inválidos');
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      const dados: Partial<Profissional> = {
        id: profissionalParaEditar?.id,
        ...parseResult.data,
      };

      const servicoIds = Object.keys(selecionadosMap).filter((id) => selecionadosMap[id]);

      await salvarProfissional(dados, servicoIds);
      setSalvando(false);
      handleFechar();
    } catch (err: any) {
      console.error('Erro ao salvar profissional:', err);
      setErro(err.message || 'Falha ao salvar profissional');
      setSalvando(false);
    }
  };

  return {
    modalAberto,
    isEdicao: !!profissionalParaEditar,
    nome,
    setNome,
    especialidade,
    setEspecialidade,
    email,
    setEmail,
    telefone,
    setTelefone,
    cpf,
    setCpf,
    comissaoPercentual,
    status,
    setStatus,
    salvando,
    erro,
    categoriasComServicos,
    servicosSemCategoria,
    selecionadosMap,
    totalServicosSelecionados,
    totalTodosServicos: todosServicos.length,
    mostrarDetalhesServicos,
    setMostrarDetalhesServicos,
    toggleCategoria,
    toggleServico,
    selecionarTodos,
    limparSelecao,
    handleFechar,
    handleSalvar,
  };
}
