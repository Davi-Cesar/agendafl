import { useEffect } from 'react';
import { useServicosStore } from '../../store/servicos.store';

export function useServicosViewController() {
  const servicos = useServicosStore((s) => s.servicos);
  const categorias = useServicosStore((s) => s.categorias);
  const totalServicos = useServicosStore((s) => s.totalServicos);
  const busca = useServicosStore((s) => s.busca);
  const categoriaIdFiltro = useServicosStore((s) => s.categoriaIdFiltro);
  const paginaAtual = useServicosStore((s) => s.paginaAtual);
  const itensPorPagina = useServicosStore((s) => s.itensPorPagina);
  const carregando = useServicosStore((s) => s.carregando);

  const setBusca = useServicosStore((s) => s.setBusca);
  const setCategoriaIdFiltro = useServicosStore((s) => s.setCategoriaIdFiltro);
  const setPaginaAtual = useServicosStore((s) => s.setPaginaAtual);
  const setItensPorPagina = useServicosStore((s) => s.setItensPorPagina);
  const carregarServicos = useServicosStore((s) => s.carregarServicos);
  const carregarCategorias = useServicosStore((s) => s.carregarCategorias);

  const abrirModalNovo = useServicosStore((s) => s.abrirModalNovo);
  const abrirModalExcluir = useServicosStore((s) => s.abrirModalExcluir);

  useEffect(() => {
    carregarServicos();
    carregarCategorias();
  }, [carregarServicos, carregarCategorias]);

  const handleLimparFiltros = () => {
    setBusca('');
    setCategoriaIdFiltro(null);
  };

  const formatarPrecoBR = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  return {
    servicos,
    categorias,
    totalServicos,
    busca,
    categoriaIdFiltro,
    paginaAtual,
    itensPorPagina,
    carregando,
    setBusca,
    setCategoriaIdFiltro,
    setPaginaAtual,
    setItensPorPagina,
    handleLimparFiltros,
    formatarPrecoBR,
    abrirModalNovo,
    abrirModalExcluir,
  };
}
