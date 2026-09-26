/**
 * Utilitários compartilhados de formatação para CPF, Celular/Telefone e Datas.
 */

/**
 * Extrai apenas os dígitos numéricos (0-9) de uma string.
 */
export function apenasDigitos(val?: string | null): string {
  if (!val) return '';
  return val.replace(/\D/g, '');
}

/**
 * Formata CPF para o padrão 000.000.000-00.
 * Aceita até 11 dígitos numéricos e aceita entrada já formatada ou crua.
 */
export function formatarCPF(val?: string | null): string {
  const digits = apenasDigitos(val).slice(0, 11);
  if (!digits) return '';

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

/**
 * Formata celular/telefone para o padrão (00) 00000-0000 ou (00) 0000-0000.
 * Aceita até 11 dígitos numéricos.
 */
export function formatarCelular(val?: string | null): string {
  const digits = apenasDigitos(val).slice(0, 11);
  if (!digits) return '';

  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Formata data de nascimento no formato ISO (YYYY-MM-DD) para o formato brasileiro (DD/MM/AAAA).
 * Retorna 'Não informada' se o parâmetro estiver vazio ou nulo.
 */
export function formatarDataBR(dataIso?: string | null): string {
  if (!dataIso) return 'Não informada';
  const limpo = dataIso.trim();
  if (!limpo) return 'Não informada';

  // Se já for DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(limpo)) return limpo;

  // Formato YYYY-MM-DD ou ISO datetime
  const partes = limpo.split('T')[0].split('-');
  if (partes.length === 3) {
    const [ano, mes, dia] = partes;
    if (ano.length === 4 && mes.length === 2 && dia.length === 2) {
      return `${dia}/${mes}/${ano}`;
    }
  }

  return limpo;
}

/**
 * Converte data no formato brasileiro DD/MM/AAAA para formato ISO (YYYY-MM-DD).
 */
export function formatarDataISO(dataBR?: string | null): string | null {
  if (!dataBR) return null;
  const limpo = dataBR.trim();
  if (!limpo) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(limpo)) return limpo;

  const partes = limpo.split('/');
  if (partes.length === 3) {
    const [dia, mes, ano] = partes;
    if (dia.length === 2 && mes.length === 2 && ano.length === 4) {
      return `${ano}-${mes}-${dia}`;
    }
  }

  return null;
}
