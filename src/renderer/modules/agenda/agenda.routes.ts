import { AgendaView } from './views/AgendaView';

export interface RouteDefinition {
  path: string;
  component: React.ComponentType;
  label: string;
}

export const agendaRoutes: RouteDefinition[] = [
  { path: '/agenda', component: AgendaView, label: 'Agenda' },
];
