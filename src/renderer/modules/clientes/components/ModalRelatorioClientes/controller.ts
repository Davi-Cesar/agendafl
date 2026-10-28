import { useState, useMemo, useCallback } from 'react';
import { useClientesStore } from '../../store/clientes.store';

export function useModalRelatorioClientesController() {
  const modalAberto = useClientesStore((s) => s.modalRelatorioAberto);
  const relatorioAtendimentos = useClientesStore((s) => s.relatorioAtendimentos);
  const carregandoRelatorio = useClientesStore((s) => s.carregandoRelatorio);
  const nomesProfissionais = useClientesStore((s) => s.nomesProfissionais);
  const fecharModalRelatorio = useClientesStore((s) => s.fecharModalRelatorio);

  const [busca, setBusca] = useState('');
  const [filtroProfissional, setFiltroProfissional] = useState('todos');
  const [filtroServico, setFiltroServico] = useState('todos');
  const [filtroData, setFiltroData] = useState('');

  const listaProfissionais = useMemo(() => {
    const doRelatorio = relatorioAtendimentos.map((item) => item.profissionalNome);
    return Array.from(new Set([...nomesProfissionais, ...doRelatorio])).filter(Boolean).sort();
  }, [relatorioAtendimentos, nomesProfissionais]);

  const listaServicos = useMemo(() => {
    return Array.from(new Set(relatorioAtendimentos.map((item) => item.servicoNome))).sort();
  }, [relatorioAtendimentos]);

  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return relatorioAtendimentos.filter((item) => {
      const matchProf = filtroProfissional === 'todos' || item.profissionalNome === filtroProfissional;
      const matchServico = filtroServico === 'todos' || item.servicoNome === filtroServico;
      const matchData = !filtroData || item.data === filtroData;
      const matchBusca =
        !termo ||
        item.clienteNome.toLowerCase().includes(termo) ||
        item.servicoNome.toLowerCase().includes(termo) ||
        item.profissionalNome.toLowerCase().includes(termo) ||
        (item.comandaNumero && item.comandaNumero.toLowerCase().includes(termo));

      return matchProf && matchServico && matchData && matchBusca;
    });
  }, [relatorioAtendimentos, busca, filtroProfissional, filtroServico, filtroData]);

  const totalValorFiltrado = useMemo(() => {
    return itensFiltrados.reduce((acc, item) => acc + item.valor, 0);
  }, [itensFiltrados]);

  const temFiltrosAtivos =
    Boolean(busca.trim()) ||
    filtroProfissional !== 'todos' ||
    filtroServico !== 'todos' ||
    Boolean(filtroData);

  const handleLimparFiltros = useCallback(() => {
    setBusca('');
    setFiltroProfissional('todos');
    setFiltroServico('todos');
    setFiltroData('');
  }, []);

  const handleFechar = useCallback(() => {
    fecharModalRelatorio();
  }, [fecharModalRelatorio]);

  return {
    modalAberto,
    carregandoRelatorio,
    itensFiltrados,
    totalCount: itensFiltrados.length,
    totalValorFiltrado,
    busca,
    setBusca,
    filtroProfissional,
    setFiltroProfissional,
    filtroServico,
    setFiltroServico,
    filtroData,
    setFiltroData,
    listaProfissionais,
    listaServicos,
    temFiltrosAtivos,
    handleLimparFiltros,
    handleFechar,
  };
}
