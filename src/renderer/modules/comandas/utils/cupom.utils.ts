import type { Cliente } from '@modules/clientes/schemas/cliente.schema';
import type { ComandaItem } from '../schemas/comanda.schema';

export interface ElegibilidadeCupomAniversario {
  elegivel: boolean;
  motivo?: 'sem_data_nascimento' | 'nao_e_mes_aniversario' | 'ja_utilizado_neste_ano' | 'cliente_nao_encontrado';
  mesAniversario?: number;
}

/**
 * Valida se o cliente tem direito ao cupom de aniversário de 10% no ano corrente.
 */
export function verificarElegibilidadeAniversario(cliente?: Cliente | null): ElegibilidadeCupomAniversario {
  if (!cliente) {
    return { elegivel: false, motivo: 'cliente_nao_encontrado' };
  }

  if (!cliente.dataNascimento) {
    return { elegivel: false, motivo: 'sem_data_nascimento' };
  }

  // dataNascimento esperada em YYYY-MM-DD
  const partes = cliente.dataNascimento.split('-');
  const mesNascimento = parseInt(partes[1], 10);
  if (isNaN(mesNascimento)) {
    return { elegivel: false, motivo: 'sem_data_nascimento' };
  }

  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1; // 1-12
  const anoAtual = hoje.getFullYear();

  if (mesNascimento !== mesAtual) {
    return { elegivel: false, motivo: 'nao_e_mes_aniversario', mesAniversario: mesNascimento };
  }

  // Verifica se o cupom já foi utilizado no ano corrente
  if (cliente.cupomAniversarioUsadoEm) {
    const anoUltimoUso = new Date(cliente.cupomAniversarioUsadoEm).getFullYear();
    if (anoUltimoUso === anoAtual) {
      return { elegivel: false, motivo: 'ja_utilizado_neste_ano' };
    }
  }

  return { elegivel: true, mesAniversario: mesNascimento };
}

/**
 * Verifica se a data de hoje coincide exatamente com o DIA e MÊS de aniversário do cliente.
 */
export function isAniversarianteDoDia(cliente?: Cliente | null): boolean {
  if (!cliente || !cliente.dataNascimento) return false;

  const partes = cliente.dataNascimento.split('-');
  if (partes.length < 3) return false;

  const mesNascimento = parseInt(partes[1], 10);
  const diaNascimento = parseInt(partes[2], 10);

  if (isNaN(mesNascimento) || isNaN(diaNascimento)) return false;

  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1; // 1-12
  const diaAtual = hoje.getDate(); // 1-31

  return mesNascimento === mesAtual && diaNascimento === diaAtual;
}

/**
 * Calcula o valor em R$ do desconto concedido em um item específico,
 * respeitando o teto de 100% do valor da linha do serviço.
 */
export function calcularDescontoItem(item: ComandaItem): number {
  if (!item.desconto || item.desconto.valor <= 0) {
    return 0;
  }

  const totalLinhaBruto = item.quantidade * item.valorUnitario;

  if (item.desconto.tipo === 'percentual') {
    const pct = Math.min(100, Math.max(0, item.desconto.valor));
    return Number((totalLinhaBruto * (pct / 100)).toFixed(2));
  }

  if (item.desconto.tipo === 'valor_fixo') {
    // Travado no valor máximo de 100% da linha
    const val = Math.min(totalLinhaBruto, Math.max(0, item.desconto.valor));
    return Number(val.toFixed(2));
  }

  return 0;
}

/**
 * Calcula o resumo consolidado de valores da comanda (Subtotal, Descontos, Total).
 */
export function calcularTotaisComanda(itens: ComandaItem[]) {
  let subtotal = 0;
  let descontos = 0;

  for (const item of itens) {
    const linhaBruto = item.quantidade * item.valorUnitario;
    const descItem = calcularDescontoItem(item);

    subtotal += linhaBruto;
    descontos += descItem;
  }

  subtotal = Number(subtotal.toFixed(2));
  descontos = Number(descontos.toFixed(2));
  const total = Number(Math.max(0, subtotal - descontos).toFixed(2));

  return { subtotal, descontos, total };
}
