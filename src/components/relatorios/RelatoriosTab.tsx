'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  Filter, 
  Layers, 
  GraduationCap, 
  Award, 
  TrendingDown, 
  BarChart3, 
  UserCheck, 
  AlertTriangle,
  FileSpreadsheet,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { AlunoModel, TurmaModel } from '@/models';
import { 
  LeituraOMRRegistro, 
  Question, 
  ProvaMontadaRegistro,
  AvaliacaoCiclo,
  RelatorioIndividualAluno
} from '@/types';
import { RelatoriosService } from '@/services/RelatoriosService';
import { GraficoDificuldadeQuestoes } from './GraficoDificuldadeQuestoes';
import { ModalDetalheAluno } from './ModalDetalheAluno';

interface RelatoriosTabProps {
  alunos: AlunoModel[];
  leiturasOMR: LeituraOMRRegistro[];
  turmas: TurmaModel[];
  provasMontadas?: ProvaMontadaRegistro[];
  bancoQuestoes?: Question[];
  buscaRelatorio: string;
  setBuscaRelatorio: (busca: string) => void;
  alunosFiltradosRelatorio: AlunoModel[];
  onExportarCsv?: () => void;
  onExportarExcel?: (params?: { turmaId?: string; ciclo?: AvaliacaoCiclo | 'TODAS'; semestre?: string }) => void;
}

