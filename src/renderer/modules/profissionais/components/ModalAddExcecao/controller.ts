import { useState, useEffect } from 'react';
import { useProfissionaisStore } from '../../store/profissionais.store';
import type { TipoExcecaoHorario } from '../../schemas/profissional.schema';

function parseTimeToMins(tStr: string): number {
  if (!tStr) return 0;
  const [h, m] = tStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function getProximaDataParaDiaSemana(diaSemanaDesejado: number): string {
  const hoje = new Date();
  const diaAtual = hoje.getDay();
  let diff = diaSemanaDesejado - diaAtual;
  if (diff < 0) diff += 7;
  const proximaData = new Date(hoje);
  proximaData.setDate(hoje.getDate() + diff);

  const yyyy = proximaData.getFullYear();
  const mm = String(proximaData.getMonth() + 1).padStart(2, '0');
  const dd = String(proximaData.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function useModalAddExcecaoController() {
  const config = useProfissionaisStore((s) => s.modalExcecaoConfig);
  const modalAberto = useProfissionaisStore((s) => s.modalExcecaoAberto) || Boolean(config.aberto);
  const profissionalSelecionadoId = useProfissionaisStore((s) => s.profissionalSelecionadoId);
  const setModalExcecaoConfig = useProfissionaisStore((s) => s.setModalExcecaoConfig);
  const adicionarExcecaoDireta = useProfissionaisStore((s) => s.adicionarExcecaoDireta);

  const [dataStr, setDataStr] = useState('');
  const [inicio, setInicio] = useState('11:30');
  const [fim, setFim] = useState('');
  const [tipo, setTipo] = useState<TipoExcecaoHorario>('atendimento_extra');
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const tipoTravado = Boolean(config.tipoTravado);
  const profissionalNome = config.profissionalNome || '';

  useEffect(() => {
    if (modalAberto) {
      const dataInicial = config.dataStr
        ? config.dataStr
        : config.diaSemana !== null && config.diaSemana !== undefined
        ? getProximaDataParaDiaSemana(config.diaSemana)
        : new Date().toISOString().split('T')[0];

      setDataStr(dataInicial);
      setInicio(config.inicio || '11:30');
      setFim(config.fim !== undefined && config.fim !== null ? config.fim : (config.tipoTravado ? '' : '12:30'));
      setTipo(config.tipo || 'atendimento_extra');
      setMotivo('');
      setErro(null);
    }
  }, [modalAberto, config]);

  const nomeDiaCalculado = (() => {
    if (!dataStr) return '';
    const partes = dataStr.split('-');
    if (partes.length === 3) {
      const d = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      const nomes = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      return `${nomes[d.getDay()]} (${partes[2]}/${partes[1]}/${partes[0]})`;
    }
    return '';
  })();

  const handleFechar = () => {
    setModalExcecaoConfig({ aberto: false });
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataStr) {
      setErro('A data específica é obrigatória.');
      return;
    }
    if (!inicio.trim() || !fim.trim()) {
      setErro('Os horários de início e fim são obrigatórios.');
      return;
    }

    const mInicio = parseTimeToMins(inicio.trim());
    const mFim = parseTimeToMins(fim.trim());

    if (mFim <= mInicio) {
      setErro('O horário de fim deve ser posterior ao horário de início.');
      return;
    }

    const targetProfId = config.profissionalId || profissionalSelecionadoId;
    if (!targetProfId) {
      setErro('Nenhum profissional selecionado.');
      return;
    }

    try {
      await adicionarExcecaoDireta(targetProfId, dataStr, inicio.trim(), fim.trim(), tipo, motivo.trim());
      const callback = config.onSalvarSuccess;
      handleFechar();
      if (callback) {
        callback(dataStr, inicio.trim(), fim.trim());
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar exceção';
      setErro(msg);
    }
  };

  return {
    modalAberto,
    dataStr,
    setDataStr,
    nomeDiaCalculado,
    inicio,
    setInicio,
    fim,
    setFim,
    tipo,
    setTipo,
    tipoTravado,
    profissionalNome,
    motivo,
    setMotivo,
    erro,
    handleFechar,
    handleSalvar,
  };
}
