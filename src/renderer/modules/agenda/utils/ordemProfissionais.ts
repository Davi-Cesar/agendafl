import type { Profissional } from '../schemas/agendamento.schema';

const STORAGE_KEY_ORDEM = 'agendafl_profissionais_ordem';

export function obterOrdemSalva(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDEM);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Erro ao ler ordem de profissionais do localStorage:', err);
    return [];
  }
}

export function salvarOrdem(ordemIds: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ORDEM, JSON.stringify(ordemIds));
  } catch (err) {
    console.error('Erro ao salvar ordem de profissionais no localStorage:', err);
  }
}

export function limparOrdemSalva(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ORDEM);
  } catch (err) {
    console.error('Erro ao limpar ordem de profissionais do localStorage:', err);
  }
}

export function aplicarOrdemSalva(profs: Profissional[], ordemIds?: string[]): Profissional[] {
  const ids = ordemIds ?? obterOrdemSalva();
  if (!ids || ids.length === 0) return profs;

  const profsMap = new Map<string, Profissional>();
  profs.forEach((p) => profsMap.set(p.id, p));

  const resultado: Profissional[] = [];

  // 1. Adiciona os profissionais na ordem salva
  ids.forEach((id) => {
    const p = profsMap.get(id);
    if (p) {
      resultado.push(p);
      profsMap.delete(id);
    }
  });

  // 2. Adiciona os profissionais restantes (novos ou que não estavam no localStorage)
  profsMap.forEach((p) => {
    resultado.push(p);
  });

  return resultado;
}
