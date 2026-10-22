'use client';

import React, { useState } from 'react';
import { 
  GraduationCap, 
  UserPlus, 
  Pencil, 
  Trash2, 
  Mail, 
  BookOpen, 
  ShieldCheck, 
  Users,
  Search
} from 'lucide-react';
import { UsuarioModel } from '@/models/UsuarioModel';
import { TurmaModel } from '@/models/TurmaModel';

interface ProfessoresTabProps {
  professores: UsuarioModel[];
  turmas: TurmaModel[];
  onOpenNovoProfessor: () => void;
  onEditProfessor: (prof: UsuarioModel) => void;
  onDeleteProfessor: (id: string) => void;
}

export function ProfessoresTab({
  professores,
  turmas,
  onOpenNovoProfessor,
  onEditProfessor,
  onDeleteProfessor
}: ProfessoresTabProps) {
  const [busca, setBusca] = useState('');

  const professoresFiltrados = professores.filter(p => {
    const termo = busca.toLowerCase();
    return (
      p.nome.toLowerCase().includes(termo) ||
      p.email.toLowerCase().includes(termo) ||
      (p.disciplina && p.disciplina.toLowerCase().includes(termo))
    );
  });

  return (
    <div className="space-y-6">
      {/* CABEÇALHO DA SEÇÃO DE PROFESSORES */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-catolica-primary text-white rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Corpo Docente & Disciplinas</h2>
              <p className="text-xs text-slate-500">
                Gestão exclusiva de Professores e Atribuição de Disciplinas (Acesso Administrador)
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenNovoProfessor}
          className="bg-catolica-primary hover:bg-catolica-dark text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-catolica-primary/25 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Novo Professor
        </button>
      </div>

      {/* BARRA DE PESQUISA */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail institucional ou disciplina..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="bg-transparent text-xs w-full outline-none"
          />
        </div>
      </div>

      {/* GRID DE CARDS DE PROFESSORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professoresFiltrados.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
            Nenhum professor encontrado com os critérios de busca.
          </div>
        ) : (
          professoresFiltrados.map((prof) => {
            const turmasDoProf = turmas.filter(t => t.professorId === prof.id);

            return (
              <div
                key={prof.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
                        {prof.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{prof.nome}</h3>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                          Docente
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditProfessor(prof)}
                        className="p-1.5 text-slate-400 hover:text-catolica-primary hover:bg-slate-100 rounded-lg transition"
                        title="Editar Professor"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProfessor(prof.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Excluir Professor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-[11px] truncate">{prof.email}</span>
                    </div>
                    {prof.disciplina && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-700 truncate">{prof.disciplina}</span>
                      </div>
                    )}
                  </div>

                  {/* TURMAS ASSOCIADAS */}
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 flex items-center gap-1">
                      <Users className="w-3 h-3 text-catolica-primary" />
                      Disciplinas / Turmas Atribuídas ({turmasDoProf.length}):
                    </p>
                    {turmasDoProf.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">Nenhuma turma atribuída no momento.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {turmasDoProf.map(t => (
                          <span
                            key={t.id}
                            className="text-[10px] font-bold bg-catolica-light text-catolica-primary px-2 py-0.5 rounded-lg border border-catolica-primary/20"
                          >
                            {t.nome}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> Acesso Ativo
                  </span>
                  <span className="font-mono text-[10px]">ID: {prof.id.slice(0, 8)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
