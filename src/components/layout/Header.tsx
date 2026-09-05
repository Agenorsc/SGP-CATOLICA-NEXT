import React from 'react';
import { GraduationCap } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
}

export const Header: React.FC<HeaderProps> = ({ currentTab }) => {
  return (
    <header className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-catolica-primary text-white rounded-lg">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold capitalize text-slate-800 sm:text-xl">{currentTab.replace('-', ' ')}</h1>
          <p className="text-sm text-slate-500">Centro Universitário Católica SC</p>
        </div>
      </div>
    </header>
  );
};
