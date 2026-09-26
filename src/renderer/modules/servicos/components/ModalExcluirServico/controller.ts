import { useServicosStore } from '../../store/servicos.store';

export function useModalExcluirServicoController() {
  const modalAberto = useServicosStore((s) => s.modalExcluirAberto);
  const servico = useServicosStore((s) => s.servicoParaExcluir);
  const salvando = useServicosStore((s) => s.salvando);
  const fecharModais = useServicosStore((s) => s.fecharModais);
  const excluirServico = useServicosStore((s) => s.excluirServico);

  const handleConfirmarExclusao = async () => {
    if (!servico) return;
    await excluirServico(servico.id);
  };

  return {
    modalAberto,
    servico,
    salvando,
    handleConfirmarExclusao,
    fecharModais,
  };
}
