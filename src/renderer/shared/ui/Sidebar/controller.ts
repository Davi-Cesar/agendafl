import { useCallback } from 'react';
import { useRouterStore, type RoutePath } from '../../router/router.store';
import { useThemeStore } from '../../lib/theme.store';

export function useSidebarController() {
  const currentRoute = useRouterStore((state) => state.currentRoute);
  const navigate = useRouterStore((state) => state.navigate);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

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
    theme,
    toggleTheme,
    handleNavigate,
    handleLogout,
  };
}

export type SidebarController = ReturnType<typeof useSidebarController>;
