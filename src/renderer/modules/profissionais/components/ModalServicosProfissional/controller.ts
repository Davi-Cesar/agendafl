import { useState, useEffect } from 'react';
import { useProfissionaisStore as useProfStore } from '../../store/profissionais.store';

export function useModalServicosProfissionalController() {
  const modalAberto = useProfStore((s) => s.modalServicosAberto);
  const setModalServicosAberto = useProfStore((s) => s.setModalServicosAberto);
  const todosServicos = useProfStore((s) => s.todosServicos);
  const categorias = useProfStore((s) => s.categorias);
  const servicosDoProfissional = useProfStore((s) => s.servicosDoProfissional);
  const salvarServicos = useProfStore((s) => s.salvarServicos);
  const profissionalId = useProfStore((s) => s.profissionalSelecionadoId);
  const profissionais = useProfStore((s) => s.profissionais);

  const profissionalAtual = profissionais.find((p) => p.id === profissionalId);

  const [selecionadosMap, setSelecionadosMap] = useState<Record<string, boolean>>({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const map: Record<string, boolean> = {};
    servicosDoProfissional.forEach((s) => {
      map[s.id] = true;
    });
    setSelecionadosMap(map);
  }, [servicosDoProfissional, modalAberto]);

  // Agrupamento por categorias
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

  const servicosSemCategoria = todosServicos.filter(
    (s) => !s.categoriaId || !categorias.some((c) => c.id === s.categoriaId)
  );

  const totalSelecionados = Object.values(selecionadosMap).filter(Boolean).length;

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

  const toggleServico = (id: string) => {
    setSelecionadosMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selecionarTodos = () => {
    const next: Record<string, boolean> = {};
    todosServicos.forEach((s) => {
      next[s.id] = true;
    });
    setSelecionadosMap(next);
  };

  const limparSelecao = () => {
    setSelecionadosMap({});
  };

  const handleFechar = () => {
    setModalServicosAberto(false);
  };

  const handleSalvar = async () => {
    setSalvando(true);
    const ids = Object.keys(selecionadosMap).filter((id) => selecionadosMap[id]);
    try {
      await salvarServicos(ids);
      setSalvando(false);
      handleFechar();
    } catch (err) {
      console.error('Erro ao vincular serviços:', err);
      setSalvando(false);
    }
  };

  return {
    modalAberto,
    profissionalAtual,
    todosServicos,
    categoriasComServicos,
    servicosSemCategoria,
    selecionadosMap,
    totalSelecionados,
    totalTodosServicos: todosServicos.length,
    toggleCategoria,
    toggleServico,
    selecionarTodos,
    limparSelecao,
    salvando,
    handleFechar,
    handleSalvar,
  };
}
