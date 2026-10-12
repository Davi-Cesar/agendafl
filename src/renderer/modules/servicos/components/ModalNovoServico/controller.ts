import { useState, useEffect } from 'react';
import { useServicosStore } from '../../store/servicos.store';
import { formatarNomeProprio } from '@shared/lib/formatters';

export function useModalNovoServicoController() {
  const modalAberto = useServicosStore((s) => s.modalNovoAberto);
  const servicoParaEditar = useServicosStore((s) => s.servicoParaEditar);
  const categorias = useServicosStore((s) => s.categorias);
  const profissionaisDisponiveis = useServicosStore((s) => s.profissionaisDisponiveis);
  const salvando = useServicosStore((s) => s.salvando);
  const erroStore = useServicosStore((s) => s.erro);
  const fecharModais = useServicosStore((s) => s.fecharModais);
  const salvarServico = useServicosStore((s) => s.salvarServico);
  const criarCategoria = useServicosStore((s) => s.criarCategoria);

  const [nome, setNomeState] = useState('');
  const setNome = (valor: string) => setNomeState(formatarNomeProprio(valor));
  const [descricao, setDescricao] = useState('');
  
  // Estado do Combobox de Categoria
  const [categoriaId, setCategoriaId] = useState<string>('');
  const [buscaCategoria, setBuscaCategoria] = useState<string>('');
  const [dropdownCatAberto, setDropdownCatAberto] = useState(false);
  const [criandoCategoria, setCriandoCategoria] = useState(false);

  const [preco, setPreco] = useState('');
  const [duracao, setDuracao] = useState<number>(30);
  const [profissionaisSelecionados, setProfissionaisSelecionados] = useState<Array<{ id: string; nome: string }>>([]);
  const [buscaProfissional, setBuscaProfissional] = useState('');
  const [dropdownProfAberto, setDropdownProfAberto] = useState(false);
  const [erroLocal, setErroLocal] = useState<string | null>(null);

  const isEdicao = Boolean(servicoParaEditar);

  useEffect(() => {
    if (modalAberto) {
      if (servicoParaEditar) {
        setNome(servicoParaEditar.nome || '');
        setDescricao(servicoParaEditar.descricao || '');
        setCategoriaId(servicoParaEditar.categoriaId || '');
        setBuscaCategoria(servicoParaEditar.categoriaNome || '');
        setPreco(servicoParaEditar.precoPadrao ? String(servicoParaEditar.precoPadrao) : '');
        setDuracao(servicoParaEditar.duracaoMinutos || 30);
        
        // Mapear profissionais vinculados existentes
        const vinculados = profissionaisDisponiveis.filter((p) =>
          servicoParaEditar.profissionaisIds.includes(p.id)
        );
        setProfissionaisSelecionados(vinculados);
      } else {
        setNome('');
        setDescricao('');
        setCategoriaId('');
        setBuscaCategoria('');
        setPreco('');
        setDuracao(30);
        setProfissionaisSelecionados([]);
      }
      setBuscaProfissional('');
      setDropdownProfAberto(false);
      setDropdownCatAberto(false);
      setCriandoCategoria(false);
      setErroLocal(null);
    }
  }, [modalAberto, servicoParaEditar, profissionaisDisponiveis]);

  // Filtragem de Categorias
  const termoLimpo = buscaCategoria.trim().toLowerCase();

  const categoriasFiltradas = categorias.filter((c) =>
    c.nome.toLowerCase().includes(termoLimpo)
  );

  const temMatchExato = categorias.some(
    (c) => c.nome.trim().toLowerCase() === termoLimpo
  );

  const exibirOpcaoCriar = termoLimpo.length > 0 && !temMatchExato;

  const handleSelecionarCategoria = (id: string | null, nome: string) => {
    setCategoriaId(id || '');
    setBuscaCategoria(id ? nome : '');
    setDropdownCatAberto(false);
  };

  const handleCriarCategoriaInline = async (nomeDigitado: string) => {
    if (!nomeDigitado.trim()) return;
    setCriandoCategoria(true);
    setErroLocal(null);
    try {
      const novaCat = await criarCategoria(nomeDigitado.trim());
      setCategoriaId(novaCat.id);
      setBuscaCategoria(novaCat.nome);
      setDropdownCatAberto(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar categoria';
      setErroLocal(msg);
    } finally {
      setCriandoCategoria(false);
    }
  };

  const handleAdicionarProfissional = (prof: { id: string; nome: string }) => {
    if (!profissionaisSelecionados.some((p) => p.id === prof.id)) {
      setProfissionaisSelecionados([...profissionaisSelecionados, prof]);
    }
    setBuscaProfissional('');
    setDropdownProfAberto(false);
  };

  const handleRemoverProfissional = (id: string) => {
    setProfissionaisSelecionados(profissionaisSelecionados.filter((p) => p.id !== id));
  };

  const profsFiltradosParaAdicionar = profissionaisDisponiveis.filter(
    (p) =>
      !profissionaisSelecionados.some((sel) => sel.id === p.id) &&
      p.nome.toLowerCase().includes(buscaProfissional.toLowerCase().trim())
  );

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroLocal(null);

    if (!nome.trim()) {
      setErroLocal('Informe o nome do serviço');
      return;
    }

    const precoNum = parseFloat(preco.replace(',', '.'));
    if (isNaN(precoNum) || precoNum < 0) {
      setErroLocal('Informe um preço padrão válido (ex: 85.00)');
      return;
    }

    if (!duracao || duracao <= 0) {
      setErroLocal('Informe a duração em minutos (ex: 30)');
      return;
    }

    try {
      await salvarServico({
        id: servicoParaEditar?.id,
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        categoriaId: categoriaId || null,
        precoPadrao: precoNum,
        duracaoMinutos: Number(duracao),
        profissionaisIds: profissionaisSelecionados.map((p) => p.id),
        ativo: true,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar serviço';
      setErroLocal(msg);
    }
  };

  return {
    modalAberto,
    isEdicao,
    salvando,
    erro: erroLocal || erroStore,
    nome,
    setNome,
    descricao,
    setDescricao,
    categoriaId,
    setCategoriaId,
    buscaCategoria,
    setBuscaCategoria,
    dropdownCatAberto,
    setDropdownCatAberto,
    categoriasFiltradas,
    exibirOpcaoCriar,
    criandoCategoria,
    handleSelecionarCategoria,
    handleCriarCategoriaInline,
    preco,
    setPreco,
    duracao,
    setDuracao,
    categorias,
    profissionaisSelecionados,
    buscaProfissional,
    setBuscaProfissional,
    dropdownProfAberto,
    setDropdownProfAberto,
    profsFiltradosParaAdicionar,
    handleAdicionarProfissional,
    handleRemoverProfissional,
    handleSalvar,
    fecharModais,
  };
}
