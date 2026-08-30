import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Database,
  FileText,
  Cpu,
  Image,
  Wrench,
  Shield,
  FileSearch,
  Settings,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'operator', 'analyst', 'viewer'] },
  { path: '/agents', icon: Users, label: 'Agent Workspace', roles: ['admin', 'operator', 'analyst'] },
  { path: '/knowledge-base', icon: Database, label: 'Knowledge Base', roles: ['admin', 'operator', 'analyst'] },
  { path: '/documents', icon: FileText, label: 'Documents', roles: ['admin', 'operator', 'analyst', 'viewer'] },
  { path: '/models', icon: Cpu, label: 'Models', roles: ['admin', 'operator', 'analyst', 'viewer'] },
  { path: '/multimodal', icon: Image, label: 'Multimodal', roles: ['admin', 'operator', 'analyst'] },
  { path: '/tools', icon: Wrench, label: 'Tools', roles: ['admin', 'operator', 'analyst'] },
  { path: '/audit-logs', icon: FileSearch, label: 'Audit Logs', roles: ['admin', 'operator', 'viewer'] },
  { path: '/security', icon: Shield, label: 'Security Center', roles: ['admin'] },
  { path: '/settings', icon: Settings, label: 'Settings', roles: ['admin', 'operator', 'analyst', 'viewer'] },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const filteredItems = navItems.filter(item =>
    user && item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 h-screen bg-light-bg-secondary dark:bg-dark-bg-secondary border-r border-light-border dark:border-dark-border flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary">Sovereign AI</h1>
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
          On-Premise Workbench
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-light-text-primary dark:text-dark-text-primary hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary'
              )
            }
          >
            <item.icon size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="p-4 border-t border-light-border dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary truncate">
                {user.username}
              </p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
