import { create } from 'zustand';

export type RoutePath = '/agenda' | '/caixa' | '/clientes' | '/servicos' | '/comandas' | '/profissionais';

interface RouterState {
  currentRoute: RoutePath;
  routeParams: Record<string, any>;
  navigate: (route: RoutePath, params?: Record<string, any>) => void;
}

export const useRouterStore = create<RouterState>((set) => ({
  currentRoute: '/agenda',
  routeParams: {},
  navigate: (route, params = {}) => set({ currentRoute: route, routeParams: params }),
}));
