import { useCallback } from 'react';
import { useCaixaStore } from '../../store/caixa.store';

export function useResumoCaixaController() {
  const caixaAtivo = useCaixaStore((s) => s.caixaAtivo);
  const transacoes = useCaixaStore((s) => s.transacoes);
  const totaisMeios = useCaixaStore((s) => s.totaisMeios);
  const abrirModalRelatorio = useCaixaStore((s) => s.abrirModalRelatorio);

  const handleVerRelatorio = useCallback(() => {
    abrirModalRelatorio();
  }, [abrirModalRelatorio]);

  return {
    isCaixaAberto: Boolean(caixaAtivo),
    transacoes,
    totaisMeios,
    handleVerRelatorio,
  };
}

export type ResumoCaixaController = ReturnType<typeof useResumoCaixaController>;
