'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

interface AlertaModalProps {
  isOpen: boolean;
  onClose: () => void;
  titulo?: string;
  mensagem: string;
  tipo?: 'erro' | 'sucesso' | 'info';
}

export function AlertaModal({
  isOpen,
  onClose,
  titulo,
  mensagem,
  tipo = 'erro'
}: AlertaModalProps) {
  if (!isOpen) return null;

  const config = {
    erro: {
      bgIcon: 'bg-red-100 text-red-600',
      border: 'border-red-200',
      btn: 'bg-red-600 hover:bg-red-700 text-white',
      defaultTitle: 'Atenção na Validação',
      Icon: AlertTriangle
    },
    sucesso: {
      bgIcon: 'bg-emerald-100 text-emerald-600',
      border: 'border-emerald-200',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      defaultTitle: 'Sucesso',
      Icon: CheckCircle2
    },
    info: {
      bgIcon: 'bg-blue-100 text-blue-600',
      border: 'border-blue-200',
      btn: 'bg-blue-600 hover:bg-blue-700 text-white',
      defaultTitle: 'Informação',
      Icon: Info
    }
  }[tipo];

  const IconComponent = config.Icon;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 border ${config.border} transform transition-all scale-100`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl ${config.bgIcon} flex items-center justify-center shrink-0 shadow-sm`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {titulo || config.defaultTitle}
              </h3>
              <p className="text-xs text-slate-500 font-medium">SGP Católica SC</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 leading-relaxed">
          {mensagem}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2.5 ${config.btn} rounded-xl text-xs font-bold shadow-md transition cursor-pointer`}
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
