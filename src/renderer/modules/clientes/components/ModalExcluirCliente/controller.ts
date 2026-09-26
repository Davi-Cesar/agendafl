import { useClientesStore } from '../../store/clientes.store';

export function useModalExcluirClienteController() {
  const modalAberto = useClientesStore((s) => s.modalExcluirAberto);
  const cliente = useClientesStore((s) => s.clienteSelecionado);
  const salvando = useClientesStore((s) => s.salvando);
  const fecharModais = useClientesStore((s) => s.fecharModais);
  const excluirCliente = useClientesStore((s) => s.excluirCliente);

  const handleConfirmarExclusao = async () => {
    if (cliente) {
      await excluirCliente(cliente.id);
    }
  };

  return {
    modalAberto,
    cliente,
    salvando,
    handleFechar: fecharModais,
    handleConfirmarExclusao,
  };
}
