import { useEffect, useCallback } from 'react';
import { useCaixaStore } from '../../store/caixa.store';

export function useCaixaViewController() {
  const caixaAtivo = useCaixaStore((s) => s.caixaAtivo);
  const abaAtiva = useCaixaStore((s) => s.abaAtiva);
  const carregando = useCaixaStore((s) => s.carregando);
  const erro = useCaixaStore((s) => s.erro);
  const modalAbrirAberto = useCaixaStore((s) => s.modalAbrirAberto);
  const modalFecharAberto = useCaixaStore((s) => s.modalFecharAberto);

  const setAbaAtiva = useCaixaStore((s) => s.setAbaAtiva);
  const carregarCaixa = useCaixaStore((s) => s.carregarCaixa);
  const abrirModalAbrir = useCaixaStore((s) => s.abrirModalAbrir);
  const abrirModalFechar = useCaixaStore((s) => s.abrirModalFechar);

  useEffect(() => {
    carregarCaixa();
  }, [carregarCaixa]);

  const handleAcaoCabecalho = useCallback(() => {
    if (caixaAtivo) {
      abrirModalFechar();
    } else {
      abrirModalAbrir();
    }
  }, [caixaAtivo, abrirModalFechar, abrirModalAbrir]);

  const handleToggleAnteriores = useCallback(() => {
    if (abaAtiva === 'anteriores') {
      setAbaAtiva('transacoes');
    } else {
      setAbaAtiva('anteriores');
    }
  }, [abaAtiva, setAbaAtiva]);

  return {
    caixaAtivo,
    isCaixaAberto: Boolean(caixaAtivo),
    abaAtiva,
    setAbaAtiva,
    carregando,
    erro,
    modalAbrirAberto,
    modalFecharAberto,
    abrirModalAbrir,
    abrirModalFechar,
    handleAcaoCabecalho,
    handleToggleAnteriores,
  };
}

export type CaixaViewController = ReturnType<typeof useCaixaViewController>;
