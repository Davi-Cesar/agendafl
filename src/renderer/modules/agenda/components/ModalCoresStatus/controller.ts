import { useState, useCallback } from 'react';
import { useStatusCoresStore, CORES_PRESET } from '../../store/statusCores.store';

export function useModalCoresStatusController() {
  const modalAberto = useStatusCoresStore((s) => s.modalAberto);
  const statusList = useStatusCoresStore((s) => s.statusList);
  const fecharModal = useStatusCoresStore((s) => s.fecharModal);
  const alterarCorStatus = useStatusCoresStore((s) => s.alterarCorStatus);
  const adicionarStatus = useStatusCoresStore((s) => s.adicionarStatus);
  const removerStatus = useStatusCoresStore((s) => s.removerStatus);
  const restaurarPadrao = useStatusCoresStore((s) => s.restaurarPadrao);

  const [novoNome, setNovoNome] = useState('');
  const [novaCor, setNovaCor] = useState('#a855f7');

  const handleAdicionarNovoStatus = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!novoNome.trim()) return;
      adicionarStatus(novoNome.trim(), novaCor);
      setNovoNome('');
    },
    [novoNome, novaCor, adicionarStatus]
  );

  return {
    modalAberto,
    statusList,
    coresPreset: CORES_PRESET,
    fecharModal,
    alterarCorStatus,
    removerStatus,
    restaurarPadrao,
    novoNome,
    setNovoNome,
    novaCor,
    setNovaCor,
    handleAdicionarNovoStatus,
  };
}

export type ModalCoresStatusController = ReturnType<typeof useModalCoresStatusController>;
