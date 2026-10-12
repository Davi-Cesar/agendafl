import { useCallback } from 'react';
import { useRouterStore, type RoutePath } from '../../router/router.store';

export function useSidebarController() {
  const currentRoute = useRouterStore((state) => state.currentRoute);
  const navigate = useRouterStore((state) => state.navigate);

  const handleNavigate = useCallback((route: RoutePath) => {
    navigate(route);
  }, [navigate]);

  const handleLogout = useCallback(() => {
    if (window.electronAPI?.closeWindow) {
      window.electronAPI.closeWindow();
    }
  }, []);

  return {
    currentRoute,
    handleNavigate,
    handleLogout,
  };
}

export type SidebarController = ReturnType<typeof useSidebarController>;
