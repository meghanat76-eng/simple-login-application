import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Plus, LogOut, User as UserIcon, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16" id="app-navbar">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            id="navbar-mobile-toggle"
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5 font-bold text-slate-900" id="navbar-brand-link">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-lg tracking-tight hidden sm:inline">JobTracker</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/applications/new" id="navbar-add-app-button">
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              <span className="hidden sm:inline">Add Application</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div
                id="navbar-user-profile"
                className="flex items-center gap-2 px-2 py-1 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-semibold">
                  {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                </div>
                <div className="hidden md:block text-left text-xs">
                  <div className="font-semibold text-slate-800 leading-tight">{user.name}</div>
                  <div className="text-slate-500 leading-tight truncate max-w-[120px]">{user.email}</div>
                </div>
              </div>

              <Button
                id="navbar-logout-button"
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                title="Log out"
                className="text-slate-500 hover:text-rose-600"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline text-xs">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