export function RelatoriosTab({
  alunos,
  leiturasOMR,
  turmas,
  provasMontadas = [],
  bancoQuestoes = [],
  buscaRelatorio,
  setBuscaRelatorio,
  onExportarCsv,
  onExportarExcel
}: RelatoriosTabProps) {
  // Filtros Dinâmicos de Escopo
  const [turmaFiltroId, setTurmaFiltroId] = useState<string>('TODAS');
  const [cicloFiltro, setCicloFiltro] = useState<AvaliacaoCiclo | 'TODAS'>('TODAS');
  const [semestreFiltro, setSemestreFiltro] = useState<string>('2026/2');

  // Estado do Drilldown / Modal Individual do Aluno
  const [alunoSelecionadoDetalhe, setAlunoSelecionadoDetalhe] = useState<RelatorioIndividualAluno | null>(null);

  // Semestres únicos disponíveis
  const semestresDisponiveis = useMemo(() => {
    const s = new Set<string>();
    turmas.forEach(t => { if (t.semestre) s.add(t.semestre); });
    if (s.size === 0) s.add('2026/2');
    return Array.from(s);
  }, [turmas]);

  // Turmas filtradas pelo semestre
  const turmasDoSemestre = useMemo(() => {
    return turmas.filter(t => !semestreFiltro || t.semestre === semestreFiltro);
  }, [turmas, semestreFiltro]);

  // Execução do Pipeline de Agregação Estatística (RelatoriosService)
  const relatorioTurma = useMemo(() => {
    return RelatoriosService.gerarRelatorioTurma({
      turmaId: turmaFiltroId,
      alunos,
      turmas,
      leiturasOMR,
      provasMontadas,
      bancoQuestoes,
      filtroCiclo: cicloFiltro,
      filtroSemestre: semestreFiltro
    });
  }, [turmaFiltroId, alunos, turmas, leiturasOMR, provasMontadas, bancoQuestoes, cicloFiltro, semestreFiltro]);

  // Alunos filtrados pela busca textual (Nome ou RA)
  const alunosExibicao = useMemo(() => {
    if (!buscaRelatorio.trim()) return relatorioTurma.alunosConsolidado;
    const termo = buscaRelatorio.toLowerCase().trim();
    return relatorioTurma.alunosConsolidado.filter(
      a => a.alunoNome.toLowerCase().includes(termo) || a.ra.toLowerCase().includes(termo)
    );
  }, [relatorioTurma.alunosConsolidado, buscaRelatorio]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Exame':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="space-y-6">

      {/* 1. BARRA DE FILTROS DINÂMICOS E AÇÕES */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Controles de Filtros Acadêmicos */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Filter className="w-4 h-4 text-catolica-primary" />
              <span>Filtrar por:</span>
            </div>

            {/* Filtro por Ano/Semestre */}
            <select
              value={semestreFiltro}
              onChange={(e) => setSemestreFiltro(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-catolica-primary"
            >
              {semestresDisponiveis.map(sem => (
                <option key={sem} value={sem}>Semestre {sem}</option>
              ))}
            </select>

            {/* Filtro por Turma / Disciplina */}
            <select
              value={turmaFiltroId}
              onChange={(e) => setTurmaFiltroId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-catolica-primary max-w-xs"
            >
              <option value="TODAS">Todas as Turmas (Visão Geral Coletiva)</option>
              {turmasDoSemestre.map(t => (
                <option key={t.id} value={t.id}>{t.nome} ({t.curso})</option>
              ))}
            </select>

            {/* Filtro por Ciclo de Avaliação */}
            <select
              value={cicloFiltro}
              onChange={(e) => setCicloFiltro(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-catolica-primary"
            >
              <option value="TODAS">Todas as Avaliações (N1 + N2 + N3)</option>
              <option value="N1">Etapa N1</option>
              <option value="N2">Etapa N2</option>
              <option value="N3">Etapa N3</option>
            </select>
          </div>

          {/* Busca por Aluno/RA e Exportação */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar Aluno ou RA..."
                value={buscaRelatorio}
                onChange={(e) => setBuscaRelatorio(e.target.value)}
                className="bg-transparent text-xs w-full outline-none"
              />
            </div>

            <button
              onClick={() => {
                if (onExportarExcel) {
                  onExportarExcel({
                    turmaId: turmaFiltroId,
                    ciclo: cicloFiltro,
                    semestre: semestreFiltro
                  });
                } else if (onExportarCsv) {
                  onExportarCsv();
                }
              }}
              className="bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-800 transition shrink-0 cursor-pointer shadow-sm shadow-emerald-700/20"
              title="Exportar relatório completo em planilha Excel (.xlsx) com abas de Notas, Espelho e Estatísticas"
            >
              <FileSpreadsheet className="w-4 h-4" /> Exportar Planilha Excel (.xlsx)
            </button>
          </div>

        </div>
      </div>

      {/* 2. CARDS DE MÉTRICAS GLOBAIS DA TURMA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Média Geral */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Média Geral da Turma</span>
            <GraduationCap className="w-4 h-4 text-catolica-primary" />
          </div>
          <strong className="text-3xl font-black text-slate-900">{relatorioTurma.metricas.mediaGeral}</strong>
          <span className="text-xs text-slate-500 block mt-1">
            Desvio Padrão: <strong>±{relatorioTurma.metricas.desvioPadrao} pts</strong>
          </span>
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 pointer-events-none">
            <GraduationCap className="w-24 h-24 text-catolica-primary" />
          </div>
        </div>

        {/* Card 2: Taxa de Aprovação */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Taxa de Aprovação</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <strong className="text-3xl font-black text-emerald-600">{relatorioTurma.metricas.taxaAprovacao}%</strong>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${relatorioTurma.metricas.taxaAprovacao}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            {relatorioTurma.metricas.taxaExame}% em Exame • {relatorioTurma.metricas.taxaReprovacao}% Reprovados
          </span>
        </div>

        {/* Card 3: Total de Avaliações Corrigidas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Provas Corrigidas</span>
            <FileSpreadsheet className="w-4 h-4 text-catolica-primary" />
          </div>
          <strong className="text-3xl font-black text-catolica-primary">{relatorioTurma.metricas.totalProvasCorrigidas}</strong>
          <span className="text-xs text-slate-500 block mt-1">
            Em <strong>{relatorioTurma.metricas.totalAlunos} estudantes</strong> matriculados
          </span>
        </div>

        {/* Card 4: Questão Crítica (Maior Taxa de Erro) */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-rose-600 uppercase">Questão Crítica</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          {relatorioTurma.metricas.questaoCritica ? (
            <>
              <div className="flex items-baseline gap-2">
                <strong className="text-2xl font-black text-rose-700">
                  Q.{relatorioTurma.metricas.questaoCritica.numero < 10 ? `0${relatorioTurma.metricas.questaoCritica.numero}` : relatorioTurma.metricas.questaoCritica.numero}
                </strong>
                <span className="text-xs font-bold text-rose-600">
                  {relatorioTurma.metricas.questaoCritica.taxaErro}% de erro
                </span>
              </div>
              <p className="text-[10px] text-slate-600 line-clamp-1 mt-1 italic">
                {relatorioTurma.metricas.questaoCritica.enunciado}
              </p>
            </>
          ) : (
            <div className="text-xs text-emerald-600 font-bold mt-2">
              Nenhuma questão crítica detectada
            </div>
          )}
        </div>
      </div>

      {/* 3. GRÁFICO ANALÍTICO POR QUESTÕES (TAXA DE ACERTO / DIFICULDADE COM DISTRATORES) */}
      <GraficoDificuldadeQuestoes
        questoes={relatorioTurma.rankingQuestoes}
        turmaNome={relatorioTurma.turmaNome}
      />

      {/* 4. QUADRO CONSOLIDADO DE NOTAS (TABELA DA TURMA COM DRILLDOWN) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-catolica-primary" />
              Quadro Consolidado de Notas por Aluno (N1, N2 e N3)
            </h3>
            <p className="text-xs text-slate-500">
              Clique em qualquer aluno da lista para abrir a <strong>Visão Individual (Evolução Temporal & Mapa de Calor)</strong>
            </p>
          </div>

          <span className="text-xs text-slate-400 font-bold">
            Total: {alunosExibicao.length} aluno(s)
          </span>
        </div>

        {alunosExibicao.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <UserCheck className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">Nenhum aluno encontrado para este filtro.</p>
            <p className="text-xs text-slate-400">Tente buscar por outro termo ou selecione outra turma.</p>
          </div>
        ) : (
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="min-w-[760px] w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-3 pl-2">Estudante</th>
                  <th className="pb-3">RA</th>
                  <th className="pb-3">Turma</th>
                  <th className="pb-3 text-center">Nota N1</th>
                  <th className="pb-3 text-center">Nota N2</th>
                  <th className="pb-3 text-center">Nota N3</th>
                  <th className="pb-3 text-center">Média Final</th>
                  <th className="pb-3 text-center">Desempenho</th>
                  <th className="pb-3 text-center">Situação</th>
                  <th className="pb-3 text-right pr-2">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alunosExibicao.map((item) => (
                  <tr
                    key={item.alunoId}
                    onClick={() => setAlunoSelecionadoDetalhe(item)}
                    className="hover:bg-slate-50/80 transition cursor-pointer group"
                  >
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700 text-xs group-hover:bg-catolica-primary group-hover:text-white transition">
                          {item.alunoNome.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900 group-hover:text-catolica-primary transition">
                          {item.alunoNome}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-slate-600">{item.ra}</td>
                    <td className="py-3 text-slate-500 max-w-[140px] truncate">{item.turmaNome}</td>
                    <td className="py-3 text-center font-bold text-slate-700">{item.n1.toFixed(1)}</td>
                    <td className="py-3 text-center font-bold text-slate-700">{item.n2.toFixed(1)}</td>
                    <td className="py-3 text-center font-bold text-slate-700">{item.n3.toFixed(1)}</td>
                    <td className="py-3 text-center font-black text-slate-900 text-sm">
                      {item.mediaFinal.toFixed(1)}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${item.deltaRelativoTurma >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                        {item.deltaRelativoTurma >= 0 ? `+${item.deltaRelativoTurma}%` : `${item.deltaRelativoTurma}%`}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(item.statusAprovacao)}`}>
                        {item.statusAprovacao}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 group-hover:bg-catolica-primary group-hover:text-white transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. MODAL INDIVIDUAL DO ALUNO (DRILLDOWN COM EVOLUÇÃO TEMPORAL E MAPA DE CALOR) */}
      <ModalDetalheAluno
        aluno={alunoSelecionadoDetalhe}
        onClose={() => setAlunoSelecionadoDetalhe(null)}
      />

    </div>
  );
}
