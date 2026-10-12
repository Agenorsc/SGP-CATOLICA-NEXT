'use client';

import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { AlunoModel } from '@/models/AlunoModel';
import { TurmaModel } from '@/models/TurmaModel';

interface AlunosTableProps {
  alunos: AlunoModel[];
  turmas: TurmaModel[];
  onEdit: (aluno: AlunoModel) => void;
  onDelete: (id: string) => void;
}

export function AlunosTable({
  alunos,
  turmas,
  onEdit,
  onDelete
}: AlunosTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      <h4 className="font-bold text-slate-800 text-sm">Lista de Estudantes Cadastrados</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b text-slate-400 font-bold uppercase">
              <th className="pb-3">RA / Registro</th>
              <th className="pb-3">Nome Completo</th>
              <th className="pb-3">Curso</th>
              <th className="pb-3">Turno</th>
              <th className="pb-3">Disciplina / Turma</th>
              <th className="pb-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {alunos.map(a => {
              const turmaObj = turmas.find(t => t.id === a.turmaId);
              return (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="py-3 font-mono font-bold text-slate-800">{a.ra}</td>
                  <td className="py-3 font-bold text-slate-900">{a.nome}</td>
                  <td className="py-3 text-slate-600">{a.curso}</td>
                  <td className="py-3 text-slate-600">{a.turno}</td>
                  <td className="py-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                        turmaObj
                          ? 'bg-catolica-light text-catolica-primary'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {turmaObj ? turmaObj.nome : 'Nenhuma Disciplina'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(a)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                        title="Editar Aluno"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(a.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Excluir Aluno"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
