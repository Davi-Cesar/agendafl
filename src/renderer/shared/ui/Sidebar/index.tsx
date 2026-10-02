import React from 'react';
import { useSidebarController } from './controller';
import { NAV_ITEMS } from './sidebar.config';
import { SidebarBrand, SidebarNavItem, SidebarLogoutButton } from './components';

export function Sidebar() {
  const controller = useSidebarController();

  return (
    <aside className="w-[220px] min-w-[220px] h-full bg-surface-lowest border-r border-primary/30 shadow-sidebar flex flex-col justify-between p-4 font-inter text-on-surface relative z-10">
      <div>
        <SidebarBrand />

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = controller.currentRoute === item.route;

            return (
              <SidebarNavItem
                key={item.route}
                label={item.label}
                icon={<Icon className="w-5 h-5" />}
                isActive={isActive}
                onClick={() => controller.handleNavigate(item.route)}
              />
            );
          })}
        </nav>
      </div>

      <SidebarLogoutButton onLogout={controller.handleLogout} />
    </aside>
  );
}
