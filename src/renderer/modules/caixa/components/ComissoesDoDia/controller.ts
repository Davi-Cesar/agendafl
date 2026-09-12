import { useState, useMemo, useCallback } from 'react';
import { useCaixaStore } from '../../store/caixa.store';

export function useComissoesDoDiaController() {
  const comissoes = useCaixaStore((s) => s.comissoes);
  const abrirModalRelatorio = useCaixaStore((s) => s.abrirModalRelatorio);

  const [filtroProfissional, setFiltroProfissional] = useState<string>('todos');

  const listaProfissionais = useMemo(() => {
    return Array.from(new Set(comissoes.map((c) => c.profissionalNome))).sort();
  }, [comissoes]);

  const comissoesFiltradas = useMemo(() => {
    if (filtroProfissional === 'todos') return comissoes;
    return comissoes.filter((c) => c.profissionalNome === filtroProfissional);
  }, [comissoes, filtroProfissional]);

  const totalComissoesGeral = useMemo(() => {
    return comissoesFiltradas.reduce((acc, c) => acc + c.totalComissao, 0);
  }, [comissoesFiltradas]);

  const handleVerRelatorio = useCallback(() => {
    abrirModalRelatorio();
  }, [abrirModalRelatorio]);

  return {
    comissoes: comissoesFiltradas,
    filtroProfissional,
    setFiltroProfissional,
    listaProfissionais,
    totalComissoesGeral,
    handleVerRelatorio,
  };
}

export type ComissoesDoDiaController = ReturnType<typeof useComissoesDoDiaController>;
