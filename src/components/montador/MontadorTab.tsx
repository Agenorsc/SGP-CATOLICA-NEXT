'use client';

import React from 'react';
import { 
  FileText, 
  PlusCircle, 
  Search, 
  Pencil, 
  Trash2, 
  Plus, 
  Check, 
  Printer,
  Layers,
  GraduationCap,
  Globe
} from 'lucide-react';
import { Question, AvaliacaoCiclo } from '@/types';
import { TurmaModel } from '@/models/TurmaModel';
import { ContagemCiclos } from '@/services/QuestionService';

interface MontadorTabProps {
  bancoQuestoes: Question[];
  questoesFiltradas: Question[];
  questoesSelecionadas: Question[];
  turmas: TurmaModel[];
  turmaSelecionadaId: string;
  setTurmaSelecionadaId: (id: string) => void;
  tituloProva: string;
  setTituloProva: (titulo: string) => void;
  buscaQuestao: string;
  setBuscaQuestao: (busca: string) => void;
  cicloSelecionado: AvaliacaoCiclo | 'TODAS';
  setCicloSelecionado: (ciclo: AvaliacaoCiclo | 'TODAS') => void;
  filtroApenasTurma: boolean;
  setFiltroApenasTurma: (val: boolean) => void;
  contagemCiclos: ContagemCiclos;
  shuffleQ: boolean;
  setShuffleQ: (shuffle: boolean) => void;
  shuffleAlt: boolean;
  setShuffleAlt: (shuffle: boolean) => void;
  withId: boolean;
  setWithId: (val: boolean) => void;
  pontuacaoTotal: number;
  onOpenNovaQuestao: () => void;
  onEditQuestao: (q: Question) => void;
  onDeleteQuestao: (id: string) => void;
  onAdicionarNaProva: (q: Question) => void;
  onRemoverDaProva: (id: string) => void;
  onIrParaImpressao: () => void;
}

