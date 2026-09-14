import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListFilter, PlusCircle, CheckCircle2 } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      id: 'sidebar-nav-dashboard',
    },
    {
      to: '/applications',
      label: 'Applications',
      icon: <ListFilter className="w-5 h-5" />,
      id: 'sidebar-nav-applications',
    },
    {
      to: '/applications/new',
      label: 'Add Application',
      icon: <PlusCircle className="w-5 h-5" />,
      id: 'sidebar-nav-add-application',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="p-4 space-y-6">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Navigation
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  id={item.id}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Database & local mode badge */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-3 rounded-xl border border-slate-200/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Local Database Active</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            SQLite powered with Prisma ORM. No external cloud credentials required.
          </p>
        </div>
      </aside>
    </>
  );
};
