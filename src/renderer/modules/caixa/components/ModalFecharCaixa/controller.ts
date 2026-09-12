import { useState, useCallback, useMemo } from 'react';
import { useCaixaStore } from '../../store/caixa.store';

export function useModalFecharCaixaController() {
  const [observacoes, setObservacoes] = useState<string>('');
  const [erroLocal, setErroLocal] = useState<string | null>(null);

  const fecharModal = useCaixaStore((s) => s.fecharModalFechar);
  const fecharCaixaAction = useCaixaStore((s) => s.fecharCaixa);
  const carregando = useCaixaStore((s) => s.carregando);

  const totaisMeios = useCaixaStore((s) => s.totaisMeios);
  const comissoes = useCaixaStore((s) => s.comissoes);

  const totalComissoes = useMemo(() => {
    return comissoes.reduce((acc, c) => acc + c.totalComissao, 0);
  }, [comissoes]);

  const totalVendas = useMemo(() => {
    return (
      totaisMeios.dinheiro +
      totaisMeios.pixBricia +
      totaisMeios.pixFlavia +
      totaisMeios.cartaoCredito +
      totaisMeios.cartaoDebito
    );
  }, [totaisMeios]);

  const valorLiquido = useMemo(() => {
    return Math.max(0, totalVendas - totalComissoes);
  }, [totalVendas, totalComissoes]);

  const handleConfirmarFechamento = useCallback(async () => {
    setErroLocal(null);
    try {
      await fecharCaixaAction(observacoes);
    } catch (err: any) {
      console.error('Erro ao fechar caixa:', err);
      setErroLocal(err?.message || 'Erro ao fechar caixa no banco de dados');
    }
  }, [observacoes, fecharCaixaAction]);

  return {
    observacoes,
    setObservacoes,
    erroLocal,
    totaisMeios,
    totalVendas,
    totalComissoes,
    valorLiquido,
    carregando,
    fecharModal,
    handleConfirmarFechamento,
  };
}

export type ModalFecharCaixaController = ReturnType<typeof useModalFecharCaixaController>;
