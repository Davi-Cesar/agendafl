import React from 'react';
import { createRoot } from 'react-dom/client';
import { Sidebar } from '@shared/ui/Sidebar';
import { useRouterStore } from '@shared/router/router.store';
import { AgendaView } from '@modules/agenda';
import { ComandasView } from '@modules/comandas';
import { CaixaView } from '@modules/caixa';
import { ClientesView } from '@modules/clientes';
import { ServicosView } from '@modules/servicos';
import { ProfissionaisView } from '@modules/profissionais';
import { UpdateBanner } from '@shared/ui/UpdateBanner';
import { iniciarMonitoramentoAtualizacao } from '@shared/lib/update.store';

// Assina os eventos de atualização OTA do Electron uma única vez (no-op no navegador).
iniciarMonitoramentoAtualizacao();

function App() {
  const currentRoute = useRouterStore((s) => s.currentRoute);

  return (
    <div id="app" style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ flex: 1, height: '100%', overflowY: 'auto', background: 'var(--surface-base, #0f172a)' }}>
        {currentRoute === '/agenda' && <AgendaView />}
        {currentRoute === '/comandas' && <ComandasView />}
        {currentRoute === '/caixa' && <CaixaView />}
        {currentRoute === '/clientes' && <ClientesView />}
        {currentRoute === '/servicos' && <ServicosView />}
        {currentRoute === '/profissionais' && <ProfissionaisView />}
      </div>

      <UpdateBanner />
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
