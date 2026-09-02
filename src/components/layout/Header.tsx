import React from 'react';
import { GraduationCap, LogOut } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  userName: string;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, userName, onLogout }) => {
  return (
    <header className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-catolica-primary text-white rounded-lg">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 capitalize">{currentTab.replace('-', ' ')}</h1>
          <p className="text-sm text-slate-500">Centro Universitário Católica SC</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-xs bg-catolica-light text-catolica-primary font-semibold px-4 py-2 rounded-full border border-catolica-primary/20">
          {userName} autenticado(a)
        </div>
        <button onClick={onLogout} className="p-2 text-slate-400 hover:text-catolica-primary transition" title="Sair" aria-label="Sair">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
