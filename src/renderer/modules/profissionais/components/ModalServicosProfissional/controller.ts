import { useState, useEffect } from 'react';
import { useProfissionaisStore as useProfStore } from '../../store/profissionais.store';

export function useModalServicosProfissionalController() {
  const modalAberto = useProfStore((s) => s.modalServicosAberto);
  const setModalServicosAberto = useProfStore((s) => s.setModalServicosAberto);
  const todosServicos = useProfStore((s) => s.todosServicos);
  const servicosDoProfissional = useProfStore((s) => s.servicosDoProfissional);
  const salvarServicos = useProfStore((s) => s.salvarServicos);
  const profissionalId = useProfStore((s) => s.profissionalSelecionadoId);
  const profissionais = useProfStore((s) => s.profissionais);

  const profissionalAtual = profissionais.find((p) => p.id === profissionalId);

  const [selecionadosMap, setSelecionadosMap] = useState<Record<string, boolean>>({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const map: Record<string, boolean> = {};
    servicosDoProfissional.forEach((s) => {
      map[s.id] = true;
    });
    setSelecionadosMap(map);
  }, [servicosDoProfissional, modalAberto]);

  const toggleServico = (id: string) => {
    setSelecionadosMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFechar = () => {
    setModalServicosAberto(false);
  };

  const handleSalvar = async () => {
    setSalvando(true);
    const ids = Object.keys(selecionadosMap).filter((id) => selecionadosMap[id]);
    try {
      await salvarServicos(ids);
      setSalvando(false);
      handleFechar();
    } catch (err) {
      console.error('Erro ao vincular serviços:', err);
      setSalvando(false);
    }
  };

  return {
    modalAberto,
    profissionalAtual,
    todosServicos,
    selecionadosMap,
    toggleServico,
    salvando,
    handleFechar,
    handleSalvar,
  };
}
