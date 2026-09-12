import { useState, useCallback } from 'react';
import { useCaixaStore } from '../../store/caixa.store';

export function useModalAbrirCaixaController() {
  const [saldoInicial, setSaldoInicial] = useState<number>(500);
  const [erro, setErro] = useState<string | null>(null);

  const fecharModal = useCaixaStore((s) => s.fecharModalAbrir);
  const abrirCaixaAction = useCaixaStore((s) => s.abrirCaixa);
  const carregando = useCaixaStore((s) => s.carregando);

  const handleConfirmar = useCallback(async () => {
    if (saldoInicial < 0) {
      setErro('O saldo inicial não pode ser negativo');
      return;
    }
    setErro(null);
    try {
      await abrirCaixaAction(saldoInicial);
    } catch (err: any) {
      setErro(err?.message || 'Falha ao abrir caixa no sistema.');
    }
  }, [saldoInicial, abrirCaixaAction]);

  return {
    saldoInicial,
    setSaldoInicial,
    erro,
    carregando,
    fecharModal,
    handleConfirmar,
  };
}

export type ModalAbrirCaixaController = ReturnType<typeof useModalAbrirCaixaController>;
