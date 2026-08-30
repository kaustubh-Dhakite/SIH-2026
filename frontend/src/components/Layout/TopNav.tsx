import React from 'react';
import { Bell, Search, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../../hooks/useAuth';

export const TopNav: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="h-16 bg-light-bg-primary dark:bg-dark-bg-primary border-b border-light-border dark:border-dark-border flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary" size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary relative">
          <Bell size={20} className="text-light-text-primary dark:text-dark-text-primary" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
        </button>

        <ThemeToggle />

        {user && (
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                {user.username}
              </p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary capitalize">
                {user.role}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary text-light-text-primary dark:text-dark-text-primary"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
