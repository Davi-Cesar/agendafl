import { useState, useMemo } from 'react';
import { useClientesStore } from '../../store/clientes.store';

export function useModalPerfilClienteController() {
  const modalAberto = useClientesStore((s) => s.modalPerfilAberto);
  const cliente = useClientesStore((s) => s.clienteSelecionado);
  const historicoCliente = useClientesStore((s) => s.historicoCliente);
  const carregandoHistorico = useClientesStore((s) => s.carregandoHistorico);
  const nomesProfissionais = useClientesStore((s) => s.nomesProfissionais);
  const fecharModais = useClientesStore((s) => s.fecharModais);
  const abrirModalNovo = useClientesStore((s) => s.abrirModalNovo);
  const abrirModalExcluir = useClientesStore((s) => s.abrirModalExcluir);

  const [filtroProfissional, setFiltroProfissional] = useState('todos');

  const listaProfissionais = useMemo(() => {
    const doHistorico = historicoCliente.map((h) => h.profissionalNome);
    return Array.from(new Set([...nomesProfissionais, ...doHistorico])).filter(Boolean).sort();
  }, [historicoCliente, nomesProfissionais]);

  const historicoFiltrado = useMemo(() => {
    return historicoCliente.filter((item) => {
      return filtroProfissional === 'todos' || item.profissionalNome === filtroProfissional;
    });
  }, [historicoCliente, filtroProfissional]);

  const handleFechar = () => {
    setFiltroProfissional('todos');
    fecharModais();
  };

  const handleEditar = () => {
    if (cliente) {
      abrirModalNovo(cliente);
    }
  };

  const handleExcluir = () => {
    if (cliente) {
      abrirModalExcluir(cliente);
    }
  };

  return {
    modalAberto,
    cliente,
    historicoCliente,
    historicoFiltrado,
    carregandoHistorico,
    filtroProfissional,
    setFiltroProfissional,
    listaProfissionais,
    handleFechar,
    handleEditar,
    handleExcluir,
  };
}
