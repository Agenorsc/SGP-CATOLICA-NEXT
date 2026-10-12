'use client';

import React, { useState } from 'react';
import { UserPlus, FolderPlus, GraduationCap, Users } from 'lucide-react';
import { AlunoModel } from '@/models/AlunoModel';
import { TurmaModel } from '@/models/TurmaModel';
import { AlunosTable } from './AlunosTable';
import { TurmasGrid } from './TurmasGrid';

interface CadastrosTabProps {
  alunos: AlunoModel[];
  turmas: TurmaModel[];
  onOpenNovoAluno: () => void;
  onOpenNovaTurma: () => void;
  onEditAluno: (aluno: AlunoModel) => void;
  onDeleteAluno: (id: string) => void;
  onEditTurma: (turma: TurmaModel) => void;
  onDeleteTurma: (id: string) => void;
}

export function CadastrosTab({
  alunos,
  turmas,
  onOpenNovoAluno,
  onOpenNovaTurma,
  onEditAluno,
  onDeleteAluno,
  onEditTurma,
  onDeleteTurma
}: CadastrosTabProps) {
  const [subTab, setSubTab] = useState<'alunos' | 'turmas'>('alunos');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Painel de Cadastros Gerais</h3>
          <p className="text-xs text-slate-500">Gestão e Edição de Alunos e Turmas Acadêmicas</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onOpenNovoAluno}
            className="bg-catolica-primary text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-catolica-dark transition shadow-md"
          >
            <UserPlus className="w-4 h-4" /> Cadastrar Aluno
          </button>
          <button
            onClick={onOpenNovaTurma}
            className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-md"
          >
            <FolderPlus className="w-4 h-4" /> Cadastrar Turma
          </button>
        </div>
      </div>

      <div className="flex gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('alunos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === 'alunos'
              ? 'bg-catolica-primary text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Alunos Cadastrados ({alunos.length})
        </button>
        <button
          onClick={() => setSubTab('turmas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            subTab === 'turmas'
              ? 'bg-catolica-primary text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> Turmas / Disciplinas ({turmas.length})
        </button>
      </div>

      {subTab === 'alunos' && (
        <AlunosTable
          alunos={alunos}
          turmas={turmas}
          onEdit={onEditAluno}
          onDelete={onDeleteAluno}
        />
      )}

      {subTab === 'turmas' && (
        <TurmasGrid
          turmas={turmas}
          alunos={alunos}
          onEdit={onEditTurma}
          onDelete={onDeleteTurma}
        />
      )}
    </div>
  );
}
