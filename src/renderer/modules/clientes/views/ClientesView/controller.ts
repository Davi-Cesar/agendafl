import { useEffect, useState } from 'react';
import { useClientesStore } from '../../store/clientes.store';
import { exportarClientesCSV } from '../../services/clientes.service';
import { apenasDigitos } from '@shared/lib/formatters';

export function useClientesViewController() {
  const clientes = useClientesStore((s) => s.clientes);
  const aniversariantes = useClientesStore((s) => s.aniversariantes);
  const totalClientes = useClientesStore((s) => s.totalClientes);
  const totalAniversariantesCount = useClientesStore((s) => s.totalAniversariantesCount);

  const abaAtiva = useClientesStore((s) => s.abaAtiva);
  const dataAniversariantes = useClientesStore((s) => s.dataAniversariantes);
  const busca = useClientesStore((s) => s.busca);
  const paginaAtual = useClientesStore((s) => s.paginaAtual);
  const itensPorPagina = useClientesStore((s) => s.itensPorPagina);
  const carregando = useClientesStore((s) => s.carregando);

  const setAbaAtiva = useClientesStore((s) => s.setAbaAtiva);
  const setBusca = useClientesStore((s) => s.setBusca);
  const setDataAniversariantes = useClientesStore((s) => s.setDataAniversariantes);
  const setPaginaAtual = useClientesStore((s) => s.setPaginaAtual);
  const carregarClientes = useClientesStore((s) => s.carregarClientes);

  const abrirModalNovo = useClientesStore((s) => s.abrirModalNovo);
  const abrirPerfilCliente = useClientesStore((s) => s.abrirPerfilCliente);

  const [filtroStatusAberto, setFiltroStatusAberto] = useState(false);
  const [dataLocalAniv, setDataLocalAniv] = useState(dataAniversariantes);

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  useEffect(() => {
    setDataLocalAniv(dataAniversariantes);
  }, [dataAniversariantes]);

  const handleExportarCSV = () => {
    const lista = abaAtiva === 'todos' ? clientes : aniversariantes;
    exportarClientesCSV(lista, `clientes_${abaAtiva}_export.csv`);
  };

  const handleFiltrarDataAniversariantes = () => {
    setDataAniversariantes(dataLocalAniv);
  };

  const handleAbrirWhatsApp = (telefone: string | null | undefined, nome: string) => {
    if (!telefone) return;
    const numLimpo = apenasDigitos(telefone);
    if (!numLimpo) return;
    const mensagem = encodeURIComponent(`Olá, ${nome}! O Espaço FL deseja um feliz aniversário! 🎉🎂`);
    const url = `https://wa.me/55${numLimpo}?text=${mensagem}`;
    window.open(url, '_blank');
  };

  // Helper para gerar as primeiras 2 letras das iniciais
  const getInitials = (nome: string) => {
    if (!nome) return 'FL';
    const partes = nome.trim().split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return nome.slice(0, 2).toUpperCase();
  };

  return {
    clientes,
    aniversariantes,
    totalClientes,
    totalAniversariantesCount,
    abaAtiva,
    dataAniversariantes,
    dataLocalAniv,
    setDataLocalAniv,
    busca,
    paginaAtual,
    itensPorPagina,
    carregando,
    filtroStatusAberto,
    setFiltroStatusAberto,
    setAbaAtiva,
    setBusca,
    setPaginaAtual,
    handleExportarCSV,
    handleFiltrarDataAniversariantes,
    handleAbrirWhatsApp,
    getInitials,
    abrirModalNovo,
    abrirPerfilCliente,
  };
}
