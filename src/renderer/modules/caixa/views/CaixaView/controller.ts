import { useCallback } from 'react';

export function useCaixaViewController() {
  const handleAbrirCaixa = useCallback(() => {
    console.log('[Caixa] Abrir caixa acionado');
  }, []);

  return {
    handleAbrirCaixa,
  };
}
