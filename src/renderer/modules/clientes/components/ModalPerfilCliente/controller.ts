import { useClientesStore } from '../../store/clientes.store';

export function useModalPerfilClienteController() {
  const modalAberto = useClientesStore((s) => s.modalPerfilAberto);
  const cliente = useClientesStore((s) => s.clienteSelecionado);
  const fecharModais = useClientesStore((s) => s.fecharModais);
  const abrirModalNovo = useClientesStore((s) => s.abrirModalNovo);
  const abrirModalExcluir = useClientesStore((s) => s.abrirModalExcluir);

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
    handleFechar: fecharModais,
    handleEditar,
    handleExcluir,
  };
}
