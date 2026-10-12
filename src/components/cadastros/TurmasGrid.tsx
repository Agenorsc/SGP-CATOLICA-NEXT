'use client';

import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { TurmaModel } from '@/models/TurmaModel';
import { AlunoModel } from '@/models/AlunoModel';

interface TurmasGridProps {
  turmas: TurmaModel[];
  alunos: AlunoModel[];
  onEdit: (turma: TurmaModel) => void;
  onDelete: (id: string) => void;
}

export function TurmasGrid({
  turmas,
  alunos,
  onEdit,
  onDelete
}: TurmasGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {turmas.map(t => {
        const alunosDaTurma = alunos.filter(a => a.turmaId === t.id);
        return (
          <div key={t.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold bg-catolica-light text-catolica-primary px-3 py-1 rounded-lg border border-catolica-primary/20">
                {t.semestre}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-lg border text-slate-700">
                  Convite: <strong>{t.codigoConvite}</strong>
                </span>
                <button
                  onClick={() => onEdit(t)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                  title="Editar Turma"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => onDelete(t.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Excluir Turma"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <h4 className="font-bold text-base text-slate-800">{t.nome}</h4>
            <p className="text-xs text-slate-500">{t.curso}</p>

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">
                  Estudantes Matriculados ({alunosDaTurma.length}):
                </span>
              </div>

              <div className="text-xs space-y-1 text-slate-600 max-h-40 overflow-y-auto">
                {alunosDaTurma.length === 0 ? (
                  <p className="text-slate-400 italic text-[11px] py-2">
                    Nenhum aluno matriculado nesta disciplina.
                  </p>
                ) : (
                  alunosDaTurma.map(a => (
                    <div key={a.id} className="flex justify-between p-1.5 bg-slate-50 rounded-lg">
                      <span>{a.nome}</span>
                      <span className="font-mono text-slate-500">RA: {a.ra}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
