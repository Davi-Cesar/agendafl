import { useEffect, useCallback } from 'react';
import { useCaixaStore } from '../../store/caixa.store';

export function useCaixasAnterioresController() {
  const historicoCaixas = useCaixaStore((s) => s.historicoCaixas);
  const caixaSelecionado = useCaixaStore((s) => s.caixaSelecionadoHistorico);
  const carregando = useCaixaStore((s) => s.carregando);
  const erro = useCaixaStore((s) => s.erro);

  const carregarHistorico = useCaixaStore((s) => s.carregarHistorico);
  const selecionarCaixaHistorico = useCaixaStore((s) => s.selecionarCaixaHistorico);
  const abrirModalRelatorio = useCaixaStore((s) => s.abrirModalRelatorio);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  const handleSelecionarCaixa = useCallback(
    (caixaId: string) => {
      selecionarCaixaHistorico(caixaId);
    },
    [selecionarCaixaHistorico]
  );

  const handleVoltarLista = useCallback(() => {
    selecionarCaixaHistorico(null);
  }, [selecionarCaixaHistorico]);

  const handleVerRelatorioHistorico = useCallback(
    (caixaId: string) => {
      abrirModalRelatorio(caixaId);
    },
    [abrirModalRelatorio]
  );

  return {
    historicoCaixas,
    caixaSelecionado,
    carregando,
    erro,
    handleSelecionarCaixa,
    handleVoltarLista,
    handleVerRelatorioHistorico,
  };
}

export type CaixasAnterioresController = ReturnType<typeof useCaixasAnterioresController>;
