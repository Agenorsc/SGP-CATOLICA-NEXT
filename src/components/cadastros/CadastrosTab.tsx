'use client';

import React, { useState, useMemo } from 'react';
import { UserPlus, FolderPlus, GraduationCap, Users, BookOpen, Layers, ArrowRight } from 'lucide-react';
import { AlunoModel } from '@/models/AlunoModel';
import { TurmaModel } from '@/models/TurmaModel';
import { AlunosTable } from './AlunosTable';
import { TurmasGrid } from './TurmasGrid';
import { ImportarAlunos } from './ImportarAlunos';

interface CadastrosTabProps {
  alunos: AlunoModel[];
  turmas: TurmaModel[];
  onOpenNovoAluno: (cursoInicial?: string) => void;
  onOpenNovaTurma: () => void;
  onEditAluno: (aluno: AlunoModel) => void;
  onDeleteAluno: (id: string) => void;
  onImportComplete: () => Promise<void> | void;
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
  onImportComplete,
  onEditTurma,
  onDeleteTurma
}: CadastrosTabProps) {
  const [subTab, setSubTab] = useState<'alunos' | 'turmas' | 'cursos'>('alunos');
  const [cursoFiltro, setCursoFiltro] = useState<string>('TODOS');

  // Cursos únicos cadastrados a partir das turmas e alunos
  const cursosUnicos = useMemo(() => {
    const map = new Map<string, { nome: string; turmasCount: number; alunosCount: number }>();
    
    // Contabiliza turmas por curso
    turmas.forEach(t => {
      const nomeCurso = (t.curso || '').trim();
      if (!nomeCurso) return;
      const key = nomeCurso.toLowerCase();
      if (!map.has(key)) {
        map.set(key, { nome: nomeCurso, turmasCount: 0, alunosCount: 0 });
      }
      map.get(key)!.turmasCount++;
    });

    // Contabiliza alunos por curso
    alunos.forEach(a => {
      const nomeCurso = (a.curso || '').trim();
      if (!nomeCurso) return;
      const key = nomeCurso.toLowerCase();
      if (!map.has(key)) {
        map.set(key, { nome: nomeCurso, turmasCount: 0, alunosCount: 0 });
      }
      map.get(key)!.alunosCount++;
    });

    return Array.from(map.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [turmas, alunos]);

  // Alunos filtrados por curso se ativo
  const alunosExibidos = useMemo(() => {
    if (cursoFiltro === 'TODOS') return alunos;
    return alunos.filter(a => (a.curso || '').trim().toLowerCase() === cursoFiltro.toLowerCase());
  }, [alunos, cursoFiltro]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Painel de Cadastros Gerais</h3>
          <p className="text-xs text-slate-500">Gestão e Edição de Alunos, Turmas e Cursos Acadêmicos</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onOpenNovoAluno()}
            className="bg-catolica-primary text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-catolica-dark transition shadow-md cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Cadastrar Aluno
          </button>
          <ImportarAlunos alunos={alunos} turmas={turmas} onImportComplete={onImportComplete} />
          <button
            onClick={onOpenNovaTurma}
            className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-md cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" /> Cadastrar Turma
          </button>
        </div>
      </div>

      {/* SUB-ABAS: ALUNOS, TURMAS E CURSOS */}
      <div className="flex flex-wrap gap-2.5 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('alunos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            subTab === 'alunos'
              ? 'bg-catolica-primary text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Alunos Cadastrados ({alunos.length})
        </button>
        <button
          onClick={() => setSubTab('turmas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            subTab === 'turmas'
              ? 'bg-catolica-primary text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> Turmas / Disciplinas ({turmas.length})
        </button>
        <button
          onClick={() => setSubTab('cursos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            subTab === 'cursos'
              ? 'bg-catolica-primary text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Cursos Acadêmicos ({cursosUnicos.length})
        </button>
      </div>

      {/* ABA 1: ALUNOS (COM FILTRO RÁPIDO DE CURSO) */}
      {subTab === 'alunos' && (
        <div className="space-y-4">
          {/* BARRA DE FILTROS RÁPIDOS POR CURSO */}
          {cursosUnicos.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 bg-white p-3 rounded-2xl border border-slate-200 text-xs">
              <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-catolica-primary" /> Filtrar por Curso:
              </span>
              <button
                type="button"
                onClick={() => setCursoFiltro('TODOS')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  cursoFiltro === 'TODOS'
                    ? 'bg-catolica-primary text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Todos ({alunos.length})
              </button>
              {cursosUnicos.map(c => (
                <button
                  key={c.nome}
                  type="button"
                  onClick={() => setCursoFiltro(c.nome)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    cursoFiltro.toLowerCase() === c.nome.toLowerCase()
                      ? 'bg-catolica-primary text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {c.nome} ({c.alunosCount})
                </button>
              ))}
            </div>
          )}

          <AlunosTable
            alunos={alunosExibidos}
            turmas={turmas}
            onEdit={onEditAluno}
            onDelete={onDeleteAluno}
          />
        </div>
      )}

      {/* ABA 2: TURMAS */}
      {subTab === 'turmas' && (
        <TurmasGrid
          turmas={turmas}
          alunos={alunos}
          onEdit={onEditTurma}
          onDelete={onDeleteTurma}
        />
      )}

      {/* ABA 3: CURSOS ACADÊMICOS */}
      {subTab === 'cursos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursosUnicos.length === 0 ? (
            <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
              Nenhum curso acadêmico identificado. Crie turmas para registrar cursos.
            </div>
          ) : (
            cursosUnicos.map(curso => {
              const turmasDesteCurso = turmas.filter(t => (t.curso || '').trim().toLowerCase() === curso.nome.toLowerCase());
              return (
                <div
                  key={curso.nome}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="p-2 bg-catolica-primary/10 text-catolica-primary rounded-xl">
                        <BookOpen className="w-5 h-5" />
                      </span>
                      <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                        {curso.turmasCount} turma(s)
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900 mt-3">{curso.nome}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {curso.alunosCount} estudante(s) matriculado(s) neste curso
                    </p>

                    {/* Turmas do Curso */}
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Disciplinas Vinculadas:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {turmasDesteCurso.slice(0, 3).map(t => (
                          <span key={t.id} className="text-[11px] font-semibold bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            {t.nome}
                          </span>
                        ))}
                        {turmasDesteCurso.length > 3 && (
                          <span className="text-[11px] text-slate-400">+{turmasDesteCurso.length - 3} mais</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onOpenNovoAluno(curso.nome)}
                      className="flex-1 bg-catolica-primary hover:bg-catolica-dark text-white px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Cadastrar Aluno
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCursoFiltro(curso.nome);
                        setSubTab('alunos');
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      Ver Alunos <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
