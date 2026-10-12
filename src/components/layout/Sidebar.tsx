'use client';

import React from 'react';
import { 
  UserPlus, 
  BookOpen, 
  Printer, 
  Scan, 
  BarChart3, 
  X, 
  LogOut 
} from 'lucide-react';

export type TabType = 'cadastros' | 'montador' | 'impressao' | 'leitura' | 'relatorios';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
  session: { name: string; email: string };
  onLogout: () => void;
}

const navItems: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'cadastros', label: 'Cadastros (Aluno/Turma)', icon: UserPlus },
  { id: 'montador', label: 'Montador de Provas', icon: BookOpen },
  { id: 'impressao', label: 'Caderno & Gabarito OMR', icon: Printer },
  { id: 'leitura', label: 'Leitura & Correção OMR', icon: Scan },
  { id: 'relatorios', label: 'Relatórios & Histórico', icon: BarChart3 },
];

export function Sidebar({
  currentTab,
  onSelectTab,
  sidebarOpen,
  onCloseSidebar,
  session,
  onLogout
}: SidebarProps) {
  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm print:hidden md:hidden"
          onClick={onCloseSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col justify-between bg-slate-900 p-6 text-white shadow-2xl transition-transform duration-300 print:hidden md:h-screen md:w-64 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-catolica-primary flex items-center justify-center font-black text-white text-xl shadow-lg shadow-catolica-primary/40">
                C
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-white">SGP Católica</h2>
                <p className="text-[11px] text-slate-400 font-medium">Gestão & OMR Studio (N2)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCloseSidebar}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white md:hidden"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1.5" aria-label="Navegação principal">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseSidebar();
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    active
                      ? 'translate-x-1 bg-catolica-primary text-white shadow-md shadow-catolica-primary/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-800/60 p-4 text-[11px] text-slate-400">
          <div className="border-b border-slate-700 pb-3">
            <p className="truncate text-xs font-semibold text-slate-200">{session.name} autenticado(a)</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-500">Acesso de professor</p>
          </div>
          <p className="font-semibold text-slate-300">Católica SC - Campus Jaraguá</p>
          <p>Projeto de Arquitetura de Software</p>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-catolica-primary hover:bg-catolica-primary hover:text-white"
            title="Sair da conta"
          >
            <LogOut className="h-4 w-4" /> Sair da conta
          </button>
        </div>
      </aside>
    </>
  );
}
