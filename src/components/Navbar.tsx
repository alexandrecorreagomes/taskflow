import React from 'react';
import { CheckSquare, BarChart3, Calendar as CalendarIcon, LogOut, User } from 'lucide-react';

export type TabId = 'tasks' | 'analytics' | 'calendar';

interface NavbarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  username: string;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, username, onLogout }) => {
  const tabs = [
    { id: 'tasks' as TabId, label: 'Tarefas', icon: CheckSquare },
    { id: 'analytics' as TabId, label: 'Análises', icon: BarChart3 },
    { id: 'calendar' as TabId, label: 'Calendário', icon: CalendarIcon },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <CheckSquare size={20} className="stroke-[2.5]" />
            </div>
            <span className="font-semibold text-slate-800 tracking-tight hidden sm:block">
              TaskFlow
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 sm:px-4 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-500/5'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'stroke-[2.2]' : ''} />
                  <span className="hidden xs:block">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            {/* User Badge */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 max-w-[140px] sm:max-w-none">
              <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 text-xs">
                <User size={12} className="stroke-[2.5]" />
              </div>
              <span className="text-xs font-semibold text-slate-600 truncate">
                {username}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              title="Sair da conta"
              className="flex items-center justify-center w-9 h-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-100"
            >
              <LogOut size={16} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
