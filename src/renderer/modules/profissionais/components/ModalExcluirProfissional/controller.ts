import { useCallback, useState, useEffect } from 'react';
import { useProfissionaisStore } from '../../store/profissionais.store';
import { alterarStatusProfissional } from '../../services/profissionais.service';

export function useModalExcluirProfissionalController() {
  const modalAberto = useProfissionaisStore((s) => s.modalExcluirAberto);
  const profissional = useProfissionaisStore((s) => s.profissionalParaExcluir);
  const salvando = useProfissionaisStore((s) => s.salvandoExclusao);
  const setModalExcluirAberto = useProfissionaisStore((s) => s.setModalExcluirAberto);
  const confirmarExclusaoProfissional = useProfissionaisStore((s) => s.confirmarExclusaoProfissional);
  const carregarProfissionais = useProfissionaisStore((s) => s.carregarProfissionais);

  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (modalAberto) {
      setErro(null);
    }
  }, [modalAberto]);

  const handleFechar = useCallback(() => {
    if (!salvando) {
      setErro(null);
      setModalExcluirAberto(false, null);
    }
  }, [salvando, setModalExcluirAberto]);

  const handleConfirmarExclusao = useCallback(async () => {
    setErro(null);
    try {
      await confirmarExclusaoProfissional();
    } catch (err: any) {
      setErro(err?.message || 'Não foi possível excluir o profissional.');
    }
  }, [confirmarExclusaoProfissional]);

  const handleInativarAoInvesDeExcluir = useCallback(async () => {
    if (!profissional) return;
    try {
      await alterarStatusProfissional(profissional.id, 'inativo');
      await carregarProfissionais();
      setModalExcluirAberto(false, null);
      setErro(null);
    } catch (err: any) {
      setErro(err?.message || 'Erro ao inativar profissional.');
    }
  }, [profissional, carregarProfissionais, setModalExcluirAberto]);

  return {
    modalAberto,
    profissional,
    salvando,
    erro,
    handleFechar,
    handleConfirmarExclusao,
    handleInativarAoInvesDeExcluir,
  };
}

export type ModalExcluirProfissionalController = ReturnType<typeof useModalExcluirProfissionalController>;
