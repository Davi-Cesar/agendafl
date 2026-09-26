export type AbaClientes = 'todos' | 'aniversariantes';

export interface FiltroClientes {
  busca: string;
  aba: AbaClientes;
  dataAniversariantes: string; // YYYY-MM-DD
  paginaAtual: number;
  itensPorPagina: number;
}
