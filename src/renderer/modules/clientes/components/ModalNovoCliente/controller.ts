import { useState, useEffect } from 'react';
import { useClientesStore } from '../../store/clientes.store';
import { CriarClienteDTOSchema, type ClienteStatus } from '../../schemas/cliente.schema';
import { formatarCelular, formatarCPF, apenasDigitos } from '@shared/lib/formatters';

export function useModalNovoClienteController() {
  const modalAberto = useClientesStore((s) => s.modalNovoAberto);
  const clienteParaEditar = useClientesStore((s) => s.clienteParaEditar);
  const salvando = useClientesStore((s) => s.salvando);
  const fecharModais = useClientesStore((s) => s.fecharModais);
  const salvarCliente = useClientesStore((s) => s.salvarCliente);

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cpf, setCpf] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [status, setStatus] = useState<ClienteStatus>('ativo');
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (modalAberto) {
      if (clienteParaEditar) {
        setNome(clienteParaEditar.nome || '');
        setTelefone(formatarCelular(clienteParaEditar.telefone));
        setDataNascimento(clienteParaEditar.dataNascimento || '');
        setCpf(formatarCPF(clienteParaEditar.cpf));
        setObservacoes(clienteParaEditar.observacoes || '');
        setStatus(clienteParaEditar.status || 'ativo');
      } else {
        setNome('');
        setTelefone('');
        setDataNascimento('');
        setCpf('');
        setObservacoes('');
        setStatus('ativo');
      }
      setErro(null);
    }
  }, [modalAberto, clienteParaEditar]);

  const handleTelefoneChange = (value: string) => {
    setTelefone(formatarCelular(value));
  };

  const handleCpfChange = (value: string) => {
    setCpf(formatarCPF(value));
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();

    const telefoneCru = apenasDigitos(telefone);
    const cpfCru = apenasDigitos(cpf);

    const parseResult = CriarClienteDTOSchema.safeParse({
      nome: nome.trim(),
      telefone: telefoneCru,
      dataNascimento: dataNascimento || null,
      cpf: cpfCru || null,
      observacoes: observacoes.trim() || null,
      status,
    });

    if (!parseResult.success) {
      setErro(parseResult.error.issues[0]?.message || 'Dados inválidos');
      return;
    }

    try {
      await salvarCliente({
        id: clienteParaEditar?.id,
        ...parseResult.data,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar dados do cliente.';
      setErro(msg);
    }
  };

  return {
    modalAberto,
    isEdicao: Boolean(clienteParaEditar),
    nome,
    setNome,
    telefone,
    setTelefone: handleTelefoneChange,
    dataNascimento,
    setDataNascimento,
    cpf,
    setCpf: handleCpfChange,
    observacoes,
    setObservacoes,
    status,
    setStatus,
    salvando,
    erro,
    handleFechar: fecharModais,
    handleSalvar,
  };
}
