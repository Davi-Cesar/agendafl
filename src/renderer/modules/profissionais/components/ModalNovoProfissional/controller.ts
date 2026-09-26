import { useState, useEffect } from 'react';
import { useProfissionaisStore } from '../../store/profissionais.store';
import { CriarProfissionalDTOSchema, type Profissional } from '../../schemas/profissional.schema';

export function useModalNovoProfissionalController() {
  const modalAberto = useProfissionaisStore((s) => s.modalNovoAberto);
  const profissionalParaEditar = useProfissionaisStore((s) => s.profissionalParaEditar);
  const setModalNovoAberto = useProfissionaisStore((s) => s.setModalNovoAberto);
  const salvarProfissional = useProfissionaisStore((s) => s.salvarProfissional);

  const [nome, setNome] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const comissaoPercentual = 60; // Sempre 60% por regra do negócio (não editável)
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (profissionalParaEditar) {
      setNome(profissionalParaEditar.nome || '');
      setEspecialidade(profissionalParaEditar.especialidade || '');
      setEmail(profissionalParaEditar.email || '');
      setTelefone(profissionalParaEditar.telefone || '');
      setCpf(profissionalParaEditar.cpf || '');
      setStatus(profissionalParaEditar.status || 'ativo');
    } else {
      setNome('');
      setEspecialidade('');
      setEmail('');
      setTelefone('');
      setCpf('');
      setStatus('ativo');
    }
    setErro(null);
  }, [profissionalParaEditar, modalAberto]);

  const handleFechar = () => {
    setModalNovoAberto(false);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();

    const parseResult = CriarProfissionalDTOSchema.safeParse({
      nome: nome.trim(),
      especialidade: especialidade.trim() || null,
      email: email.trim() || null,
      telefone: telefone.trim() || null,
      cpf: cpf.trim() || null,
      comissaoPercentual: 60,
      status,
    });

    if (!parseResult.success) {
      setErro(parseResult.error.issues[0]?.message || 'Dados inválidos');
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      const dados: Partial<Profissional> = {
        id: profissionalParaEditar?.id,
        ...parseResult.data,
      };

      await salvarProfissional(dados);
      setSalvando(false);
      handleFechar();
    } catch (err: any) {
      console.error('Erro ao salvar profissional:', err);
      setErro(err.message || 'Falha ao salvar profissional');
      setSalvando(false);
    }
  };

  return {
    modalAberto,
    isEdicao: !!profissionalParaEditar,
    nome,
    setNome,
    especialidade,
    setEspecialidade,
    email,
    setEmail,
    telefone,
    setTelefone,
    cpf,
    setCpf,
    comissaoPercentual,
    status,
    setStatus,
    salvando,
    erro,
    handleFechar,
    handleSalvar,
  };
}