export function MontadorTab({
  bancoQuestoes,
  questoesFiltradas,
  questoesSelecionadas,
  turmas,
  turmaSelecionadaId,
  setTurmaSelecionadaId,
  tituloProva,
  setTituloProva,
  buscaQuestao,
  setBuscaQuestao,
  cicloSelecionado,
  setCicloSelecionado,
  filtroApenasTurma,
  setFiltroApenasTurma,
  contagemCiclos,
  shuffleQ,
  setShuffleQ,
  shuffleAlt,
  setShuffleAlt,
  withId,
  setWithId,
  pontuacaoTotal,
  onOpenNovaQuestao,
  onEditQuestao,
  onDeleteQuestao,
  onAdicionarNaProva,
  onRemoverDaProva,
  onIrParaImpressao
}: MontadorTabProps) {
  const turmaSelecionada = turmas.find(t => t.id === turmaSelecionadaId);

  const getBadgeCiclo = (ciclo?: string) => {
    const c = (ciclo || 'N2').toUpperCase();
    switch (c) {
      case 'N1':
        return (
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
            N1
          </span>
        );
      case 'N2':
        return (
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
            N2
          </span>
        );
      case 'N3':
        return (
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
            N3
          </span>
        );
      case 'N-1':
      case 'EXAME':
        return (
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
            Exame (N-1)
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Geral
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="text-catolica-primary" /> Montador de Avaliações
          </h2>
          <p className="text-xs text-slate-500">
            Banco de questões organizado por Turma e Ciclo Avaliativo (N1, N2, N3 e N-1).
          </p>
        </div>
        <button
          onClick={onOpenNovaQuestao}
          className="flex items-center gap-2 bg-catolica-primary hover:bg-catolica-dark text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-catolica-primary/20 transition cursor-pointer"
        >
          <PlusCircle size={16} /> Nova Questão
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUNA ESQUERDA: BANCO DE QUESTÕES ORGANIZADO POR TURMA E CICLO */}
        <div className="lg:col-span-6 space-y-4">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-catolica-primary" /> Banco de Questões
                </h3>
                <p className="text-xs text-slate-500">
                  {turmaSelecionada ? `Turma: ${turmaSelecionada.nome}` : 'Todas as Turmas'}
                </p>
              </div>
              <span className="text-xs bg-slate-100 font-bold px-3 py-1 rounded-lg text-slate-700 self-start sm:self-auto">
                {questoesFiltradas.length} / {bancoQuestoes.length} disponíveis
              </span>
            </div>

            {/* Abas de Ciclo Avaliativo (N1, N2, N3 e N-1) com Destaque Visual */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
              {[
                { id: 'TODAS', label: 'Todas', count: contagemCiclos.todas, activeClass: 'bg-slate-900 text-white shadow-md shadow-slate-900/20 ring-2 ring-slate-900/30', inactiveClass: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200', activeBadge: 'bg-white/20 text-white', inactiveBadge: 'bg-slate-200 text-slate-700' },
                { id: 'N1', label: 'N1', count: contagemCiclos.n1, activeClass: 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-600/30', inactiveClass: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200', activeBadge: 'bg-white/25 text-white', inactiveBadge: 'bg-blue-200 text-blue-800' },
                { id: 'N2', label: 'N2', count: contagemCiclos.n2, activeClass: 'bg-purple-700 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-700/30', inactiveClass: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200', activeBadge: 'bg-white/25 text-white', inactiveBadge: 'bg-purple-200 text-purple-800' },
                { id: 'N3', label: 'N3', count: contagemCiclos.n3, activeClass: 'bg-amber-600 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-600/30', inactiveClass: 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200', activeBadge: 'bg-white/25 text-white', inactiveBadge: 'bg-amber-200 text-amber-900' },
                { id: 'N-1', label: 'Exame (N-1)', count: contagemCiclos.exame, activeClass: 'bg-rose-600 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-600/30', inactiveClass: 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200', activeBadge: 'bg-white/25 text-white', inactiveBadge: 'bg-rose-200 text-rose-900' }
              ].map(tab => {
                const isActive = cicloSelecionado === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCicloSelecionado(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 ${isActive ? tab.activeClass : tab.inactiveClass}`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isActive ? tab.activeBadge : tab.inactiveBadge}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {cicloSelecionado === 'N-1' && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 animate-fadeIn">
                <span className="font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide shrink-0">Cumulativo</span>
                <span className="text-[11px] leading-tight">O <strong>Exame (N-1)</strong> reúne automaticamente todas as questões cadastradas para <strong>N1</strong>, <strong>N2</strong> e <strong>N3</strong> desta turma.</span>
              </div>
            )}

            {/* Busca textual e Filtro de Turma */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filtrar por enunciado ou tag (#N1, #N2, #OMR...)"
                  value={buscaQuestao}
                  onChange={(e) => setBuscaQuestao(e.target.value)}
                  className="bg-transparent text-xs w-full outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600 hover:text-slate-900 transition">
                <input
                  type="checkbox"
                  checked={filtroApenasTurma}
                  onChange={(e) => setFiltroApenasTurma(e.target.checked)}
                  className="w-3.5 h-3.5 accent-catolica-primary rounded"
                />
                <span>Exibir apenas questões exclusivas da turma selecionada</span>
              </label>
            </div>
          </div>

          {/* Lista de Questões do Banco */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {questoesFiltradas.length === 0 ? (
              <div className="p-8 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 space-y-2">
                <p className="font-semibold text-slate-600">Nenhuma questão encontrada para este filtro.</p>
                <p>Tente selecionar outro ciclo avaliativo (N1, N2, N3, N-1) ou criar uma nova questão.</p>
              </div>
            ) : (
              questoesFiltradas.map((q, idx) => {
                const jaAdicionada = questoesSelecionadas.some(item => item.id === q.id);
                const turmaOrigem = turmas.find(t => t.id === q.turmaId);

                return (
                  <div
                    key={q.id}
                    className={`bg-white p-5 rounded-2xl border transition-all ${
                      jaAdicionada
                        ? 'border-catolica-primary/40 bg-catolica-light/30'
                        : 'border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="mb-2.5 flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-900 text-white">
                          Q{idx + 1} • {q.tipo.toUpperCase()}
                        </span>
                        {getBadgeCiclo(q.avaliacao)}
                        <span className="text-[10px] font-semibold text-slate-500">
                          {q.pontuacao.toFixed(1)} pts
                        </span>
                        {turmaOrigem ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-slate-500" /> {turmaOrigem.nome}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 flex items-center gap-1 border border-emerald-100">
                            <Globe className="w-3 h-3 text-emerald-600" /> Banco Geral
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onEditQuestao(q)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          title="Editar Questão"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteQuestao(q.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Excluir Questão"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={() => onAdicionarNaProva(q)}
                          disabled={jaAdicionada}
                          className={`text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition ml-1 ${
                            jaAdicionada
                              ? 'bg-emerald-100 text-emerald-800 cursor-default'
                              : 'bg-slate-900 text-white hover:bg-catolica-primary'
                          }`}
                        >
                          {jaAdicionada ? (
                            <><Check className="w-3 h-3" /> No Caderno</>
                          ) : (
                            <><Plus className="w-3 h-3" /> Adicionar</>
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 font-medium leading-relaxed mb-3">
                      {q.enunciado}
                    </p>

                    <div className="flex gap-1.5 flex-wrap">
                      {q.tags.map(t => (
                        <span key={t} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: CONFIGURAÇÃO DO CADERNO E RESUMO DA AVALIAÇÃO */}
        <div className="lg:col-span-6 space-y-4">
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="border-b border-slate-100 pb-4 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                Turma Destino da Prova:
              </label>
              <select
                value={turmaSelecionadaId}
                onChange={(e) => setTurmaSelecionadaId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-catolica-primary outline-none"
              >
                {turmas.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nome} — {t.curso} ({t.semestre})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Resumo da Avaliação</h3>
                <p className="text-xs text-slate-500">Configuração de caderno e gabarito</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 block uppercase">Pontuação Total:</span>
                <strong className={`text-lg font-black ${pontuacaoTotal === 10 ? 'text-emerald-600' : 'text-catolica-primary'}`}>
                  {pontuacaoTotal.toFixed(1)} / 10.0 pts
                </strong>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Matéria / Título da Prova:
                </label>
                <input
                  type="text"
                  value={tituloProva}
                  onChange={(e) => setTituloProva(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-catolica-primary"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Regras de Impressão e Embaralhamento:
                </span>
                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleQ}
                    onChange={(e) => setShuffleQ(e.target.checked)}
                    className="w-3.5 h-3.5 accent-catolica-primary"
                  />
                  Embaralhar ordem das questões
                </label>
                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleAlt}
                    onChange={(e) => setShuffleAlt(e.target.checked)}
                    className="w-3.5 h-3.5 accent-catolica-primary"
                  />
                  Embaralhar alternativas (A, B, C, D, E)
                </label>
                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={withId}
                    onChange={(e) => setWithId(e.target.checked)}
                    className="w-3.5 h-3.5 accent-catolica-primary"
                  />
                  QR Code Nominal (com Matrícula e Nome do Aluno)
                </label>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 uppercase block mb-2">
                  Questões no Caderno ({questoesSelecionadas.length} / 20):
                </span>
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {questoesSelecionadas.map((q, idx) => (
                    <div key={q.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs">
                      <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
                        <span className="font-bold text-slate-400 w-5 text-center">{idx + 1}.</span>
                        <span className="max-w-[160px] truncate font-semibold text-slate-800 sm:max-w-[280px]">
                          {q.enunciado}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {getBadgeCiclo(q.avaliacao)}
                        <span className="font-bold text-catolica-primary">{q.pontuacao.toFixed(1)} pts</span>
                        <button
                          onClick={() => onRemoverDaProva(q.id)}
                          className="text-slate-400 hover:text-red-600 transition ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={onIrParaImpressao}
              disabled={questoesSelecionadas.length === 0}
              className="w-full bg-catolica-primary text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-catolica-dark transition shadow-lg shadow-catolica-primary/30"
            >
              <Printer className="w-4 h-4" /> Gerar Caderno Frente/Verso & Gabarito OMR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
