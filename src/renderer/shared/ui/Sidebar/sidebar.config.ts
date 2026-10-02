import type { ComponentType } from 'react';
import type { RoutePath } from '../../router/router.store';
import {
  AgendaIcon,
  CaixaIcon,
  ProfissionaisIcon,
  ClientesIcon,
  ServicosIcon,
  ComandasIcon,
  type IconProps,
} from './icons';

export interface NavItemConfig {
  route: RoutePath;
  label: string;
  icon: ComponentType<IconProps>;
}

export const NAV_ITEMS: readonly NavItemConfig[] = [
  {
    route: '/agenda',
    label: 'Agenda',
    icon: AgendaIcon,
  },
  {
    route: '/caixa',
    label: 'Caixa',
    icon: CaixaIcon,
  },
  {
    route: '/profissionais',
    label: 'Profissionais',
    icon: ProfissionaisIcon,
  },
  {
    route: '/clientes',
    label: 'Clientes',
    icon: ClientesIcon,
  },
  {
    route: '/servicos',
    label: 'Serviços',
    icon: ServicosIcon,
  },
  {
    route: '/comandas',
    label: 'Comandas',
    icon: ComandasIcon,
  },
] as const;
