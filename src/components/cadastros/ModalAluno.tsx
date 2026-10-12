'use client';

import React from 'react';
import { X } from 'lucide-react';
import { TurmaModel } from '@/models/TurmaModel';

export interface FormAlunoState {
  nome: string;
  ra: string;
  curso: string;
  turno: string;
  turmaId: string;
  dataNascimento: string;
  naturalidade: string;
  estadoNatal: string;
  mae: string;
  pai: string;
  celular: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface ModalAlunoProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formAluno: FormAlunoState;
  setFormAluno: React.Dispatch<React.SetStateAction<FormAlunoState>>;
  onSubmit: (e: React.FormEvent) => void;
  turmas: TurmaModel[];
}

export function ModalAluno({
  isOpen,
  onClose,
  isEditing,
  formAluno,
  setFormAluno,
  onSubmit,
  turmas
}: ModalAlunoProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isEditing ? 'Editar Aluno' : 'Cadastro do Aluno'}
            </h3>
            <p className="text-xs text-slate-500">Estrutura baseada no Portal Acadêmico Católica SC</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="border-b pb-3">
            <span className="text-xs font-bold text-catolica-primary uppercase block mb-2">
              Dados Acadêmicos & Identificação
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Nome Completo</label>
                <input
                  required
                  type="text"
                  value={formAluno.nome}
                  onChange={e => setFormAluno({ ...formAluno, nome: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Registro Acadêmico (RA)</label>
                <input
                  type="text"
                  placeholder="Ex: 1328834"
                  value={formAluno.ra}
                  onChange={e => setFormAluno({ ...formAluno, ra: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Disciplina / Turma</label>
                <select
                  value={formAluno.turmaId}
                  onChange={e => setFormAluno({ ...formAluno, turmaId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-bold"
                >
                  <option value="">Nenhuma Disciplina</option>
                  {turmas.map(t => (
                    <option key={t.id} value={t.id}>{t.nome}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

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
              className="px-4 py-2 bg-catolica-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-catolica-dark transition"
            >
              {isEditing ? 'Atualizar Aluno' : 'Salvar Aluno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
