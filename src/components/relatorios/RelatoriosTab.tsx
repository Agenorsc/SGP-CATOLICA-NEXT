'use client';

import React from 'react';
import { Search, Download } from 'lucide-react';
import { AlunoModel } from '@/models/AlunoModel';
import { TurmaModel } from '@/models/TurmaModel';
import { LeituraOMRRegistro } from '@/types';

interface RelatoriosTabProps {
  alunos: AlunoModel[];
  leiturasOMR: LeituraOMRRegistro[];
  turmas: TurmaModel[];
  buscaRelatorio: string;
  setBuscaRelatorio: (busca: string) => void;
  alunosFiltradosRelatorio: AlunoModel[];
  onExportarCsv: () => void;
}

export function RelatoriosTab({
  alunos,
  leiturasOMR,
  turmas,
  buscaRelatorio,
  setBuscaRelatorio,
  alunosFiltradosRelatorio,
  onExportarCsv
}: RelatoriosTabProps) {
  const mediaGeral = (
    alunos.reduce((acc, a) => acc + a.media, 0) / (alunos.length || 1)
  ).toFixed(1);

  const taxaAprovacao = Math.round(
    (alunos.filter(a => a.status === 'Aprovado').length / (alunos.length || 1)) * 100
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Média Geral da Turma</span>
          <strong className="text-2xl font-black text-slate-900">{mediaGeral}</strong>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Taxa de Aprovação</span>
          <strong className="text-2xl font-black text-emerald-600">{taxaAprovacao}%</strong>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Total de Provas Lidas</span>
          <strong className="text-2xl font-black text-catolica-primary">{leiturasOMR.length}</strong>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Etapa Atual</span>
          <strong className="text-2xl font-black text-purple-600">N2 em Andamento</strong>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Histórico Contínuo de Notas (N1, N2 e N3)</h3>
            <p className="text-xs text-slate-500">Acompanhamento longitudinal do desempenho dos estudantes por turma</p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por Aluno ou RA..."
                value={buscaRelatorio}
                onChange={(e) => setBuscaRelatorio(e.target.value)}
                className="bg-transparent text-xs w-full outline-none"
              />
            </div>

            <button
              onClick={onExportarCsv}
              className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="min-w-[680px] w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                <th className="pb-3">Estudante</th>
                <th className="pb-3">Registro Acadêmico (RA)</th>
                <th className="pb-3">Disciplina / Turma</th>
                <th className="pb-3 text-center">Nota N1</th>
                <th className="pb-3 text-center">Nota N2</th>
                <th className="pb-3 text-center">Nota N3</th>
                <th className="pb-3 text-center">Média Semestral</th>
                <th className="pb-3 text-right">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alunosFiltradosRelatorio.map((item) => {
                const turmaObj = turmas.find(t => t.id === item.turmaId);
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-slate-800">{item.nome}</td>
                    <td className="py-3 font-mono text-slate-500">{item.ra}</td>
                    <td className="py-3 text-slate-600 font-semibold">{turmaObj ? turmaObj.nome : 'Engenharia IV'}</td>
                    <td className="py-3 text-center font-bold text-catolica-primary">{item.n1.toFixed(1)}</td>
                    <td className="py-3 text-center font-bold text-emerald-600 bg-emerald-50/50 rounded-lg">{item.n2.toFixed(1)}</td>
                    <td className="py-3 text-center font-semibold text-slate-700">{item.n3.toFixed(1)}</td>
                    <td className="py-3 text-center font-black text-slate-900 text-sm">{item.media.toFixed(1)}</td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          item.status === 'Aprovado'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
