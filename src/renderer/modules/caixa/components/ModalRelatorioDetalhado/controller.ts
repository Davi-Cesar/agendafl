import { useState, useMemo, useCallback } from 'react';
import { useCaixaStore } from '../../store/caixa.store';

export function useModalRelatorioDetalhadoController() {
  const modalAberto = useCaixaStore((s) => s.modalRelatorioAberto);
  const relatorioItens = useCaixaStore((s) => s.relatorioItens);
  const fecharModal = useCaixaStore((s) => s.fecharModalRelatorio);

  const [filtroProfissional, setFiltroProfissional] = useState<string>('todos');
  const [filtroFormaPagamento, setFiltroFormaPagamento] = useState<string>('todas');
  const [busca, setBusca] = useState<string>('');

  const listaProfissionais = useMemo(() => {
    return Array.from(new Set(relatorioItens.map((item) => item.profissionalNome))).sort();
  }, [relatorioItens]);

  const itensFiltrados = useMemo(() => {
    return relatorioItens.filter((item) => {
      const matchProf = filtroProfissional === 'todos' || item.profissionalNome === filtroProfissional;
      const matchForma =
        filtroFormaPagamento === 'todas' || item.formaPagamento.toLowerCase() === filtroFormaPagamento.toLowerCase();
      const termo = busca.toLowerCase().trim();
      const matchBusca =
        !termo ||
        item.clienteNome.toLowerCase().includes(termo) ||
        item.servicoNome.toLowerCase().includes(termo) ||
        item.comandaNumero.toLowerCase().includes(termo) ||
        (item.detalheConta && item.detalheConta.toLowerCase().includes(termo));

      return matchProf && matchForma && matchBusca;
    });
  }, [relatorioItens, filtroProfissional, filtroFormaPagamento, busca]);

  const totalFiltrado = useMemo(() => {
    return itensFiltrados.reduce((acc, item) => acc + item.valor, 0);
  }, [itensFiltrados]);

  const handleLimparFiltros = useCallback(() => {
    setFiltroProfissional('todos');
    setFiltroFormaPagamento('todas');
    setBusca('');
  }, []);

  return {
    modalAberto,
    fecharModal,
    relatorioItens: itensFiltrados,
    filtroProfissional,
    setFiltroProfissional,
    filtroFormaPagamento,
    setFiltroFormaPagamento,
    busca,
    setBusca,
    listaProfissionais,
    totalFiltrado,
    totalCount: itensFiltrados.length,
    handleLimparFiltros,
  };
}

export type ModalRelatorioDetalhadoController = ReturnType<typeof useModalRelatorioDetalhadoController>;
