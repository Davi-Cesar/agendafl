import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@shared/supabase/client';

export interface ServicoOption {
  id: string;
  nome: string;
  preco: number;
}

export interface ProfissionalOption {
  id: string;
  nome: string;
}

export interface UseModalAdicionarServicoProps {
  aberto: boolean;
  onFechar: () => void;
  onAdicionar: (descricao: string, profissional: string, valor: number) => void;
}

export function useModalAdicionarServicoController({
  aberto,
  onFechar,
  onAdicionar,
}: UseModalAdicionarServicoProps) {
  const [servicos, setServicos] = useState<ServicoOption[]>([]);
  const [profissionais, setProfissionais] = useState<ProfissionalOption[]>([]);
  const [servicoSelecionadoId, setServicoSelecionadoId] = useState<string>('');
  const [profissionalSelecionado, setProfissionalSelecionado] = useState<string>('');
  const [valorCustomizado, setValorCustomizado] = useState<number>(0);
  const [carregando, setCarregando] = useState<boolean>(false);

  useEffect(() => {
    if (!aberto) return;

    let cancelado = false;
    async function carregarDados() {
      setCarregando(true);
      try {
        const [{ data: srvData }, { data: profData }] = await Promise.all([
          supabase.from('servicos').select('id, nome, preco_padrao').eq('ativo', true),
          supabase.from('profissionais').select('id, nome').eq('status', 'ativo'),
        ]);

        if (cancelado) return;

        const sList: ServicoOption[] = (srvData ?? []).map((s: any) => ({
          id: s.id,
          nome: s.nome,
          preco: Number(s.preco_padrao || 0),
        }));

        const pList: ProfissionalOption[] = (profData ?? []).map((p: any) => ({
          id: p.id,
          nome: p.nome,
        }));

        setServicos(sList);
        setProfissionais(pList);

        if (sList.length > 0) {
          setServicoSelecionadoId(sList[0].id);
          setValorCustomizado(sList[0].preco);
        }
        if (pList.length > 0) {
          setProfissionalSelecionado(pList[0].nome);
        }
      } catch (err) {
        console.error('Erro ao carregar serviços/profissionais:', err);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    carregarDados();

    return () => {
      cancelado = true;
    };
  }, [aberto]);

  const handleSelectServico = useCallback(
    (id: string) => {
      setServicoSelecionadoId(id);
      const srv = servicos.find((s) => s.id === id);
      if (srv) {
        setValorCustomizado(srv.preco);
      }
    },
    [servicos]
  );

  const handleConfirmar = useCallback(() => {
    const srv = servicos.find((s) => s.id === servicoSelecionadoId);
    const descricao = srv ? srv.nome : 'Serviço Adicional';
    const profNome = profissionalSelecionado || 'Profissional';
    const valor = valorCustomizado > 0 ? valorCustomizado : srv?.preco || 100;

    onAdicionar(descricao, profNome, valor);
    onFechar();
  }, [servicos, servicoSelecionadoId, profissionalSelecionado, valorCustomizado, onAdicionar, onFechar]);

  return {
    carregando,
    servicos,
    profissionais,
    servicoSelecionadoId,
    profissionalSelecionado,
    valorCustomizado,
    setProfissionalSelecionado,
    setValorCustomizado,
    handleSelectServico,
    handleConfirmar,
    onFechar,
  };
}

export type ModalAdicionarServicoController = ReturnType<typeof useModalAdicionarServicoController>;
