type EventCallback<T = any> = (payload: T) => void;

export interface EventMap {
  'comanda:finalizada': { comandaId: string; agendamentoId?: string };
  'caixa:aberto': { caixaId: string; valorInicial: number };
  'caixa:fechado': { caixaId: string };
  'agendamento:criado': { agendamentoId: string };
  'agendamento:atualizado': { agendamentoId: string };
}

class EventBus {
  private listeners = new Map<string, Set<EventCallback>>();

  on<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);
  }

  off<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void {
    this.listeners.get(event)?.delete(callback as EventCallback);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    this.listeners.get(event)?.forEach((cb) => cb(payload));
  }
}

export const eventBus = new EventBus();
