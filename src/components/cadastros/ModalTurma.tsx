'use client';

import React from 'react';
import { X, GraduationCap } from 'lucide-react';
import { UsuarioModel } from '@/models/UsuarioModel';

export interface FormTurmaState {
  nome: string;
  curso: string;
  semestre: string;
  fase?: string;
  professorId?: string;
}

export const OPCOES_FASES_DISCIPLINA = [
  '1ª Fase',
  '2ª Fase',
  '3ª Fase',
  '4ª Fase',
  '5ª Fase',
  '6ª Fase',
  '7ª Fase',
  '8ª Fase',
  '9ª Fase',
  '10ª Fase'
] as const;

interface ModalTurmaProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formTurma: FormTurmaState;
  setFormTurma: React.Dispatch<React.SetStateAction<FormTurmaState>>;
  onSubmit: (e: React.FormEvent) => void;
  professores?: UsuarioModel[];
  isAdmin?: boolean;
}

export function ModalTurma({
  isOpen,
  onClose,
  isEditing,
  formTurma,
  setFormTurma,
  onSubmit,
  professores = [],
  isAdmin = false
}: ModalTurmaProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 border border-slate-200">
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="text-base font-bold text-slate-900">
            {isEditing ? 'Editar Turma' : 'Nova Turma Acadêmica'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nome da Disciplina / Turma
            </label>
            <input
              required
              type="text"
              placeholder="Ex: Engenharia de Software IV"
              value={formTurma.nome}
              onChange={e => setFormTurma({ ...formTurma, nome: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Curso</label>
            <input
              type="text"
              value={formTurma.curso}
              onChange={e => setFormTurma({ ...formTurma, curso: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Fase da Disciplina
            </label>
            <select
              value={formTurma.fase || '1ª Fase'}
              onChange={e => setFormTurma({ ...formTurma, fase: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-800 focus:border-catolica-primary outline-none"
            >
              {OPCOES_FASES_DISCIPLINA.map(fase => (
                <option key={fase} value={fase}>
                  {fase}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Semestre Letivo</label>
            <input
              type="text"
              value={formTurma.semestre}
              onChange={e => setFormTurma({ ...formTurma, semestre: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
            />
          </div>

          {/* Atribuição de Professor Responsável (exclusivo para Admin ou se houver lista de professores) */}
          {isAdmin && professores.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-catolica-primary" />
                Professor Responsável
              </label>
              <select
                value={formTurma.professorId || ''}
                onChange={e => setFormTurma({ ...formTurma, professorId: e.target.value || undefined })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
              >
                <option value="">Selecione o professor responsável...</option>
                {professores.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nome} {p.disciplina ? `(${p.disciplina})` : ''}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-400">
                Apenas o professor atribuído terá acesso a esta turma e aos seus alunos.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 transition"
            >
              {isEditing ? 'Atualizar Turma' : 'Criar Turma'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
